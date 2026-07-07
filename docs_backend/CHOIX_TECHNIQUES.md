# Choix techniques — Plateforme de gestion de tickets de support

Document vivant : toute décision d'architecture non triviale est consignée ici avec sa justification.
Partagé conceptuellement avec le repo frontend `ticketing-web`.

---

## 1. Stack et justification

### Backend : NestJS + Prisma + PostgreSQL

- **NestJS** : structure modulaire par domaine métier (`auth`, `users`, `tickets`, `messages`, `sla`, `dashboard`), écosystème mature (guards, pipes, Swagger, config), adapté à un test technique où la lisibilité et la testabilité comptent.
- **Prisma** : schéma déclaratif, migrations versionnées, client typé — réduit les erreurs SQL et facilite l'évolution du modèle.
- **PostgreSQL** : base relationnelle robuste, transactions ACID indispensables pour l'assignation concurrente de tickets.

### Deux repos séparés (`ticketing-api` / `ticketing-web`)

- Déploiements indépendants (Render pour l'API, Vercel pour le frontend).
- Séparation claire des responsabilités pour l'évaluation.
- Le contrat entre les deux repos est **uniquement HTTP + Swagger + WebSocket** — aucun partage de types au build. Le frontend recopie les enums et interfaces depuis `docs/FRONTEND_TYPES.ts` ou Swagger.

### Déploiement

- **API** : Render (Web Service + PostgreSQL managé).
- **Frontend** : Vercel (React Router v7 SSR).
- En dev : API sur `http://localhost:3000`, frontend sur `http://localhost:5173`.

---

## 2. Architecture backend (état final)

```txt
src/
├── main.ts                 # Bootstrap global (prefix, validation, swagger, CORS)
├── config/env.validation.ts
├── prisma/                 # Module global Prisma + AuthDatabase
├── common/filters/         # HttpExceptionFilter
├── auth/                   # JWT, login, refresh, logout, guards RBAC
├── users/                  # CRUD utilisateurs (Admin)
├── sla/                    # Calcul SLA (transverse, testable)
├── tickets/                # Cycle de vie, assignation atomique, historique
├── messages/               # Fil de discussion + WebSocket temps réel
└── dashboard/              # Agrégats par rôle
```

Contrat exposé via Swagger : `{API_URL}/api/docs`.

---

## 3. Décisions de conception

### Modélisation des données

| Entité | Rôle |
|--------|------|
| `User` | Comptes avec rôle RBAC, soft delete (`deletedAt`) pour ne pas casser l'historique |
| `Ticket` | Ticket de support, lien client + agent assigné |
| `Message` | Fil de discussion |
| `TicketStatusHistory` | Audit de chaque transition de statut |
| `RefreshToken` | Refresh tokens hashés (SHA-256), rotation à chaque utilisation |

Relations clés :
- `User` 1→N `Ticket` (créateur, relation `TicketClient`)
- `User` 1→N `Ticket` (agent assigné, relation `AssignedAgent`)
- `Ticket` 1→N `Message`, 1→N `TicketStatusHistory`

### Machine à états des statuts de ticket

Statuts : `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`, avec `REOPENED` si un client répond sur un ticket résolu.

Les transitions sont centralisées dans `src/tickets/logic/status-transition.rules.ts` — jamais dans les controllers.

**Transitions autorisées (machine à états globale) :**

| De \ Vers | IN_PROGRESS | RESOLVED | CLOSED | REOPENED |
|-----------|:-----------:|:--------:|:------:|:--------:|
| OPEN | ✅ | ❌ | ❌ | — |
| IN_PROGRESS | — | ✅ | ❌ | — |
| RESOLVED | — | — | ✅ | ✅ |
| REOPENED | ✅ | — | — | — |
| CLOSED | ❌ | ❌ | — | ❌ |

**Par rôle :**

| Rôle | Transitions manuelles autorisées |
|------|----------------------------------|
| **CLIENT** | Aucune (réouverture automatique via message sur ticket `RESOLVED`) |
| **AGENT** (assigné) | `OPEN → IN_PROGRESS`, `IN_PROGRESS → RESOLVED`, `REOPENED → IN_PROGRESS` |
| **ADMIN** | Toutes les transitions de la table ci-dessus |

Toute violation renvoie `400 Bad Request` avec message explicite (`Transition de statut interdite : X → Y`).

### Calcul du SLA

| Priorité | Délai cible |
|----------|-------------|
| HIGH | 4 heures |
| MEDIUM | 24 heures |
| LOW | 72 heures |

**Choix retenu : temps calendaire brut** (plus simple, testable, pas de gestion des jours fériés).  
La configuration est externalisée dans `src/sla/sla.config.ts` — pas en dur dans la logique métier.

**Alternative non retenue : heures ouvrées** (lun–ven 9h–18h, exclusion jours fériés).  
Plus réaliste en support B2B, mais complexifie les tests (week-ends, fuseaux horaires, calendrier).  
Le calcul est centralisé dans `sla.util.ts` : basculer vers les heures ouvrées ne nécessite que de modifier cette fonction, pas les délais configurés.

Le champ `isLate` est recalculé à la lecture via `isOverdue()` (pas de job cron au MVP).  
Les tickets `RESOLVED` ou `CLOSED` ne sont jamais considérés en retard.

Pour les agrégats dashboard, `buildOverdueTicketFilter()` dans `sla.util.ts` produit un filtre Prisma équivalent à `isOverdue()`.

---

## 4. Authentification cross-origin (décision clé)

Le frontend (Vercel) et l'API (Render) sont sur des **domaines différents**. Les cookies httpOnly cross-site (`SameSite=None; Secure`) posent des frictions réelles : blocage des cookies tiers sur Safari/Firefox (ITP).

### Choix retenu : JWT dans le corps de la réponse

| Token | Durée | Stockage côté frontend |
|-------|-------|------------------------|
| `accessToken` | 15 min (configurable) | **En mémoire uniquement** — jamais `localStorage` (vulnérable au XSS) |
| `refreshToken` | 7 jours (configurable) | Cookie httpOnly sur le **domaine du frontend** (SSR) ou mémoire (SPA) |

**Flux :**
1. `POST /api/v1/auth/login` → `{ accessToken, refreshToken, user }`
2. Chaque requête protégée : `Authorization: Bearer <accessToken>`
3. À l'expiration : `POST /api/v1/auth/refresh` avec le `refreshToken` → nouveaux tokens (rotation : l'ancien refresh est invalidé)
4. `POST /api/v1/auth/logout` (authentifié) + `refreshToken` dans le body → invalidation côté serveur

