# Dockerfile pour le backend
# Ce Dockerfile doit être utilisé avec Root Directory = "backend" dans Railway
# OU être placé à la racine et utiliser les chemins "backend/..."

FROM node:20-alpine

# Installer pnpm globalement
RUN npm install -g pnpm@10.23.0

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package.json pnpm-lock.yaml* tsconfig.json ./

# Copier Prisma
COPY prisma ./prisma

# Copier le code source
COPY src ./src

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

