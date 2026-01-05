# PLAN : Déploiement Préprod - Vercel + Railway

## 📋 Checklist (cocher au fur et à mesure)

- [x] **Analyse du contexte** terminée
  - [x] Fichiers environnants analysés
  - [x] Conventions de code identifiées
  - [x] Logique métier comprise
  - [x] URLs hardcodées identifiées (12 fichiers)
  - [x] Configuration CORS analysée

- [x] **Modifications du code** terminées
  - [x] Création de `src/config/api.ts` pour centraliser l'URL API
  - [x] Modification des hooks (`useExercises.ts`, `useTrainingSessions.ts`)
  - [x] Modification de `AuthContext.tsx`
  - [x] Modification des composants Auth (Login, Register, ConfirmEmail, EmailConfirmation)
  - [x] Modification des composants coach (Students, Sessions, CoachHome)
  - [x] Modification du backend pour CORS dynamique
  - [x] Création de `vercel.json` pour le frontend
  - [x] Création de `railway.json` pour le backend
  - [x] Modification de `backend/package.json` (ajout postbuild, migrate deploy)

- [ ] **Configuration des plateformes**
  - [ ] Compte Vercel créé
  - [ ] Compte Railway créé
  - [ ] Variables d'environnement configurées sur Vercel
  - [ ] Variables d'environnement configurées sur Railway
  - [ ] Base de données PostgreSQL créée sur Railway

- [ ] **Déploiement**
  - [ ] Backend déployé sur Railway
  - [ ] Migrations Prisma exécutées
  - [ ] Frontend déployé sur Vercel
  - [ ] URLs mises à jour dans les variables d'environnement

- [ ] **Validation fonctionnelle**
  - [ ] Backend accessible (test endpoint `/`)
  - [ ] Frontend accessible
  - [ ] CORS fonctionne correctement
  - [ ] Authentification testée (login/register)
  - [ ] API endpoints testés
  - [ ] Base de données accessible

## 📁 Fichiers créés/modifiés

### Fichiers créés
- `src/config/api.ts` - Configuration centralisée de l'URL API
- `vercel.json` - Configuration Vercel pour le frontend
- `backend/railway.json` - Configuration Railway pour le backend
- `backend/Procfile` - Procfile pour Railway (alternative)
- `PLAN_deploiement_preprod.md` - Ce fichier

### Fichiers modifiés
- `src/hooks/useExercises.ts` - Utilise maintenant `API_URL` depuis config
- `src/hooks/useTrainingSessions.ts` - Utilise maintenant `API_URL` depuis config
- `src/contexts/AuthContext.tsx` - Utilise maintenant `API_URL` depuis config
- `src/components/pages/Auth/Login.tsx` - URLs dynamiques
- `src/components/pages/Auth/Register.tsx` - URLs dynamiques
- `src/components/pages/Auth/ConfirmEmail.tsx` - URLs dynamiques
- `src/components/pages/Auth/EmailConfirmation.tsx` - URLs dynamiques
- `src/components/pages/dashboard/coach/Students.tsx` - URLs dynamiques
- `src/components/pages/dashboard/coach/Sessions.tsx` - URLs dynamiques
- `src/components/pages/dashboard/coach/CoachHome.tsx` - URLs dynamiques
- `backend/src/index.ts` - CORS dynamique selon environnement
- `backend/package.json` - Ajout postbuild et migrate deploy

## 📝 Variables d'environnement nécessaires

### Frontend (Vercel)
```env
VITE_API_URL=https://votre-backend.railway.app/api
```

### Backend (Railway)
```env
PORT=3000
DATABASE_URL=postgresql://... (fourni par Railway)
JWT_SECRET=votre_secret_jwt_fort
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://votre-frontend.vercel.app
ALLOWED_ORIGINS=https://votre-frontend.vercel.app,http://localhost:5173
EMAIL_SENDER=votre@email.com
EMAIL_PASSWORD=votre_mot_de_passe_email
NODE_ENV=production
```

## 🚀 Guide de déploiement étape par étape

### Étape 1 : Préparer le repository GitHub

1. Vérifier que tous les fichiers sont commités :
```bash
git status
git add .
git commit -m "Préparation au déploiement : URLs dynamiques et configurations"
git push
```

### Étape 2 : Déployer le backend sur Railway

