# 📚 Contexte complet de l'application MyTrackLy

**Date de mise à jour** : 2 janvier 2025  
**Version** : 1.0 (en développement)

---

## 🎯 Vue d'ensemble

**MyTrackLy** est une application web de suivi d'entraînement et de fitness avec un système de coaching en ligne. L'application permet à trois types d'utilisateurs (Personnel, Élève, Coach) de suivre leurs séances d'entraînement, leurs mensurations, leurs habitudes et de bénéficier d'un accompagnement personnalisé.

### Positionnement

- **Public cible principal** : Sportifs et personnes souhaitant suivre leur progression
- **Public cible secondaire** : Coaches sportifs et leurs élèves
- **Marché** : Fitness, santé, bien-être
- **Positionnement** : Application complète avec système de coaching intégré

---

## 💰 Tarification actuelle (à retravailler)

### Plans disponibles

#### 1. Plan Personnel : 5€/mois

- **Cible** : Sportifs autonomes
- **Fonctionnalités** :
  - Suivi personnel complet de ses séances
  - Statistiques et progression détaillées
  - Mensurations et historique
  - Habitudes et objectifs personnels
  - Historique complet des séances
  - Support par email

#### 2. Plan Élève : 0€ (géré par le coach)

- **Cible** : Personnes souhaitant être accompagnées par un coach
- **Fonctionnalités** :
  - Toutes les fonctionnalités du plan Personnel
  - Coach assigné pour accompagnement
  - Réservation de séances avec le coach
  - Discussion et messagerie avec le coach
  - Accès aux programmes créés par le coach
  - Suivi personnalisé par le coach
  - Support prioritaire
- **Inscription** : Nécessite un code d'invitation fourni par le coach
- **Paiement** : Le coach paie pour l'accès de ses élèves (pas de paiement côté élève)

#### 3. Plan Coach : 50€/mois

- **Cible** : Coaches sportifs professionnels
- **Fonctionnalités** :
  - Toutes les fonctionnalités du plan Personnel
  - Gestion illimitée de ses élèves
  - Visualisation complète des données de ses élèves
  - Création de séances pour ses élèves
  - Messagerie avec tous ses élèves
  - Programmes d'entraînement personnalisés
  - Rappels et notifications par email
  - Statistiques globales de ses élèves
  - Support prioritaire 24/7

### Calcul actuel des tarifs (approximatif)

**Coûts infrastructure mensuels estimés** :

- Hébergement VPS/Cloud (moyen) : 20€
- Base de données PostgreSQL (managed) : 10€
- Stockage et backups : 5€
- Service email (SendGrid/SES) : 5€
- CDN et assets : 3€
- **Total infrastructure** : ~43€/mois

**Répartition par type d'utilisateur** :

- **Personnel** : 3.33€/mois (avec marge 50% = 5€/mois)
- **Élève** : 10€/mois (avec marge 50% = 15€/mois) - mais géré par le coach
- **Coach** : 33.33€/mois (avec marge 50% = 50€/mois)

**Note** : Les tarifs actuels sont basés sur des estimations de coûts infrastructure + 50% de marge. Ces tarifs doivent être réévalués en fonction de l'analyse de marché et de la concurrence.

---

## 🏗️ Architecture technique

### Stack technologique

**Frontend** :

- React 18+ avec TypeScript/TSX
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Context API (state management)
- Hooks personnalisés

**Backend** :

- Node.js avec Express
- TypeScript
- Prisma ORM
- PostgreSQL (base de données)
- JWT (authentification)
- bcrypt (hachage des mots de passe)
- nodemailer (emails)

**Infrastructure** :

- Docker (conteneurs)
- PostgreSQL (base de données)
- SMTP (emails)

### Structure de la base de données

**Modèles principaux** :

- **User** : Utilisateurs avec rôles (personnel, élève, coach)
- **TrainingSession** : Séances d'entraînement
- **Exercise** : Exercices (prédéfinis et custom)
- **SessionExercise** : Exercices dans une séance
- **Measurement** : Mensurations corporelles
- **Habit** : Habitudes à suivre
- **HabitLog** : Logs des habitudes
- **InvitationCode** : Codes d'invitation pour les élèves

**Relations principales** :

- Coach ↔ Élève (one-to-many)
- User → TrainingSession (one-to-many)
- TrainingSession → SessionExercise (one-to-many)
- Exercise → SessionExercise (one-to-many)

---

## 👥 Système de rôles

### Rôle Personnel

- **Description** : Utilisateur standard avec suivi personnel
- **Accès** : Ses propres données uniquement
- **Fonctionnalités principales** :
  - Créer et gérer ses séances
  - Suivre ses mensurations
  - Gérer ses habitudes
  - Voir ses statistiques

### Rôle Élève

