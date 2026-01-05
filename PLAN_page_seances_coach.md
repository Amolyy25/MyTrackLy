# PLAN : Page Séances pour le Coach

## 📋 Checklist (cocher au fur et à mesure)

- [ ] **Analyse du contexte** terminée

  - [x] Fichiers environnants analysés
  - [x] Conventions de code identifiées
  - [x] Logique métier comprise

- [ ] **Plan validé** par l'utilisateur

  - [ ] Étapes détaillées approuvées
  - [ ] Fichiers impactés confirmés

- [ ] **Implémentation en cours**

  - [ ] Étape 1 : Ajouter champ coachComment dans le schéma Prisma
  - [ ] Étape 2 : Créer migration Prisma
  - [ ] Étape 3 : Backend - Route pour récupérer les séances des élèves d'un coach
  - [ ] Étape 4 : Backend - Route pour créer une séance pour un élève (par le coach)
  - [ ] Étape 5 : Backend - Route pour ajouter un commentaire du coach sur une séance
  - [ ] Étape 6 : Backend - Template email pour commentaire du coach
  - [ ] Étape 7 : Backend - Template email pour création de séance par le coach
  - [ ] Étape 8 : Frontend - Créer la page Sessions.tsx pour le coach
  - [ ] Étape 9 : Frontend - Ajouter la route dans App.jsx
  - [ ] Étape 10 : Frontend - Ajouter le lien dans la navigation du DashboardLayout
  - [ ] Étape 11 : Frontend - Créer les hooks nécessaires
  - [ ] Tous les fichiers modifiés
  - [ ] Tests écrits/validés

- [ ] **Validation fonctionnelle**

  - [ ] Fonctionnalité testée et validée
  - [ ] Tests unitaires/feature OK
  - [ ] Pas de régression détectée

- [ ] **Refactor (optionnel)**
  - [ ] Plan de refactor validé
  - [ ] Refactor appliqué
  - [ ] Tests après refactor OK

## 📁 Fichiers impactés

Liste complète des fichiers créés/modifiés :

### Backend

- `backend/prisma/schema.prisma` (MODIFIÉ - ajout champ coachComment)
- `backend/prisma/migrations/...` (NOUVEAU - migration)
- `backend/src/controllers/trainingController.ts` (MODIFIÉ - nouvelles fonctions)
- `backend/src/routes/trainingRoutes.ts` (MODIFIÉ - nouvelles routes)
- `backend/src/email/templates/coachCommentNotification.html` (NOUVEAU)
- `backend/src/email/templates/coachCreatedSessionNotification.html` (NOUVEAU)

### Frontend

- `src/components/pages/dashboard/coach/Sessions.tsx` (NOUVEAU)
- `src/App.jsx` (MODIFIÉ - ajout route)
- `src/components/layout/DashboardLayout.tsx` (MODIFIÉ - ajout lien navigation)
- `src/hooks/useTrainingSessions.ts` (MODIFIÉ - nouveaux hooks)
- `src/types/index.ts` (MODIFIÉ - ajout type pour coachComment)

## 📝 Notes importantes

- Décisions techniques prises :
  - Ajouter un champ `coachComment` dans `TrainingSession` pour stocker les commentaires du coach
  - Le coach peut voir toutes les séances de ses élèves via une route dédiée
  - Le coach peut créer une séance pour un élève spécifique (userId sera celui de l'élève)
  - Les emails seront envoyés de manière asynchrone (ne bloquent pas la réponse)
- Hypothèses faites :
  - Le champ `coachComment` sera optionnel (String?)
  - Les emails utiliseront les templates HTML existants comme modèle
  - La page Sessions affichera toutes les séances de tous les élèves du coach, avec possibilité de filtrer par élève
- Points à vérifier après déploiement :
  - Les emails sont bien envoyés lors de l'ajout d'un commentaire
  - Les emails sont bien envoyés lors de la création d'une séance par le coach
  - Les permissions sont correctes (seul le coach peut voir/créer/modifier les séances de ses élèves)
- TODO futurs :
  - Ajouter un système de notifications en temps réel
  - Permettre au coach de répondre aux commentaires de l'élève

## 📊 Statut actuel

**Date** : 2025-01-02
**Progression** : 11 / 11 étapes terminées ✅
**Prochaine étape** : Régénérer Prisma Client et appliquer la migration

## ⚠️ Actions requises après implémentation

1. **Régénérer Prisma Client** :

   ```bash
   cd backend
   docker exec -i apimmo_php npx prisma generate
   ```

2. **Appliquer la migration** :

   ```bash
   cd backend
   docker exec -i apimmo_php npx prisma migrate deploy
   ```

   (ou `prisma migrate dev` en développement)

3. **Tester les fonctionnalités** :
   - Se connecter en tant que coach
   - Accéder à la page "Séances" depuis le dashboard
   - Vérifier que les séances des élèves s'affichent
   - Tester l'ajout d'un commentaire
   - Vérifier que les emails sont bien envoyés