**Pourquoi pas de cookie cross-origin côté API :**
- CORS avec `credentials: true` est configuré, mais les cookies émis par l'API Render ne seraient pas fiables sur tous les navigateurs en cross-site.
- Le bearer token en mémoire est le pattern recommandé pour des repos séparés.

**Implémentation SSR (React Router v7) :**
- Le serveur frontend stocke le `refreshToken` dans un cookie httpOnly **sur son propre domaine** (pas cross-origin).
- Les loaders/actions serveur appellent l'API avec le `accessToken` — jamais exposé aux composants React client.
- Voir `docs/API_FRONTEND.md` § Authentification pour le détail d'intégration.

**Sécurité complémentaire :**
- Mots de passe hashés bcrypt (cost 12).
- Refresh tokens stockés hashés (SHA-256) en base, jamais en clair.
- Rate limiting sur `POST /auth/login` (5 tentatives / minute).
- `RolesGuard` + filtrage Prisma par ownership sur chaque ressource.

---

## 5. Traitement des points d'attention du sujet

### Double assignation concurrente

**Stratégie retenue : update conditionnel atomique** via `updateMany`.

```typescript
const result = await prisma.ticket.updateMany({
  where: { id: ticketId, assignedAgentId: null },
  data: { assignedAgentId: agentId },
});
if (result.count === 0) throw new ConflictException('Ticket déjà assigné');
```

- Utilisé pour l'**auto-assignation agent** (`PATCH /tickets/:id/assign` sans `agentId`).
- L'admin peut **réassigner** un ticket déjà assigné (update direct, pas de condition `assignedAgentId: null`).
- Réponse `409 Conflict` si deux agents tentent de s'auto-assigner le même ticket simultanément.

**Alternative documentée mais non retenue :** verrou optimiste via colonne `version` (présente sur `Ticket` pour une évolution future).

**Côté frontend :** intercepter le `409` sur l'assignation, afficher un toast « Ticket déjà pris par un autre agent », puis rafraîchir les données.

### Message client sur ticket résolu — réouverture automatique

**Comportement retenu :** quand un **client propriétaire** envoie un message sur un ticket `RESOLVED`, le ticket passe automatiquement en `REOPENED`.

