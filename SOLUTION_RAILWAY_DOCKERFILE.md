# Solution Railway avec Dockerfile

## 🎯 Problème résolu

J'ai créé un `Dockerfile` dans le dossier `backend/` qui va forcer Railway à ne prendre que les fichiers du backend.

## 📋 Étapes pour configurer Railway

### 1. Commiter le Dockerfile

```bash
git add backend/Dockerfile backend/.dockerignore
git commit -m "Ajout Dockerfile pour déploiement Railway backend uniquement"
git push
```

### 2. Configurer Railway pour utiliser le Dockerfile

1. **Aller sur Railway** → Votre projet → Service backend
2. **Aller dans Settings** (⚙️)
3. **Chercher "Dockerfile Path"** ou "Build Configuration"
4. **Entrer** : `backend/Dockerfile`
   - Ou si Railway détecte automatiquement, laissez-le faire
5. **Sauvegarder**

### 3. Alternative : Configurer le Root Directory + Dockerfile

Si Railway ne détecte pas automatiquement le Dockerfile :

1. **Settings** → **Root Directory** : `backend`
2. Railway devrait alors trouver automatiquement `backend/Dockerfile`

### 4. Redéployer

Railway devrait redéployer automatiquement après le push, ou cliquez sur "Redeploy" manuellement.

## 🔍 Comment vérifier que ça fonctionne

### Dans les logs Railway, vous devriez voir :

```
Step 1/10 : FROM node:20-alpine
Step 2/10 : RUN npm install -g pnpm@10.23.0
Step 3/10 : WORKDIR /app
Step 4/10 : COPY backend/package.json ...
Step 5/10 : RUN pnpm install --frozen-lockfile
Step 6/10 : RUN pnpm prisma generate
Step 7/10 : RUN pnpm build
...
```

**PAS** de références à :
- ❌ `vite`
- ❌ `react`
- ❌ `tailwindcss`

### Tester l'API :

```bash
curl https://mytrackly-production.up.railway.app/
```

Devrait retourner :
```json
{"message":"API fonctionnel"}
```

## ⚠️ Si Railway ne trouve pas le Dockerfile

Si Railway dit qu'il ne trouve pas le Dockerfile :

1. **Vérifier que le fichier existe bien** : `backend/Dockerfile`
2. **Dans Railway Settings**, chercher "Dockerfile Path" et mettre : `backend/Dockerfile`
3. **Ou configurer Root Directory = `backend`** et Railway trouvera automatiquement le Dockerfile

## 🆘 Si ça ne fonctionne toujours pas

### Option A : Forcer Railway à utiliser Docker

1. **Settings** → **Build Command** : laisser vide (Railway utilisera le Dockerfile)
2. **Settings** → **Start Command** : laisser vide (défini dans le Dockerfile)

### Option B : Vérifier les logs

Regardez les logs Railway pour voir exactement quelle commande est exécutée. Si vous voyez encore `cd backend && pnpm install`, c'est que Railway n'utilise pas le Dockerfile.

### Option C : Supprimer et recréer le service

1. **Supprimer le service actuel**
2. **Créer un nouveau service** → "Empty Service"
3. **Connecter le repo GitHub**
4. **Configurer immédiatement** :
   - Root Directory : `backend`
   - Ou Dockerfile Path : `backend/Dockerfile`
5. **Déployer**

## 📝 Structure des fichiers

```
carnet-entrainement/
├── backend/
│   ├── Dockerfile          ← Nouveau fichier
│   ├── .dockerignore       ← Nouveau fichier
│   ├── package.json
│   ├── src/
│   └── ...
├── src/                    ← Ignoré par le Dockerfile
└── ...
```

Le Dockerfile copie **uniquement** les fichiers du dossier `backend/`, donc le frontend est complètement ignoré.

