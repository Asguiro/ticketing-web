# Frontend — `ticketing-web` — Pages React Router v7 (SSR)

Structure alignée sur `010-react-router.mdc` / `020-server-architecture.mdc` :
`app/pages/<domaine>/<Nom>Page.tsx` + logique dans `app/server/<domaine>/{loaders,actions}`.

---

## 1. Domaine `auth`

### `app/pages/auth/LoginPage.tsx`
- Route : `/login`
- Public (redirige vers `/dashboard` si déjà authentifié)
- `action` → appelle `POST /auth/login`, stocke l'access token (en mémoire / contexte,
  pas de cookie — cf. décision cross-origin)
- Pas de `loader` de données, juste vérif session existante → `redirect`

**Server**
```
app/server/auth/session.server.ts        // gestion du token en mémoire côté serveur SSR
app/server/auth/require-auth.server.ts   // helper appelé dans chaque loader protégé
app/server/auth/redirect.server.ts       // redirects selon rôle après login
app/server/auth/actions/login.server.ts
```

---

## 2. Domaine `dashboard`

### `app/pages/dashboard/DashboardPage.tsx`
- Route : `/dashboard`
- `loader` protégé (`require-auth.server.ts`), appelle `GET /dashboard/stats`
- Rendu conditionnel selon `user.role` :
  - **Client** : mes tickets ouverts / résolus, bouton "Créer un ticket"
  - **Agent** : mes tickets assignés, mes tickets en retard
  - **Admin** : vue globale (tous compteurs + éventuel graphique répartition statuts)

**Server**
```
app/server/dashboard/loaders/dashboard.server.ts
```

**Composants dédiés**
```
app/components/dashboard/StatsCard.tsx
app/components/dashboard/OverdueBadge.tsx
```

---

## 3. Domaine `tickets`

### `app/pages/tickets/TicketsListPage.tsx`
- Route : `/tickets`
- `loader` → `GET /tickets` avec `searchParams` (status, priority, assignedAgentId, tri)
  transmis tels quels à l'API
- Vue différenciée par rôle (colonnes visibles, filtres disponibles) :
  - Client : pas de filtre "agent assigné"
  - Agent : filtre par défaut sur "mes tickets"
  - Admin : tous les filtres + colonne agent assigné

**Server**
```
app/server/tickets/loaders/ticket.server.ts   → ticketsListLoader
```

**Composants**
```
app/components/tickets/TicketFilters.tsx
app/components/tickets/TicketTable.tsx
app/components/tickets/StatusBadge.tsx
app/components/tickets/PriorityBadge.tsx
```

---

### `app/pages/tickets/NewTicketPage.tsx`
- Route : `/tickets/new`
- Accessible **Client uniquement** (guard rôle dans le loader → redirect/403 sinon)
- `action` → `POST /tickets` (titre, description, catégorie, priorité)
- Validation côté client via schéma partagé (`zod`) + erreurs serveur remontées proprement

**Server**
```
app/server/tickets/actions/ticket.server.ts     → createTicketAction
app/server/tickets/schema/ticket.schema.ts
```

---

### `app/pages/tickets/TicketDetailPage.tsx`
- Route : `/tickets/:id`
- `loader` → `GET /tickets/:id` + `GET /tickets/:id/messages` + `GET /tickets/:id/history`
  (agrégés dans le loader pour un seul aller-retour côté page)
- `action` avec `intent` (via `useFetcher`) pour distinguer les mutations :
  - `intent=send-message` → `POST /tickets/:id/messages`
  - `intent=change-status` → `PATCH /tickets/:id/status`
  - `intent=assign` → `PATCH /tickets/:id/assign` (gérer le `409 Conflict` en cas de
    double assignation → toast + refresh des données, pas de crash)

**Contenu affiché selon rôle**
- Client : fil de discussion, statut, historique — pas de bouton assignation/changement
  de statut libre (ou action limitée, ex. "réponse" seulement)
- Agent : boutons de transition de statut autorisées, réponse au client
- Admin : tout + bouton "assigner/réassigner à un agent"

**Server**
```
app/server/tickets/loaders/ticket.server.ts   → ticketDetailLoader
app/server/tickets/actions/ticket.server.ts   → ticketDetailAction (dispatch par intent)
```

**Composants**
```
app/components/tickets/MessageThread.tsx
app/components/tickets/MessageComposer.tsx
app/components/tickets/StatusHistoryTimeline.tsx
app/components/tickets/StatusTransitionButtons.tsx
app/components/tickets/AssignAgentSelect.tsx   // Admin uniquement
```

---

## 4. Domaine `users` (Admin uniquement)

### `app/pages/users/UsersListPage.tsx`
- Route : `/users`
- Guard rôle : Admin uniquement (redirect `/dashboard` sinon)
- `loader` → `GET /users`, filtre par rôle

### `app/pages/users/NewUserPage.tsx` (ou modale intégrée à la liste)
- Route : `/users/new`
- `action` → `POST /users` (création client/agent/admin)

**Server**
```
app/server/users/loaders/user.server.ts
app/server/users/actions/user.server.ts
```

**Composants**
```
app/components/users/UserTable.tsx
app/components/users/UserForm.tsx
app/components/users/RoleBadge.tsx
```

---

## 5. Pages transverses

### `app/pages/errors/NotFoundPage.tsx`
- `404` générique (route catch-all)

### `app/pages/errors/ForbiddenPage.tsx`
- Affichée quand un loader renvoie `403` (accès à un ticket qui n'est pas le sien, etc.)

### `app/pages/RootLayoutPage.tsx` (ou `app/root.tsx` selon convention RRv7)
- Layout global : nav selon rôle, gestion logout, affichage user courant

---

## Récapitulatif des routes

| Route | Page | Rôles autorisés |
|---|---|---|
| `/login` | LoginPage | Public |
| `/dashboard` | DashboardPage | Client, Agent, Admin |
| `/tickets` | TicketsListPage | Client, Agent, Admin |
| `/tickets/new` | NewTicketPage | Client |
| `/tickets/:id` | TicketDetailPage | Client (owner), Agent (assigné), Admin |
| `/users` | UsersListPage | Admin |
| `/users/new` | NewUserPage | Admin |

## Modules front transverses (hors pages)

```
app/server/api/api-client.server.ts     // fetch wrapper + Authorization header + gestion erreurs
app/server/api/ticket-api.server.ts
app/server/api/user-api.server.ts
app/server/api/dashboard-api.server.ts
app/lib/auth-context.tsx                // contexte client pour l'access token en mémoire
app/lib/roles.ts                        // constantes + helpers hasRole()
```
