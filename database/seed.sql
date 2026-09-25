-- =====================================================================
-- StageMatch — Données de démonstration
-- =====================================================================
USE stagematch;

INSERT INTO fields_of_study (name) VALUES
 ('Génie Logiciel'), ('Réseaux & Systèmes'), ('Data & IA'), ('Gestion des projets informatiques');

INSERT INTO skills (name, category) VALUES
 ('React','Frameworks'),('Vue.js','Frameworks'),('Node.js','Frameworks'),('Java','Langages'),
 ('Spring Boot','Frameworks'),('MySQL','Bases de données'),('PostgreSQL','Bases de données'),
 ('Flutter','Mobile'),('REST API','Architecture'),('Git','Outils'),('Docker','DevOps'),
 ('TypeScript','Langages'),('Python','Langages'),('MongoDB','Bases de données'),('Angular','Frameworks');

-- Compte entreprise de démo (déjà validée) — mot de passe : "Password123!"
-- Le hash ci-dessous est généré par le script backend/src/utils/hashSeed.js (voir README)
INSERT INTO users (email, password_hash, role, is_email_verified, is_active)
VALUES ('rh@orangedigitalcenter.mg', '__HASH__', 'company', 1, 1);
SET @company_user_id = LAST_INSERT_ID();

INSERT INTO companies (user_id, name, description, sector, validation_status, validated_at)
VALUES (@company_user_id, 'Orange Digital Center', 'Centre d''innovation numérique.', 'Technologies de l''information', 'approved', NOW());
SET @company_id = LAST_INSERT_ID();

INSERT INTO internships (company_id, title, description, location, duration_weeks, is_remote, status)
VALUES (@company_id, 'Développeur Web Full-Stack',
 'Rejoignez l''équipe produit pour concevoir et développer des fonctionnalités web de bout en bout.',
 'Antananarivo', 12, 0, 'published');
SET @internship_id = LAST_INSERT_ID();

INSERT INTO internship_skills (internship_id, skill_id, weight)
SELECT @internship_id, id, 1.0 FROM skills WHERE name IN ('React','Node.js','MySQL','REST API','Git');

-- Compte admin de démo — mot de passe : "Password123!"
INSERT INTO users (email, password_hash, role, is_email_verified, is_active)
VALUES ('admin@stagematch.mg', '__HASH__', 'admin', 1, 1);
