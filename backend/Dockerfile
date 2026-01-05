# Dockerfile pour le backend
# Ce Dockerfile fonctionne depuis la racine du repo GitHub
# Railway doit être configuré avec Root Directory = "backend" OU utiliser dockerfilePath = "backend/Dockerfile"

FROM node:20-alpine

# Installer pnpm globalement
RUN npm install -g pnpm@10.23.0

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration du backend
COPY backend/package.json backend/pnpm-lock.yaml* backend/tsconfig.json ./

# Copier Prisma
COPY backend/prisma ./prisma

# Copier le code source
COPY backend/src ./src

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Générer le client Prisma
RUN pnpm prisma generate

# Build TypeScript
RUN pnpm build

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["pnpm", "start"]

