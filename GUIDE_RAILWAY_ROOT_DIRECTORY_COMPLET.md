# Guide complet : Railway avec Root Directory

## 🎯 Objectif

Configurer Railway pour qu'il ne déploie que le dossier `backend/` alors que votre repo GitHub contient aussi le frontend.

## ✅ Solution 1 : Root Directory dans l'interface Railway (RECOMMANDÉ)

### Étapes détaillées

1. **Aller sur [railway.app](https://railway.app)**
2. **Sélectionner votre projet**
3. **Cliquer sur le service backend** (ou créer un nouveau service si nécessaire)
4. **Aller dans l'onglet "Settings"** (icône ⚙️ en haut à droite)
5. **Scroller jusqu'à la section "Source"** ou "Build & Deploy"
6. **Chercher le champ "Root Directory"** ou "Working Directory"
   - Il peut être dans différentes sections selon la version de Railway
   - Chercher aussi dans "Deploy" ou "Build"
7. **Entrer la valeur** : `backend`
   - ⚠️ **IMPORTANT** : Juste `backend` (pas `/backend`, pas `./backend`, pas `backend/`)
8. **Sauvegarder** (bouton "Save" ou "Update")
9. **Redéployer** le service

### Résultat attendu

Après configuration, Railway va :
- ✅ Copier uniquement le contenu du dossier `backend/` dans le conteneur
- ✅ Exécuter `pnpm install` depuis `backend/`
- ✅ Exécuter `pnpm build` depuis `backend/`
- ✅ Exécuter `pnpm start` depuis `backend/`
- ✅ Ignorer complètement le dossier `src/` et les autres fichiers frontend

## ✅ Solution 2 : Créer un nouveau service avec Root Directory

Si vous ne trouvez pas le champ "Root Directory" dans votre service actuel :

1. **Supprimer l'ancien service** (optionnel, mais recommandé pour éviter la confusion)
2. **Créer un nouveau service** :
   - Cliquer sur "+ New" dans votre projet
   - Sélectionner "Empty Service"
3. **Connecter le repo GitHub** :
   - Cliquer sur "Connect GitHub Repo"
   - Sélectionner votre repository
4. **Configurer immédiatement le Root Directory** :
   - Avant le premier déploiement, aller dans Settings
   - Configurer "Root Directory" = `backend`
5. **Railway détectera automatiquement** :
   - Le `package.json` dans `backend/`
   - Les commandes de build et start

## ✅ Solution 3 : Utiliser un fichier nixpacks.toml (Alternative)

Si Railway ne propose pas le Root Directory, créer un fichier à la racine :

### Créer `nixpacks.toml` à la racine du projet

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = [
  "cd backend && pnpm install"
]

[phases.build]
cmds = [
  "cd backend && pnpm build"
]

[start]
cmd = "cd backend && pnpm start"
```

⚠️ **Note** : Cette solution fonctionne mais la Solution 1 (Root Directory) est préférable.

## ✅ Solution 4 : Utiliser un Dockerfile (Dernier recours)

Si rien ne fonctionne, créer un `Dockerfile` dans le dossier `backend/` :

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY backend/package.json backend/pnpm-lock.yaml ./
COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Installer pnpm
RUN npm install -g pnpm

# Installer les dépendances
RUN pnpm install

# Générer Prisma Client
RUN pnpm prisma generate

# Build
RUN pnpm build

# Exposer le port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

Puis dans Railway, configurer pour utiliser ce Dockerfile.

## 🔍 Comment vérifier que ça fonctionne

### 1. Vérifier les logs Railway

Après le déploiement, dans les logs Railway, vous devriez voir :

```
✓ Installing dependencies...
✓ Building...
✓ Starting server...
```

Et **PAS** de références à `vite`, `react`, ou autres dépendances frontend.

### 2. Tester l'API

```bash
curl https://mytrackly-production.up.railway.app/
```

Devrait retourner :
```json
{"message":"API fonctionnel"}
```

### 3. Vérifier la structure dans les logs

Les logs ne devraient **PAS** mentionner :
- ❌ `vite build`
- ❌ `react`
- ❌ `tailwindcss`

Ils devraient mentionner :
- ✅ `tsc` (TypeScript compiler)
- ✅ `prisma generate`
- ✅ `node dist/index.js`

## 📋 Checklist de configuration

- [ ] Root Directory configuré sur `backend` dans Railway
- [ ] Service redéployé après configuration
- [ ] Logs Railway montrent que le build se fait depuis `backend/`
- [ ] Test : `curl https://mytrackly-production.up.railway.app/` retourne JSON
- [ ] Pas d'erreurs liées à `vite` ou `react` dans les logs

## ⚠️ Points d'attention

1. **Le Root Directory doit être configuré AVANT le premier déploiement** si possible
2. **Après modification du Root Directory, toujours redéployer**
3. **Le Root Directory est relatif à la racine du repo**, donc `backend` et non `./backend`
4. **Vercel doit pointer vers le dossier `carnet-entrainement/`** (pas `backend/`)

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifier que le service est bien un service Node.js** (pas un service frontend)
2. **Vérifier les logs Railway** pour voir exactement quelle commande est exécutée
3. **Essayer de supprimer et recréer le service** avec le Root Directory configuré dès le début
4. **Vérifier que `backend/package.json` existe bien** dans le repo GitHub