- **Description** : Utilisateur avec coach assigné
- **Accès** : Ses propres données + données partagées par le coach
- **Fonctionnalités principales** :
  - Toutes les fonctionnalités du rôle Personnel
  - Être accompagné par un coach
  - Réserver des séances avec le coach
  - Communiquer avec le coach
  - Accéder aux programmes du coach
- **Contrainte** : DOIT avoir un coach assigné (coachId)

### Rôle Coach

- **Description** : Utilisateur qui gère des élèves
- **Accès** : Ses propres données + données de ses élèves
- **Fonctionnalités principales** :
  - Toutes les fonctionnalités du rôle Personnel
  - Gérer ses élèves (liste, détails, codes d'invitation)
  - Voir les séances de ses élèves
  - Créer des séances pour ses élèves
  - Ajouter des commentaires sur les séances de ses élèves
  - Communiquer avec ses élèves
  - Créer des programmes d'entraînement
  - Statistiques globales

---

## ✅ Fonctionnalités implémentées

### Authentification et rôles

- ✅ Inscription/Connexion/Déconnexion
- ✅ Gestion des rôles (personnel, élève, coach)
- ✅ Confirmation d'email
- ✅ Codes d'invitation (coach → élève)

### Séances d'entraînement

- ✅ Création de séances (exercices, séries, reps, poids)
- ✅ Historique des séances
- ✅ Filtres par dates
- ✅ Calculs automatiques (volume, répétitions)
- ✅ Notes par séance et par exercice
- ✅ Statistiques (totalSessions, totalVolume, streak, fréquence)
- ✅ Pour le coach : voir les séances de ses élèves, créer des séances pour ses élèves, ajouter des commentaires

### Exercices

- ✅ Bibliothèque d'exercices (prédéfinis et custom)
- ✅ Création d'exercices personnalisés
- ✅ Filtres par catégorie et recherche
- ✅ Support des exercices de force, cardio, flexibilité

### Gestion des élèves (Coach)

- ✅ Liste de tous les élèves
- ✅ Détails d'un élève
- ✅ Génération de codes d'invitation
- ✅ Gestion des codes d'invitation

### Emails et notifications

- ✅ Email de confirmation d'email
- ✅ Email de confirmation de séance
- ✅ Email de notification au coach (élève crée une séance)
- ✅ Email de notification au coach (élève utilise un code)
- ✅ Email de notification à l'élève (coach ajoute un commentaire)
- ✅ Email de notification à l'élève (coach crée une séance)

### Dashboard

- ✅ Dashboard Personnel (Home avec stats)
- ✅ Dashboard Élève (StudentHome avec infos coach)
- ✅ Dashboard Coach (CoachHome avec vue d'ensemble)
- ✅ Navigation adaptative selon le rôle

---

## ❌ Fonctionnalités prévues mais non implémentées

### Mensurations

- ❌ Page frontend de gestion des mensurations
- ❌ Graphiques de progression
- ❌ Comparaisons entre périodes

### Habitudes

- ❌ Routes backend pour habitudes
- ❌ Page frontend de gestion des habitudes
- ❌ Calendrier heatmap

### Statistiques avancées

- ❌ Graphiques détaillés (Chart.js, Recharts, etc.)
- ❌ Progression par exercice
- ❌ Analyses approfondies

### Réservation de séances (Élève)

- ❌ Voir les créneaux disponibles du coach
- ❌ Réserver une séance
- ❌ Annuler une séance réservée

### Messagerie en temps réel

- ❌ Chat en temps réel (WebSocket)
- ❌ Notifications push
- ❌ Messages groupés

### Programmes d'entraînement

- ❌ Création de programmes
- ❌ Assignation de programmes
- ❌ Suivi de progression dans les programmes

### Fonctionnalités avancées

- ❌ Export CSV/PDF
- ❌ Intégration avec Apple Health / Google Fit
- ❌ Application mobile
- ❌ Notifications push mobiles

---

## 📊 Modèle économique actuel

### Structure de revenus

1. **Plan Personnel** : 5€/mois par utilisateur
2. **Plan Coach** : 50€/mois par coach (inclut la gestion de ses élèves)
3. **Plan Élève** : 0€ (payé par le coach)

### Hypothèses économiques

- **Coût infrastructure** : ~43€/mois (estimation)
- **Marge** : 50% sur les coûts infrastructure
- **Cible** : B2C (particuliers) et B2B (coaches)

### Questions à clarifier

1. Les tarifs actuels sont-ils compétitifs ?
2. Faut-il un plan gratuit (freemium) ?
3. Faut-il un essai gratuit (14 jours, 30 jours) ?
4. Faut-il des plans annuels (réduction) ?
5. Le modèle "élève payé par le coach" est-il viable ?
6. Faut-il un modèle à la commission pour les coaches ?

---

## 🎨 Design et UX

### Identité visuelle

- **Couleurs principales** : Indigo, Purple
- **Style** : Moderne, professionnel, épuré
- **Typographie** : Moderne, lisible
- **UI** : Design system cohérent avec Tailwind CSS

### Expérience utilisateur

- ✅ Navigation intuitive
- ✅ Feedback visuel immédiat
- ✅ Messages d'erreur clairs
- ✅ Loading states
- ✅ Responsive design (mobile-first)

---

## 🔒 Sécurité et conformité

### Implémenté

- ✅ Authentification JWT
- ✅ Hachage des mots de passe (bcrypt)
- ✅ Protection des routes (middleware)
- ✅ Validation des rôles et permissions
- ✅ HTTPS (en production)

### À implémenter

- ❌ Rate limiting
- ❌ Validation des données côté backend (Joi, Zod)
- ❌ Conformité RGPD
- ❌ Gestion des cookies et consentement
- ❌ Audit de sécurité

---

## 📈 État actuel du projet

### Développement

- **Phase** : Développement actif (MVP)
- **Statut** : Application fonctionnelle mais incomplète
- **Fonctionnalités de base** : Implémentées et fonctionnelles
- **Fonctionnalités avancées** : En cours ou prévues

### Déploiement

- **Environnement** : Développement local
- **Base de données** : PostgreSQL (locale/Docker)
- **Production** : Non déployé

### Tests

- **Tests unitaires** : Aucun
- **Tests d'intégration** : Aucun
- **Tests E2E** : Aucun

---

## 🎯 Objectifs business

### Objectifs à court terme (6 mois)

1. Compléter les fonctionnalités de base (mensurations, habitudes)
2. Améliorer l'expérience utilisateur
3. Tester le marché avec un MVP
4. Obtenir les premiers utilisateurs (bêta testeurs)
5. Affiner la tarification

### Objectifs à moyen terme (12 mois)

1. Lancer officiellement l'application
2. Acquérir des utilisateurs (coaches et particuliers)
3. Implémenter les fonctionnalités avancées (messagerie, programmes)
4. Optimiser les coûts infrastructure
5. Générer des revenus récurrents

### Objectifs à long terme (24 mois)

1. Expansion du marché
2. Application mobile
3. Intégrations tierces (Apple Health, Google Fit)
4. Partenariats avec des coaches/influenceurs
5. Scaling de l'infrastructure

---

## 🔍 Points à analyser

### Questions stratégiques

1. **Positionnement** :

   - Comment se différencier de la concurrence ?
   - Quel est notre avantage concurrentiel ?
   - Quel message de vente unique (USP) ?

2. **Tarification** :

   - Les tarifs actuels sont-ils adaptés au marché ?
   - Faut-il un plan gratuit (freemium) ?
   - Faut-il des plans annuels avec réduction ?
   - Le modèle "élève payé par le coach" est-il viable ?

3. **Marché** :

   - Qui sont nos concurrents directs et indirects ?
   - Quelle est la taille du marché (TAM, SAM, SOM) ?
   - Quels sont les segments de marché les plus rentables ?
   - Quelles sont les tendances du marché ?

4. **Fonctionnalités** :

   - Quelles fonctionnalités sont vraiment attendues ?
   - Quelles fonctionnalités nous différencient ?
   - Quelles fonctionnalités sont des "nice to have" ?
   - Quelles fonctionnalités sont des "must have" ?

5. **Monétisation** :

   - Quel modèle économique est le plus rentable ?
   - Comment optimiser les revenus récurrents (MRR) ?
   - Faut-il un modèle à la commission pour les coaches ?
   - Faut-il des fonctionnalités premium ?

6. **GTM (Go-To-Market)** :
   - Comment acquérir les premiers utilisateurs ?
   - Quel canal marketing est le plus efficace ?
   - Comment cibler les coaches ?
   - Comment cibler les particuliers ?

---

## 📝 Notes importantes

### Forces actuelles

- ✅ Architecture propre et modulaire
- ✅ Système de rôles bien pensé
- ✅ Fonctionnalités de base implémentées
- ✅ Design moderne et professionnel
- ✅ Code maintenable

### Faiblesses actuelles

- ❌ Application incomplète (fonctionnalités manquantes)
- ❌ Pas de tests
- ❌ Pas déployé en production
- ❌ Pas d'utilisateurs
- ❌ Tarification non validée

### Opportunités

- 🚀 Marché du fitness en croissance
- 🚀 Digitalisation du coaching sportif
- 🚀 Demande croissante pour le suivi personnalisé
- 🚀 Tendance "health & wellness"

### Menaces

- ⚠️ Concurrence forte (MyFitnessPal, Strava, etc.)
- ⚠️ Barrières à l'entrée élevées
- ⚠️ Coûts d'acquisition utilisateurs
- ⚠️ Coûts infrastructure

---

**Dernière mise à jour** : 2 janvier 2025
