# Guide Railway avec Nixpacks (Solution Simple)

## 🎯 Solution : Utiliser Nixpacks (sans Docker)

Railway avec Nixpacks gère automatiquement :
- ✅ Les dépendances système (OpenSSL, etc.)
- ✅ La détection automatique du projet Node.js
- ✅ L'installation de pnpm
- ✅ Toutes les bibliothèques nécessaires pour Prisma

## 📋 Configuration Railway

### 1. Supprimer le Dockerfile

Le Dockerfile a été supprimé pour forcer Railway à utiliser Nixpacks.

### 2. Configurer Root Directory dans Railway

1. **Aller sur Railway** → Votre projet → Service backend
2. **Settings** (⚙️) → **Root Directory**
3. **Entrer** : `backend` (sans slash)
4. **Sauvegarder**

### 3. Railway détectera automatiquement

Avec Root Directory = `backend`, Railway va :
- ✅ Détecter automatiquement le `package.json` dans `backend/`
- ✅ Utiliser Nixpacks (pas Docker)
- ✅ Installer automatiquement Node.js 20 et pnpm
- ✅ Installer toutes les dépendances système nécessaires (OpenSSL, etc.)
- ✅ Exécuter `pnpm install`
- ✅ Exécuter `pnpm build` (qui inclut `prisma generate` via postbuild)
- ✅ Exécuter `pnpm start`

### 4. Vérifier les commandes de build (optionnel)

Dans **Settings** → **Deploy**, vérifier que :
- **Build Command** : `pnpm install && pnpm build` (ou laisser vide pour auto-détection)
- **Start Command** : `pnpm start` (ou laisser vide pour auto-détection)

Railway devrait détecter automatiquement ces commandes depuis le `package.json`.

### 5. Redéployer

1. **Deployments** → **Redeploy** (ou push sur GitHub)
2. Surveiller les logs

## 🔍 Vérification dans les logs

### Logs attendus avec Nixpacks :

```
✓ Detected Node.js project
✓ Installing Node.js 20...
✓ Installing pnpm...
✓ Installing dependencies...
  → pnpm install
✓ Building...
  → pnpm build
  → tsc
  → prisma generate (via postbuild)
✓ Starting...
  → pnpm start
  → node dist/index.js
```

**✅ Signes que ça fonctionne :**
- Pas d'erreur OpenSSL
- Prisma generate réussi
- Build TypeScript réussi
- Serveur démarre correctement

**❌ Si vous voyez encore des erreurs OpenSSL :**
- Vérifier que le Dockerfile est bien supprimé
- Vérifier que Root Directory = `backend`
- Forcer un redéploiement complet

## 🎯 Avantages de Nixpacks vs Docker

| Nixpacks | Docker |
|----------|--------|
| ✅ Gère automatiquement OpenSSL | ❌ Doit installer manuellement |
| ✅ Détecte automatiquement la config | ❌ Configuration manuelle |
| ✅ Plus simple | ❌ Plus complexe |
| ✅ Moins de maintenance | ❌ Maintenance du Dockerfile |

## 📝 Checklist

- [ ] Dockerfile supprimé (ou renommé)
- [ ] Root Directory configuré à `backend` dans Railway
- [ ] Service redéployé
- [ ] Logs montrent Nixpacks (pas Docker)
- [ ] Pas d'erreur OpenSSL
- [ ] Prisma generate réussi
- [ ] API répond correctement

## 🐛 Si ça ne fonctionne toujours pas

### Problème : Railway utilise encore Docker

**Solution :**
1. Vérifier qu'il n'y a pas de Dockerfile dans le repo
2. Vérifier qu'il n'y a pas de `.dockerignore` qui force Docker
3. Dans Railway Settings → Build, forcer "Nixpacks" si disponible

### Problème : Railway ne trouve pas le package.json

**Solution :**
1. Vérifier que Root Directory = `backend` (pas `/backend`)
2. Vérifier que `backend/package.json` existe bien dans le repo GitHub
3. Vérifier les logs pour voir le chemin utilisé

## ✅ Résumé

**Ce qui a été fait :**
- ✅ Supprimé `backend/Dockerfile` (causait erreur OpenSSL)
- ✅ Railway utilisera maintenant Nixpacks automatiquement
- ✅ Root Directory = `backend` dans Railway Settings

**Configuration finale :**
- Pas de Dockerfile
- Root Directory = `backend`
- Railway détecte automatiquement et utilise Nixpacks
- Toutes les dépendances système gérées automatiquement

Cette solution est plus simple et plus fiable pour Prisma.

