# Matrice RBAC — permissions par rôle

Référence rapide pour les guards frontend et la visibilité UI.
L'API applique ces règles côté serveur — le frontend ne fait que refléter / anticiper.

---

## Légende

| Symbole | Signification |
|---------|---------------|
| ✅ | Autorisé |
| ✅* | Autorisé avec condition (ownership / assignation) |
| ❌ | Interdit (403) |
| — | Non applicable |

---

## Endpoints par rôle

### Auth

| Endpoint | CLIENT | AGENT | ADMIN |
|----------|:------:|:-----:|:-----:|
| POST /auth/login | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ |
| POST /auth/logout | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ |

### Users

| Endpoint | CLIENT | AGENT | ADMIN |
|----------|:------:|:-----:|:-----:|
| GET /users | ❌ | ❌ | ✅ |
| GET /users/:id | ✅* (soi) | ✅* (soi) | ✅ |
| POST /users | ❌ | ❌ | ✅ |
| PATCH /users/:id | ❌ | ❌ | ✅ |
| DELETE /users/:id | ❌ | ❌ | ✅ |

### Tickets

| Endpoint | CLIENT | AGENT | ADMIN |
|----------|:------:|:-----:|:-----:|
| POST /tickets | ✅ | ❌ | ❌ |
| GET /tickets | ✅* (siens) | ✅* (assignés + option non assignés) | ✅ (tous) |
| GET /tickets/:id | ✅* (sien) | ✅* (assigné ou non assigné) | ✅ |
| PATCH /tickets/:id/status | ❌ | ✅* (assigné) | ✅ |
| PATCH /tickets/:id/assign | ❌ | ✅* (auto-assign) | ✅ |
| GET /tickets/:id/history | ✅* (sien) | ✅* (assigné ou non assigné) | ✅ |

### Messages

| Endpoint | CLIENT | AGENT | ADMIN |
|----------|:------:|:-----:|:-----:|
| GET /tickets/:id/messages | ✅* (sien) | ✅* (assigné ou non assigné) | ✅ |
| POST /tickets/:id/messages | ✅* (sien, hors CLOSED) | ✅* (assigné, hors CLOSED) | ❌* |

\* L'admin peut **lire** les messages mais ne peut pas en envoyer (seuls client propriétaire et agent assigné).

### Dashboard

| Endpoint | CLIENT | AGENT | ADMIN |
|----------|:------:|:-----:|:-----:|
| GET /dashboard/stats | ✅ (scope client) | ✅ (scope assigné) | ✅ (global + byStatus) |

---

## Périmètre de données (filtres implicites)

| Rôle | Tickets visibles | Notes |
|------|------------------|-------|
| **CLIENT** | `clientId = moi` | Jamais les tickets d'autres clients |
| **AGENT** | `assignedAgentId = moi` | + non assignés si `includeUnassigned=true` sur GET /tickets |
| **ADMIN** | Tous | Filtre optionnel `assignedAgentId` |

Le dashboard agent **n'inclut pas** les tickets non assignés (contrairement à la liste avec `includeUnassigned`).

---

## Actions métier par rôle

### Création de ticket

| Rôle | Peut créer |
|------|:----------:|
| CLIENT | ✅ |
| AGENT | ❌ |
| ADMIN | ❌ |

### Assignation

| Rôle | Comportement |
|------|--------------|
| AGENT | Auto-assignation uniquement (`PATCH /assign` sans `agentId`). `409` si déjà pris. |
| ADMIN | Assigner n'importe quel agent (`agentId` requis). Réassignation possible. |

### Changement de statut manuel

| Transition | CLIENT | AGENT | ADMIN |
|------------|:------:|:-----:|:-----:|
| OPEN → IN_PROGRESS | ❌ | ✅* | ✅ |
| IN_PROGRESS → RESOLVED | ❌ | ✅* | ✅ |
| RESOLVED → CLOSED | ❌ | ❌ | ✅ |
| RESOLVED → REOPENED | ✅** | ❌ | ✅ |
| REOPENED → IN_PROGRESS | ❌ | ✅* | ✅ |

\* Agent assigné au ticket.  
\*\* Via envoi de message (réouverture automatique), pas via PATCH /status.

### Messages

| Condition | Peut envoyer |
|-----------|:------------:|
| Client propriétaire, ticket non CLOSED | ✅ |
| Agent assigné, ticket non CLOSED | ✅ |
| Ticket CLOSED | ❌ (400) |
| Admin (même avec accès lecture) | ❌ (403) |

---

## Visibilité UI suggérée

| Élément UI | CLIENT | AGENT | ADMIN |
|------------|:------:|:-----:|:-----:|
| Menu « Utilisateurs » | ❌ | ❌ | ✅ |
| Bouton « Créer un ticket » | ✅ | ❌ | ❌ |
| Filtre agent assigné | ❌ | ❌ | ✅ |
| Colonne agent assigné | ❌ | Optionnel | ✅ |
| Boutons transition statut | ❌ | ✅* | ✅ |
| Bouton assignation | ❌ | ✅ (auto) | ✅ |
| Compteur `overdueCount` dashboard | Optionnel | ✅ | ✅ |
| Graphique `byStatus` | ❌ | ❌ | ✅ |
| Badge SLA « En retard » | ✅ (ses tickets) | ✅ | ✅ |

---

## Codes d'erreur attendus par scénario

| Scénario | Code | Message type |
|----------|------|--------------|
| Client tente de lire le ticket d'un autre | 403 | Accès refusé pour ce ticket |
| Agent non assigné tente de changer le statut | 403 | Seul l'agent assigné ou un admin... |
| Double auto-assignation | 409 | Ticket déjà assigné |
| Transition interdite | 400 | Transition de statut interdite : X → Y |
| Message sur ticket fermé | 400 | Impossible d'envoyer un message sur un ticket fermé |
| Token expiré | 401 | Unauthorized |
| Admin tente POST /tickets | 403 | Seuls les clients peuvent créer un ticket |
