# Guide : Configurer Railway pour déployer uniquement le backend

## 🎯 Objectif

Configurer Railway pour qu'il ne déploie que le dossier `backend/` et ignore le reste du projet.

## 📋 Étapes à suivre

### Étape 1 : Accéder aux paramètres du service

1. **Aller sur [railway.app](https://railway.app)**
2. **Sélectionner votre projet**
3. **Cliquer sur le service backend** (ou créer un nouveau service si nécessaire)
4. **Aller dans l'onglet "Settings"** (⚙️)

### Étape 2 : Configurer le Root Directory

1. **Dans Settings, trouver la section "Source"**
2. **Chercher le champ "Root Directory"** ou "Working Directory"
3. **Entrer** : `backend`
   - ⚠️ **IMPORTANT** : Juste `backend` (pas `/backend` ni `./backend`)
4. **Sauvegarder** les modifications

### Étape 3 : Vérifier la configuration de build

Railway devrait maintenant :
- Détecter automatiquement que c'est un projet Node.js
- Utiliser le `package.json` dans le dossier `backend/`
- Exécuter les commandes depuis le dossier `backend/`

### Étape 4 : Vérifier les commandes de build

Dans Settings → Deploy, vérifier que :
- **Build Command** : `pnpm install && pnpm build` (ou laisser Railway le détecter automatiquement)
- **Start Command** : `pnpm start` (ou `node dist/index.js`)

### Étape 5 : Redéployer

1. **Aller dans l'onglet "Deployments"**
2. **Cliquer sur "Redeploy"** ou créer un nouveau déploiement
3. **Attendre** que le build se termine

## 🔍 Vérification

Après le redéploiement, tester :

```bash
curl https://mytrackly-production.up.railway.app/
```

Vous devriez voir :
```json
{"message":"API fonctionnel"}
```

Si vous voyez du HTML (frontend), le Root Directory n'est pas correctement configuré.

## ⚠️ Si le champ "Root Directory" n'apparaît pas

Si vous ne trouvez pas le champ "Root Directory" dans les settings :

### Option A : Utiliser railway.json

Le fichier `backend/railway.json` que nous avons créé devrait aider, mais Railway peut aussi utiliser un fichier à la racine.

Créer un fichier `railway.json` à la **racine du projet** avec :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "cd backend && pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option B : Créer un nouveau service

1. **Supprimer l'ancien service** (si nécessaire)
2. **Créer un nouveau service** → "Empty Service"
3. **Connecter le repo GitHub**
4. **Dans les settings du nouveau service**, configurer :
   - Root Directory : `backend`
   - Build Command : `pnpm install && pnpm build`
   - Start Command : `pnpm start`

## 📝 Structure attendue

Votre projet GitHub devrait avoir cette structure :

```
carnet-entrainement/
├── backend/          ← Railway doit pointer ici
│   ├── src/
│   ├── package.json
│   ├── railway.json
│   └── ...
├── src/              ← Ignoré par Railway
├── package.json      ← Ignoré par Railway
└── ...
```

## ✅ Checklist

- [ ] Root Directory configuré sur `backend`
- [ ] Service redéployé
- [ ] Test : `curl https://mytrackly-production.up.railway.app/` retourne JSON
- [ ] Pas de HTML (frontend) sur l'URL backend

