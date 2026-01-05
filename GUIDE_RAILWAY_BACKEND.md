# Guide de déploiement Backend sur Railway

## 🎯 Objectif

Déployer uniquement le backend (dossier `backend/`) sur Railway depuis un repo GitHub qui contient aussi le frontend.

## ✅ Prérequis

- Compte Railway créé
- Repo GitHub avec le code backend dans `backend/`
- Base de données PostgreSQL (Railway peut en créer une automatiquement)

## 📋 Étapes de configuration Railway

### 1. Créer un nouveau service sur Railway

1. Aller sur [Railway](https://railway.app)
2. Cliquer sur **"New Project"**
3. Sélectionner **"Deploy from GitHub repo"**
4. Choisir votre repo GitHub

### 2. Configurer le Root Directory

**IMPORTANT** : Railway doit savoir qu'il doit builder uniquement le dossier `backend/`.

#### Option A : Root Directory (Recommandé)

1. Dans votre service Railway, aller dans **Settings** (⚙️)
2. Scroller jusqu'à **"Root Directory"**
3. Entrer : `backend`
4. Sauvegarder

Railway va alors :
- Utiliser automatiquement le `Dockerfile` dans `backend/`
- Builder uniquement les fichiers du backend
- Ignorer complètement le frontend

#### Option B : Dockerfile Path (Alternative)

Si l'option Root Directory ne fonctionne pas :

1. Dans **Settings**, chercher **"Dockerfile Path"**
2. Entrer : `backend/Dockerfile`
3. Sauvegarder

### 3. Configurer les variables d'environnement

Dans **Settings** → **Variables**, ajouter :

#### Variables obligatoires

```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
JWT_SECRET=votre_secret_jwt_super_securise
```

#### Variables optionnelles (selon votre config)

```
ALLOWED_ORIGINS=https://votre-frontend.vercel.app,https://votre-domaine.com
NODE_ENV=production
```

**Note** : Railway peut créer automatiquement une base de données PostgreSQL. Si c'est le cas :
1. Créer un service **PostgreSQL** dans Railway
2. Railway génère automatiquement `DATABASE_URL`
3. Ajouter cette variable à votre service backend

### 4. Configurer les migrations Prisma

Railway va automatiquement :
- Exécuter `pnpm prisma generate` lors du build (défini dans le Dockerfile)
- Mais **PAS** les migrations automatiquement

#### Option A : Migrations manuelles

Après le premier déploiement, exécuter manuellement :

```bash
# Via Railway CLI
railway run pnpm prisma migrate deploy

# Ou via Railway Dashboard → Service → Deployments → Run Command
```

#### Option B : Script de démarrage avec migrations (Recommandé)

Modifier le `package.json` du backend pour ajouter :

```json
"scripts": {
  "start": "prisma migrate deploy && node dist/index.js"
}
```

**⚠️ Attention** : Cette approche exécute les migrations à chaque redémarrage. Utilisez `migrate deploy` (pas `migrate dev`) en production.

### 5. Déployer

1. Railway va détecter automatiquement le push sur GitHub
2. Ou cliquer sur **"Deploy"** manuellement
3. Surveiller les logs dans **Deployments**

## 🔍 Vérification du déploiement

### 1. Vérifier les logs Railway

Dans **Deployments** → Cliquer sur le dernier déploiement → **View Logs**

Vous devriez voir :

```
Step 1/10 : FROM node:20-alpine
Step 2/10 : RUN npm install -g pnpm@10.23.0
Step 3/10 : WORKDIR /app
Step 4/10 : COPY backend/package.json ...
Step 5/10 : RUN pnpm install --frozen-lockfile
Step 6/10 : RUN pnpm prisma generate
Step 7/10 : RUN pnpm build
Step 8/10 : CMD ["pnpm", "start"]
```

**✅ Signes que ça fonctionne :**
- Pas de références à `vite`, `react`, `tailwindcss`
- Build TypeScript réussi
- Prisma generate réussi
- Serveur démarre sur le port 3000

**❌ Signes de problème :**
- Erreurs liées au frontend
- Erreurs "file not found" pour les fichiers backend
- Build échoue sur `pnpm install`

### 2. Tester l'API

Une fois déployé, Railway génère une URL publique (ex: `https://votre-backend.up.railway.app`)

Tester avec :

```bash
curl https://votre-backend.up.railway.app/
```

Devrait retourner :

```json
{ "message": "API fonctionnel" }
```

### 3. Vérifier les routes

Tester une route protégée (doit retourner une erreur d'authentification, pas une 404) :

```bash
curl https://votre-backend.up.railway.app/api/training-sessions
```

## 🐛 Résolution de problèmes

### Problème : Railway ne trouve pas le Dockerfile

**Solution :**
1. Vérifier que `backend/Dockerfile` existe bien dans le repo
2. Dans Railway Settings → Root Directory : `backend`
3. Ou Railway Settings → Dockerfile Path : `backend/Dockerfile`

### Problème : Build échoue avec "file not found"

**Solution :**
- Vérifier que le Root Directory est bien configuré à `backend`
- Vérifier que tous les fichiers nécessaires sont commités dans Git

### Problème : Erreurs Prisma

**Solution :**
1. Vérifier que `DATABASE_URL` est bien configurée
2. Vérifier que la base de données est accessible
3. Exécuter manuellement les migrations : `railway run pnpm prisma migrate deploy`

### Problème : CORS errors depuis le frontend

**Solution :**
1. Vérifier que `ALLOWED_ORIGINS` contient l'URL de votre frontend Vercel
2. Format : `https://votre-frontend.vercel.app` (sans slash final)
3. Pour plusieurs origines : `https://domaine1.com,https://domaine2.com`

### Problème : Le service redémarre en boucle

**Solution :**
1. Vérifier les logs pour voir l'erreur
2. Vérifier que `PORT` est bien défini (Railway l'injecte automatiquement, mais vérifiez)
3. Vérifier que la commande `pnpm start` fonctionne localement

## 📝 Checklist de déploiement

- [ ] Service Railway créé et connecté au repo GitHub
- [ ] Root Directory configuré à `backend`
- [ ] Variables d'environnement configurées (`DATABASE_URL`, `JWT_SECRET`, etc.)
- [ ] Base de données PostgreSQL créée (si nécessaire)
- [ ] Premier déploiement réussi
- [ ] Migrations Prisma exécutées
- [ ] API répond sur l'URL publique
- [ ] CORS configuré pour le frontend
- [ ] Tests des routes API effectués

## 🔄 Mises à jour futures

Pour déployer une nouvelle version :

1. Push sur GitHub (branche main/master)
2. Railway détecte automatiquement et redéploie
3. Ou déclencher manuellement un redéploiement depuis Railway

**Note** : Les migrations Prisma doivent être exécutées manuellement après chaque déploiement si vous utilisez l'Option A.

## 📚 Ressources

- [Documentation Railway](https://docs.railway.app)
- [Railway Docker Guide](https://docs.railway.app/deploy/dockerfiles)
- [Prisma Migrate Deploy](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production)

