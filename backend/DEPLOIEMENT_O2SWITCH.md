# Guide de déploiement Backend sur O2Switch (Méthode manuelle SSH)

> ⚠️ **Note** : Pour une méthode plus simple avec l'outil cPanel, voir `DEPLOIEMENT_O2SWITCH_CPANEL.md`

## ✅ Prérequis

- Serveur O2Switch avec accès SSH
- Node.js 20+ installé
- PostgreSQL (sur le serveur ou externe)
- pnpm installé globalement

## 📋 Étapes de déploiement

### 1. Se connecter en SSH

#### Option A : Avec mot de passe (première connexion)

```bash
ssh votre-utilisateur@votre-serveur.o2switch.net
# Entrer le mot de passe quand demandé
```

#### Option B : Avec clé SSH (recommandé - plus sécurisé)

**Étape 1 : Générer une clé SSH (si vous n'en avez pas déjà)**

Sur votre machine locale (Mac/Linux) :

```bash
# Générer une nouvelle clé SSH
ssh-keygen -t ed25519 -C "votre-email@example.com"

# Ou avec RSA (si ed25519 n'est pas supporté)
ssh-keygen -t rsa -b 4096 -C "votre-email@example.com"
```

Appuyez sur Entrée pour accepter l'emplacement par défaut (`~/.ssh/id_ed25519` ou `~/.ssh/id_rsa`).

**Étape 2 : Copier la clé publique sur le serveur O2Switch**

```bash
# Méthode 1 : Utiliser ssh-copy-id (le plus simple)
ssh-copy-id votre-utilisateur@votre-serveur.o2switch.net

# Méthode 2 : Copier manuellement
cat ~/.ssh/id_ed25519.pub | ssh votre-utilisateur@votre-serveur.o2switch.net "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Méthode 3 : Si vous avez déjà accès au serveur
# Sur le serveur, créer ~/.ssh/authorized_keys et y coller le contenu de ~/.ssh/id_ed25519.pub
```

**Étape 3 : Se connecter avec la clé SSH**

```bash
# La connexion se fera automatiquement avec la clé
ssh votre-utilisateur@votre-serveur.o2switch.net
```

**Étape 4 : Configurer un alias (optionnel mais pratique)**

Créer/modifier `~/.ssh/config` sur votre machine locale :

```bash
nano ~/.ssh/config
```

Ajouter :

```
Host o2switch
    HostName votre-serveur.o2switch.net
    User votre-utilisateur
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```

Ensuite, vous pouvez vous connecter simplement avec :

```bash
ssh o2switch
```

**Vérifier que la clé fonctionne :**

```bash
# Tester la connexion
ssh -v votre-utilisateur@votre-serveur.o2switch.net

# Si ça fonctionne, vous ne devriez pas être demandé de mot de passe
```

### 2. Installer Node.js et pnpm (si pas déjà installé)

```bash
# Installer Node.js 20 (via nvm recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Installer pnpm
npm install -g pnpm@10.23.0
```

### 3. Cloner le repository

```bash
cd ~
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo/backend
```

### 4. Installer les dépendances

```bash
pnpm install
```

### 5. Configurer les variables d'environnement

Créer un fichier `.env` dans `backend/` :

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

### 6. Configurer la base de données PostgreSQL

Si PostgreSQL est sur le serveur :

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE votre_database;
CREATE USER votre_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE votre_database TO votre_user;
\q
```

### 7. Exécuter les migrations Prisma

```bash
cd ~/votre-repo/backend
pnpm prisma migrate deploy
```

### 8. Build le projet

```bash
pnpm build
```

### 9. Installer PM2 (gestionnaire de processus)

```bash
npm install -g pm2
```

### 10. Démarrer l'application avec PM2

```bash
cd ~/votre-repo/backend
pm2 start dist/index.js --name "backend-api"
pm2 save
pm2 startup  # Pour démarrer automatiquement au boot
```

### 11. Configurer Nginx (reverse proxy)

Créer/modifier la configuration Nginx :

```bash
sudo nano /etc/nginx/sites-available/votre-domaine
```

Configuration Nginx :

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/votre-domaine /etc/nginx/sites-enabled/
sudo nginx -t  # Vérifier la config
sudo systemctl reload nginx
```

### 12. Configurer SSL avec Let's Encrypt (optionnel mais recommandé)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.votre-domaine.com
```

## 🔧 Commandes PM2 utiles

```bash
pm2 list              # Voir les processus
pm2 logs backend-api  # Voir les logs
pm2 restart backend-api  # Redémarrer
pm2 stop backend-api    # Arrêter
pm2 delete backend-api  # Supprimer
```

## 🔄 Mise à jour du code

```bash
cd ~/votre-repo
git pull
cd backend
pnpm install
pnpm build
pm2 restart backend-api
```

## 📝 Variables d'environnement nécessaires

- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `EMAIL_SENDER=...`
- `EMAIL_PASSWORD=...`
- `ALLOWED_ORIGINS=...`
- `FRONTEND_URL=...`

## ✅ Avantages O2Switch vs Render/Railway

- ✅ SMTP fonctionne directement (même serveur)
- ✅ Pas de blocage de ports
- ✅ Performance meilleure
- ✅ Contrôle total
- ✅ Coût fixe (pas de surprise)

## 🐛 Dépannage

### L'application ne démarre pas

```bash
pm2 logs backend-api  # Vérifier les logs
cd ~/votre-repo/backend
node dist/index.js  # Tester manuellement
```

### Erreur de connexion à la base de données

Vérifier que PostgreSQL est démarré :

```bash
sudo systemctl status postgresql
```

### Erreur SMTP

Sur O2Switch, utiliser le port 465 (SSL) directement :

```bash
# Vérifier que le code utilise bien port 465 en production locale
```

## 📊 Monitoring

```bash
pm2 monit  # Monitoring en temps réel
pm2 logs --lines 100  # Dernières 100 lignes de logs
```
