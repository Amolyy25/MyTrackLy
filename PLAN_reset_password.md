# PLAN : Reset Password (Frontend + Backend)

## 📋 Checklist (cocher au fur et à mesure)

- [ ] **Analyse du contexte** terminée

  - [ ] Fichiers environnants analysés
  - [ ] Conventions de code identifiées
  - [ ] Logique métier comprise

- [ ] **Plan validé** par l'utilisateur

  - [ ] Étapes détaillées approuvées
  - [ ] Fichiers impactés confirmés

- [ ] **Implémentation en cours**

  - [ ] Étape 1 : Migration Prisma pour PasswordResetToken
  - [ ] Étape 2 : Backend - Controller pour reset password
  - [ ] Étape 3 : Backend - Routes pour reset password
  - [ ] Étape 4 : Backend - Template email pour reset
  - [ ] Étape 5 : Frontend - Page ForgotPassword
  - [ ] Étape 6 : Frontend - Page ResetPassword
  - [ ] Étape 7 : Frontend - Routes dans App.jsx
  - [ ] Étape 8 : Frontend - Export dans index.tsx Auth
  - [ ] Tous les fichiers modifiés
  - [ ] Tests écrits/validés

- [ ] **Validation fonctionnelle**

  - [ ] Fonctionnalité testée et validée
  - [ ] Tests unitaires/feature OK
  - [ ] Pas de régression détectée

- [x] **Refactor (optionnel)**
  - [x] Plan de refactor validé
  - [x] Refactor appliqué
  - [x] Service passwordResetService créé
  - [x] Utilitaire tokenGenerator créé
  - [x] Contrôleurs refactorisés
  - [x] Gestion d'erreurs améliorée

## 📁 Fichiers impactés

Liste complète des fichiers créés/modifiés/supprimés :

### Backend

- `backend/prisma/schema.prisma` (modification - ajout modèle PasswordResetToken)
- `backend/prisma/migrations/` (nouvelle migration)
- `backend/src/controllers/authController.ts` (modification - ajout fonctions reset)
- `backend/src/routes/authRoutes.ts` (modification - ajout routes reset)
- `backend/src/email/templates/passwordReset.html` (création - template email)

### Frontend

- `src/components/pages/Auth/ForgotPassword.tsx` (création)
- `src/components/pages/Auth/ResetPassword.tsx` (création)
- `src/components/pages/Auth/index.tsx` (modification - export nouveaux composants)
- `src/App.jsx` (modification - ajout routes)

## 📝 Notes importantes

- Décisions techniques prises :

  - Utilisation d'un token unique et sécurisé (crypto.randomBytes)
  - Expiration du token : 1 heure
  - Un seul token actif par utilisateur à la fois
  - Template email suivant le même pattern que les autres templates
  - Pages frontend suivant le même style que Login.tsx (Tailwind CSS)

- Hypothèses faites :

  - URL frontend pour le reset : `/reset-password?token=XXX`
  - Variable d'environnement `FRONTEND_URL` pour construire le lien dans l'email
  - Le token sera passé en query parameter

- Points à vérifier après déploiement :

  - Variable d'environnement `FRONTEND_URL` configurée
  - Emails de reset reçus correctement
  - Tokens expirés correctement supprimés (job de nettoyage optionnel)

- TODO futurs :
  - Job de nettoyage automatique des tokens expirés
  - Rate limiting sur la demande de reset

## 📊 Statut actuel

**Date** : 2025-01-02
**Progression** : 8 / 8 étapes terminées ✅
**Prochaine étape** : Validation fonctionnelle et tests
