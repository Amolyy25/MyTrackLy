# Guide Backend - Reset Password

Ce guide détaille toutes les modifications backend nécessaires pour implémenter la fonctionnalité de réinitialisation de mot de passe.

## 📋 Résumé des modifications

- **1 migration Prisma** : Ajout du modèle `PasswordResetToken`
- **1 service créé** : `passwordResetService.ts` (logique métier)
- **1 utilitaire créé** : `tokenGenerator.ts` (génération de tokens)
- **1 contrôleur modifié** : Ajout de 2 fonctions dans `authController.ts`
- **1 route modifiée** : Ajout de 2 routes dans `authRoutes.ts`
- **1 template email créé** : `passwordReset.html`

---

## 1. Base de données - Migration Prisma

### Fichier modifié : `backend/prisma/schema.prisma`

#### Ajout de la relation dans le modèle User

```prisma
model User {
  // ... champs existants ...

  passwordResetTokens   PasswordResetToken[] // Tokens de reset de mot de passe

  @@map("users")
}
```

#### Nouveau modèle PasswordResetToken

```prisma
model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique // Token unique pour le reset
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("password_reset_tokens")
  @@index([token])
  @@index([userId])
}
```

### Migration SQL créée : `backend/prisma/migrations/20250102120000_add_password_reset_token/migration.sql`

```sql
-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Commandes à exécuter

```bash
cd backend
pnpm prisma generate
pnpm prisma migrate deploy  # Pour appliquer la migration en production
# OU
pnpm prisma db push  # Pour développement (synchronise le schéma sans créer de migration)
```

---

## 2. Service - Logique métier

### Fichier créé : `backend/src/services/passwordResetService.ts`

Ce service contient toute la logique métier pour la réinitialisation de mot de passe, séparée des contrôleurs pour une meilleure maintenabilité et testabilité.

**Fonctions principales :**

- `requestPasswordReset(email: string)` : Génère et envoie un token de reset
- `resetPasswordWithToken(token: string, newPassword: string)` : Valide et utilise le token pour changer le mot de passe

**Constantes de configuration :**

- `TOKEN_EXPIRATION_HOURS = 1` : Durée de validité du token
- `MIN_PASSWORD_LENGTH = 6` : Longueur minimale du mot de passe

### Fichier créé : `backend/src/utils/tokenGenerator.ts`

Utilitaire pour générer des tokens sécurisés :

- `generateResetToken()` : Génère un token hexadécimal de 64 caractères

---

## 3. Contrôleur - Fonctions de reset

### Fichier modifié : `backend/src/controllers/authController.ts`

#### Imports ajoutés

```typescript
import {
  requestPasswordReset,
  resetPasswordWithToken,
} from "../services/passwordResetService";
```

#### Nouvelle fonction : `requestPasswordResetController`

```typescript
// --- Request Password Reset ---
export async function requestPasswordResetController(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      res.status(400).json({ message: "Veuillez saisir votre email." });
      return;
    }

    // Déléguer la logique métier au service
    const message = await requestPasswordReset(email);

    res.json({ message });
  } catch (error) {
    console.error("Request Password Reset Error:", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la demande de réinitialisation.",
    });
  }
}
```

#### Nouvelle fonction : `resetPasswordController`

```typescript
// --- Reset Password ---
export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    // Validation des entrées
    if (!token) {
      res.status(400).json({ message: "Le token est requis." });
      return;
    }

    if (!password) {
      res.status(400).json({ message: "Le mot de passe est requis." });
      return;
    }

    // Déléguer la logique métier au service
    await resetPasswordWithToken(token, password);

    res.json({
      message: "Votre mot de passe a été réinitialisé avec succès.",
    });
  } catch (error) {
    // Gérer les erreurs métier (token invalide, mot de passe trop court, etc.)
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Erreurs de validation métier (400)
      if (
        errorMessage.includes("Token invalide") ||
        errorMessage.includes("expiré") ||
        errorMessage.includes("caractères")
      ) {
        res.status(400).json({ message: errorMessage });
        return;
      }
    }

    // Erreurs serveur (500)
    console.error("Reset Password Error:", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la réinitialisation du mot de passe.",
    });
  }
}
```

---

## 3. Routes - Endpoints API

### Fichier modifié : `backend/src/routes/authRoutes.ts`

#### Imports modifiés

```typescript
import {
  register,
  login,
  getMe,
  requestPasswordResetController,
  resetPasswordController,
} from "../controllers/authController";
```

#### Routes ajoutées

```typescript
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", requestPasswordResetController); // ← NOUVELLE ROUTE
router.post("/reset-password", resetPasswordController); // ← NOUVELLE ROUTE

