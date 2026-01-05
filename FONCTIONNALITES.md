# 📋 Fonctionnalités du projet MyTrackLy

**Date de mise à jour** : 2 janvier 2025

Ce document liste toutes les fonctionnalités du projet, qu'elles soient développées ou prévues.

---

## 📊 Légende

- ✅ **Développée** : Fonctionnalité complètement implémentée et fonctionnelle
- 🟡 **Partiellement développée** : Fonctionnalité en cours de développement ou partiellement implémentée
- ❌ **Non développée** : Fonctionnalité prévue mais pas encore implémentée

---

## 🔐 Authentification et Rôles

### ✅ Système d'authentification

- ✅ Inscription (Register)
- ✅ Connexion (Login)
- ✅ Déconnexion (Logout)
- ✅ Gestion du token JWT
- ✅ Middleware d'authentification
- ✅ Protection des routes backend
- ✅ Protection des routes frontend

### ✅ Système de rôles

- ✅ Rôle **Personnel** : Utilisateur standard avec suivi personnel
- ✅ Rôle **Élève** : Utilisateur avec coach assigné
- ✅ Rôle **Coach** : Utilisateur qui gère des élèves
- ✅ Navigation adaptative selon le rôle
- ✅ Redirection automatique selon le rôle

### ✅ Confirmation d'email

- ✅ Envoi d'email de confirmation
- ✅ Vérification du token de confirmation
- ✅ Page de confirmation d'email
- ✅ Route backend pour confirmer l'email

---

## 💰 Plans et Paiement

### ✅ Page de présentation des plans

- ✅ Affichage des 3 plans (Personnel, Élève, Coach)
- ✅ Description détaillée de chaque plan
- ✅ Tarifs affichés
- ✅ Redirection vers la page de paiement

### ✅ Page de paiement

- ✅ Formulaire de paiement (frontend)
- ✅ Sélection du plan
- ✅ Informations de facturation
- ✅ Formulaire de carte bancaire (simulation)
- ❌ Intégration avec système de paiement réel (Stripe, etc.)

### ✅ Code d'invitation (Plan Élève)

- ✅ Génération de codes d'invitation par le coach
- ✅ Validation du code lors de l'inscription
- ✅ Association élève-coach via code
- ✅ Notification au coach lors de l'utilisation d'un code
- ✅ Email de notification au coach

---

## 🏠 Dashboard Personnel

### ✅ Page d'accueil (Home)

- ✅ Statistiques principales (séances totales, volume, streak, fréquence)
- ✅ Message contextuel selon l'objectif (perte de poids, prise de poids, maintenance)
- ✅ Affichage de la dernière séance
- ✅ Call-to-action vers "Nouvelle séance"

### ✅ Séances d'entraînement

- ✅ Création de séance (NewTrainingSession)
- ✅ Historique des séances (TrainingHistory)
- ✅ Affichage détaillé d'une séance
- ✅ Suppression d'une séance
- ✅ Modification d'une séance (backend implémenté, frontend à faire)
- ✅ Filtres par dates (dateFrom, dateTo)
- ✅ Calcul automatique des répétitions (uniforme et variable)
- ✅ Calcul du volume total (reps × poids)
- ✅ Notes par exercice et par séance
- ✅ Statistiques de séances (totalSessions, totalVolume, currentStreak, weeklyFrequency)

### ✅ Exercices

- ✅ Bibliothèque d'exercices
- ✅ Création d'exercices personnalisés (custom)
- ✅ Filtres par catégorie et recherche
- ✅ Support des exercices prédéfinis et custom

### 🟡 Mensurations

- ✅ Modèle de données (Measurement) dans la base
- ✅ Routes backend partiellement implémentées
- ❌ Page frontend de gestion des mensurations
- ❌ Graphiques de progression

### ❌ Habitudes

- ✅ Modèle de données (Habit, HabitLog) dans la base
- ❌ Routes backend
- ❌ Page frontend de gestion des habitudes
- ❌ Calendrier heatmap

### ❌ Statistiques avancées

- ✅ Statistiques de base (séances, volume, streak)
- ❌ Graphiques détaillés
- ❌ Progression par exercice
- ❌ Analyses approfondies

---

## 👨‍🎓 Dashboard Élève

### ✅ Page d'accueil (StudentHome)

- ✅ Affichage des informations du coach
- ✅ Statistiques personnelles (séances, volume, streak, fréquence)
- ✅ Dernière séance
- ✅ Message d'alerte si pas de coach assigné

### ✅ Mes séances

