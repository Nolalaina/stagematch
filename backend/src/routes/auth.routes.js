import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = Router();

// F-S-01 / F-E-01 : inscription (email + mot de passe), rôle étudiant ou entreprise
router.post('/register', async (req, res) => {
  const { email, password, role, universityDomain, companyName } = req.body;
  if (!email || !password || !['student', 'company'].includes(role)) {
    return res.status(400).json({ error: 'Champs invalides.' });
  }
  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Cet email est déjà utilisé.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const isVerified = role === 'student' && universityDomain ? 1 : 0;

    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO users (email, password_hash, role, is_email_verified, university_domain) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, role, isVerified, universityDomain || null]
    );
    const userId = result.insertId;

    if (role === 'student') {
      await conn.query('INSERT INTO student_profiles (user_id, full_name) VALUES (?, ?)', [userId, email.split('@')[0]]);
    } else {
      // F-E-01 : publication possible uniquement après validation par l'admin
      await conn.query('INSERT INTO companies (user_id, name, validation_status) VALUES (?, ?, "pending")', [
        userId,
        companyName || email.split('@')[0],
      ]);
    }
    await conn.commit();

    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    res.status(201).json({ token, user: { id: userId, email, role } });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Erreur lors de l\'inscription.', detail: err.message });
  } finally {
    conn.release();
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !user.is_active) return res.status(401).json({ error: 'Identifiants invalides.' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la connexion.', detail: err.message });
  }
});

export default router;
