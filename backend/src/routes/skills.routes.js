import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// Liste publique des compétences (pour les sélecteurs de tags du frontend)
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, category FROM skills ORDER BY category, name');
  res.json(rows);
});

export default router;
