# PLAN : Système de rôles et plans payants

**Date** : 2 janvier 2025

---

## 📋 Étape 1 : ANALYSE DU CONTEXTE

### Fichiers examinés

- `src/components/pages/landingpage/main.tsx` - Landing page avec CTAs
- `backend/prisma/schema.prisma` - Schéma de base de données
- `src/components/pages/dashboard/Home.tsx` - Dashboard actuel (personnel)
- `src/components/layout/DashboardLayout.tsx` - Layout du dashboard
- `src/App.jsx` - Routes de l'application

### Compréhension de la structure

**Landing Page :**

- Plusieurs boutons CTA : "Commencer gratuitement", "Voir la démo", "Réserver une démo"
- Section pricing existante (à vérifier)
- Besoin de rediriger vers une page de présentation des plans

**Base de données :**

- Modèle `User` existe avec champs de base
- **À ajouter** : colonne `role` (personnel, eleve, coach)
- **À ajouter** : relation coach-élève (un élève doit être lié à un coach)

**Dashboards :**

- Dashboard actuel = dashboard "personnel"
- À créer : dashboard "élève" (student)
- À créer : dashboard "coach"

---

## 📋 Étape 2 : PROPOSITION DE PLAN

### 🎯 Objectif global

Créer un système de rôles avec 3 types d'utilisateurs :

1. **Personnel** : Dashboard actuel (suivi personnel)
2. **Élève** : Dashboard pour suivre avec un coach (réservation, discussion, etc.)
3. **Coach** : Dashboard pour gérer ses élèves (administration, suivi, etc.)

Chaque rôle correspond à un plan payant avec tarification basée sur les coûts infrastructure + 50% marge.

---

## 📋 Étape 3 : PLAN DÉTAILLÉ PAR ÉTAPE

### **ÉTAPE 1 : Page de présentation des plans + Page de paiement**

#### 1.1 Créer la page de présentation des plans

**Fichier à créer** : `src/components/pages/Plans.tsx`

**Fonctionnalités** :

- Présentation des 3 plans (Personnel, Élève, Coach)
- Description détaillée de chaque plan
- Tarifs calculés (coûts infrastructure + 50% marge)
- Boutons "Choisir ce plan" qui redirigent vers la page de paiement

**Structure des plans** :

**Plan Personnel** :

- Suivi personnel de ses séances
- Statistiques et progression
- Mensurations
- Habitudes
- **Tarif estimé** : ~5€/mois (coût infra ~3.33€ + 50% marge)

**Plan Élève** :

