# Prompt Cursor - Refactor frontend React Router v7 SSR

Utilise ce prompt dans Cursor à la racine du repo frontend.

```txt
Tu es mon assistant lead full-stack. Refactorise progressivement ce projet React Router v7 pour respecter strictement les règles Cursor du dossier `.cursor/rules`.

Objectif principal : utiliser React Router v7 en framework mode avec SSR activé, routes explicites, et séparation nette de la logique serveur.

Architecture obligatoire :
- `app/routes.ts` reste le point central des routes.
- Les routes par domaine peuvent rester dans `app/router/*Routes.ts`.
- Les pages restent dans `app/pages/<domaine>/`.
- Toute logique serveur doit être déplacée dans `app/server/<domaine>/loaders/<nom>.server.ts` ou `app/server/<domaine>/actions/<nom>.server.ts`.
- Les appels à l'API externe doivent passer par `app/server/api/*.server.ts`.
- Les pages ne doivent plus contenir directement de fetch API, lecture de session, refresh token ou traitement lourd de FormData.

Commence par la feature tickets :
1. Crée/organise `app/server/tickets/loaders/ticket.server.ts`.
2. Crée/organise `app/server/tickets/actions/ticket.server.ts`.
3. Crée/organise `app/server/api/ticket-api.server.ts` si nécessaire.
4. Dans les pages tickets, remplace les loaders/actions complets par des exports courts qui délèguent.
5. Garde l'UI dans les pages et composants.
6. Vérifie TypeScript et corrige les imports.

Ne change pas toute l'application d'un coup. Procède feature par feature et explique chaque changement avant de le faire.
```