- Implémenté dans `MessagesService.create()` → `TicketsService.reopenFromClientMessage()`.
- Une entrée `TicketStatusHistory` (`RESOLVED → REOPENED`) est créée dans la même logique.
- Le message n'est **jamais** silencieusement ignoré.
- `resolvedAt` est remis à `null`.
- Événement WebSocket `ticket:reopened` émis aux clients connectés à la room du ticket.

**Cas limites :**
- Ticket `CLOSED` → `400 Bad Request` (« Impossible d'envoyer un message sur un ticket fermé »).
- Agent ou admin qui envoie un message sur un ticket `RESOLVED` → pas de réouverture automatique (seul le client déclenche cette règle).

### Transitions de statut interdites

Exemple : passage direct `OPEN → CLOSED` interdit. Toute violation renvoie `400 Bad Request` avec message explicite.

---

## 6. Dashboard — agrégats et règles métier

Endpoint : `GET /api/v1/dashboard/stats?periodDays=30`

### Périmètre par rôle (RBAC)

Logique centralisée dans `src/tickets/logic/ticket-scope.util.ts` — réutilisée par `TicketsService` (liste) et `DashboardService` (stats).

| Rôle | Périmètre |
|------|-----------|
| CLIENT | `clientId = user.id` |
| AGENT | `assignedAgentId = user.id` uniquement (pas de tickets non assignés, contrairement à `GET /tickets?includeUnassigned=true`) |
| ADMIN | aucun filtre utilisateur (vue globale) |

### Définitions des compteurs

| Compteur | Règle |
|----------|-------|
| `openCount` | `status IN (OPEN, IN_PROGRESS, REOPENED)` dans le périmètre |
| `overdueCount` | tickets actifs (`status NOT IN (RESOLVED, CLOSED)`) dont `createdAt` dépasse le SLA calendaire selon la priorité |
| `resolvedInPeriodCount` | `resolvedAt` dans `[now - periodDays, now]` (défaut 30 jours, max 365) |
| `byStatus` | `groupBy status` — **admin uniquement** |

### Choix d'implémentation

- Agrégats Prisma (`count`, `groupBy`) plutôt que chargement en mémoire.
- Combinaison des filtres via `mergeTicketWhere()` (AND) pour éviter les collisions quand le périmètre ou le SLA contiennent un `OR`.
- Pas de dépendance de `DashboardModule` vers `TicketsModule` : le scoping est extrait dans `ticket-scope.util.ts`.

---

## 7. WebSocket — messages temps réel

Namespace Socket.IO : `/chat` (même origine que l'API).

- Authentification via JWT dans `handshake.auth.token` ou header `Authorization: Bearer`.
- Rooms par ticket : `ticket:{ticketId}`.
- Événements : `joinTicket`, `leaveTicket`, `sendMessage`, `message:created`, `ticket:reopened`.
- Le REST `POST /tickets/:id/messages` reste la source de vérité ; le WebSocket est un complément temps réel.

Détail complet : `docs/API_FRONTEND.md` § WebSocket.

---

## 8. Configuration — détails

| Élément | Choix | Justification |
|---------|-------|---------------|
| Préfixe API | `/api/v1` | Versioning dès le départ, frontend déployé séparément |
| Validation | ValidationPipe global | Cohérence sur tous les endpoints, DTO comme contrat |
| Erreurs | `HttpExceptionFilter` global | Format uniforme `{ statusCode, message, error, path, timestamp }` |
| CORS | `FRONTEND_URL` exacte | Jamais `origin: '*'`, `credentials: true` |
| Prisma | v7 + adaptateur `@prisma/adapter-pg` | Client dans `generated/prisma` |
| Seed | `tsx prisma/seed.ts` | Comptes de test + ticket démo documentés dans le README |
| Mots de passe seed | bcrypt cost 12 | Aligné sur AuthModule |

---

## 9. Limites connues et pistes d'amélioration

| Limite | Piste |
|--------|-------|
| Pas de génération automatique de types frontend depuis OpenAPI | Ajouter `openapi-typescript` en CI pour synchroniser `FRONTEND_TYPES.ts` |
| SLA en temps calendaire uniquement | Adapter `sla.util.ts` pour heures ouvrées sans changer `sla.config.ts` |
| Pas de tests e2e complets par rôle | Couvrir les scénarios RBAC et concurrence en e2e |
| WebSocket sans reconnexion automatique documentée côté API | Le frontend gère la reconnexion Socket.IO |
| Plan gratuit Render : cold start | Documenté dans le README — premier appel après inactivité = latence |
