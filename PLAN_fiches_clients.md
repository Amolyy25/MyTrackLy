# PLAN : Système de Fiches Clients (Élèves passifs)

## 📋 Checklist (cocher au fur et à mesure)

- [x] **Analyse du contexte** terminée
  - [x] Fichiers environnants analysés
  - [x] Conventions de code identifiées
  - [x] Logique métier comprise

- [x] **Plan validé** par l'utilisateur
  - [x] Étapes détaillées approuvées
  - [x] Fichiers impactés confirmés

- [x] **Implémentation terminée**
  - [x] Étape 1 : Modification du schéma Prisma (isVirtual, passwordHash nullable, allowEmails, CoachNote)
  - [x] Étape 2 : Migration Prisma
  - [x] Étape 3 : Backend - Controller création/gestion fiches clients + notes coach
  - [x] Étape 4 : Backend - Routes API
  - [x] Étape 5 : Backend - Modifier emailService pour respecter allowEmails
  - [x] Étape 6 : Backend - Endpoint stats détaillées pour profil élève (top exercices, volume, fréquence)
  - [x] Étape 7 : Frontend - Types TypeScript mis à jour
  - [x] Étape 8 : Frontend - Formulaire "Ajouter un client" dans Students.tsx
  - [x] Étape 9 : Frontend - Hooks pour les nouvelles API
  - [x] Étape 10 : Frontend - Page profil élève /dashboard/coach/student/:id (header, stats, charts, historique)
  - [x] Étape 11 : Frontend - Routing dans App.jsx
  - [x] Tous les fichiers modifiés
  - [ ] Tests manuels validés

- [ ] **Validation fonctionnelle**
  - [ ] Création de fiche client sans mot de passe
  - [ ] Ajout de séances/mensurations/notes pour un client
  - [ ] Page profil élève avec stats et graphiques
  - [ ] Gestion des emails conditionnels
  - [ ] Permissions : seul le coach créateur a accès
  - [ ] Pas de régression sur les élèves actifs existants

## 📁 Fichiers impactés

### Base de données
- `backend/prisma/schema.prisma` — Ajout isVirtual, passwordHash nullable, allowEmails, modèle CoachNote

### Backend (création/modification)
- `backend/src/controllers/studentController.ts` — Ajout createVirtualStudent, updateVirtualStudent, deleteVirtualStudent
- `backend/src/controllers/coachNoteController.ts` — CRUD notes privées coach (NOUVEAU)
- `backend/src/controllers/statsController.ts` — Ajout getStudentDetailedStats
- `backend/src/routes/studentRoutes.ts` — Nouvelles routes
- `backend/src/routes/coachNoteRoutes.ts` — Routes notes (NOUVEAU)
- `backend/src/email/emailService.ts` — Vérification allowEmails avant envoi

### Frontend (création/modification)
- `src/types/index.ts` — Types VirtualStudent, CoachNote, StudentDetailedStats
- `src/components/pages/dashboard/coach/Students.tsx` — Bouton + formulaire "Ajouter un client"
- `src/components/pages/dashboard/coach/StudentProfile.tsx` — Page profil complète (NOUVEAU)
- `src/hooks/useStudents.ts` — Hook pour CRUD clients (NOUVEAU)
- `src/hooks/useCoachNotes.ts` — Hook pour notes coach (NOUVEAU)
- `src/App.jsx` — Route /dashboard/coach/student/:id

## 📝 Notes importantes

### Décisions techniques prises
- **isVirtual sur User** : On ajoute un champ `isVirtual` (Boolean, default false) plutôt qu'un modèle séparé. Cela permet de réutiliser toutes les relations existantes (TrainingSession, Measurement, etc.)
- **passwordHash nullable** : Les fiches clients n'ont pas de mot de passe. On rend le champ nullable (`String?`).
- **allowEmails sur User** : Champ Boolean (default true) pour contrôler l'envoi d'emails par client.
- **CoachNote** : Nouveau modèle pour les notes privées du coach sur un élève (pas lié à une séance, contrairement à coachComment).
- **Permissions** : Les fiches virtuelles sont toujours liées à `coachId` → seul le coach créateur y a accès.

### Architecture des données
```
User (isVirtual: true, passwordHash: null, coachId: coachX)
  ├── TrainingSession[] (créées par le coach)
  ├── Measurement[] (créées par le coach)
  └── CoachNote[] (notes privées du coach)
```

### Points à vérifier après déploiement
- Les élèves existants ne sont pas impactés (isVirtual = false par défaut)
- Le login refuse les users avec isVirtual = true (pas de passwordHash)
- Les emails ne sont envoyés que si allowEmails = true

## 📊 Statut actuel
**Date** : 11 février 2026
**Progression** : 11 / 11 étapes terminées
**Prochaine étape** : Validation fonctionnelle (appliquer la migration en BDD puis tester)
