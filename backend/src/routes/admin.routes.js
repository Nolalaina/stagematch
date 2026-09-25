import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

// F-A-01 : validation des entreprises
router.get('/companies/pending', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM companies WHERE validation_status = 'pending' ORDER BY created_at`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/companies/:id/validate', async (req, res) => {
  const { decision, comment } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ error: 'Décision invalide.' });

  await pool.query(
    `UPDATE companies SET validation_status = ?, validated_by = ?, validated_at = NOW() WHERE id = ?`,
    [decision, req.user.id, req.params.id]
  );
  await pool.query(
    `INSERT INTO admin_actions (admin_id, action_type, target_user_id, comment)
     SELECT ?, ?, user_id, ? FROM companies WHERE id = ?`,
    [req.user.id, decision === 'approved' ? 'validate_company' : 'reject_company', comment || null, req.params.id]
  );
  res.json({ ok: true });
});

// F-A-02 : gestion des utilisateurs
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/deactivate', async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
    await pool.query('INSERT INTO admin_actions (admin_id, action_type, target_user_id) VALUES (?, "deactivate_user", ?)', [
      req.user.id,
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// F-A-03 : statistiques détaillées (pour cartes et graphiques)
router.get('/stats', async (req, res) => {
  try {
    const [[stats]] = await pool.query('SELECT * FROM v_admin_stats');
    
    const [appStatusRows] = await pool.query(
      'SELECT status, COUNT(*) as count FROM applications GROUP BY status'
    );
    const [companyStatusRows] = await pool.query(
      'SELECT validation_status, COUNT(*) as count FROM companies GROUP BY validation_status'
    );
    const [internshipStatusRows] = await pool.query(
      'SELECT status, COUNT(*) as count FROM internships GROUP BY status'
    );

    res.json({
      ...stats,
      applicationsByStatus: appStatusRows,
      companiesByStatus: companyStatusRows,
      internshipsByStatus: internshipStatusRows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// F-A-04 : gestion du référentiel de compétences et filières
router.get('/skills', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM skills ORDER BY category, name');
  res.json(rows);
});

router.post('/skills', async (req, res) => {
  const { name, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom de la compétence est requis.' });
  const [result] = await pool.query('INSERT INTO skills (name, category) VALUES (?, ?)', [name, category || null]);
  res.status(201).json({ id: result.insertId, name, category });
});

router.delete('/skills/:id', async (req, res) => {
  await pool.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

router.get('/fields', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM fields_of_study ORDER BY name');
  res.json(rows);
});

router.post('/fields', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom de la filière est requis.' });
  const [result] = await pool.query('INSERT INTO fields_of_study (name) VALUES (?)', [name]);
  res.status(201).json({ id: result.insertId, name });
});

router.delete('/fields/:id', async (req, res) => {
  await pool.query('DELETE FROM fields_of_study WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
