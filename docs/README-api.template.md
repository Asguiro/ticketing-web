# Ticketing API

## Prérequis
- Node.js >= 20, pnpm >= 9
- PostgreSQL >= 15 (local) ou instance distante

## Installation locale
\`\`\`bash
git clone <repo-api>
cd ticketing-api
pnpm install
cp .env.example .env
pnpm prisma migrate dev
pnpm prisma db seed
pnpm start:dev
\`\`\`

## URLs
- API en production (Render) : <à compléter>
- Documentation Swagger : <URL API>/api/docs
- Frontend associé (repo séparé `ticketing-web`) : <URL du repo>

## Comptes de test (créés par le seed)
| Rôle   | Email                  | Mot de passe |
|--------|------------------------|---------------|
| Client | client@test.dev        | ChangeMe123!  |
| Agent  | agent@test.dev         | ChangeMe123!  |
| Admin  | admin@test.dev         | ChangeMe123!  |

## Notes de déploiement
- Backend hébergé sur Render (offre gratuite) : peut mettre quelques secondes à
  répondre après une période d'inactivité (mise en veille automatique).
- CORS restreint au domaine Vercel du frontend, configuré via `FRONTEND_URL`.
