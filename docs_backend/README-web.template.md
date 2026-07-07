# Ticketing Web

Frontend React Router v7 en SSR pour la plateforme de gestion de tickets MSK Création.

## Prérequis

- Node.js >= 20
- pnpm >= 9
- Une instance de l'API accessible (`ticketing-api`)

## Installation locale

```bash
git clone <repo-web>
cd ticketing-web
pnpm install
cp .env.example .env
pnpm dev
```

## Variables d'environnement

```env
API_URL=http://localhost:4000
SESSION_SECRET=change-me-with-a-strong-secret
```

> Les appels API principaux passent par les loaders/actions SSR. Éviter d'exposer inutilement l'URL API via `VITE_*` si elle n'est pas appelée depuis le navigateur.

## Architecture frontend

```txt
app/
  routes.ts
  router/
  pages/
  components/
  server/
    auth/
    api/
    tickets/
      loaders/
      actions/
  types/
```

## Règle loader/action

Les pages React Router délèguent la logique serveur :

```ts
import { ticketsListLoader } from '~/server/tickets/loaders/ticket.server';
export const loader = ticketsListLoader;
```

Pour les mutations :

```ts
import { ticketDetailAction } from '~/server/tickets/actions/ticket.server';
export const action = ticketDetailAction;
```

## URLs

- Frontend en production : <à compléter>
- API associée : <à compléter>

## Comptes de test

Voir le README du repo `ticketing-api`.

| Rôle   | Email           | Mot de passe |
|--------|-----------------|--------------|
| Client | client@test.dev | ChangeMe123! |
| Agent  | agent@test.dev  | ChangeMe123! |
| Admin  | admin@test.dev  | ChangeMe123! |

## Notes de déploiement

- Le frontend doit être déployé sur une plateforme compatible SSR React Router.
- Les cookies de session doivent être `httpOnly`, `secure` en production et signés avec `SESSION_SECRET`.
- Tester en navigation privée avant remise.