router.get("/me", authenticateToken, getMe);
```

### Endpoints disponibles

- **POST** `/api/auth/forgot-password`

  - Body : `{ "email": "user@example.com" }`
  - Réponse : `{ "message": "Si cet email existe..." }`

- **POST** `/api/auth/reset-password`
  - Body : `{ "token": "abc123...", "password": "nouveauMotDePasse" }`
  - Réponse : `{ "message": "Votre mot de passe a été réinitialisé..." }`

---

## 5. Template email

### Fichier créé : `backend/src/email/templates/passwordReset.html`

Le template utilise les placeholders suivants :

- `{{userName}}` : Nom de l'utilisateur
- `{{resetUrl}}` : URL complète de réinitialisation avec le token

Le template est déjà créé et suit le même style que les autres templates email du projet.

---

## 6. Variables d'environnement

### Variable requise

Ajouter dans votre fichier `.env` :

```env
FRONTEND_URL=http://localhost:5173
```

En production, utiliser l'URL de votre frontend :

```env
FRONTEND_URL=https://votre-domaine.com
```

Cette variable est utilisée pour construire le lien de réinitialisation dans l'email.

---

## 7. Architecture et refactorisation

### Séparation des responsabilités

Le code a été refactorisé pour suivre les principes SOLID :

1. **Service Layer** (`passwordResetService.ts`) :

   - Contient toute la logique métier
   - Facilement testable
   - Réutilisable

2. **Controller Layer** (`authController.ts`) :

   - Gère uniquement les requêtes/réponses HTTP
   - Validation des entrées
   - Délègue la logique au service

3. **Utils Layer** (`tokenGenerator.ts`) :
   - Fonctions utilitaires réutilisables
   - Génération de tokens sécurisés

### Avantages du refactor

- ✅ **Testabilité** : La logique métier peut être testée indépendamment
- ✅ **Maintenabilité** : Code plus organisé et facile à comprendre
- ✅ **Réutilisabilité** : Le service peut être utilisé ailleurs si besoin
- ✅ **Séparation des responsabilités** : Chaque couche a un rôle clair

---

## 8. Sécurité

### Mesures de sécurité implémentées

1. **Token unique et sécurisé** : Généré avec `crypto.randomBytes(32)`
2. **Expiration** : Token valide pendant 1 heure uniquement
3. **Un seul token actif** : Les anciens tokens sont supprimés lors d'une nouvelle demande
4. **Pas de révélation d'email** : La réponse est identique que l'email existe ou non
5. **Validation du token** : Vérification de l'existence, expiration et utilisateur
6. **Suppression après usage** : Le token est supprimé après utilisation réussie
7. **Hachage du mot de passe** : Utilisation de bcrypt avec 10 rounds de salt

---

## 9. Tests manuels

### Test 1 : Demande de reset

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test 2 : Reset avec token

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_RECU_DANS_EMAIL",
    "password": "nouveauMotDePasse123"
  }'
```

---

## 10. Checklist de déploiement

- [ ] Migration Prisma appliquée en production
- [ ] Variable d'environnement `FRONTEND_URL` configurée
- [ ] Service d'email configuré et fonctionnel
- [ ] Test de l'envoi d'email de reset
- [ ] Test du reset avec un token valide
- [ ] Test du reset avec un token expiré
- [ ] Vérification de la suppression des tokens après usage

---

## 11. Améliorations futures (optionnel)

- **Rate limiting** : Limiter le nombre de demandes de reset par email/IP
- **Job de nettoyage** : Supprimer automatiquement les tokens expirés (cron job)
- **Historique** : Logger les tentatives de reset pour audit
- **Notification** : Envoyer un email de confirmation après reset réussi

---

## 📝 Notes importantes

- Le token est valide pendant **1 heure** uniquement
- Un seul token actif par utilisateur (les anciens sont supprimés)
- Le token est supprimé après utilisation réussie
- Pour des raisons de sécurité, on ne révèle jamais si un email existe dans la base
