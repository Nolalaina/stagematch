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

  // Entreprises supplémentaires et offres variées
  const companies = [
    ['rh@novatech.mg', 'NovaTech Madagascar', 'ESN spécialisée dans les applications web, mobiles et cloud.', 'Conseil & développement logiciel', 'approved'],
    ['rh@greenpower.mg', 'GreenPower Analytics', 'Solutions de suivi énergétique et d’analyse de données.', 'Énergie & Data', 'approved'],
    ['rh@medilink.mg', 'MediLink', 'Plateforme numérique au service des professionnels de santé.', 'Santé numérique', 'pending'],
  ];

  const createdCompanyIds = [];
  for (const [email, name, description, sector, status] of companies) {
    const [userResult] = await connection.query(`
      INSERT INTO users (email, password_hash, role, is_email_verified, is_active)
      VALUES (?, ?, 'company', 1, 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), id = LAST_INSERT_ID(id);
    `, [email, passwordHash]);

    const [companyResult] = await connection.query(`
      INSERT INTO companies (user_id, name, description, sector, validation_status, validated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name), id = LAST_INSERT_ID(id);
    `, [userResult.insertId, name, description, sector, status, status === 'approved' ? new Date() : null]);

    createdCompanyIds.push(companyResult.insertId);
  }

  const [novaOffer] = await connection.query(`
    INSERT INTO internships (company_id, title, description, location, duration_weeks, is_remote, status)
    VALUES (?, 'Développeur Mobile Flutter', 'Concevez des interfaces mobiles performantes et intégrez des API REST pour une application métier.', 'Antananarivo', 16, 0, 'published')
  `, [createdCompanyIds[0]]);
  await connection.query('INSERT IGNORE INTO internship_skills (internship_id, skill_id, weight) VALUES (?,8,1.0),(?,9,1.0),(?,10,1.0),(?,12,0.9)', [novaOffer.insertId, novaOffer.insertId, novaOffer.insertId, novaOffer.insertId]);

  const [dataOffer] = await connection.query(`
    INSERT INTO internships (company_id, title, description, location, duration_weeks, is_remote, status)
    VALUES (?, 'Analyste Data & Intelligence Artificielle', 'Préparez, analysez et visualisez des données énergétiques avec Python et MySQL.', 'Antsirabe', 20, 1, 'published')
  `, [createdCompanyIds[1]]);
  await connection.query('INSERT IGNORE INTO internship_skills (internship_id, skill_id, weight) VALUES (?,13,1.0),(?,6,1.0),(?,10,0.8)', [dataOffer.insertId, dataOffer.insertId, dataOffer.insertId]);

  const [javaOffer] = await connection.query(`
    INSERT INTO internships (company_id, title, description, location, duration_weeks, is_remote, status)
    VALUES (?, 'Développeur Backend Java', 'Développez des services Spring Boot sécurisés et participez à la conception des API.', 'Toamasina', 12, 0, 'published')
  `, [createdCompanyIds[0]]);
  await connection.query('INSERT IGNORE INTO internship_skills (internship_id, skill_id, weight) VALUES (?,4,1.0),(?,5,1.0),(?,7,0.9),(?,9,0.9)', [javaOffer.insertId, javaOffer.insertId, javaOffer.insertId, javaOffer.insertId]);

  const [frontendOffer] = await connection.query(`
    INSERT INTO internships (company_id, title, description, location, duration_weeks, is_remote, status)
    VALUES (?, 'Stage Frontend React', 'Participez à la création d’interfaces accessibles et réactives avec React et TypeScript.', 'Antananarivo', 12, 1, 'published')
  `, [createdCompanyIds[1]]);
  await connection.query('INSERT IGNORE INTO internship_skills (internship_id, skill_id, weight) VALUES (?,1,1.0),(?,12,1.0),(?,10,0.8),(?,9,0.8)', [frontendOffer.insertId, frontendOffer.insertId, frontendOffer.insertId, frontendOffer.insertId]);

  const [devopsOffer] = await connection.query(`
    INSERT INTO internships (company_id, title, description, location, duration_weeks, is_remote, status)
    VALUES (?, 'Assistant DevOps', 'Automatisez les déploiements, documentez les environnements et expérimentez Docker.', 'Antananarivo', 14, 1, 'draft')
  `, [createdCompanyIds[0]]);
  await connection.query('INSERT IGNORE INTO internship_skills (internship_id, skill_id, weight) VALUES (?,11,1.0),(?,10,1.0),(?,3,0.7)', [devopsOffer.insertId, devopsOffer.insertId, devopsOffer.insertId]);

  // Étudiants de démonstration supplémentaires
  const demoStudents = [
    ['soa.rasoa@univ-antananarivo.mg', 'Rasoa Soa', 2, 'Master 1', 'Réseaux informatiques', 'Antsirabe', 1, [10,11,3,7]],
    ['toky.rabemanana@univ-antananarivo.mg', 'Toky Rabemanana', 3, 'Master 2', 'Data Science', 'Antananarivo', 1, [13,6,14,10]],
    ['mialy.andria@univ-toamasina.mg', 'Mialy Andria', 1, 'Licence 3', 'Développement logiciel', 'Toamasina', 0, [4,5,7,9]],
    ['lalaina.rakoto@univ-antananarivo.mg', 'Lalaina Rakoto', 1, 'Licence 3', 'Frontend Web', 'Antananarivo', 1, [1,12,9,10]],
  ];

  for (const [email, fullName, fieldId, year, domain, location, remote, skillIds] of demoStudents) {
    const [userResult] = await connection.query(`
      INSERT INTO users (email, password_hash, role, is_email_verified, is_active)
      VALUES (?, ?, 'student', 1, 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), id = LAST_INSERT_ID(id);
    `, [email, passwordHash]);

    const [profileResult] = await connection.query(`
      INSERT INTO student_profiles (user_id, full_name, field_of_study_id, year_of_study, desired_domain, location, accepts_remote)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), id = LAST_INSERT_ID(id);
    `, [userResult.insertId, fullName, fieldId, year, domain, location, remote]);

    for (const skillId of skillIds) {
      await connection.query(
        'INSERT IGNORE INTO student_skills (student_profile_id, skill_id, weight, source) VALUES (?, ?, 1.0, "manual")',
        [profileResult.insertId, skillId]
      );
    }
  }

  // Compte admin de démo
  await connection.query(`
    INSERT INTO users (email, password_hash, role, is_email_verified, is_active)
    VALUES ('admin@stagematch.mg', ?, 'admin', 1, 1)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
  `, [passwordHash]);

  console.log('✅ Base de données WAMP initialisée et peuplée avec succès !');
  await connection.end();
}

initDatabase().catch((err) => {
  console.error('❌ Erreur lors de l\'initialisation de la BD :', err);
  process.exit(1);
});
