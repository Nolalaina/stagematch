import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { computeIdf, computeMatchScore, missingSkills } from '../utils/matching.js';

const router = Router();
router.use(authenticate, requireRole('student'));

async function getOwnProfileId(userId) {
  const [rows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
  if (!rows.length) throw new Error('Profil étudiant introuvable.');
  return rows[0].id;
}

// F-S-02 : lecture / mise à jour du profil (filière, niveau, domaine, localisation, compétences)
router.get('/me', async (req, res) => {
  try {
    const [[profile]] = await pool.query(
      `SELECT sp.*, f.name AS field_of_study
       FROM student_profiles sp LEFT JOIN fields_of_study f ON f.id = sp.field_of_study_id
       WHERE sp.user_id = ?`,
      [req.user.id]
    );
    if (!profile) return res.status(404).json({ error: 'Profil introuvable.' });
    const [skills] = await pool.query(
      `SELECT s.id, s.name, ss.weight FROM student_skills ss
       JOIN skills s ON s.id = ss.skill_id WHERE ss.student_profile_id = ?`,
      [profile.id]
    );
    res.json({ ...profile, skills });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la lecture du profil.', detail: err.message });
  }
});

router.put('/me', async (req, res) => {
  try {
    const { fullName, yearOfStudy, desiredDomain, location, acceptsRemote, fieldOfStudyId, skillIds } = req.body;
    const profileId = await getOwnProfileId(req.user.id);

    await pool.query(
      `UPDATE student_profiles SET full_name = ?, year_of_study = ?, desired_domain = ?,
         location = ?, accepts_remote = ?, field_of_study_id = ? WHERE id = ?`,
      [fullName, yearOfStudy, desiredDomain, location, acceptsRemote ? 1 : 0, fieldOfStudyId || null, profileId]
    );

    if (Array.isArray(skillIds)) {
      await pool.query('DELETE FROM student_skills WHERE student_profile_id = ?', [profileId]);
      if (skillIds.length) {
        const values = skillIds.map((skillId) => [profileId, skillId, 1.0, 'manual']);
        await pool.query('INSERT INTO student_skills (student_profile_id, skill_id, weight, source) VALUES ?', [values]);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(err.message === 'Profil étudiant introuvable.' ? 404 : 500).json({ error: err.message });
  }
});

// F-S-03 : Upload et extraction automatique des mots-clés du CV
router.post('/me/cv', async (req, res) => {
  try {
    const { cvUrl, cvText, fileName } = req.body;
    const profileId = await getOwnProfileId(req.user.id);
    const contentToParse = `${fileName || ''} ${cvText || ''} ${cvUrl || ''}`;

    // Récupérer la liste des compétences en BD
    const [allSkills] = await pool.query('SELECT id, name FROM skills');
    const matchedSkills = [];

    // Recherche de mots-clés (case-insensitive)
    for (const skill of allSkills) {
      const regex = new RegExp(`\\b${skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(contentToParse)) {
        matchedSkills.push(skill);
      }
    }

    const finalCvUrl = cvUrl || (fileName ? `/uploads/${fileName}` : `/uploads/cv_${req.user.id}.pdf`);

    await pool.query(
      `UPDATE student_profiles SET cv_url = ?, cv_parsed_at = NOW() WHERE id = ?`,
      [finalCvUrl, profileId]
    );

    if (matchedSkills.length) {
      for (const skill of matchedSkills) {
        await pool.query(
          `INSERT INTO student_skills (student_profile_id, skill_id, weight, source)
           VALUES (?, ?, 1.000, 'cv_extraction')
           ON DUPLICATE KEY UPDATE source = 'cv_extraction'`,
          [profileId, skill.id]
        );
      }
    }

    res.json({
      ok: true,
      cvUrl: finalCvUrl,
      parsedAt: new Date(),
      extractedSkills: matchedSkills,
      message: `${matchedSkills.length} compétence(s) extraite(s) automatiquement du CV.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du traitement du CV.' });
  }
});

// F-S-04 : recommandation intelligente — Top-N stages, score > 60 (§4.1)
router.get('/recommendations', async (req, res) => {
  try {
    const profileId = await getOwnProfileId(req.user.id);
    const [[profile]] = await pool.query('SELECT * FROM student_profiles WHERE id = ?', [profileId]);
    const [studentSkills] = await pool.query('SELECT skill_id, weight FROM student_skills WHERE student_profile_id = ?', [profileId]);

    const [internships] = await pool.query(
      `SELECT i.*, c.name AS company_name, c.sector FROM internships i
       JOIN companies c ON c.id = i.company_id WHERE i.status = 'published'`
    );
    const [allInternshipSkillRows] = await pool.query(
      `SELECT isk.internship_id, isk.skill_id, isk.weight, s.name AS skill_name
       FROM internship_skills isk
       JOIN internships i ON i.id = isk.internship_id
       JOIN skills s ON s.id = isk.skill_id
       WHERE i.status = 'published'`
    );
    const idfMap = computeIdf(allInternshipSkillRows, internships.length);
    const skillsByInternship = new Map();
    for (const row of allInternshipSkillRows) {
      if (!skillsByInternship.has(row.internship_id)) skillsByInternship.set(row.internship_id, []);
      skillsByInternship.get(row.internship_id).push(row);
    }

    const results = internships.map((internship) => {
      const internshipSkills = skillsByInternship.get(internship.id) || [];
      const locationMatch = !!profile.location && profile.location === internship.location;
      const domainMatch =
        (!!profile.desired_domain && !!internship.sector &&
          internship.sector.toLowerCase().includes(profile.desired_domain.toLowerCase())) ||
        (profile.accepts_remote && internship.is_remote);

      const score = computeMatchScore({ studentSkills, internshipSkills, idfMap, locationMatch, domainMatch });
      return {
        internshipId: internship.id,
        title: internship.title,
        company: internship.company_name,
        location: internship.location,
        isRemote: !!internship.is_remote,
        score,
        missingSkills: missingSkills(studentSkills.map((s) => s.skill_id), internshipSkills).map((s) => s.skill_name),
      };
    });

    // §4.1 : seuls les scores > 60 entrent dans la liste de recommandation ; AC-01 : ≥ 3 stages si possible
    const recommended = results.filter((r) => r.score > 60).sort((a, b) => b.score - a.score);
    res.json(recommended.length ? recommended : results.sort((a, b) => b.score - a.score).slice(0, 3));
  } catch (err) {
    res.status(err.message === 'Profil étudiant introuvable.' ? 404 : 500).json({ error: err.message });
  }
});

// F-S-07 : suivi des candidatures
router.get('/applications', async (req, res) => {
  try {
    const profileId = await getOwnProfileId(req.user.id);
    const [rows] = await pool.query(
      `SELECT a.*, i.title, c.name AS company_name FROM applications a
       JOIN internships i ON i.id = a.internship_id JOIN companies c ON c.id = i.company_id
       WHERE a.student_profile_id = ? ORDER BY a.applied_at DESC`,
      [profileId]
    );
    res.json(rows);
  } catch (err) {
    res.status(err.message === 'Profil étudiant introuvable.' ? 404 : 500).json({ error: err.message });
  }
});

export default router;
