import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// F-S-05 : recherche et filtres (domaine, lieu, durée, télétravail) — public
router.get('/', async (req, res) => {
  const { location, remote, domain, maxDuration } = req.query;
  const conditions = ["i.status = 'published'"];
  const params = [];

  if (location) { conditions.push('i.location = ?'); params.push(location); }
  if (remote === 'true') { conditions.push('i.is_remote = 1'); }
  if (domain) { conditions.push('c.sector LIKE ?'); params.push(`%${domain}%`); }
  if (maxDuration) { conditions.push('i.duration_weeks <= ?'); params.push(Number(maxDuration)); }

  const [rows] = await pool.query(
    `SELECT i.id, i.title, i.location, i.duration_weeks, i.is_remote, c.name AS company_name
     FROM internships i JOIN companies c ON c.id = i.company_id
     WHERE ${conditions.join(' AND ')} ORDER BY i.created_at DESC`,
    params
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [[internship]] = await pool.query(
    `SELECT i.*, c.name AS company_name, c.sector FROM internships i
     JOIN companies c ON c.id = i.company_id WHERE i.id = ?`,
    [req.params.id]
  );
  if (!internship) return res.status(404).json({ error: 'Offre introuvable.' });
  const [skills] = await pool.query(
    `SELECT s.id, s.name FROM internship_skills isk JOIN skills s ON s.id = isk.skill_id WHERE isk.internship_id = ?`,
    [req.params.id]
  );
  res.json({ ...internship, skills });
});

// F-S-06 : candidature en un clic
router.post('/:id/apply', authenticate, requireRole('student'), async (req, res) => {
  const [[profile]] = await pool.query('SELECT id, location, desired_domain, accepts_remote FROM student_profiles WHERE user_id = ?', [req.user.id]);
  if (!profile) return res.status(404).json({ error: 'Profil étudiant introuvable.' });

  const [[internship]] = await pool.query(
    `SELECT i.*, c.sector FROM internships i JOIN companies c ON c.id = i.company_id WHERE i.id = ? AND i.status = 'published'`,
    [req.params.id]
  );
  if (!internship) return res.status(404).json({ error: 'Offre introuvable ou non publiée.' });

  const [studentSkills] = await pool.query('SELECT skill_id, weight FROM student_skills WHERE student_profile_id = ?', [profile.id]);
  const [internshipSkills] = await pool.query('SELECT skill_id, weight FROM internship_skills WHERE internship_id = ?', [req.params.id]);
  const { computeIdf, computeMatchScore } = await import('../utils/matching.js');
  const idfMap = computeIdf(internshipSkills.map((s) => ({ skill_id: s.skill_id })), 1);
  const locationMatch = profile.location === internship.location;
  const domainMatch = !!profile.desired_domain && !!internship.sector && internship.sector.toLowerCase().includes(profile.desired_domain.toLowerCase());
  const score = computeMatchScore({ studentSkills, internshipSkills, idfMap, locationMatch, domainMatch });

  try {
    await pool.query(
      'INSERT INTO applications (student_profile_id, internship_id, match_score) VALUES (?, ?, ?)',
      [profile.id, req.params.id, score]
    );
    // F-S-08 : notification à l'entreprise côté matching (simplifiée ici)
    res.status(201).json({ ok: true, matchScore: score });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Vous avez déjà postulé à cette offre.' });
    res.status(500).json({ error: 'Erreur lors de la candidature.' });
  }
});

export default router;
