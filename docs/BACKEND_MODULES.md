# Backend — `ticketing-api` — Modules NestJS

Basé sur le périmètre fonctionnel du test MSK Création : auth/rôles, gestion des tickets,
SLA, messages, dashboard.

---

## 1. `AuthModule`

Authentification JWT (access token en mémoire côté client, pas de cookie cross-domain).

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
  dto/login.dto.ts
```

**Endpoints**
- `POST /auth/login` → `{ accessToken, user }`
- `POST /auth/refresh` (si refresh token implémenté)
- `GET /auth/me` → profil de l'utilisateur connecté

**Notes**
- Pas de `POST /auth/register` public : les comptes sont créés par l'Admin via `UsersModule`
  (cohérent avec « Admin gère les utilisateurs »).
- `RolesGuard` + `@Roles('CLIENT' | 'AGENT' | 'ADMIN')` réutilisés sur tous les autres modules.

---

## 2. `UsersModule`

Gestion des comptes (réservé Admin, sauf lecture de son propre profil).

**Fichiers**
```
src/users/
  users.module.ts
  users.controller.ts
  users.service.ts
  dto/create-user.dto.ts
  dto/update-user.dto.ts
```

**Endpoints**
- `GET /users` — Admin uniquement, liste + filtre par rôle
- `GET /users/:id` — Admin, ou soi-même
- `POST /users` — Admin, création (client/agent/admin)
- `PATCH /users/:id` — Admin
- `DELETE /users/:id` — Admin (soft delete recommandé, ne pas casser l'historique des tickets)

---

## 3. `TicketsModule`

Cœur métier : création, cycle de vie, assignation, filtres.

**Fichiers**
```
src/tickets/
  tickets.module.ts
  tickets.controller.ts
  tickets.service.ts
  dto/create-ticket.dto.ts
  dto/update-ticket-status.dto.ts
  dto/assign-ticket.dto.ts
  dto/query-tickets.dto.ts
  enums/ticket-status.enum.ts
  enums/ticket-priority.enum.ts
  logic/status-transition.rules.ts
```

**Endpoints**
- `POST /tickets` — Client crée un ticket (titre, description, catégorie, priorité)
- `GET /tickets` — liste filtrée selon le rôle :
  - Client → uniquement ses tickets
  - Agent → tickets qui lui sont assignés (+ option "non assignés" si autorisé)
  - Admin → tous, avec filtres `status`, `priority`, `assignedAgentId`, tri
- `GET /tickets/:id` — détail (vérif ownership/assignation selon rôle)
- `PATCH /tickets/:id/status` — transition de statut (règles de transition centralisées dans
  `status-transition.rules.ts`, ex. interdire un passage direct `OUVERT → FERMÉ`)
- `PATCH /tickets/:id/assign` — Admin (ou self-assign Agent), **avec gestion de concurrence**
  (cf. point d'attention §6 du sujet — double assignation simultanée)
- `GET /tickets/:id/history` — historique des changements de statut

**Point d'attention critique — double assignation concurrente**
- Stratégie à documenter : verrou optimiste via colonne `version` (Prisma) ou contrainte
  transactionnelle (`UPDATE ... WHERE agentId IS NULL`), renvoyant `409 Conflict` si déjà pris.
- À trancher et justifier dans le doc "choix techniques".

**Point d'attention — client répond sur ticket résolu**
- Décision à documenter : soit ré-ouverture automatique du ticket (`RÉSOLU → EN_COURS`), soit
  message accepté mais statut inchangé avec notification à l'agent. Centraliser la règle dans
  `status-transition.rules.ts` plutôt que dans le controller.

---

## 4. `MessagesModule` (fil de discussion)

Sous-ressource de `tickets`, module séparé pour garder `TicketsModule` lisible.

**Fichiers**
```
src/messages/
  messages.module.ts
  messages.controller.ts
  messages.service.ts
  dto/create-message.dto.ts
```

**Endpoints**
- `GET /tickets/:ticketId/messages` — fil de discussion complet
- `POST /tickets/:ticketId/messages` — Client ou Agent assigné uniquement
  - Doit appliquer la règle « client répond à un ticket résolu » définie plus haut

---

## 5. `SlaModule`

Logique de calcul des délais — isolée pour être testable unitairement.

**Fichiers**
```
src/sla/
  sla.module.ts
  sla.service.ts
  sla.config.ts        // mapping priorité → délai (4h/24h/72h)
  sla.util.ts           // calcul dépassement, jours/heures ouvrés si retenu
```

**Responsabilités**
- `computeDeadline(priority, createdAt)` → date limite
- `isOverdue(ticket)` → booléen recalculé à la lecture (pas de job cron nécessaire au MVP,
  mais mentionner un futur `@Cron` pour notifications si le périmètre s'élargit)
- Décision à documenter : calcul en temps calendaire brut ou en heures ouvrées
  (point d'attention §6 du sujet)
- Utilisé par `TicketsModule` (champ dérivé `isLate` dans les réponses) et par
  `DashboardModule` (compteur "tickets en retard")

---

## 6. `DashboardModule`

Agrégats pour les indicateurs chiffrés.

**Fichiers**
```
src/dashboard/
  dashboard.module.ts
  dashboard.controller.ts
  dashboard.service.ts
```

**Endpoints**
- `GET /dashboard/stats` — retourne selon le rôle :
  - tickets ouverts, tickets en retard, tickets résolus sur la période
  - Client → scope sur ses tickets ; Agent → ses tickets assignés ; Admin → global
- Requêtes Prisma agrégées (`groupBy`, `count`) plutôt que recalcul en mémoire

---

## 7. `PrismaModule` / `common`

**Fichiers**
```
src/prisma/
  prisma.module.ts
  prisma.service.ts

src/common/
  filters/http-exception.filter.ts
  interceptors/logging.interceptor.ts
  pipes/validation.pipe.ts (ou ValidationPipe global)
```

---

## Récapitulatif des modules

| Module | Rôle principal concerné | Dépend de |
|---|---|---|
| AuthModule | Tous | UsersModule (lookup), PrismaModule |
| UsersModule | Admin | PrismaModule |
| TicketsModule | Client/Agent/Admin | SlaModule, PrismaModule, AuthModule (guards) |
| MessagesModule | Client/Agent | TicketsModule, PrismaModule |
| SlaModule | (transverse) | — |
| DashboardModule | Client/Agent/Admin | TicketsModule, SlaModule, PrismaModule |
| PrismaModule | (infra) | — |

## Schéma Prisma — entités attendues (rappel rapide)

- `User` (id, email, password hash, role: CLIENT/AGENT/ADMIN)
- `Ticket` (id, title, description, category, priority, status, clientId, assignedAgentId,
  createdAt, resolvedAt, version — pour le verrou optimiste)
- `Message` (id, ticketId, authorId, content, createdAt)
- `TicketStatusHistory` (id, ticketId, fromStatus, toStatus, changedById, changedAt)
