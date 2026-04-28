# Questly — Transforme tes tâches en quête

Questly est une application de productivité gamifiée qui transforme ta gestion du quotidien en une expérience engageante. Chaque tâche complétée rapporte de l'XP, fait progresser ton niveau et alimente ton streak — comme un RPG, mais pour ta vie réelle.

---

## Pourquoi Questly ?

Les applications de to-do sont ennuyeuses. On les ouvre, on les ferme, on les oublie.

Questly résout ce problème en ajoutant une couche de progression et de récompense à chaque action. Tu ne coches pas des cases — tu montes en niveau.

---

## Ce que tu peux faire

- **Gérer tes tâches** — Crée, filtre et organise par priorité, catégorie et statut
- **Planifier ta semaine** — Assigne tes tâches à des blocs de temps dans un calendrier hebdomadaire
- **Suivre ta progression** — XP, niveaux, streak quotidien et achievements débloquables
- **Voir tes stats** — Dashboard en temps réel avec activité de la semaine et tâches du jour

---

## Stack technique

### Frontend
- **React 18** + TypeScript + Vite
- **TanStack Query** — cache et synchronisation des données
- **Zustand** — gestion de l'état auth
- **Lucide React** — icônes
- **Anime.js** — animations

### Backend
- **NestJS 11** + TypeScript
- **Prisma 7** + PostgreSQL (Neon)
- **JWT** — access token (15min) + refresh token httpOnly cookie
- **Zod** — validation des DTOs

### Infrastructure
- **Railway** — backend
- **Vercel** — frontend
- **Neon** — base de données PostgreSQL serverless

---

## Démarrage rapide

### Prérequis
- Node.js 20+
- npm 10+

### Backend

```bash
cd back
npm install
cp .env.example .env
# Remplis les variables dans .env
npx prisma migrate dev
npx ts-node -r tsconfig-paths/register prisma/seed.ts
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5173/api
npm run dev
```

---

## Variables d'environnement

### Backend (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `JWT_ACCESS_SECRET` | Secret pour les access tokens |
| `JWT_REFRESH_SECRET` | Secret pour les refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Durée access token (ex: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Durée refresh token (ex: `7d`) |
| `FRONTEND_URL` | URL(s) autorisée(s) pour le CORS |
| `PORT` | Port du serveur (défaut: `3000`) |
| `NODE_ENV` | `development` ou `production` |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de l'API backend |

---

## Architecture

```
questly/
├── back/                     # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Login, register, refresh, logout
│   │   │   ├── tasks/         # CRUD tâches + changement de statut
│   │   │   ├── time-blocks/   # Blocs de temps + assignation de tâches
│   │   │   ├── categories/    # Catégories par utilisateur
│   │   │   ├── gamification/  # XP, niveaux, streak, achievements
│   │   │   └── priorities/    # Niveaux de priorité
│   │   └── common/            # Guards, filtres, intercepteurs
│   └── prisma/                # Schéma + migrations + seed
│
└── frontend/                  # App React
    └── src/
        ├── api/               # Clients Axios par domaine
        ├── components/        # Composants UI réutilisables
        ├── hooks/             # Logique métier (TanStack Query)
        ├── pages/             # Dashboard, Tâches, Calendrier, Progression
        ├── store/             # État global (Zustand)
        └── styles/            # Design tokens
```

---

## Sécurité

- Authentification via JWT avec rotation automatique des tokens
- Refresh token stocké en cookie `httpOnly` — inaccessible au JavaScript
- Protection IDOR sur toutes les routes — un utilisateur ne peut accéder qu'à ses propres données
- Validation Zod sur tous les DTOs entrants
- Helmet + rate limiting sur le backend

---

## Déploiement

| Environnement | Service | URL |
|---|---|---|
| Backend | Railway | `https://todolist-backend-fun.up.railway.app` |
| Frontend | Vercel | `https://todolist-fun.vercel.app` |
| Base de données | Neon | PostgreSQL serverless |

---

## Auteur

**Sahiré** — [GitHub](https://github.com/MrPanda225)

---

*Questly — Chaque tâche compte. Chaque jour compte.*
