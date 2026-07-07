# Guide d'intégration API — pour le frontend `ticketing-web`

Ce document est la **référence principale** pour consommer l'API depuis le repo frontend.
Le contrat HTTP est versionné (`/api/v1`). Swagger (`/api/docs`) reste la source de vérité interactive.

> Types TypeScript prêts à recopier : [`FRONTEND_TYPES.ts`](./FRONTEND_TYPES.ts)  
> Matrice des permissions : [`RBAC_MATRIX.md`](./RBAC_MATRIX.md)  
> Pages et routes : [`FRONTEND_PAGES.md`](./FRONTEND_PAGES.md)

---

## 1. Configuration de base

### URL de l'API

| Environnement | Variable frontend | Valeur |
|---------------|-------------------|--------|
| Dev local | `API_URL` | `http://localhost:3000/api/v1` |
| Production | `API_URL` | URL Render + `/api/v1` |

### En-têtes communs

```http
Content-Type: application/json
Authorization: Bearer <accessToken>   # routes protégées uniquement
```

### Format des erreurs (toutes les routes)

```json
{
  "statusCode": 400,
  "message": ["Transition de statut interdite : OPEN → CLOSED"],
  "error": "BAD_REQUEST",
  "path": "/api/v1/tickets/uuid/status",
  "timestamp": "2026-07-07T14:00:00.000Z"
}
```

`message` est **toujours un tableau de strings** (même pour une seule erreur).

### Codes HTTP à gérer côté frontend

| Code | Signification | Action frontend suggérée |
|------|---------------|--------------------------|
| 400 | Validation ou règle métier | Afficher `message[0]` |
| 401 | Token expiré ou invalide | Tenter refresh, sinon redirect `/login` |
| 403 | Rôle ou ownership insuffisant | Page 403 ou toast |
| 404 | Ressource introuvable | Page 404 |
| 409 | Conflit (assignation, email dupliqué) | Toast + refresh données |
| 429 | Rate limit (login) | Message « Trop de tentatives » |

---

## 2. Authentification cross-origin

L'API et le frontend sont sur des domaines différents. **Pas de cookie d'auth émis par l'API.**

### Flux login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "client@test.dev",
  "password": "ChangeMe123!"
}
```

**Réponse 200 :**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "a1b2c3...",
  "user": {
    "id": "uuid",
    "email": "client@test.dev",
    "firstName": "Client",
    "lastName": "Test",
    "role": "CLIENT",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Stockage recommandé

| Token | Où le stocker | Durée |
|-------|---------------|-------|
| `accessToken` | Mémoire serveur (SSR) ou contexte React (SPA) — **jamais localStorage** | 15 min |
| `refreshToken` | Cookie httpOnly sur le domaine frontend (SSR) ou mémoire session | 7 jours |

### Refresh automatique

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "a1b2c3..." }
```

Réponse identique au login. L'ancien refresh token est **invalidé** (rotation).

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "refreshToken": "a1b2c3..." }
```

Réponse : `204 No Content`.

### Profil courant

```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

### Wrapper fetch recommandé (SSR)

```typescript
async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken: string },
): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.accessToken}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // déclencher refresh côté serveur, puis retry ou redirect login
    throw new AuthError();
  }

  if (!res.ok) {
    const body = await res.json();
    throw new ApiError(res.status, body.message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
```

### Redirect après login selon rôle

| Rôle | Route par défaut |
|------|------------------|
| CLIENT | `/dashboard` ou `/tickets` |
| AGENT | `/dashboard` |
| ADMIN | `/dashboard` |

---

## 3. Enums (valeurs exactes)

Recopier depuis [`FRONTEND_TYPES.ts`](./FRONTEND_TYPES.ts) :

```typescript
type Role = 'CLIENT' | 'AGENT' | 'ADMIN';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';

type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
```

---

## 4. Endpoints — référence complète

