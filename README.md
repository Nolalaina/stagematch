# StageMatch — Application (v1)

Implémentation des fonctionnalités "Must" du cahier des charges V1.0 :
inscription/connexion, profil étudiant, publication d'offres, algorithme de
matching (TF-IDF + similarité cosinus), candidature en un clic, suivi des
candidatures, validation des entreprises par l'administrateur.

## Stack

- **Base de données** : MySQL 8 (`database/schema.sql`)
- **Backend** : Node.js + Express, JWT + bcrypt, moteur de matching maison
- **Frontend** : React (Vite), même identité visuelle que les maquettes
  (`StageMatch — Maquettes UI`) : Fraunces + IBM Plex Sans, fond ivoire, accent vert mousse

## 1. Base de données

```bash
mysql -u root -p < database/schema.sql
```

Pour charger des données de démonstration, générez d'abord un hash de mot
de passe (par défaut `Password123!`) puis remplacez `__HASH__` dans
`database/seed.sql` par la valeur obtenue :

```bash
cd backend && npm install
npm run hash-seed
# copiez le hash affiché à la place de __HASH__ (2 occurrences) dans database/seed.sql
cd .. && mysql -u root -p stagematch < database/seed.sql
```

## 2. Backend (API REST)

```bash
cd backend
cp .env.example .env      # ajustez DB_USER / DB_PASSWORD / JWT_SECRET
npm install
npm run dev                # http://localhost:4000
```

Endpoints principaux : `/api/auth`, `/api/students`, `/api/companies`,
`/api/internships`, `/api/admin`, `/api/skills`, `/api/notifications`.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (proxy /api -> :4000)
```

## Comptes de démonstration (après seed)

| Rôle       | Email                          | Mot de passe   |
|------------|---------------------------------|----------------|
| Entreprise | rh@orangedigitalcenter.mg      | Password123!   |
| Admin      | admin@stagematch.mg            | Password123!   |

Créez un compte étudiant via `/register`, complétez le profil (compétences,
localisation, domaine) puis consultez le tableau de bord : les recommandations
et le score de compatibilité (§4.1 du cahier des charges) se calculent en
temps réel côté backend.

## Ce qui est couvert (MoSCoW "Must")

F-S-01, F-S-02, F-S-04 à F-S-07, F-E-01 à F-E-04, F-A-01, F-A-02.

## Ce qui reste à faire (Should / Could, hors budget de cette implémentation)

- F-S-03 : upload et extraction automatique des mots-clés d'un CV (actuellement `cv_url` existe en base mais l'extraction n'est pas branchée)
- F-S-08 / F-E-04 : les notifications sont créées en base mais il n'y a pas encore de centre de notifications dans l'UI
- F-A-03 : les statistiques sont exposées (`/api/admin/stats`) et affichées dans l'espace admin, mais sans graphiques
- F-A-04 : gestion de la configuration (ajout de compétences/filières) exposée côté API (`POST /api/admin/skills`) mais sans écran dédié
- Tests automatisés (non couverts par ce sprint)
