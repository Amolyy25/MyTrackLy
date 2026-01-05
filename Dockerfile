# Dockerfile à la racine pour Railway
# Railway va builder depuis la racine du repo

FROM node:20-alpine

# Installer pnpm globalement
RUN npm install -g pnpm@10.23.0

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers du backend
COPY backend/package.json backend/pnpm-lock.yaml* backend/tsconfig.json ./
COPY backend/prisma ./prisma
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