### Health

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/health` | Non | `{ status: "ok", timestamp }` |

---

### Auth

| Méthode | Route | Auth | Body | Réponse |
|---------|-------|------|------|---------|
| POST | `/auth/login` | Non | `{ email, password }` | `AuthTokensResponse` |
| POST | `/auth/refresh` | Non | `{ refreshToken }` | `AuthTokensResponse` |
| POST | `/auth/logout` | Oui | `{ refreshToken }` | 204 |
| GET | `/auth/me` | Oui | — | `User` |

---

### Users (Admin)

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| GET | `/users` | Oui | ADMIN | Liste paginée |
| GET | `/users/:id` | Oui | ADMIN ou soi-même | Détail |
| POST | `/users` | Oui | ADMIN | Création |
| PATCH | `/users/:id` | Oui | ADMIN | Modification |
| DELETE | `/users/:id` | Oui | ADMIN | Soft delete (204) |

**Query `GET /users` :** `?role=AGENT&page=1&pageSize=20`

**Body `POST /users` :**

```json
{
  "email": "nouveau@test.dev",
  "password": "ChangeMe123!",
  "role": "AGENT",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponse liste :** `{ data: User[], meta: { total, page, pageSize } }`

---

### Tickets

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| POST | `/tickets` | Oui | CLIENT | Créer un ticket |
| GET | `/tickets` | Oui | Tous | Liste paginée (scopée par rôle) |
| GET | `/tickets/:id` | Oui | Tous* | Détail |
| PATCH | `/tickets/:id/status` | Oui | AGENT, ADMIN | Changer le statut |
| PATCH | `/tickets/:id/assign` | Oui | AGENT, ADMIN | Assigner |
| GET | `/tickets/:id/history` | Oui | Tous* | Historique statuts |

\* Selon ownership — voir [RBAC_MATRIX.md](./RBAC_MATRIX.md)

**Query `GET /tickets` :**

```
?status=OPEN
&priority=HIGH
&assignedAgentId=<uuid>        # Admin uniquement
&includeUnassigned=true        # Agent : inclure tickets non assignés
&sortBy=createdAt               # createdAt | updatedAt | priority
&order=desc                     # asc | desc
&page=1
&pageSize=20
```

**Body `POST /tickets` :**

```json
{
  "title": "Problème de connexion",
  "description": "Je n'arrive plus à me connecter depuis ce matin.",
  "category": "Authentification",
  "priority": "MEDIUM"
}
```

**Body `PATCH /tickets/:id/status` :**

```json
{ "status": "IN_PROGRESS" }
```

**Body `PATCH /tickets/:id/assign` :**

```json
{ "agentId": "uuid-agent" }
```

- **Agent** : omettre `agentId` pour s'auto-assigner → `409` si déjà pris.
- **Admin** : `agentId` requis.

**Réponse `Ticket` :**

```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "category": "Authentification",
  "priority": "MEDIUM",
  "status": "OPEN",
  "clientId": "uuid",
  "assignedAgentId": null,
  "resolvedAt": null,
  "createdAt": "2026-07-07T10:00:00.000Z",
  "updatedAt": "2026-07-07T10:00:00.000Z",
  "deadline": "2026-07-08T10:00:00.000Z",
  "isLate": false
}
```

`deadline` et `isLate` sont calculés côté API (SLA calendaire).

**Réponse liste :** `{ data: Ticket[], meta: { total, page, pageSize } }`

**Réponse `GET /tickets/:id/history` :** tableau de :

```json
{
  "id": "uuid",
  "fromStatus": "OPEN",
  "toStatus": "IN_PROGRESS",
  "changedById": "uuid",
  "changedAt": "2026-07-07T11:00:00.000Z",
  "changedBy": {
    "id": "uuid",
    "email": "agent@test.dev",
    "firstName": "Agent",
    "lastName": "Test"
  }
}
```

`fromStatus` est `null` pour la création initiale.

---

### Messages

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/tickets/:ticketId/messages` | Oui | Fil de discussion |
| POST | `/tickets/:ticketId/messages` | Oui | Envoyer un message |

**Body `POST` :**

```json
{ "content": "Merci pour votre retour." }
```

**Réponse `Message` :**

```json
{
  "id": "uuid",
  "ticketId": "uuid",
  "authorId": "uuid",
  "content": "...",
  "createdAt": "2026-07-07T12:00:00.000Z",
  "updatedAt": "2026-07-07T12:00:00.000Z",
  "author": {
    "id": "uuid",
    "email": "client@test.dev",
    "firstName": "Client",
    "lastName": "Test",
    "role": "CLIENT"
  }
}
```

**Réouverture automatique :** si un **client** envoie un message sur un ticket `RESOLVED`, le statut passe à `REOPENED`. Rafraîchir le ticket après envoi (ou écouter l'événement WebSocket `ticket:reopened`).

---

### Dashboard

| Méthode | Route | Auth | Query | Description |
|---------|-------|------|-------|-------------|
| GET | `/dashboard/stats` | Oui | `?periodDays=30` | Agrégats scopés par rôle |

**Réponse :**

```json
{
  "openCount": 5,
  "overdueCount": 2,
  "resolvedInPeriodCount": 12,
  "period": {
    "from": "2026-06-07T00:00:00.000Z",
    "to": "2026-07-07T14:00:00.000Z"
  },
  "byStatus": {
    "OPEN": 3,
    "IN_PROGRESS": 2,
    "RESOLVED": 10
  }
}
```

`byStatus` est présent **uniquement pour ADMIN**. `periodDays` : défaut 30, max 365.

---

## 5. Machine à états — guide UI

### Transitions autorisées (globales)

```
OPEN        → IN_PROGRESS
IN_PROGRESS → RESOLVED
RESOLVED    → CLOSED, REOPENED
REOPENED    → IN_PROGRESS
CLOSED      → (aucune)
```

### Boutons à afficher par rôle

| Statut actuel | CLIENT | AGENT (assigné) | ADMIN |
|---------------|--------|-----------------|-------|
| OPEN | — | « Prendre en charge » (assign + IN_PROGRESS) | Assigner + transitions |
| IN_PROGRESS | — | « Marquer résolu » | Toutes transitions |
| RESOLVED | Envoyer message → réouverture auto | Message seulement | « Fermer », réassigner |
| REOPENED | Message | « Reprendre » (IN_PROGRESS) | Toutes transitions |
| CLOSED | Lecture seule | Lecture seule | Lecture seule |

### Affichage SLA

- Badge « En retard » si `ticket.isLate === true`.
- Afficher `ticket.deadline` formatée (date limite SLA).
- Masquer le compteur `overdueCount` pour le client si souhaité (l'API le renvoie quand même).

---

## 6. WebSocket — chat temps réel

Complément au REST. Namespace : `/chat` sur la même origine que l'API (sans `/api/v1`).

### Connexion

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: { token: accessToken },
  // ou : extraHeaders: { Authorization: `Bearer ${accessToken}` }
});
```

### Événements client → serveur

| Événement | Payload | Description |
|-----------|---------|-------------|
| `joinTicket` | `{ ticketId: string }` | Rejoindre la room du ticket (vérifie l'accès) |
| `leaveTicket` | `{ ticketId: string }` | Quitter la room |
| `sendMessage` | `{ ticketId: string, content: string }` | Envoyer un message (mêmes règles que REST) |

### Événements serveur → client

| Événement | Payload | Quand |
|-----------|---------|-------|
| `message:created` | `Message` | Nouveau message (REST ou WS) |
| `ticket:reopened` | `{ ticketId, status: "REOPENED" }` | Client répond sur ticket résolu |

### Pattern recommandé page détail ticket

1. Au mount : `GET /tickets/:id/messages` (chargement initial).
2. Connexion WS + `joinTicket`.
3. Écouter `message:created` pour append au fil sans re-fetch.
4. Écouter `ticket:reopened` pour mettre à jour le badge statut.
5. Au unmount : `leaveTicket` + disconnect.

Le `POST` REST reste utilisable seul (sans WS) pour un MVP.

---

## 7. Scénarios d'intégration par page

### LoginPage

1. `POST /auth/login`
2. Stocker tokens (session serveur)
3. Redirect selon rôle

### DashboardPage

1. `GET /dashboard/stats?periodDays=30`
2. Affichage conditionnel selon `user.role`

### TicketsListPage

1. `GET /tickets` avec query params des filtres UI
2. Agent : `includeUnassigned=true` pour voir le pool non assigné
3. Admin : filtre `assignedAgentId` via select agents (`GET /users?role=AGENT`)

### TicketDetailPage

Charger en parallèle dans le loader :

```typescript
const [ticket, messages, history] = await Promise.all([
  api.get(`/tickets/${id}`),
  api.get(`/tickets/${id}/messages`),
  api.get(`/tickets/${id}/history`),
]);
```

Actions (via `useFetcher` + intent) :

| Intent | Endpoint | Notes |
|--------|----------|-------|
| `send-message` | `POST /tickets/:id/messages` | Réouverture auto si client + RESOLVED |
| `change-status` | `PATCH /tickets/:id/status` | Vérifier transitions autorisées |
| `assign` | `PATCH /tickets/:id/assign` | Gérer 409 |

### NewTicketPage (Client)

`POST /tickets` → redirect vers `/tickets/:id`

### UsersListPage (Admin)

`GET /users` + `POST /users` / `PATCH /users/:id` / `DELETE /users/:id`

---

## 8. Checklist intégration

- [ ] Variable `API_URL` configurée (dev + prod)
- [ ] Wrapper fetch avec gestion 401 → refresh
- [ ] Enums recopiés depuis `FRONTEND_TYPES.ts`
- [ ] CORS : `FRONTEND_URL` côté API = URL exacte du frontend Vercel
- [ ] Gestion 409 sur assignation agent
- [ ] Rafraîchissement statut après message client sur ticket RESOLVED
- [ ] Pagination : utiliser `meta.total`, `meta.page`, `meta.pageSize`
- [ ] Swagger consulté pour valider les DTO avant implémentation
