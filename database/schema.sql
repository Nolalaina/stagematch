-- =====================================================================
-- StageMatch — Schéma de base de données MySQL (v1.0)
-- Basé sur le cahier des charges V1.0 (Septembre 2026)
-- Auteure du cahier des charges : RAKOTOVAHINY Nolalaina Harintsoa
-- =====================================================================
-- Choix techniques :
--  - InnoDB (transactions + clés étrangères)
--  - utf8mb4 (support complet Unicode, emojis, accents)
--  - Mots de passe : jamais stockés en clair -> password_hash (bcrypt côté appli)
--  - Score de matching stocké en DECIMAL(5,2) sur 0 à 100 (cf §4.1 du CDC)
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS stagematch
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stagematch;

-- ---------------------------------------------------------------------
-- 1. UTILISATEURS & AUTHENTIFICATION (F-S-01, F-E-01, NFR-03)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email               VARCHAR(191) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,          -- bcrypt (NFR-03)
    role                ENUM('student','company','admin') NOT NULL,
    is_email_verified   TINYINT(1) NOT NULL DEFAULT 0,   -- vérif. domaine universitaire (F-S-01)
    university_domain   VARCHAR(191) NULL,               -- ex: 'univ-antananarivo.mg'
    is_active           TINYINT(1) NOT NULL DEFAULT 1,   -- désactivation par admin (F-A-02)
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. RÉFÉRENTIEL DE COMPÉTENCES (F-A-04, moteur de matching §4)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS skills;
CREATE TABLE skills (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(100) NULL,                       -- ex: 'Langages', 'Frameworks', 'Soft skills'
    UNIQUE KEY uq_skills_name (name)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS fields_of_study;                     -- filières (F-A-04)
CREATE TABLE fields_of_study (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    UNIQUE KEY uq_fields_name (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. ESPACE ÉTUDIANT (§3.1 F-S-01 à F-S-08)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS student_profiles;
CREATE TABLE student_profiles (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT UNSIGNED NOT NULL,
    field_of_study_id   INT UNSIGNED NULL,                -- filière (F-S-02)
    full_name           VARCHAR(150) NOT NULL,
    year_of_study       VARCHAR(50)  NULL,                -- niveau (F-S-02)
    desired_domain      VARCHAR(150) NULL,                -- domaine souhaité (F-S-02)
    location             VARCHAR(150) NULL,               -- localisation (F-S-02)
    accepts_remote      TINYINT(1) NOT NULL DEFAULT 0,
    cv_url              VARCHAR(255) NULL,                -- upload CV (F-S-03)
    cv_parsed_at        DATETIME NULL,                    -- extraction auto des mots-clés (F-S-03)
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_user (user_id),
    KEY idx_student_field (field_of_study_id),
    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_field
        FOREIGN KEY (field_of_study_id) REFERENCES fields_of_study(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Compétences déclarées par l'étudiant, pondérées -> vecteur S du §4.1
DROP TABLE IF EXISTS student_skills;
CREATE TABLE student_skills (
    student_profile_id BIGINT UNSIGNED NOT NULL,
    skill_id            INT UNSIGNED NOT NULL,
    weight              DECIMAL(4,3) NOT NULL DEFAULT 1.000,  -- poids du tag (TF-IDF appliqué côté moteur)
    source              ENUM('manual','cv_extraction') NOT NULL DEFAULT 'manual',
    PRIMARY KEY (student_profile_id, skill_id),
    CONSTRAINT fk_ss_student
        FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. ESPACE ENTREPRISE (§3.2 F-E-01 à F-E-05)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT UNSIGNED NOT NULL,
    name                VARCHAR(150) NOT NULL,
    description         TEXT NULL,                        -- présentation (F-E-05)
    logo_url            VARCHAR(255) NULL,                 -- logo (F-E-05)
    contact_email       VARCHAR(191) NULL,
    contact_phone       VARCHAR(50)  NULL,
    sector              VARCHAR(150) NULL,                 -- pour les stats de répartition sectorielle (F-A-03)
    validation_status   ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending', -- F-A-01
    validated_by        BIGINT UNSIGNED NULL,              -- admin qui a validé
    validated_at        DATETIME NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_company_user (user_id),
    KEY idx_company_status (validation_status),
    CONSTRAINT fk_company_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_company_validator
        FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS internships;
CREATE TABLE internships (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id          BIGINT UNSIGNED NOT NULL,
    title               VARCHAR(200) NOT NULL,             -- (F-E-02)
    description         TEXT NOT NULL,
    location            VARCHAR(150) NULL,
    duration_weeks      SMALLINT UNSIGNED NULL,
    is_remote           TINYINT(1) NOT NULL DEFAULT 0,      -- filtre télétravail (F-S-05)
    status              ENUM('draft','published','closed') NOT NULL DEFAULT 'draft',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_internship_company (company_id),
    KEY idx_internship_status (status),
    KEY idx_internship_location (location),
    CONSTRAINT fk_internship_company
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Compétences requises par l'offre, pondérées -> vecteur R du §4.1
DROP TABLE IF EXISTS internship_skills;
CREATE TABLE internship_skills (
    internship_id   BIGINT UNSIGNED NOT NULL,
    skill_id        INT UNSIGNED NOT NULL,
    weight          DECIMAL(4,3) NOT NULL DEFAULT 1.000,
    PRIMARY KEY (internship_id, skill_id),
    CONSTRAINT fk_is_internship
        FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    CONSTRAINT fk_is_skill
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. CANDIDATURES & MATCHING (§3, §4, §7.2)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS applications;
CREATE TABLE applications (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_profile_id  BIGINT UNSIGNED NOT NULL,
    internship_id       BIGINT UNSIGNED NOT NULL,
    match_score         DECIMAL(5,2) NOT NULL,             -- 0.00 à 100.00 (§4.1 : seuil > 60 pour recommandation)
    status              ENUM('submitted','viewed','interview','result_positive','result_negative')
                            NOT NULL DEFAULT 'submitted',   -- suivi temps réel (F-S-07)
    applied_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_application (student_profile_id, internship_id), -- 1 candidature / étudiant / offre
    KEY idx_application_internship (internship_id, match_score),
    KEY idx_application_status (status),
    CONSTRAINT fk_app_student
        FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_internship
        FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Documents complémentaires joints à une candidature (F-S-06)
DROP TABLE IF EXISTS application_documents;
CREATE TABLE application_documents (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id  BIGINT UNSIGNED NOT NULL,
    file_url        VARCHAR(255) NOT NULL,
    label           VARCHAR(150) NULL,                     -- ex: 'Lettre de motivation'
    uploaded_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appdoc_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. NOTIFICATIONS (F-S-08)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    type        ENUM('new_match','status_change','deadline_reminder','account') NOT NULL,
    message     VARCHAR(255) NOT NULL,
    related_application_id BIGINT UNSIGNED NULL,
    is_read     TINYINT(1) NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notif_user (user_id, is_read),
    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_application
        FOREIGN KEY (related_application_id) REFERENCES applications(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. ADMINISTRATION (§3.3 F-A-01 à F-A-04)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS admin_actions;                        -- journal d'audit
CREATE TABLE admin_actions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id        BIGINT UNSIGNED NOT NULL,
    action_type     ENUM('validate_company','reject_company','deactivate_user',
                          'reactivate_user','edit_config') NOT NULL,
    target_user_id  BIGINT UNSIGNED NULL,
    comment         VARCHAR(255) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_actor
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_target
        FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 8. VUE POUR LES STATISTIQUES ADMIN (F-A-03)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_admin_stats AS
SELECT
    (SELECT COUNT(*) FROM internships WHERE status = 'published')            AS nb_stages_publies,
    (SELECT COUNT(*) FROM applications)                                      AS nb_candidatures,
    (SELECT ROUND(AVG(match_score), 2) FROM applications)                    AS score_matching_moyen,
    (SELECT COUNT(*) FROM companies WHERE validation_status = 'approved')    AS nb_entreprises_validees,
    (SELECT COUNT(*) FROM student_profiles)                                  AS nb_etudiants;

-- =====================================================================
-- Notes d'implémentation
-- =====================================================================
-- - Le calcul du score TF-IDF + similarité cosinus (§4.1) se fait côté
--   moteur de matching (microservice Python), PAS en SQL : ce schéma ne
--   stocke que le résultat (applications.match_score) et les poids
--   déclaratifs (student_skills.weight / internship_skills.weight).
-- - "CorrespondanceLieu" et "CorrespondanceDomaine" (§4.1) se déduisent
--   par comparaison applicative entre student_profiles.location /
--   desired_domain et internships.location / companies.sector — pas
--   besoin de colonnes dédiées.
-- - Index idx_application_internship (internship_id, match_score) sert
--   directement F-E-03 (candidats triés par score) et F-S-04 (retour des
--   Top-N stages, AC-01 : ≥ 3 stages avec scores pertinents).