- Toutes les fonctionnalités du plan Personnel
- Réservation de séances avec son coach
- Discussion/messagerie avec le coach
- Accès aux programmes créés par le coach
- Suivi par le coach
- **Tarif** : Géré par votre coach (le coach paie pour l'accès de ses élèves)
- **Inscription** : Nécessite un code d'invitation unique et complexe fourni par le coach

**Plan Coach** :

- Toutes les fonctionnalités du plan Personnel
- - Gestion de ses élèves (création, administration)
- - Visualisation des séances de ses élèves
- - Visualisation des mensurations de ses élèves
- - Création de séances pour ses élèves
- - Envoi d'emails de rappel
- - Messagerie avec ses élèves
- - Statistiques globales de ses élèves
- **Tarif estimé** : ~50€/mois (coût infra ~33.33€ + 50% marge)

**Calcul des coûts infrastructure (estimation)** :

- Hébergement (VPS/Cloud) : ~20€/mois
- Base de données PostgreSQL : ~10€/mois
- Stockage/Backup : ~5€/mois
- Email service (SendGrid/SES) : ~5€/mois
- CDN/Assets : ~3€/mois
- **Total infrastructure** : ~43€/mois

**Répartition par utilisateur (estimation)** :

- Utilisateur Personnel : ~3.33€/mois (1/13 de l'infra)
- Utilisateur Élève : ~10€/mois (3x plus de données, messagerie)
- Coach : ~33.33€/mois (gestion de plusieurs élèves, plus de ressources)

**Avec marge de 50%** :

- Plan Personnel : 3.33€ × 1.5 = **5€/mois**
- Plan Élève : **Géré par le coach** (pas de paiement côté élève)
- Plan Coach : 33.33€ × 1.5 = **50€/mois** (inclut la gestion des élèves)

#### 1.2 Créer la page de paiement ✅

**Fichier créé** : `src/components/pages/Payment.tsx`

**Fonctionnalités** :

- Formulaire de paiement (frontend seulement pour l'instant)
- Sélection du plan (si pas déjà sélectionné)
- Formulaire de carte bancaire (simulation)
- Informations de facturation
- Bouton "Payer" (pour l'instant juste redirige vers register avec le plan sélectionné)

**Données à collecter** :

- Plan sélectionné (personnel, eleve, coach)
- Pour le plan élève : Code d'invitation unique et complexe fourni par le coach (minimum 8 caractères)
- Informations de facturation (nom, adresse, etc.) - uniquement pour plans Personnel et Coach
- Informations de carte (simulation) - uniquement pour plans Personnel et Coach

**Note importante** : Le plan Élève ne nécessite PAS de paiement. L'élève s'inscrit directement avec le code d'invitation. Le coach paie pour donner accès à ses élèves.

#### 1.3 Modifier la landing page ✅

**Fichier modifié** : `src/components/pages/landingpage/main.tsx`

**Modifications** :

- Tous les boutons CTA ("Commencer gratuitement", "Voir la démo", etc.) redirigent vers `/plans`
- Ajouter un lien dans la navbar vers `/plans`

**Fichier à modifier** : `src/components/composants/Navbar.tsx`

- Bouton "Commencer" redirige vers `/plans`

---

### **ÉTAPE 2 : Ajouter colonne role dans la DB**

#### 2.1 Modifier le schéma Prisma

**Fichier** : `backend/prisma/schema.prisma`

**Modifications** :

- Ajouter colonne `role` dans le modèle `User`
- Type : `String` avec valeurs possibles : `"personnel"`, `"eleve"`, `"coach"`
- Valeur par défaut : `"personnel"`
- Ajouter colonne `coachId` (optionnelle) pour lier un élève à son coach
- Ajouter relation `coach` et `students` dans le modèle User

**Structure** :

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash String    @map("password_hash")
  name          String
  role          String    @default("personnel") // "personnel" | "eleve" | "coach"
  coachId      String?   @map("coach_id") // Pour les élèves, ID du coach
  coach        User?     @relation("CoachStudents", fields: [coachId], references: [id], onDelete: SetNull)
  students     User[]    @relation("CoachStudents") // Pour les coaches, liste des élèves
  goalType      String?   @map("goal_type")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations existantes
  trainingSessions  TrainingSession[]
  customExercises   Exercise[]
  measurements      Measurement[]

  @@map("users")
}
```

#### 2.2 Migration Prisma ✅

**Actions effectuées** :

- ✅ Exécuté `prisma db push` - Base de données synchronisée
- ✅ Exécuté `prisma generate` - Client Prisma régénéré automatiquement
- ✅ Migration réussie - Colonnes `role` et `coachId` ajoutées, relation coach-élève créée

---

### **ÉTAPE 3 : Créer les 3 dashboards**

#### 3.1 Dashboard Personnel (existant)

**Fichier** : `src/components/pages/dashboard/Home.tsx` (existant)

**Fonctionnalités** (déjà implémentées) :

- ✅ Statistiques personnelles
- ✅ Liste des séances
- ✅ Création de séances
- ✅ Historique
- ✅ Mensurations (à venir)
- ✅ Habitudes (à venir)
- ✅ Statistiques (à venir)

**Aucune modification nécessaire** - C'est le dashboard actuel.

---

#### 3.2 Dashboard Élève (Student)

**Fichier à créer** : `src/components/pages/dashboard/student/StudentHome.tsx`

**Fonctionnalités** :

- **Section principale** : Informations du coach assigné
  - Nom du coach
  - Contact (email, téléphone si disponible)
  - Statut (actif/inactif)
- **Réservation de séances** :
  - Voir les créneaux disponibles du coach
  - Réserver une séance
  - Voir ses séances réservées
  - Annuler une séance
- **Discussion avec le coach** :
  - Messagerie intégrée
  - Historique des messages
- **Mes séances** :
  - Séances créées par le coach pour moi
  - Séances que j'ai créées moi-même
- **Mes statistiques** :
  - Statistiques personnelles (comme le dashboard personnel)
  - Statistiques visibles par le coach
- **Programmes du coach** :
  - Programmes d'entraînement créés par le coach
  - Suivi de progression dans les programmes

**Navigation** :

- Accueil (vue d'ensemble)
- Mes séances
- Réservations
- Discussion
- Programmes
- Statistiques

**Contraintes** :

- Un élève DOIT avoir un `coachId` pour accéder au dashboard
- Si pas de coach, afficher un message pour en contacter un

---

#### 3.3 Dashboard Coach

**Fichier à créer** : `src/components/pages/dashboard/coach/CoachHome.tsx`

**Fonctionnalités** :

- **Vue d'ensemble** :
  - Nombre total d'élèves
  - Séances prévues aujourd'hui/cette semaine
  - Messages non lus
  - Statistiques globales (volume total, séances totales, etc.)
- **Gestion des élèves** :
  - Liste de tous les élèves
  - Créer un nouvel élève (formulaire d'inscription)
  - Voir les détails d'un élève
  - Activer/désactiver un élève
  - Supprimer un élève
- **Séances** :
  - Voir toutes les séances de tous les élèves
  - Créer une séance pour un élève spécifique
  - Modifier les séances des élèves
  - Planifier des séances récurrentes
- **Mensurations des élèves** :
  - Voir les mensurations de chaque élève
  - Graphiques de progression
  - Comparaisons entre élèves (anonymisées)
- **Messagerie** :
  - Discussion avec chaque élève
  - Envoi de messages groupés
- **Programmes** :
  - Créer des programmes d'entraînement
  - Assigner des programmes à des élèves
  - Suivre la progression dans les programmes
- **Rappels et notifications** :
  - Envoyer des emails de rappel aux élèves
  - Notifications de séances à venir
  - Rappels de mensurations

**Navigation** :

- Accueil (vue d'ensemble)
- Mes élèves
- Séances
- Mensurations
- Programmes
- Messagerie
- Paramètres

---

#### 3.4 Adapter le DashboardLayout selon le rôle

**Fichier à modifier** : `src/components/layout/DashboardLayout.tsx`

**Modifications** :

- Récupérer le `role` de l'utilisateur depuis `useAuth()`
- Afficher une navigation différente selon le rôle :
  - `personnel` → Navigation actuelle
  - `eleve` → Navigation élève
  - `coach` → Navigation coach
- Rediriger vers le bon dashboard selon le rôle

**Structure** :

```typescript
const { user } = useAuth();
const userRole = user?.role || "personnel";

// Navigation selon le rôle
const navigation =
  userRole === "personnel"
    ? personalNavigation
    : userRole === "eleve"
    ? studentNavigation
    : coachNavigation;
```

---

#### 3.5 Routes à créer

**Fichier à modifier** : `src/App.jsx`

**Routes à ajouter** :

- `/plans` → Page de présentation des plans
- `/payment` → Page de paiement
- Routes dashboard selon le rôle (gérées dans DashboardLayout)

---

## 📁 Fichiers impactés

### Fichiers à créer

1. **Frontend** :

   - `src/components/pages/Plans.tsx` - Page de présentation des plans
   - `src/components/pages/Payment.tsx` - Page de paiement
   - `src/components/pages/dashboard/student/StudentHome.tsx` - Dashboard élève
   - `src/components/pages/dashboard/coach/CoachHome.tsx` - Dashboard coach
   - `src/components/pages/dashboard/student/StudentSessions.tsx` - Séances élève
   - `src/components/pages/dashboard/student/StudentReservations.tsx` - Réservations
   - `src/components/pages/dashboard/student/StudentChat.tsx` - Messagerie élève
   - `src/components/pages/dashboard/coach/CoachStudents.tsx` - Gestion élèves
   - `src/components/pages/dashboard/coach/CoachSessions.tsx` - Séances coach
   - `src/components/pages/dashboard/coach/CoachChat.tsx` - Messagerie coach

2. **Backend** :
   - Migration Prisma (générée automatiquement)

### Fichiers à modifier

1. **Frontend** :

   - `src/components/pages/landingpage/main.tsx` - Rediriger CTAs vers `/plans`
   - `src/components/composants/Navbar.tsx` - Rediriger bouton vers `/plans`
   - `src/components/layout/DashboardLayout.tsx` - Navigation selon rôle
   - `src/App.jsx` - Ajouter routes `/plans` et `/payment`
   - `src/types/index.ts` - Ajouter type `UserRole`

2. **Backend** :
   - `backend/prisma/schema.prisma` - Ajouter colonne `role` et relation coach-élève

---

## 📝 Notes importantes

### Décisions techniques

1. **Rôles** :

   - `personnel` : Utilisateur standard (dashboard actuel)
   - `eleve` : Élève avec coach assigné (obligatoire)
   - `coach` : Coach qui peut gérer plusieurs élèves

2. **Relation Coach-Élève** :

   - Un élève DOIT avoir un `coachId` pour créer son compte
   - Un élève DOIT avoir un code d'invitation unique et complexe fourni par son coach
   - Chaque code d'invitation est unique et généré par le coach pour chaque élève
   - Le code doit être complexe (minimum 8 caractères, alphanumérique avec caractères spéciaux)
   - Un coach peut avoir plusieurs élèves (relation one-to-many)
   - Le coach paie pour donner accès à ses élèves (pas de paiement côté élève)
   - Si un coach est supprimé, les élèves passent en `personnel` (SetNull)

3. **Tarification** :

   - Basée sur les coûts infrastructure estimés + 50% marge
   - Tarifs mensuels (pourrait être annuel plus tard)
   - Page de paiement frontend seulement pour l'instant

4. **Sécurité** :
   - Vérifier le rôle dans le middleware backend
   - Un élève ne peut voir que ses propres données + celles partagées par son coach
   - Un coach ne peut voir que les données de ses élèves

### Hypothèses

- Les coûts infrastructure sont des estimations
- La page de paiement sera connectée à un système de paiement plus tard (Stripe, etc.)
- Pour l'instant, on stocke juste le plan sélectionné dans le register
- Le système de réservation de séances sera implémenté plus tard

---

## 📊 Statut actuel

**Date** : 2 janvier 2025  
**Progression** : 3 / 3 étapes terminées (ÉTAPE 1 ✅, ÉTAPE 2 ✅ et ÉTAPE 3 ✅ terminées)  
**Statut** : ✅ **TOUTES LES ÉTAPES SONT TERMINÉES**

### Fonctionnalités implémentées

✅ **ÉTAPE 1** : Pages Plans + Paiement

- Page de présentation des plans avec tarifs
- Page de paiement (frontend)
- Redirection des CTAs vers `/plans`
- Plan Élève sans prix (géré par le coach)

✅ **ÉTAPE 2** : Base de données

- Colonne `role` ajoutée avec valeur par défaut `"personnel"`
- Colonne `coachId` ajoutée pour relation coach-élève
- Relation self-referencing User (coach ↔ students)
- Migration Prisma exécutée avec succès

✅ **ÉTAPE 3** : Les 3 dashboards

- Dashboard Personnel (existant, fonctionnel)
- Dashboard Élève créé avec navigation dédiée
- Dashboard Coach créé avec navigation dédiée
- Navigation adaptative selon le rôle
- Redirection automatique vers le bon dashboard
- Bouton "Connexion" dans la Navbar
- Redirection après login selon le rôle

---

## ✅ Checklist d'implémentation

### ✅ ÉTAPE 1 : Page Plans + Paiement (TERMINÉE)

- [x] **1.1 Page de présentation des plans** ✅

  - [x] Créer `src/components/pages/Plans.tsx`
  - [x] Présenter les 3 plans avec descriptions
  - [x] Afficher les tarifs (5€, 15€, 50€)
  - [x] Boutons "Choisir ce plan" qui redirigent vers `/payment?plan=XXX`
  - [x] Design moderne et attractif

- [x] **1.2 Page de paiement** ✅

  - [x] Créer `src/components/pages/Payment.tsx`
  - [x] Récupérer le plan depuis query params
  - [x] Formulaire de paiement (simulation)
  - [x] Pour plan élève : champ pour code coach ou sélection coach
  - [x] Informations de facturation
  - [x] Bouton "Payer" qui redirige vers `/register?plan=XXX&coachCode=YYY`

- [x] **1.3 Modifier landing page** ✅
  - [x] Modifier tous les boutons CTA pour rediriger vers `/plans`
  - [x] Modifier Navbar pour rediriger vers `/plans`
  - [x] Ajouter route `/plans` dans `App.jsx`
  - [x] Ajouter route `/payment` dans `App.jsx`

### ÉTAPE 2 : Base de données

- [x] **2.1 Modifier schéma Prisma** ✅

  - [x] Ajouter colonne `role` dans modèle `User`
  - [x] Ajouter colonne `coachId` dans modèle `User`
  - [x] Ajouter relation `coach` et `students`
  - [x] Valeur par défaut `role = "personnel"`

- [x] **2.2 Migration** ✅
  - [x] Exécuter `prisma db push`
  - [x] Exécuter `prisma generate` (automatique avec db push)
  - [x] Vérifier que la migration fonctionne

### ÉTAPE 3 : Dashboards

- [x] **3.1 Dashboard Personnel** ✅

  - [x] Vérifier que le dashboard actuel fonctionne
  - [x] Aucune modification nécessaire (déjà fait)

- [x] **3.2 Dashboard Élève** ✅

  - [x] Créer `src/components/pages/dashboard/student/StudentHome.tsx`
  - [x] Créer navigation élève dans `DashboardLayout.tsx`
  - [x] Afficher informations du coach
  - [x] Section réservation de séances (placeholder)
  - [x] Section discussion (placeholder)
  - [x] Section mes séances
  - [x] Section statistiques
  - [x] Vérifier que l'élève a un coach (sinon message d'erreur)

- [x] **3.3 Dashboard Coach** ✅

  - [x] Créer `src/components/pages/dashboard/coach/CoachHome.tsx`
  - [x] Créer navigation coach dans `DashboardLayout.tsx`
  - [x] Vue d'ensemble avec stats globales
  - [x] Section gestion des élèves (placeholder)
  - [x] Section séances (placeholder)
  - [x] Section mensurations (placeholder)
  - [x] Section messagerie (placeholder)
  - [x] Section programmes (placeholder)

- [x] **3.4 Adapter DashboardLayout** ✅

  - [x] Récupérer le rôle de l'utilisateur
  - [x] Afficher navigation selon le rôle
  - [x] Rediriger vers le bon dashboard selon le rôle

- [x] **3.5 Routes** ✅
  - [x] Ajouter routes pour les dashboards élève et coach
  - [x] Créer composant DashboardHome pour redirection automatique
  - [x] Ajouter bouton login dans Navbar
  - [x] Redirection automatique après login selon le rôle

---

## 🔍 Détails techniques supplémentaires

### Structure des plans

#### Plan Personnel (5€/mois)

- Suivi personnel complet
- Statistiques et progression
- Mensurations
- Habitudes
- Historique des séances
- **Limites** : Pas de coach, pas de partage

#### Plan Élève (15€/mois)

- Toutes les fonctionnalités du plan Personnel
- - Coach assigné
- - Réservation de séances avec le coach
- - Discussion/messagerie avec le coach
- - Accès aux programmes du coach
- - Suivi par le coach
- **Contrainte** : Doit avoir un coach pour s'inscrire

#### Plan Coach (50€/mois)

- Toutes les fonctionnalités du plan Personnel
- - Gestion illimitée d'élèves
- - Visualisation complète des données des élèves
- - Création de séances pour les élèves
- - Messagerie avec tous les élèves
- - Programmes d'entraînement
- - Rappels et notifications par email
- - Statistiques globales

### Calcul des tarifs (détaillé)

**Coûts infrastructure mensuels (estimation)** :

- Hébergement VPS/Cloud (moyen) : 20€
- Base de données PostgreSQL (managed) : 10€
- Stockage et backups : 5€
- Service email (SendGrid/SES) : 5€
- CDN et assets : 3€
- **Total** : 43€/mois

**Répartition par type d'utilisateur** :

- **Personnel** : Utilisation basique

  - Stockage : ~100MB
  - Requêtes DB : ~1000/mois
  - Emails : ~10/mois
  - **Coût estimé** : 3.33€/mois
  - **Avec marge 50%** : **5€/mois**

- **Élève** : Utilisation moyenne + messagerie

  - Stockage : ~300MB
  - Requêtes DB : ~3000/mois
  - Emails : ~30/mois
  - Messagerie : ressources supplémentaires
  - **Coût estimé** : 10€/mois
  - **Avec marge 50%** : **15€/mois**

- **Coach** : Utilisation élevée + gestion élèves
  - Stockage : ~2GB (données de tous les élèves)
  - Requêtes DB : ~10000/mois
  - Emails : ~200/mois (rappels, notifications)
  - Calculs et agrégations : ressources supplémentaires
  - **Coût estimé** : 33.33€/mois
  - **Avec marge 50%** : **50€/mois**

### Structure de la relation Coach-Élève

```prisma
model User {
  // ... autres champs ...
  role          String    @default("personnel") // "personnel" | "eleve" | "coach"
  coachId      String?   @map("coach_id")
  coach        User?     @relation("CoachStudents", fields: [coachId], references: [id], onDelete: SetNull)
  students     User[]    @relation("CoachStudents")
}
```

**Contraintes** :

- Si `role = "eleve"`, alors `coachId` DOIT être renseigné
- Si `role = "coach"`, alors `coachId` doit être `null`
- Si `role = "personnel"`, alors `coachId` doit être `null`
- Si un coach est supprimé, ses élèves passent en `personnel` (SetNull)

### Flux d'inscription

1. **Landing page** → CTA "Commencer" → `/plans`
2. **Page Plans** → Utilisateur choisit un plan :
   - Si plan = `eleve` → `/register?plan=eleve` (pas de paiement)
   - Si plan = `personnel` ou `coach` → `/payment?plan=XXX`
3. **Page Paiement** (uniquement pour Personnel et Coach) :
   - Formulaire de paiement (simulation)
   - Informations de facturation
   - Bouton "Payer" → `/register?plan=XXX`
4. **Page Register** :
   - Pré-remplir le plan depuis query params
   - Si plan = `eleve` :
     - Afficher champ "Code d'invitation du coach" (obligatoire)
     - Validation du code (minimum 8 caractères)
     - Pas de paiement nécessaire
   - Si plan = `personnel` ou `coach` :
     - Pas de code coach nécessaire
   - Créer le compte avec le bon `role`, `coachId` (si élève) et `coachCode` (si élève)

---

## 🚀 Prochaines étapes après implémentation

1. **Backend paiement** : Intégrer Stripe ou autre système de paiement
2. **Système de réservation** : Implémenter la réservation de séances
3. **Messagerie** : Système de chat en temps réel
4. **Programmes** : Création et gestion de programmes d'entraînement
5. **Emails** : Système d'envoi d'emails de rappel
6. **Notifications** : Notifications push pour séances, messages, etc.

---

## ⚠️ Points d'attention

1. **Validation coach-élève** :

   - Lors de l'inscription d'un élève, vérifier que le `coachId` existe et que c'est bien un coach
   - Empêcher un élève de s'inscrire sans coach

2. **Sécurité** :

   - Vérifier le rôle dans toutes les routes backend
   - Un élève ne peut voir que ses données + celles partagées par son coach
   - Un coach ne peut voir que les données de ses élèves

3. **Migration des utilisateurs existants** :

   - Les utilisateurs existants auront `role = "personnel"` par défaut
   - Pas de migration nécessaire, la valeur par défaut s'appliquera

4. **Page de paiement** :
   - Pour l'instant, juste frontend (simulation)
   - Plus tard, intégrer un vrai système de paiement
   - Stocker le plan sélectionné dans le register

---

## 📝 TODO List détaillée

Voir section "Checklist d'implémentation" ci-dessus pour la liste complète des tâches à cocher.
