# Choix techniques - Plateforme de gestion de tickets de support

## 1. Stack et justification

- **Backend : NestJS + Prisma + PostgreSQL** - <justifier>.
- **Frontend : React Router v7 en framework mode avec SSR** - choisi pour garder le chargement de données, l'authentification et les mutations côté serveur frontend via `loader`/`action`, avec une UX moderne et une architecture claire.
- **Deux repos séparés** (`ticketing-api` / `ticketing-web`) - <justifier : déploiements indépendants, séparation API/UI, lisibilité pour l'évaluation>.
- **Auth : JWT côté API + session cookie httpOnly côté frontend SSR** - le frontend stocke la session de manière serveur/cookie et appelle l'API depuis les loaders/actions avec un bearer token, sans exposer les tokens dans les composants React.
- **Déploiement : Render pour l'API + Vercel ou équivalent SSR pour le frontend** - <justifier>.

## 2. Architecture

### Repo `ticketing-api`

Modules NestJS : `auth`, `users`, `tickets`, `messages`, `dashboard`. Contrat exposé via Swagger (`/api/docs`).

### Repo `ticketing-web`

React Router v7 SSR avec routes explicites :

```txt
app/routes.ts
app/router/*Routes.ts
app/pages/**
app/components/**
app/server/**
```

La logique serveur frontend est séparée par domaine :

```txt
app/server/tickets/loaders/ticket.server.ts
app/server/tickets/actions/ticket.server.ts
app/server/api/ticket-api.server.ts
```

Les pages React ne contiennent que l'UI et délèguent leurs `loader`/`action` vers `app/server/**`.

## 3. Décisions de conception

- Modélisation des données : <résumé des entités clés et relations>.
- Machine à états des statuts de ticket : <transitions autorisées/interdites>.
- Calcul du SLA : <temps calendaire vs heures ouvrées, et pourquoi>.
- Auth SSR : <expliquer session cookie, refresh éventuel, absence de token côté composant>.
- Séparation frontend : <expliquer pages / routes / server loaders / server actions / API wrappers>.

## 4. Traitement des points d'attention du sujet

- **Double assignation concurrente** : <stratégie retenue - update atomique conditionnel / verrou optimiste - et pourquoi>.
- **Message client sur ticket résolu** : <comportement retenu>.
- **Transitions de statut autorisées** : <règles retenues>.
- **Jours/heures ouvrés pour le SLA** : <choix retenu et limite connue>.

## 5. Limites connues et pistes d'amélioration

<Ce qui n'a pas été fait par manque de temps, et ce qui serait fait avec plus de temps : génération de types depuis Swagger/OpenAPI, tests e2e, monitoring, meilleure session server-side store, etc.>