1. **Créer un compte Railway**
   - Aller sur [railway.app](https://railway.app)
   - Se connecter avec GitHub

2. **Créer un nouveau projet**
   - Cliquer sur "New Project"
   - Sélectionner "Deploy from GitHub repo"
   - Choisir votre repository

3. **Ajouter un service PostgreSQL**
   - Dans le projet, cliquer sur "+ New"
   - Sélectionner "Database" → "PostgreSQL"
   - Railway créera automatiquement une base de données

4. **Ajouter le service backend**
   - Cliquer sur "+ New" → "GitHub Repo"
   - Sélectionner votre repository
   - Dans les settings, définir le **Root Directory** : `backend`
   - Railway détectera automatiquement Node.js

5. **Configurer les variables d'environnement**
   - Dans le service backend, aller dans "Variables"
   - Ajouter toutes les variables listées ci-dessus
   - Pour `DATABASE_URL` : utiliser la variable fournie par le service PostgreSQL Railway
   - Pour `FRONTEND_URL` et `ALLOWED_ORIGINS` : mettre une URL temporaire pour l'instant (on la mettra à jour après le déploiement du frontend)

6. **Exécuter les migrations Prisma**
   - Une fois le backend déployé, ouvrir le terminal Railway
   - Exécuter : `pnpm prisma migrate deploy`
   - Ou via Railway CLI : `railway run pnpm prisma migrate deploy`

7. **Noter l'URL du backend**
   - Railway génère une URL automatique (ex: `https://votre-backend.railway.app`)
   - Noter cette URL, elle sera nécessaire pour le frontend

### Étape 3 : Déployer le frontend sur Vercel

1. **Créer un compte Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Se connecter avec GitHub

2. **Importer le projet**
   - Cliquer sur "Add New..." → "Project"
   - Importer depuis GitHub
   - Sélectionner votre repository

3. **Configurer le projet**
   - **Framework Preset** : Vite
   - **Root Directory** : `carnet-entrainement`
   - **Build Command** : `pnpm build` (ou laisser par défaut)
   - **Output Directory** : `dist`
   - **Install Command** : `pnpm install`

4. **Configurer les variables d'environnement**
   - Dans "Environment Variables"
   - Ajouter : `VITE_API_URL` = `https://votre-backend.railway.app/api`
   - (Remplacer par l'URL réelle de votre backend Railway)

5. **Déployer**
   - Cliquer sur "Deploy"
   - Vercel va builder et déployer automatiquement
   - Noter l'URL générée (ex: `https://votre-frontend.vercel.app`)

### Étape 4 : Mettre à jour les URLs

1. **Mettre à jour Railway**
   - Retourner sur Railway
   - Dans les variables d'environnement du backend :
     - `FRONTEND_URL` = `https://votre-frontend.vercel.app`
     - `ALLOWED_ORIGINS` = `https://votre-frontend.vercel.app,http://localhost:5173`
   - Redémarrer le service backend

2. **Vérifier Vercel**
   - Vérifier que `VITE_API_URL` pointe bien vers le backend Railway

### Étape 5 : Tests et validation

1. **Tester le backend**
   - Ouvrir `https://votre-backend.railway.app/`
   - Devrait retourner : `{"message":"API fonctionnel"}`

2. **Tester le frontend**
   - Ouvrir `https://votre-frontend.vercel.app`
   - Vérifier que la page se charge

3. **Tester l'authentification**
   - Essayer de se connecter
   - Vérifier les logs Railway en cas d'erreur CORS

4. **Vérifier les logs**
   - Railway : Dashboard → Service → Logs
   - Vercel : Dashboard → Project → Deployments → Logs

## 🔧 Commandes utiles

### Railway CLI (optionnel)
```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Lier le projet
railway link

# Exécuter des commandes
railway run pnpm prisma migrate deploy
railway run pnpm prisma studio
```

### Vercel CLI (optionnel)
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

## ⚠️ Points d'attention

1. **Base de données** : Les migrations Prisma doivent être exécutées manuellement après le premier déploiement
2. **CORS** : Vérifier que `ALLOWED_ORIGINS` contient bien l'URL du frontend Vercel
3. **Variables d'environnement** : Ne jamais commiter les fichiers `.env` avec des secrets
4. **JWT_SECRET** : Générer une clé forte et unique pour la production
5. **Email** : Vérifier que les credentials email fonctionnent en production

## 📊 Statut actuel

**Date** : 2025-01-02
**Progression** : Modifications du code terminées ✅
**Prochaine étape** : Configuration des plateformes et déploiement

## 🔗 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Railway](https://docs.railway.app)
- [Documentation Prisma Deploy](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

