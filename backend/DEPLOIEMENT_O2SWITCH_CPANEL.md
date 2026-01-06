# Guide de déploiement Backend sur O2Switch via cPanel

## 🎯 Méthode : Utiliser l'outil "Setup Node.js App" de cPanel

O2Switch propose un outil intégré dans cPanel pour déployer des applications Node.js. Cette méthode est **plus simple** que l'installation manuelle via SSH.

## ✅ Prérequis

- Accès à cPanel O2Switch
- Base de données PostgreSQL (créée dans cPanel ou externe)
- Domaine configuré dans cPanel

## 📋 Étapes de déploiement

### 1. Créer l'application Node.js dans cPanel

1. **Connectez-vous à cPanel** O2Switch
2. **Cherchez "Setup Node.js App"** dans la section "Logiciels"
3. **Cliquez sur "Create Application"**

### 2. Configurer l'application

Remplissez le formulaire :

- **Node.js Version** : `20` (recommandé)
- **Application Root** : `/home/votre-identifiant/backend-api`
  - ⚠️ **IMPORTANT** : Ne pas mettre dans le dossier du domaine !
  - Créez un dossier séparé à la racine de l'hébergement
- **Application URL** : `api.votre-domaine.com` (ou le sous-domaine de votre choix)
- **Application Startup File** : `dist/index.js` (sera configuré après l'installation)
- **Passenger Log File** : `/home/votre-identifiant/logs/backend-error.log` (optionnel mais recommandé)

4. **Cliquez sur "Create"**

### 3. Récupérer la commande d'activation

Après la création, cPanel affiche une **commande `source`** qui ressemble à :

```bash
source /home/votre-identifiant/nodevenv/backend-api/20/bin/activate && cd /home/votre-identifiant/backend-api
```

**Copiez cette commande**, vous en aurez besoin.

### 4. Se connecter en SSH

**Option A : Avec clé SSH (recommandé)**

```bash
# Générer une clé SSH si nécessaire
ssh-keygen -t ed25519 -C "votre-email@example.com"

# Copier la clé sur le serveur
ssh-copy-id votre-identifiant@votre-serveur.o2switch.net

# Se connecter
ssh votre-identifiant@votre-serveur.o2switch.net
```

**Option B : Avec mot de passe**

```bash
ssh votre-identifiant@votre-serveur.o2switch.net
```

### 5. Cloner le repository

```bash
cd ~
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo
```

### 6. Copier les fichiers dans le dossier de l'application

```bash
# Copier le contenu du dossier backend dans le dossier de l'application Node.js
cp -r backend/* /home/votre-identifiant/backend-api/
cd /home/votre-identifiant/backend-api
```

### 7. Générer Prisma en local (IMPORTANT - éviter erreur mémoire)

**⚠️ IMPORTANT** : O2Switch a des limites mémoire qui peuvent bloquer `prisma generate`.

**Solution : Générer Prisma sur votre machine locale puis copier sur le serveur**

```bash
# Sur votre machine locale
cd backend
pnpm install
pnpm prisma generate

# Copier le dossier .prisma sur le serveur
scp -r node_modules/.prisma votre-user@serveur:/home/votre-user/backend-api/node_modules/
```

### 8. Exécuter le script d'installation

**Méthode A : Utiliser le script automatique (recommandé)**

```bash
# Activer l'environnement Node.js (utilisez la commande source de cPanel)
source /home/votre-identifiant/nodevenv/backend-api/22/bin/activate && cd /home/votre-identifiant/backend-api

# Rendre le script exécutable
chmod +x install-o2switch.sh

# Exécuter le script (il gérera l'erreur Prisma si elle survient)
./install-o2switch.sh
```

**Si vous avez déjà copié .prisma, le script continuera normalement.**

**Méthode B : Commandes manuelles**

```bash
# Activer l'environnement Node.js
source /home/votre-identifiant/nodevenv/backend-api/20/bin/activate && cd /home/votre-identifiant/backend-api

# Installer pnpm
npm install -g pnpm@10.23.0

# Installer les dépendances
pnpm install --frozen-lockfile

# Générer Prisma
pnpm prisma generate

# Build
pnpm build
```

### 8. Configurer les variables d'environnement

Créer/modifier le fichier `.env` :

```bash
nano .env
```

Contenu du `.env` :

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/database
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRES_IN=7d
EMAIL_SENDER=votre-email@votre-domaine.com
EMAIL_PASSWORD=votre_mot_de_passe_email
ALLOWED_ORIGINS=https://votre-frontend.vercel.app,http://localhost:5173
FRONTEND_URL=https://votre-frontend.vercel.app
```

### 9. Configurer la base de données PostgreSQL

**Si PostgreSQL est sur le serveur O2Switch :**

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE votre_database;
CREATE USER votre_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE votre_database TO votre_user;
\q
```

**Ou utiliser la base de données créée dans cPanel :**

Dans cPanel → PostgreSQL Databases, créez une base et récupérez les identifiants.

### 10. Installer les dépendances (sans scripts pour éviter prisma generate)

```bash
# Dans l'environnement Node.js
source /home/votre-identifiant/nodevenv/backend-api/22/bin/activate && cd /home/votre-identifiant/backend-api

# Installer les dépendances sans scripts (car .prisma est déjà copié)
pnpm install --frozen-lockfile --ignore-scripts
```

### 11. Exécuter les migrations Prisma

```bash
# Dans l'environnement Node.js
source /home/votre-identifiant/nodevenv/backend-api/22/bin/activate && cd /home/votre-identifiant/backend-api

# Exécuter les migrations (ne nécessite pas prisma generate)
pnpm prisma migrate deploy
```

### 11. Configurer le point d'entrée dans cPanel

1. **Retourner dans cPanel** → **Setup Node.js App**
2. **Cliquer sur votre application** `backend-api`
3. **Modifier "Application startup file"** : `dist/index.js`
4. **Cliquer sur "Restart App"**

### 12. Vérifier que ça fonctionne

Accédez à l'URL configurée (ex: `https://api.votre-domaine.com/`)

Vous devriez voir :

```json
{ "message": "API fonctionnel" }
```

## 🔄 Mise à jour du code

Quand vous voulez mettre à jour l'application :

```bash
# Se connecter en SSH
ssh votre-identifiant@votre-serveur.o2switch.net

# Activer l'environnement Node.js
source /home/votre-identifiant/nodevenv/backend-api/20/bin/activate && cd /home/votre-identifiant/backend-api

# Mettre à jour le code
git pull

# Réinstaller les dépendances (si package.json a changé)
pnpm install --frozen-lockfile

# Rebuild
pnpm build

# Exécuter les migrations si nécessaire
pnpm prisma migrate deploy

# Redémarrer l'application dans cPanel
# (cPanel → Setup Node.js App → Restart App)
```

## 📝 Variables d'environnement nécessaires

- `NODE_ENV=production`
- `PORT=3000` (géré automatiquement par Passenger)
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `EMAIL_SENDER=...`
- `EMAIL_PASSWORD=...`
- `ALLOWED_ORIGINS=...`
- `FRONTEND_URL=...`

## ⚠️ Points importants

1. **Ne pas lancer l'application manuellement** : Phusion Passenger le fait automatiquement
2. **Le port est géré par Passenger** : pas besoin de configurer `PORT` dans `.env` (mais on le garde pour compatibilité)
3. **Application Root ≠ Dossier du domaine** : créez un dossier séparé pour l'application
4. **Utiliser l'environnement Node.js** : toujours utiliser la commande `source` avant d'exécuter des commandes

## 🐛 Dépannage

### L'application ne démarre pas

1. Vérifier les logs dans cPanel → Setup Node.js App → View Logs
2. Vérifier que `dist/index.js` existe
3. Vérifier que le fichier `.env` est bien configuré
4. Vérifier que la base de données est accessible

### Erreur "Application startup file not found"

Vérifier que le chemin dans "Application startup file" est correct : `dist/index.js`

### Erreur de connexion à la base de données

Vérifier que `DATABASE_URL` dans `.env` est correct et que PostgreSQL est accessible.

### Erreur SMTP

Sur O2Switch, le SMTP fonctionne directement avec le port 465. Vérifier que `EMAIL_SENDER` et `EMAIL_PASSWORD` sont corrects.

## ✅ Avantages de cette méthode

- ✅ Gestion automatique par Phusion Passenger
- ✅ Redémarrage automatique en cas de crash
- ✅ Intégration avec le domaine via cPanel
- ✅ Logs accessibles depuis cPanel
- ✅ Pas besoin de PM2 ou systemd
- ✅ SMTP fonctionne directement (même serveur)
