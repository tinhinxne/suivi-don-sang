-- Base de données QATRA : suivi des dons de sang
-- Basée sur le diagramme de classes (sans la classe Événement),
-- le smart contract SuiviDonSang et les écrans du frontend.

CREATE DATABASE IF NOT EXISTS suivi_don_sang
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE suivi_don_sang;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS analyses, poches, distributions, demandes, dons, donneurs, utilisateurs, hopitaux;
SET FOREIGN_KEY_CHECKS = 1;

-- Hôpital
CREATE TABLE hopitaux (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  nom   VARCHAR(150) NOT NULL,
  ville VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Utilisateur (Administrateur / Agent centre / Médecin via "role")
CREATE TABLE utilisateurs (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  nom                VARCHAR(100) NOT NULL,
  email              VARCHAR(150) NOT NULL UNIQUE,
  password_hash      VARCHAR(255) NOT NULL,
  role               ENUM('administrateur','agent_centre','medecin') NOT NULL,
  statut             ENUM('actif','inactif') NOT NULL DEFAULT 'actif',
  derniere_connexion DATETIME NULL,
  hopital_id         INT NULL,   -- Hôpital 1 --- 1..* Médecin (optionnel à la création du compte)
  CONSTRAINT fk_user_hopital FOREIGN KEY (hopital_id) REFERENCES hopitaux(id)
) ENGINE=InnoDB;

-- Donneur
CREATE TABLE donneurs (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nom            VARCHAR(100) NOT NULL,
  prenom         VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  sexe           ENUM('M','F') NOT NULL,
  telephone      VARCHAR(20) NULL,
  groupe_sanguin ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  dernier_don    DATE NULL
) ENGINE=InnoDB;

-- Don (Donneur 1 --- 0..* Don ; Agent centre enregistre Don)
CREATE TABLE dons (
  id_don         INT AUTO_INCREMENT PRIMARY KEY,
  donneur_id     INT NOT NULL,
  agent_id       INT NOT NULL,
  date_collecte  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lieu           VARCHAR(150) NOT NULL,
  volume_ml      INT NOT NULL CHECK (volume_ml > 0),
  groupe_sanguin ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  tx_hash        VARCHAR(66) NULL,
  CONSTRAINT fk_don_donneur FOREIGN KEY (donneur_id) REFERENCES donneurs(id),
  CONSTRAINT fk_don_agent   FOREIGN KEY (agent_id)   REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- Demande (Médecin 1 --- 0..* Demande ; Agent centre traite Demande)
-- Statuts du front : pending / accepted / partial / distributed (+ refusée)
CREATE TABLE demandes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  medecin_id     INT NOT NULL,
  hopital_id     INT NOT NULL,   -- hôpital choisi dans le formulaire de demande
  agent_id       INT NULL,
  groupe_sanguin ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,  -- groupe du patient
  quantite       INT NOT NULL CHECK (quantite > 0),                          -- nombre de poches
  urgence        ENUM('normale','urgente','critique') NOT NULL DEFAULT 'normale',
  statut         ENUM('en_attente','acceptee','partielle','distribuee','refusee') NOT NULL DEFAULT 'en_attente',
  date_demande   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dem_medecin FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id),
  CONSTRAINT fk_dem_hopital FOREIGN KEY (hopital_id) REFERENCES hopitaux(id),
  CONSTRAINT fk_dem_agent   FOREIGN KEY (agent_id)   REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- Distribution (Demande 1 --- 0..* Distribution ; Agent centre effectue Distribution)
CREATE TABLE distributions (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  demande_id        INT NOT NULL,
  agent_id          INT NOT NULL,
  date_distribution DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tx_hash           VARCHAR(66) NULL,
  CONSTRAINT fk_dist_demande FOREIGN KEY (demande_id) REFERENCES demandes(id),
  CONSTRAINT fk_dist_agent   FOREIGN KEY (agent_id)   REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- Poche (Don 1 --- 1..* Poche ; Distribution 1 --- 1..* Poche)
-- Statuts alignés sur le contrat : Enregistre, EnAnalyse, Valide, Rejete, Stocke, Distribue
-- L'identifiant de la poche (id_poche) est l'identifiant envoyé au contrat.
CREATE TABLE poches (
  id_poche         INT AUTO_INCREMENT PRIMARY KEY,
  don_id           INT NOT NULL,
  distribution_id  INT NULL,
  groupe_sanguin   ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  statut           ENUM('enregistre','en_analyse','valide','rejete','stocke','distribue') NOT NULL DEFAULT 'enregistre',
  tx_hash          VARCHAR(66) NULL,
  tx_hash_stockage VARCHAR(66) NULL,
  CONSTRAINT fk_poche_don  FOREIGN KEY (don_id) REFERENCES dons(id_don),
  CONSTRAINT fk_poche_dist FOREIGN KEY (distribution_id) REFERENCES distributions(id)
) ENGINE=InnoDB;

-- Analyse (Poche 1 --- 0..* Analyse ; Agent centre effectue Analyse)
CREATE TABLE analyses (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  poche_id       INT NOT NULL,
  agent_id       INT NOT NULL,
  date_analyse   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resultat       ENUM('conforme','non_conforme') NOT NULL,
  remarque       TEXT NULL,
  tx_hash        VARCHAR(66) NULL,
  CONSTRAINT fk_ana_poche FOREIGN KEY (poche_id) REFERENCES poches(id_poche),
  CONSTRAINT fk_ana_agent FOREIGN KEY (agent_id) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

CREATE INDEX idx_poches_stock ON poches (statut, groupe_sanguin);
CREATE INDEX idx_demandes_statut ON demandes (statut, urgence);
