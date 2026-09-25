import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log('🔄 Connexion au serveur MySQL (WAMP)...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('📦 Création de la base de données stagematch si nécessaire...');
  await connection.query('CREATE DATABASE IF NOT EXISTS stagematch;');
  await connection.query('USE stagematch;');

  console.log('📜 Exécution du schéma SQL (schema.sql)...');
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await connection.query(schemaSql);
  console.log('✅ Schéma créé avec succès !');

  // Hachage du mot de passe par défaut pour la démonstration
  const passwordHash = await bcrypt.hash('Password123!', 10);

  console.log('🌱 Insertion des données de démonstration...');
  
  // Insertion des filières
  await connection.query(`
    INSERT IGNORE INTO fields_of_study (id, name) VALUES
      (1, 'Génie Logiciel'),
      (2, 'Réseaux & Systèmes'),
      (3, 'Data & IA'),
      (4, 'Gestion des projets informatiques');
  `);

  // Insertion des compétences
  await connection.query(`
    INSERT IGNORE INTO skills (id, name, category) VALUES
      (1, 'React', 'Frameworks'),
      (2, 'Vue.js', 'Frameworks'),
      (3, 'Node.js', 'Frameworks'),
      (4, 'Java', 'Langages'),
      (5, 'Spring Boot', 'Frameworks'),
      (6, 'MySQL', 'Bases de données'),
      (7, 'PostgreSQL', 'Bases de données'),
      (8, 'Flutter', 'Mobile'),
      (9, 'REST API', 'Architecture'),
      (10, 'Git', 'Outils'),
      (11, 'Docker', 'DevOps'),
      (12, 'TypeScript', 'Langages'),
      (13, 'Python', 'Langages'),
      (14, 'MongoDB', 'Bases de données'),
      (15, 'Angular', 'Frameworks');
  `);

  // Compte entreprise de démo
  const [compUser] = await connection.query(`
    INSERT INTO users (email, password_hash, role, is_email_verified, is_active)
    VALUES ('rh@orangedigitalcenter.mg', ?, 'company', 1, 1)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), id = LAST_INSERT_ID(id);
  `, [passwordHash]);

  const companyUserId = compUser.insertId;

  const [compRow] = await connection.query(`
    INSERT INTO companies (user_id, name, description, sector, validation_status, validated_at)
    VALUES (?, 'Orange Digital Center', 'Centre d''innovation numérique.', 'Technologies de l''information', 'approved', NOW())
    ON DUPLICATE KEY UPDATE name = VALUES(name), id = LAST_INSERT_ID(id);
  `, [companyUserId]);

  const companyId = compRow.insertId;

  // Offre de stage de démo
  const [internshipRow] = await connection.query(`
    INSERT INTO internships (company_id, title, description, location, duration_weeks, is_remote, status)
    VALUES (?, 'Développeur Web Full-Stack', 'Rejoignez l''équipe produit pour concevoir et développer des fonctionnalités web de bout en bout avec React, Node.js et MySQL.', 'Antananarivo', 12, 0, 'published')
    ON DUPLICATE KEY UPDATE title = VALUES(title), id = LAST_INSERT_ID(id);
  `, [companyId]);

  const internshipId = internshipRow.insertId;

  await connection.query(`
    INSERT IGNORE INTO internship_skills (internship_id, skill_id, weight) VALUES
      (?, 1, 1.0), (?, 3, 1.0), (?, 6, 1.0), (?, 9, 1.0), (?, 10, 1.0);
  `, [internshipId, internshipId, internshipId, internshipId, internshipId]);

  // Compte admin de démo
  await connection.query(`
    INSERT INTO users (email, password_hash, role, is_email_verified, is_active)
    VALUES ('admin@stagematch.mg', ?, 'admin', 1, 1)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
  `, [passwordHash]);

  // Compte étudiant de démo
  const [studUser] = await connection.query(`
    INSERT INTO users (email, password_hash, role, is_email_verified, is_active)
    VALUES ('etudiant@demo.mg', ?, 'student', 1, 1)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), id = LAST_INSERT_ID(id);
  `, [passwordHash]);

  const studentUserId = studUser.insertId;

  const [profileRow] = await connection.query(`
    INSERT INTO student_profiles (user_id, full_name, field_of_study_id, year_of_study, desired_domain, location, accepts_remote)
    VALUES (?, 'Rakoto Jean', 1, 'Licence 3', 'Développement Web', 'Antananarivo', 1)
    ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), id = LAST_INSERT_ID(id);
  `, [studentUserId]);

  const profileId = profileRow.insertId;

  await connection.query(`
    INSERT IGNORE INTO student_skills (student_profile_id, skill_id, weight, source) VALUES
      (?, 1, 1.0, 'manual'), (?, 3, 1.0, 'manual'), (?, 6, 1.0, 'manual');
  `, [profileId, profileId, profileId]);

  console.log('✅ Base de données WAMP initialisée et peuplée avec succès !');
  await connection.end();
}

initDatabase().catch((err) => {
  console.error('❌ Erreur lors de l\'initialisation de la BD :', err);
  process.exit(1);
});