- ✅ Affichage des séances créées par l'élève
- ✅ Affichage des séances créées par le coach
- ✅ Historique complet des séances

### ❌ Réservation de séances

- ❌ Voir les créneaux disponibles du coach
- ❌ Réserver une séance avec le coach
- ❌ Voir ses séances réservées
- ❌ Annuler une séance réservée

### ❌ Discussion / Messagerie

- ❌ Messagerie intégrée avec le coach
- ❌ Historique des messages
- ❌ Notifications de nouveaux messages

### ❌ Programmes du coach

- ❌ Voir les programmes d'entraînement créés par le coach
- ❌ Suivi de progression dans les programmes
- ❌ Affichage des exercices d'un programme

---

## 👨‍🏫 Dashboard Coach

### ✅ Page d'accueil (CoachHome)

- ✅ Vue d'ensemble avec statistiques globales
- ✅ Nombre total d'élèves
- ✅ Actions rapides (Créer un élève, Créer une séance, Créer un programme)

### ✅ Gestion des élèves (Students)

- ✅ Liste de tous les élèves
- ✅ Informations détaillées de chaque élève (nom, email, objectif, nombre de séances, mensurations)
- ✅ Génération de codes d'invitation
- ✅ Affichage des codes d'invitation (utilisés et disponibles)
- ✅ Copie des codes d'invitation
- ✅ Route backend pour obtenir les détails d'un élève
- ❌ Créer un élève directement (formulaire d'inscription côté coach)
- ❌ Activer/désactiver un élève
- ❌ Supprimer un élève

### ✅ Gestion des séances (Sessions)

- ✅ Voir toutes les séances de tous les élèves
- ✅ Filtres par élève et par dates
- ✅ Affichage détaillé d'une séance (exercices, notes, etc.)
- ✅ Ajouter un commentaire sur une séance d'un élève
- ✅ Modifier un commentaire existant
- ✅ Route backend pour créer une séance pour un élève spécifique
- ✅ Route backend pour récupérer toutes les séances des élèves
- ✅ Route backend pour ajouter un commentaire
- ❌ Modifier une séance d'un élève
- ❌ Supprimer une séance d'un élève
- ❌ Planifier des séances récurrentes

### 🟡 Mensurations des élèves

- ✅ Modèle de données dans la base
- ❌ Voir les mensurations de chaque élève
- ❌ Graphiques de progression
- ❌ Comparaisons entre élèves (anonymisées)

### ❌ Messagerie

- ❌ Discussion avec chaque élève
- ❌ Envoi de messages groupés
- ❌ Historique des conversations
- ❌ Notifications de nouveaux messages

### ❌ Programmes d'entraînement

- ❌ Créer des programmes d'entraînement
- ❌ Assigner des programmes à des élèves
- ❌ Suivre la progression dans les programmes
- ❌ Modifier/supprimer des programmes

---

## 📧 Système d'emails et notifications

### ✅ Emails implémentés

- ✅ Email de confirmation d'email
- ✅ Email de confirmation de séance (pour l'élève/personnel)
- ✅ Email de notification au coach (quand un élève crée une séance)
- ✅ Email de notification au coach (quand un élève utilise un code d'invitation)
- ✅ Email de notification à l'élève (quand le coach ajoute un commentaire)
- ✅ Email de notification à l'élève (quand le coach crée une séance)

### ✅ Templates HTML

- ✅ Template de confirmation d'email (emailConfirmation.html)
- ✅ Template de confirmation de séance (trainingSessionConfirmation.html)
- ✅ Template de notification coach-élève (coachStudentSessionNotification.html)
- ✅ Template de notification invitation utilisée (studentInvitationUsed.html)
- ✅ Template de notification commentaire coach (coachCommentNotification.html)
- ✅ Template de notification séance créée par coach (coachCreatedSessionNotification.html)

### ✅ Service d'emails

- ✅ Service d'envoi d'emails réutilisable (emailService.ts)
- ✅ Support des templates HTML
- ✅ Gestion des erreurs (ne bloque pas la requête)
- ✅ Configuration SMTP (nodemailer)

### ❌ Notifications push

- ❌ Notifications push en temps réel
- ❌ Notifications dans le navigateur
- ❌ Notifications mobiles

---

## 🗄️ Base de données

### ✅ Modèles implémentés

- ✅ **User** : Utilisateurs avec rôles (personnel, élève, coach)
- ✅ **TrainingSession** : Séances d'entraînement avec notes et commentaires coach
- ✅ **Exercise** : Exercices (prédéfinis et custom)
- ✅ **SessionExercise** : Exercices dans une séance (avec séries, reps, poids, etc.)
- ✅ **Measurement** : Mensurations corporelles
- ✅ **Habit** : Habitudes à suivre
- ✅ **HabitLog** : Logs des habitudes
- ✅ **InvitationCode** : Codes d'invitation pour les élèves

### ✅ Relations

- ✅ Relation Coach-Élève (User → User)
- ✅ Relation User → TrainingSession
- ✅ Relation TrainingSession → SessionExercise
- ✅ Relation Exercise → SessionExercise
- ✅ Relation User → Exercise (custom)
- ✅ Relation User → Measurement
- ✅ Relation User → Habit
- ✅ Relation Habit → HabitLog
- ✅ Relation Coach → InvitationCode

### ✅ Migrations

- ✅ Migration initiale
- ✅ Migration pour ajout des rôles (role, coachId)
- ✅ Migration pour ajout de coachComment dans TrainingSession

---

## 🔌 API Backend

### ✅ Routes d'authentification (`/api/auth`)

- ✅ `POST /api/auth/register` - Inscription
- ✅ `POST /api/auth/login` - Connexion
- ✅ `GET /api/auth/me` - Récupérer l'utilisateur connecté

### ✅ Routes de séances (`/api/training-sessions`)

- ✅ `GET /api/training-sessions` - Liste des séances
- ✅ `POST /api/training-sessions` - Créer une séance
- ✅ `GET /api/training-sessions/stats` - Statistiques
- ✅ `GET /api/training-sessions/:id` - Détails d'une séance
- ✅ `PUT /api/training-sessions/:id` - Modifier une séance
- ✅ `DELETE /api/training-sessions/:id` - Supprimer une séance
- ✅ `GET /api/training-sessions/coach/students` - Séances des élèves (coach)
- ✅ `POST /api/training-sessions/coach/:studentId` - Créer une séance pour un élève (coach)
- ✅ `PUT /api/training-sessions/:id/coach-comment` - Ajouter commentaire coach

### ✅ Routes d'exercices (`/api/exercises`)

- ✅ `GET /api/exercises` - Liste des exercices
- ✅ `POST /api/exercises` - Créer un exercice custom

### ✅ Routes des élèves (`/api/students`)

- ✅ `GET /api/students` - Liste des élèves (coach)
- ✅ `GET /api/students/:studentId` - Détails d'un élève (coach)

### ✅ Routes d'invitations (`/api/invitations`)

- ✅ `GET /api/invitations` - Liste des codes d'invitation (coach)
- ✅ `POST /api/invitations` - Créer un code d'invitation (coach)

### ✅ Routes d'emails (`/api/email`)

- ✅ `POST /api/email/send-confirmation` - Envoyer email de confirmation
- ✅ `GET /api/email/confirm` - Confirmer l'email

### ❌ Routes de mensurations (`/api/measurements`)

- ❌ `GET /api/measurements` - Liste des mensurations
- ❌ `POST /api/measurements` - Créer une mensuration
- ❌ `PUT /api/measurements/:id` - Modifier une mensuration
- ❌ `DELETE /api/measurements/:id` - Supprimer une mensuration

### ❌ Routes d'habitudes (`/api/habits`)

- ❌ `GET /api/habits` - Liste des habitudes
- ❌ `POST /api/habits` - Créer une habitude
- ❌ `PUT /api/habits/:id` - Modifier une habitude
- ❌ `DELETE /api/habits/:id` - Supprimer une habitude
- ❌ `GET /api/habits/:id/logs` - Logs d'une habitude
- ❌ `POST /api/habits/:id/logs` - Ajouter un log

### ❌ Routes de messagerie (`/api/messages`)

- ❌ `GET /api/messages` - Liste des conversations
- ❌ `GET /api/messages/:conversationId` - Messages d'une conversation
- ❌ `POST /api/messages` - Envoyer un message
- ❌ `PUT /api/messages/:id` - Modifier un message
- ❌ `DELETE /api/messages/:id` - Supprimer un message

### ❌ Routes de programmes (`/api/programs`)

- ❌ `GET /api/programs` - Liste des programmes
- ❌ `POST /api/programs` - Créer un programme
- ❌ `PUT /api/programs/:id` - Modifier un programme
- ❌ `DELETE /api/programs/:id` - Supprimer un programme
- ❌ `POST /api/programs/:id/assign` - Assigner un programme à un élève

---

## 🎨 Interface utilisateur

### ✅ Layout et navigation

- ✅ Layout responsive avec sidebar
- ✅ Navigation adaptative selon le rôle
- ✅ Menu mobile (hamburger)
- ✅ Déconnexion
- ✅ Affichage du profil utilisateur

### ✅ Composants réutilisables

- ✅ Navbar
- ✅ Footer
- ✅ DashboardLayout
- ✅ Toast notifications (ToastContext)

### ✅ Pages publiques

- ✅ Landing page
- ✅ Page de connexion (Login)
- ✅ Page d'inscription (Register)
- ✅ Page de présentation des plans (Plans)
- ✅ Page de paiement (Payment)
- ✅ Page de confirmation d'email

### ✅ Styles

- ✅ Tailwind CSS
- ✅ Design moderne et professionnel
- ✅ Couleurs indigo/purple
- ✅ Responsive design (mobile-first)
- ✅ Animations et transitions

---

## 🔒 Sécurité

### ✅ Implémenté

- ✅ Authentification JWT
- ✅ Hachage des mots de passe (bcrypt)
- ✅ Protection des routes backend (middleware)
- ✅ Protection des routes frontend (ProtectedRoute)
- ✅ Validation des rôles (coach, élève, personnel)
- ✅ Vérification des permissions (un coach ne peut voir que ses élèves)

### ❌ À implémenter

- ❌ Rate limiting
- ❌ Validation des données côté backend (Joi, Zod, etc.)
- ❌ CORS configuré correctement pour production
- ❌ HTTPS en production
- ❌ Validation des emails avec regex
- ❌ Mots de passe forts (critères minimum)

---

## 📊 Statistiques et Analyses

### ✅ Implémenté

- ✅ Statistiques de base (séances totales, volume, streak, fréquence)
- ✅ Calcul du poids actuel (latestWeight)
- ✅ Calcul de la variation de poids (weightChange)
- ✅ Message contextuel selon l'objectif (goalMessage)
- ✅ Statistiques pour le coach (nombre d'élèves, etc.)

### ❌ À implémenter

- ❌ Graphiques de progression (Chart.js, Recharts, etc.)
- ❌ Statistiques par exercice
- ❌ Statistiques par période (semaine, mois, année)
- ❌ Comparaisons entre périodes
- ❌ Export des données (CSV, PDF)
- ❌ Statistiques globales pour le coach (tous les élèves)

---

## 🚀 Fonctionnalités avancées (non développées)

### ❌ Système de réservation

- ❌ Créneaux disponibles du coach
- ❌ Réservation de séances
- ❌ Gestion des créneaux
- ❌ Notifications de rappel

### ❌ Système de programmes d'entraînement

- ❌ Création de programmes
- ❌ Modèles de programmes
- ❌ Assignation de programmes
- ❌ Suivi de progression dans les programmes

### ❌ Système de messagerie en temps réel

- ❌ Chat en temps réel (WebSocket)
- ❌ Notifications push
- ❌ Messages groupés
- ❌ Pièces jointes (images, fichiers)

### ❌ Fonctionnalités sociales

- ❌ Partage de séances
- ❌ Défis entre utilisateurs
- ❌ Classements
- ❌ Communauté

### ❌ Export et intégrations

- ❌ Export CSV/PDF
- ❌ Intégration avec Apple Health / Google Fit
- ❌ Intégration avec MyFitnessPal
- ❌ API publique

### ❌ Mobile

- ❌ Application mobile (React Native, Flutter)
- ❌ Notifications push mobiles
- ❌ Mode hors ligne

---

## 📝 Notes importantes

### Ce qui fonctionne bien

- ✅ Architecture propre et modulaire
- ✅ Séparation backend/frontend
- ✅ Système de rôles bien implémenté
- ✅ Emails fonctionnels
- ✅ Dashboard personnel complet

### Ce qui nécessite des améliorations

- 🟡 Validation des données côté backend (actuellement minimale)
- 🟡 Gestion d'erreurs (peut être améliorée)
- 🟡 Tests (aucun test écrit)
- 🟡 Documentation API (OpenAPI/Swagger manquant)

### Prochaines priorités suggérées

1. **Mensurations** : Compléter l'implémentation frontend et backend
2. **Habitudes** : Implémenter les routes et pages
3. **Messagerie** : Système de chat entre coach et élève
4. **Programmes** : Système de programmes d'entraînement
5. **Graphiques** : Ajouter des visualisations de données

---

**Dernière mise à jour** : 2 janvier 2025
