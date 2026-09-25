import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireRole('company'));

async function getOwnCompany(userId) {
  const [rows] = await pool.query('SELECT * FROM companies WHERE user_id = ?', [userId]);
  if (!rows.length) throw new Error('Entreprise introuvable.');
  return rows[0];
}

// F-E-05 : profil entreprise
router.get('/me', async (req, res) => {
  try {
    res.json(await getOwnCompany(req.user.id));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.put('/me', async (req, res) => {
  try {
    const { name, description, logoUrl, contactEmail, contactPhone, sector } = req.body;
    const company = await getOwnCompany(req.user.id);
    await pool.query(
      `UPDATE companies SET name=?, description=?, logo_url=?, contact_email=?, contact_phone=?, sector=? WHERE id=?`,
      [name, description, logoUrl, contactEmail, contactPhone, sector, company.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(err.message === 'Entreprise introuvable.' ? 404 : 500).json({ error: err.message });
  }
});

// F-E-02 : publication d'un stage — uniquement si l'entreprise est validée (F-E-01)
router.post('/internships', async (req, res) => {
  const company = await getOwnCompany(req.user.id);
  if (company.validation_status !== 'approved') {
    return res.status(403).json({ error: "Votre compte doit être validé par l'administrateur avant de publier une offre." });
  }
  const { title, description, location, durationWeeks, isRemote, skillIds = [] } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO internships (company_id, title, description, location, duration_weeks, is_remote, status)
       VALUES (?, ?, ?, ?, ?, ?, 'published')`,
      [company.id, title, description, location, durationWeeks || null, isRemote ? 1 : 0]
    );
    if (skillIds.length) {
      const values = skillIds.map((skillId) => [result.insertId, skillId, 1.0]);
      await conn.query('INSERT INTO internship_skills (internship_id, skill_id, weight) VALUES ?', [values]);
    }
    await conn.commit();
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Erreur lors de la publication.', detail: err.message });
  } finally {
    conn.release();
  }
});

router.get('/internships', async (req, res) => {
  try {
    const company = await getOwnCompany(req.user.id);
    const [rows] = await pool.query(
      `SELECT i.*, (SELECT COUNT(*) FROM applications a WHERE a.internship_id = i.id) AS application_count
       FROM internships i WHERE i.company_id = ? ORDER BY i.created_at DESC`,
      [company.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(err.message === 'Entreprise introuvable.' ? 404 : 500).json({ error: err.message });
  }
});

// F-E-03 : candidats triés par score de matching
router.get('/internships/:id/candidates', async (req, res) => {
  try {
    const company = await getOwnCompany(req.user.id);
    const [[internship]] = await pool.query('SELECT id FROM internships WHERE id = ? AND company_id = ?', [req.params.id, company.id]);
    if (!internship) return res.status(404).json({ error: 'Offre introuvable.' });

    const [rows] = await pool.query(
      `SELECT a.id AS application_id, a.match_score, a.status, a.applied_at,
              sp.full_name, sp.location, f.name AS field_of_study
       FROM applications a
       JOIN student_profiles sp ON sp.id = a.student_profile_id
       LEFT JOIN fields_of_study f ON f.id = sp.field_of_study_id
       WHERE a.internship_id = ? ORDER BY a.match_score DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(err.message === 'Entreprise introuvable.' ? 404 : 500).json({ error: err.message });
  }
});

// F-E-04 : mise à jour des statuts (déclenche une notification étudiant)
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['submitted', 'viewed', 'interview', 'result_positive', 'result_negative'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Statut invalide.' });

    const company = await getOwnCompany(req.user.id);
    const [[application]] = await pool.query(
      `SELECT a.*, sp.user_id AS student_user_id, i.title FROM applications a
       JOIN internships i ON i.id = a.internship_id JOIN student_profiles sp ON sp.id = a.student_profile_id
       WHERE a.id = ? AND i.company_id = ?`,
      [req.params.id, company.id]
    );
    if (!application) return res.status(404).json({ error: 'Candidature introuvable.' });

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, related_application_id)
       VALUES (?, 'status_change', ?, ?)`,
      [application.student_user_id, `Votre candidature pour "${application.title}" est maintenant : ${status}`, application.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(err.message === 'Entreprise introuvable.' ? 404 : 500).json({ error: err.message });
  }
});

export default router;
