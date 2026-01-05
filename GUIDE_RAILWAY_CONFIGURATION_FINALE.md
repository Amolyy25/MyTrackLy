# Guide de configuration Railway - Solution finale

## ✅ Solution : Configuration via l'interface Railway (sans railway.json)

Le fichier `railway.json` causait des erreurs de parsing. La solution la plus simple et fiable est de tout configurer via l'interface Railway.

## 📋 Étapes de configuration

### 1. Supprimer l'ancien service (si nécessaire)

Si vous avez un service qui échoue :
1. Aller sur Railway → Votre projet
2. Supprimer le service qui échoue (ou le garder et le reconfigurer)

### 2. Créer un nouveau service

1. **Cliquer sur "+ New"** dans votre projet Railway
2. **Sélectionner "Empty Service"**
3. **Connecter votre repo GitHub** :
   - Cliquer sur "Connect GitHub Repo"
   - Sélectionner votre repository

### 3. Configurer le Root Directory (CRUCIAL)

**⚠️ C'EST LA CLÉ DE TOUT**

1. **Aller dans Settings** (⚙️) du service
2. **Chercher "Root Directory"** dans la section "Source" ou "Build & Deploy"
   - Il peut être dans différentes sections selon la version de Railway
   - Chercher aussi dans "Deploy" ou "Build"
3. **Entrer** : `backend`
   - ⚠️ **IMPORTANT** : Juste `backend` (pas `/backend`, pas `./backend`, pas `backend/`)
4. **Sauvegarder** (bouton "Save" ou "Update")

### 4. Railway détectera automatiquement Docker

Une fois le Root Directory configuré à `backend` :
- Railway va automatiquement détecter le `Dockerfile` dans `backend/`
- Railway va utiliser Docker pour builder (plus besoin de railway.json)
- Le contexte Docker sera `backend/`, donc le Dockerfile fonctionnera correctement

### 5. Configurer les variables d'environnement

Dans **Settings** → **Variables**, ajouter :

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=votre_secret_jwt_super_securise
ALLOWED_ORIGINS=https://votre-frontend.vercel.app
PORT=3000
```

**Note** : Railway peut créer automatiquement une base de données PostgreSQL. Si c'est le cas :
1. Créer un service **PostgreSQL** dans Railway
2. Railway génère automatiquement `DATABASE_URL`
3. Ajouter cette variable à votre service backend

### 6. Déployer

1. Railway va automatiquement détecter le push sur GitHub et redéployer
2. Ou cliquer sur **"Deploy"** manuellement
3. Surveiller les logs dans **Deployments**

## 🔍 Vérification

### Dans les logs Railway, vous devriez voir :

```
Step 1/10 : FROM node:20-alpine
Step 2/10 : RUN npm install -g pnpm@10.23.0
Step 3/10 : WORKDIR /app
Step 4/10 : COPY package.json ...
Step 5/10 : RUN pnpm install --frozen-lockfile
Step 6/10 : RUN pnpm prisma generate
Step 7/10 : RUN pnpm build
Step 8/10 : CMD ["pnpm", "start"]
```

**✅ Signes que ça fonctionne :**
- Build Docker réussi
- Pas de références à `vite`, `react`, `tailwindcss`
- Build TypeScript réussi
- Prisma generate réussi
- Serveur démarre sur le port 3000

### Tester l'API :

```bash
curl https://votre-backend.up.railway.app/
```

Devrait retourner :

```json
{ "message": "API fonctionnel" }
```

## 🐛 Si ça ne fonctionne toujours pas

### Problème : Railway ne détecte pas le Dockerfile

**Solution :**
1. Vérifier que `backend/Dockerfile` existe bien dans le repo GitHub
2. Vérifier que le Root Directory est bien `backend` (pas `/backend`)
3. Forcer un redéploiement

### Problème : Build échoue avec "file not found"

**Solution :**
- Vérifier que tous les fichiers nécessaires sont commités dans Git
- Vérifier que le Root Directory est bien `backend`
- Vérifier les logs pour voir exactement quel fichier manque

### Problème : Railway utilise toujours Nixpacks au lieu de Docker

**Solution :**
1. Vérifier qu'il n'y a pas de `nixpacks.toml` dans le repo (on l'a supprimé)
2. Vérifier qu'il n'y a pas de `railway.json` qui force Nixpacks
3. Forcer Railway à utiliser Docker :
   - Dans Settings → Build, chercher "Builder" ou "Build Method"
   - Sélectionner "Docker" si disponible
   - Ou supprimer et recréer le service

## 📝 Checklist finale

- [ ] Service Railway créé (Empty Service)
- [ ] Repo GitHub connecté
- [ ] Root Directory configuré à `backend` (sans slash)
- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL créée (si nécessaire)
- [ ] Premier déploiement réussi
- [ ] Build Docker visible dans les logs
- [ ] API répond sur l'URL publique
- [ ] Migrations Prisma exécutées (si nécessaire)

## 🎯 Résumé de la solution

**Ce qui a été fait :**
- ✅ Supprimé `railway.json` (causait des erreurs de parsing)
- ✅ Supprimé `nixpacks.toml` (plus nécessaire)
- ✅ Dockerfile adapté pour fonctionner avec Root Directory = `backend`
- ✅ `.dockerignore` créé à la racine pour optimiser

**Configuration Railway :**
- Root Directory = `backend` (via l'interface)
- Railway détecte automatiquement le Dockerfile
- Pas besoin de fichier de configuration supplémentaire

Cette approche est plus simple, plus fiable et évite les erreurs de parsing de configuration.

