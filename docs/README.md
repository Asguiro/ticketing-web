# Cursor rules - Plateforme de tickets MSK Création

## Version mise à jour

Cette version ajoute des règles frontend plus strictes pour un projet **React Router v7 en SSR** avec une séparation nette entre :

- les pages React,
- les routes déclarées dans `app/routes.ts` et `app/router/*Routes.ts`,
- la logique serveur SSR dans `app/server/**`.

L'architecture frontend s'inspire du projet de référence fourni : routes explicites, layout global, dossiers par domaine, logique serveur dans `server`, et fichiers server-only suffixés en `.server.ts`.

## Structure livrée

```txt
ticketing-api/.cursor/rules/    -> à copier à la racine du repo backend
  000-project-context.mdc
  010-nestjs.mdc
  020-prisma.mdc
  030-api-contracts.mdc
  040-auth-rbac.mdc
  050-testing-quality.mdc
  060-deployment-render.mdc

ticketing-web/.cursor/rules/    -> à copier à la racine du repo frontend
  000-project-context.mdc       -> contexte frontend + SSR obligatoire
  010-react-router.mdc          -> React Router v7 SSR + routes explicites
  011-server-architecture.mdc   -> séparation app/server/<domaine>/loaders/actions
  020-api-integration.mdc       -> appels API server-only depuis loaders/actions
  030-testing-quality.mdc
  040-deployment-vercel.mdc     -> déploiement SSR

docs/
  README-api.template.md
  README-web.template.md
  CHOIX_TECHNIQUES.template.md
  CURSOR_PROMPT_FRONTEND_SSR_REFACTOR.md
```

## Architecture frontend recommandée

```txt
app/
  routes.ts
  router/
    ticketRoutes.ts
    userRoutes.ts
  pages/
    tickets/
      TicketsListPage.tsx
      TicketDetailPage.tsx
      TicketCreatePage.tsx
      components/
  components/
    layouts/
    ui/
    shared/
  server/
    auth/
      session.server.ts
      require-auth.server.ts
    api/
      api-client.server.ts
      ticket-api.server.ts
      user-api.server.ts
    tickets/
      loaders/
        ticket.server.ts
      actions/
        ticket.server.ts
      schema/
        ticket.schema.ts
  types/
    ticket.ts
    user.ts
```

## Règle clé demandée

Pour chaque page ou domaine fonctionnel :

- si la page charge des données : créer `app/server/<domaine>/loaders/<nom>.server.ts` ;
- si la page modifie des données : créer `app/server/<domaine>/actions/<nom>.server.ts` ;
- la page React Router exporte seulement un `loader`/`action` court qui délègue vers ces fichiers ;
- aucun appel API, aucune lecture de session et aucun traitement lourd de `FormData` ne doit rester dans le composant React.

Exemple :

```txt
app/server/tickets/loaders/ticket.server.ts
app/server/tickets/actions/ticket.server.ts
```

```ts
// app/pages/tickets/TicketDetailPage.tsx
import { ticketDetailLoader } from '~/server/tickets/loaders/ticket.server';
import { ticketDetailAction } from '~/server/tickets/actions/ticket.server';

export const loader = ticketDetailLoader;
export const action = ticketDetailAction;
```

## Installation

1. Copier `ticketing-api/.cursor/` à la racine du repo backend.
2. Copier `ticketing-web/.cursor/` à la racine du repo frontend.
3. Redémarrer Cursor ou recharger la fenêtre.
4. Utiliser le prompt `docs/CURSOR_PROMPT_FRONTEND_SSR_REFACTOR.md` pour demander à Cursor d'appliquer progressivement cette architecture.

## Point d'attention

Ces règles forcent maintenant une approche SSR. Cela change la stratégie d'auth frontend :

- pas de token dans `localStorage`,
- pas de token dans les composants React,
- session frontend en cookie `httpOnly`,
- appels API depuis les loaders/actions SSR avec `Authorization: Bearer`.
