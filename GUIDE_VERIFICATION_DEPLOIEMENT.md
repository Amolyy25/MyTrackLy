# Guide de vérification du déploiement

## 🔍 Vérifications à faire

### 1. Vérifier la configuration Vercel (Frontend)

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Sélectionner votre projet** (`my-track-ly`)
3. **Aller dans Settings → Environment Variables**

Vérifier que vous avez :
- ✅ `VITE_API_URL` = `https://mytrackly-production.up.railway.app/api`
  - ⚠️ **IMPORTANT** : L'URL doit se terminer par `/api` (pas juste `/`)
  - ⚠️ **IMPORTANT** : L'URL doit être en `https://` (pas `http://`)

4. **Vérifier que les variables sont bien appliquées**
   - Les variables doivent être définies pour **Production**, **Preview**, et **Development**
   - Cliquer sur "Redeploy" si vous avez modifié les variables

### 2. Vérifier la configuration Railway (Backend)

1. **Aller sur [railway.app](https://railway.app)**
2. **Sélectionner votre projet** → Service backend
3. **Aller dans Variables**

Vérifier que vous avez TOUTES ces variables :

```env
PORT=3000
DATABASE_URL=postgresql://... (fourni automatiquement par Railway)
JWT_SECRET=votre_secret_jwt_fort
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://my-track-ly.vercel.app
ALLOWED_ORIGINS=https://my-track-ly.vercel.app,http://localhost:5173
EMAIL_SENDER=votre@email.com
EMAIL_PASSWORD=votre_mot_de_passe
NODE_ENV=production
```

⚠️ **CRITIQUE** : `ALLOWED_ORIGINS` doit contenir EXACTEMENT :
- `https://my-track-ly.vercel.app` (sans slash final)
- `http://localhost:5173` (pour le dev local)

**Format exact** : `https://my-track-ly.vercel.app,http://localhost:5173`
- Pas d'espaces après les virgules
- Pas de slash final après `.app`

### 3. Vérifier que le backend est bien redémarré

Après avoir modifié les variables d'environnement Railway :
1. Aller dans le service backend
2. Cliquer sur "Deploy" → "Redeploy" (ou attendre le redéploiement automatique)
3. Attendre que le déploiement soit terminé

### 4. Tester le backend directement

Ouvrir dans votre navigateur :
```
https://mytrackly-production.up.railway.app/
```

Vous devriez voir :
```json
{"message":"API fonctionnel"}
```

Si ça ne marche pas, le backend n'est pas démarré correctement.

### 5. Tester CORS avec curl

Dans votre terminal, tester :

```bash
curl -X OPTIONS https://mytrackly-production.up.railway.app/api/auth/login \
  -H "Origin: https://my-track-ly.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

Vous devriez voir dans les headers de réponse :
```
Access-Control-Allow-Origin: https://my-track-ly.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Credentials: true
```

### 6. Vérifier les logs Railway

1. Dans Railway, aller dans votre service backend
2. Cliquer sur "Logs"
3. Vérifier qu'il n'y a pas d'erreurs au démarrage
4. Vous devriez voir : `Serveur lancé sur le port 3000` (ou le port configuré)

### 7. Vérifier les logs Vercel

1. Dans Vercel, aller dans votre projet
2. Cliquer sur "Deployments"
3. Sélectionner le dernier déploiement
4. Cliquer sur "View Function Logs"
5. Vérifier qu'il n'y a pas d'erreurs

## 🐛 Problèmes courants et solutions

### Problème : Erreur 405 sur OPTIONS

**Cause** : CORS mal configuré ou `ALLOWED_ORIGINS` incorrect

**Solution** :
1. Vérifier que `ALLOWED_ORIGINS` contient exactement `https://my-track-ly.vercel.app` (sans slash final)
2. Redéployer le backend sur Railway
3. Vérifier que le code CORS est bien déployé (voir `backend/src/index.ts`)

### Problème : Erreur CORS dans le navigateur

**Cause** : L'origine du frontend ne correspond pas à `ALLOWED_ORIGINS`

**Solution** :
1. Vérifier l'URL exacte de votre frontend Vercel
2. Vérifier que `ALLOWED_ORIGINS` contient cette URL exacte (sans slash final)
3. Redéployer le backend

### Problème : L'API ne répond pas

**Cause** : Le backend n'est pas démarré ou le port est incorrect

**Solution** :
1. Vérifier les logs Railway
2. Vérifier que `PORT` est bien défini (ou laisser Railway le gérer automatiquement)
3. Vérifier que le build s'est bien passé

### Problème : Variables d'environnement non prises en compte

**Cause** : Variables mal configurées ou redéploiement nécessaire

**Solution** :
1. Vérifier l'orthographe exacte des noms de variables
2. Redéployer après modification des variables
3. Pour Vercel : vérifier que les variables sont définies pour "Production"

## ✅ Checklist de vérification rapide

- [ ] Vercel : `VITE_API_URL` = `https://mytrackly-production.up.railway.app/api`
- [ ] Railway : `ALLOWED_ORIGINS` = `https://my-track-ly.vercel.app,http://localhost:5173`
- [ ] Railway : `FRONTEND_URL` = `https://my-track-ly.vercel.app`
- [ ] Railway : Backend redéployé après modification des variables
- [ ] Vercel : Frontend redéployé après modification des variables
- [ ] Test : `https://mytrackly-production.up.railway.app/` retourne `{"message":"API fonctionnel"}`
- [ ] Test : Le frontend charge sans erreur dans la console
- [ ] Test : La requête OPTIONS retourne 200 (pas 405)

## 🔧 Commandes de test

### Tester le backend
```bash
# Test simple
curl https://mytrackly-production.up.railway.app/

# Test CORS preflight
curl -X OPTIONS https://mytrackly-production.up.railway.app/api/auth/login \
  -H "Origin: https://my-track-ly.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### Vérifier les variables Vercel (via CLI)
```bash
vercel env ls
```

### Vérifier les variables Railway (via CLI)
```bash
railway variables
```

