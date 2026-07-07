# Ticketing Web

Frontend **React Router v8** en **SSR** pour la plateforme de gestion de tickets MSK Création.

L'application agit comme une couche web serveur : les loaders et actions SSR appellent l'API
(`ticketing-api`), gèrent la session via cookie `httpOnly`, et ne transmettent jamais de token
au navigateur.

## Prérequis

- Node.js >= 20
- npm (ou pnpm)
- Une instance de l'API backend accessible (`ticketing-api`)

## Installation locale

```bash
git clone <url-du-repo>
cd ticketing-web
npm install
cp .env.example .env
npm run dev
```

L'application est disponible sur [http://localhost:5173](http://localhost:5173).

## Variables d'environnement

Copier `.env.example` vers `.env` puis adapter les valeurs :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `MOCK_API` | Non | `true` = données mock locales sans API. `false` en local et **obligatoirement `false` en production**. |
| `API_URL` | Oui (si `MOCK_API=false`) | URL de base de l'API, avec le préfixe `/api/v1`. Ex. `http://localhost:3000/api/v1` |
| `SESSION_SECRET` | Oui en production | Secret fort pour signer les cookies de session SSR |

Exemple `.env` local :

```env
MOCK_API=false
API_URL=http://localhost:3000/api/v1
SESSION_SECRET=change-me-with-a-strong-secret
```

Générer un secret de production :

```bash
openssl rand -base64 32
```

> Les appels API principaux passent par les loaders/actions SSR. Ne pas exposer l'URL API via
> une variable `VITE_*` sauf besoin explicite côté navigateur.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Build de production (client + serveur SSR) |
| `npm run start` | Lance le serveur Node à partir de `build/server/index.js` |
| `npm run typecheck` | Génération des types de routes + vérification TypeScript |

## Architecture

```txt
app/
  routes.ts                 # Déclaration centrale des routes
  router/                   # Groupes de routes par domaine
  pages/                    # Composants de page (UI uniquement)
  components/               # Composants réutilisables
  server/
    auth/                   # Session, require-auth, login/logout
    api/                    # Client HTTP vers ticketing-api
    tickets/                # loaders, actions, schémas
    users/
    dashboard/
  types/
  lib/
```

### Règle loader / action

Les pages délèguent toute la logique serveur vers `app/server/**` :

```ts
import { ticketsListLoader } from "~/server/tickets/loaders/ticket.server";

export const loader = ticketsListLoader;
```

Les composants React ne doivent pas appeler l'API directement, ni lire la session, ni contenir
de logique métier lourde.

## Rôles UI

| Rôle | Périmètre |
|------|-----------|
| **client** | Crée et suit ses propres tickets |
| **agent** | Traite les tickets assignés, échange, fait évoluer le statut |
| **admin** | Supervise tout, assigne les tickets, gère les utilisateurs |

La sécurité réelle est côté API. L'UI adapte l'affichage et gère proprement les erreurs `403` / `409`.

## Comptes de test

Voir le README du repo `ticketing-api`.

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client | client@test.dev | ChangeMe123! |
| Agent | agent@test.dev | ChangeMe123! |
| Admin | admin@test.dev | ChangeMe123! |

## URLs de déploiement

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://ticketing-web-pi.vercel.app |
| API (Render) | https://ticketing-api-7mcd.onrender.com |
| Swagger API | https://ticketing-api-7mcd.onrender.com/api/docs |

---

## Déploiement sur Vercel

### Avant de commencer

1. **L'API backend doit déjà être déployée** (ex. Render) et accessible publiquement.
2. **Le code frontend doit être poussé sur GitHub** (branche `main` ou équivalent).
3. **Vérifier le build en local** :

```bash
npm run build
```

4. URL API de production : `https://ticketing-api-7mcd.onrender.com/api/v1`

### Étape 1 — Créer le projet Vercel

