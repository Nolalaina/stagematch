import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import companiesRoutes from './routes/companies.routes.js';
import internshipsRoutes from './routes/internships.routes.js';
import adminRoutes from './routes/admin.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'stagematch-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/internships', internshipsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Gestion d'erreur générique (NFR-01 : réponses rapides et propres)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`StageMatch API démarrée sur http://localhost:${port}`));
