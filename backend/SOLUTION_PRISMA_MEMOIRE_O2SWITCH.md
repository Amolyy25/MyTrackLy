# Solution : Erreur mémoire Prisma sur O2Switch

## 🎯 Problème

Erreur lors de `prisma generate` sur O2Switch :

```
RangeError: WebAssembly.Instance(): Out of memory
```

Causé par les limites LVE (Lightweight Virtual Environment) de CloudLinux qui limitent la mémoire disponible.

## ✅ Solutions

### Solution 1 : Générer Prisma en local (RECOMMANDÉ)

**Étape 1 : Générer Prisma sur votre machine locale**

```bash
cd backend
pnpm install
pnpm prisma generate
```

**Étape 2 : Copier le dossier généré sur le serveur**

```bash
# Depuis votre machine locale
scp -r backend/node_modules/.prisma votre-user@serveur:/home/votre-user/backend-api/node_modules/
```

**Étape 3 : Sur le serveur, installer les dépendances sans générer Prisma**

```bash
# Dans l'environnement Node.js
source /home/votre-identifiant/nodevenv/backend-api/22/bin/activate && cd /home/votre-identifiant/backend-api

# Installer les dépendances (sans prisma generate)
pnpm install --frozen-lockfile --ignore-scripts

# Le dossier .prisma est déjà copié, donc Prisma fonctionnera
```

### Solution 2 : Modifier package.json pour éviter prebuild

**Option A : Retirer prebuild temporairement**

Modifier `package.json` :

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy"
  }
}
```

Puis build sans prebuild :

```bash
pnpm build  # Ne lancera pas prisma generate
```

Et générer Prisma manuellement après avoir copié `.prisma` :

```bash
# Ou simplement utiliser le .prisma copié depuis local
```

### Solution 3 : Augmenter les limites LVE (si possible)

Contacter le support O2Switch pour demander une augmentation des limites LVE :

- Max resident set
- Max address space

Mais cette solution n'est pas toujours possible selon le plan d'hébergement.

### Solution 4 : Script d'installation modifié

Le script `install-o2switch.sh` a été modifié pour gérer cette erreur gracieusement.

## 📋 Workflow recommandé pour O2Switch

### 1. Préparer en local

```bash
# Sur votre machine locale
cd backend
pnpm install
pnpm prisma generate
pnpm build
```

### 2. Créer un archive avec Prisma généré

```bash
# Créer un tar.gz avec node_modules/.prisma
tar -czf prisma-generated.tar.gz node_modules/.prisma
```

### 3. Sur le serveur O2Switch

```bash
# Se connecter
ssh votre-user@serveur

# Activer l'environnement Node.js
source /home/votre-identifiant/nodevenv/backend-api/22/bin/activate && cd /home/votre-identifiant/backend-api

# Copier les fichiers (sans node_modules)
# ... (git clone ou scp)

# Extraire Prisma généré
tar -xzf prisma-generated.tar.gz

# Installer les dépendances (sans scripts)
pnpm install --frozen-lockfile --ignore-scripts

# Build (sans prebuild qui lance prisma generate)
pnpm build
```

### 4. Modifier package.json pour production

Créer un `package.json` de production sans `prebuild` :

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## 🔧 Script automatique amélioré

Le script `install-o2switch.sh` gère maintenant cette erreur et propose des alternatives.

## ✅ Vérification

Après avoir copié `.prisma`, vérifier que ça fonctionne :

```bash
# Dans l'environnement Node.js
node -e "const { PrismaClient } = require('@prisma/client'); console.log('✅ Prisma fonctionne');"
```

## 📝 Note importante

Le dossier `node_modules/.prisma` contient le client Prisma généré. Une fois copié, il fonctionne normalement même si `prisma generate` n'a pas été exécuté sur le serveur.