1. Aller sur [vercel.com](https://vercel.com) et se connecter.
2. Cliquer sur **Add New…** → **Project**.
3. Dans **Import Git Repository**, sélectionner le repo `ticketing-web`.
4. Si le repo n'apparaît pas : **Adjust GitHub App Permissions** et autoriser l'accès au repo.

### Étape 2 — Vérifier la configuration du build

Sur l'écran **Configure Project**, Vercel détecte en général **React Router** automatiquement.
Vérifier ces valeurs :

| Champ | Valeur attendue |
|-------|-----------------|
| **Framework Preset** | React Router |
| **Root Directory** | `./` (racine du repo) |
| **Build Command** | `npm run build` (ou `react-router build`) |
| **Output Directory** | _(laissé vide — géré par le framework)_ |
| **Install Command** | `npm install` |

Ne pas activer le mode SPA (`ssr: false`). Le SSR doit rester activé.

### Étape 3 — Variables d'environnement

Avant le premier déploiement, ouvrir la section **Environment Variables** et ajouter :

| Name | Value | Environments |
|------|-------|--------------|
| `API_URL` | `https://ticketing-api-7mcd.onrender.com/api/v1` | Production, Preview, Development |
| `SESSION_SECRET` | _(secret généré avec `openssl rand -base64 32`)_ | Production, Preview, Development |
| `MOCK_API` | `false` | Production, Preview, Development |

> `SESSION_SECRET` doit être identique entre redéploiements, mais différent du secret local.
> Ne jamais commiter ce secret dans le repo.

### Étape 4 — Lancer le déploiement

1. Cliquer sur **Deploy**.
2. Attendre la fin du build (onglet **Building** puis **Deploying**).
3. Une fois terminé, cliquer sur **Visit** pour ouvrir l'URL `*.vercel.app`.

En cas d'échec : ouvrir les **Build Logs**, chercher une erreur liée à `SESSION_SECRET` ou à
l'API inaccessible.

### Étape 5 — Configurer l'API pour le frontend Vercel

Le frontend SSR appelle l'API depuis le serveur Vercel. Le **chat temps réel** (Socket.IO)
se connecte depuis le **navigateur** vers l'origine de l'API.

Sur le backend (`ticketing-api`), vérifier que :

- l'API accepte les requêtes depuis le domaine Vercel (CORS si appels navigateur) ;
- l'URL `https://votre-app.vercel.app` est autorisée si CORS est restreint.

### Étape 6 — Vérifications post-déploiement

Tester en **navigation privée** :

- [ ] La page de login s'affiche
- [ ] Connexion client, agent et admin fonctionne
- [ ] Le dashboard charge les indicateurs
- [ ] Liste et détail des tickets
- [ ] Création d'un ticket (client)
- [ ] Assignation et changement de statut (agent/admin)
- [ ] Déconnexion et redirection vers login
- [ ] Aucune bannière « mode mock » (`MOCK_API` doit être `false`)

### Erreur build `ERESOLVE` / peer dependency `@react-router/dev@7`

`@vercel/react-router` déclare encore des peer dependencies React Router v7 alors que le
projet utilise v8. Le fichier `.npmrc` à la racine force `legacy-peer-deps=true` pour que
`npm install` passe sur Vercel comme en local.

### Erreur 500 `FUNCTION_INVOCATION_FAILED`

Cause la plus fréquente : **`SESSION_SECRET` manquant** sur Vercel. Sans cette variable,
le serveur SSR plante au démarrage avec `SESSION_SECRET must be set in production`.

1. **Settings** → **Environment Variables**
2. Vérifier que `SESSION_SECRET`, `API_URL` et `MOCK_API=false` sont bien définis
3. **Deployments** → **…** → **Redeploy** (obligatoire après ajout d'une variable)

### Étape 7 — Preset Vercel (obligatoire)

Le projet utilise `@vercel/react-router` avec `vercelPreset()` dans `react-router.config.ts`.
Sans ce preset, Vercel affiche un avertissement au build et la fonction serverless peut crasher.

### Redéploiements suivants

Chaque push sur la branche connectée redéclenche un déploiement automatique.

Pour forcer un redéploiement manuel :

1. Onglet **Deployments** du projet Vercel
2. **…** sur le dernier déploiement → **Redeploy**

Pour modifier une variable d'environnement :

1. **Settings** → **Environment Variables**
2. Modifier la valeur → **Save**
3. **Redeploy** le dernier déploiement pour appliquer

---

## Checklist avant remise

- [ ] Frontend accessible publiquement sur Vercel
- [ ] API accessible publiquement sur Render (ou équivalent)
- [ ] `MOCK_API=false` en production
- [ ] `SESSION_SECRET` fort, uniquement sur Vercel
- [ ] Les trois rôles peuvent se connecter
- [ ] Les pages protégées redirigent sans session
- [ ] Erreurs `403` et `409` affichées proprement
- [ ] Aucun secret dans le bundle navigateur

## Ressources

- [React Router — documentation](https://reactrouter.com/)
- [React Router sur Vercel](https://vercel.com/docs/frameworks/frontend/react-router)
- Documentation API : `<API_URL>/api/docs` (Swagger)
