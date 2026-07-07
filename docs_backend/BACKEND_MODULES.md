# Backend — `ticketing-api` — Modules NestJS

État **implémenté** (phases 0–8). Basé sur le périmètre fonctionnel du test MSK Création.

Pour le frontend : voir [`API_FRONTEND.md`](./API_FRONTEND.md) et [`FRONTEND_TYPES.ts`](./FRONTEND_TYPES.ts).

---

## 1. `AuthModule` ✅

Authentification JWT cross-origin (tokens dans le corps, pas de cookie API).

**Fichiers**
```
src/auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts
  strategies/jwt.strategy.ts
  guards/jwt-auth.guard.ts
  guards/roles.guard.ts
  decorators/roles.decorator.ts
  decorators/current-user.decorator.ts
  dto/login.dto.ts, refresh.dto.ts, logout.dto.ts
```

**Endpoints**
- `POST /auth/login` → `{ accessToken, refreshToken, user }` (rate limit 5/min)
- `POST /auth/refresh` → rotation du refresh token
- `POST /auth/logout` → 204, invalidation refresh
- `GET /auth/me` → profil utilisateur

**Notes**
- Pas de `POST /auth/register` public : comptes créés par l'Admin via `UsersModule`.
- Access token 15 min, refresh 7 jours (configurable via env).
- Refresh tokens hashés SHA-256 en base (`RefreshToken`).

---

## 2. `UsersModule` ✅

Gestion des comptes (réservé Admin, sauf lecture de son propre profil).

**Endpoints**
- `GET /users` — Admin, liste paginée + filtre `role`
- `GET /users/:id` — Admin ou soi-même
- `POST /users` — Admin, création
- `PATCH /users/:id` — Admin
- `DELETE /users/:id` — Admin, soft delete (204)

---

## 3. `TicketsModule` ✅

Cœur métier : création, cycle de vie, assignation atomique, historique.

**Fichiers clés**
```
src/tickets/
  tickets.service.ts
  tickets.controller.ts
  logic/status-transition.rules.ts    # Machine à états
  logic/ticket-scope.util.ts          # Filtres RBAC réutilisés par dashboard
  mappers/ticket-response.mapper.ts
```

**Endpoints**
- `POST /tickets` — Client uniquement
- `GET /tickets` — liste paginée scopée par rôle
- `GET /tickets/:id` — détail (ownership)
- `PATCH /tickets/:id/status` — Agent/Admin, machine à états
- `PATCH /tickets/:id/assign` — Admin ou auto-assign Agent (409 si conflit)
- `GET /tickets/:id/history` — historique des statuts

**Concurrence** : `updateMany({ assignedAgentId: null })` pour auto-assignation → `409 Conflict`.

**Réouverture** : déléguée à `MessagesModule` via `reopenFromClientMessage()`.

---

## 4. `MessagesModule` ✅

Fil de discussion + WebSocket temps réel.

**Endpoints REST**
- `GET /tickets/:ticketId/messages`
- `POST /tickets/:ticketId/messages` — client propriétaire ou agent assigné

**WebSocket** (`MessagesGateway`, namespace `/chat`)
- Auth JWT au handshake
- Events : `joinTicket`, `leaveTicket`, `sendMessage`, `message:created`, `ticket:reopened`

---

## 5. `SlaModule` ✅

Logique de calcul des délais — isolée et testable.

**Fichiers**
```
src/sla/
  sla.config.ts     # HIGH: 4h, MEDIUM: 24h, LOW: 72h
  sla.util.ts       # computeDeadline, isOverdue, buildOverdueTicketFilter
  sla.service.ts
```

- Temps **calendaire brut** (cf. `CHOIX_TECHNIQUES.md` §3).
- `isLate` recalculé à la lecture sur chaque `TicketResponse`.
- Utilisé par `TicketsModule` et `DashboardModule`.

---

## 6. `DashboardModule` ✅

Agrégats pour les indicateurs chiffrés.

**Endpoint**
- `GET /dashboard/stats?periodDays=30`

**Réponse** : `{ openCount, overdueCount, resolvedInPeriodCount, period, byStatus? }`

Règles détaillées : `CHOIX_TECHNIQUES.md` §6.

---

## 7. `PrismaModule` / `common` ✅

```
src/prisma/           # PrismaService global + AuthDatabase
src/common/filters/   # HttpExceptionFilter
src/config/           # Validation Joi des variables d'env
```

---

## Récapitulatif des modules

| Module | Rôle principal | État |
|--------|----------------|:----:|
| AuthModule | Tous | ✅ |
| UsersModule | Admin | ✅ |
| TicketsModule | Client/Agent/Admin | ✅ |
| MessagesModule | Client/Agent | ✅ |
| SlaModule | (transverse) | ✅ |
| DashboardModule | Client/Agent/Admin | ✅ |
| PrismaModule | (infra) | ✅ |

## Schéma Prisma

- `User`, `RefreshToken`, `Ticket`, `Message`, `TicketStatusHistory`
- Enums : `Role`, `TicketStatus`, `TicketPriority`
- `Ticket.version` présent pour verrou optimiste futur (non utilisé — update conditionnel retenu)
