# 🏋️ CONTEXT_AVRIL2026.md — MyTrackLy : Contexte Complet du Projet

> **Document de référence master** — Mis à jour en avril 2026.
> Ce fichier contient TOUT ce qu'une IA (ou un développeur) doit savoir pour comprendre et travailler sur le projet MyTrackLy sans aucun contexte préalable.

---

## 🎯 1. QU'EST-CE QUE MYTRACKLY ?

**MyTrackLy** est une application web SaaS de suivi d'entraînement et de fitness, avec un **système de coaching en ligne intégré**. Elle permet à des sportifs de suivre leurs séances, mensurations et habitudes, et aux coaches sportifs de gérer leurs élèves de A à Z via une interface dédiée.

### Positionnement marché

- **Secteur** : Fitness, santé, bien-être — marché en forte croissance (les Français ont doublé leur temps de sport en 10 ans selon Ipsos 2026)
- **Différenciation** : MyTrackLy n'est pas qu'un journal de sport. C'est un **amplificateur neurobiologique de motivation** — chaque séance enregistrée, chaque mensuration trackée, chaque habitude complétée déclenche un cycle dopaminergique positif fondé sur la science (études NIH, théorie d'autodétermination Deci & Ryan, neurosciences comportementales MIT)
- **Concurrents indirects** : MyFitnessPal, Strava, TrainHeroic — mais sans l'aspect coaching intégré et monétisation B2B
- **USP** : La seule app qui combine suivi personnel complet + gestion professionnelle de coaching + système de réservation et paiement intégré
- **Domaine GitHub** : `Amolyy25/MyTrackLy`

---

## 👤 2. POUR QUI ? — LES 3 RÔLES UTILISATEURS

### Rôle `personnel` (5€/mois)
- **Profil** : Sportif autonome qui veut tracker sa progression
- **Accès** : Ses propres données uniquement
- **Fonctionnalités** : Séances d'entraînement, historique, mensurations, habitudes, statistiques, profil

### Rôle `eleve` (0€ — pris en charge par le coach)
- **Profil** : Personne accompagnée par un coach
- **Inscription** : Obligatoirement via un **code d'invitation** fourni par son coach
- **Accès** : Ses propres données + données partagées avec son coach
- **Fonctionnalités** : Tout ce que fait un personnel + voir les séances créées par son coach, réserver des séances, recevoir des commentaires du coach
- **Contrainte** : DOIT avoir un `coachId` assigné

### Rôle `coach` (50€/mois)
- **Profil** : Coach sportif professionnel qui gère des élèves
- **Accès** : Ses propres données + toutes les données de ses élèves
- **Fonctionnalités** :
  - Gérer ses élèves (liste, fiches clients, codes d'invitation)
  - Créer des séances pour ses élèves, ajouter des commentaires de coach
  - Voir les mensurations de ses élèves
  - **Réservations** : calendrier de disponibilités, gestion des créneaux, confirmation/refus
  - **Paiements** : Intégration Stripe Connect — le coach reçoit les paiements des réservations, MyTrackLy prélève 10% de commission
  - Générer des factures automatiques via Stripe
  - Intégration **Google Calendar** (sync automatique des réservations)
  - Créer des **fiches clients passifs** (élèves virtuels sans accès à l'app, gérés uniquement par le coach)
  - Prendre des notes privées sur ses élèves (CoachNote)
  - Gérer ses services (types de séances, durées, tarifs, lieux)

---

## 💰 3. MODÈLE ÉCONOMIQUE

### Abonnements Plateforme (SaaS)
| Plan | Prix | Cible |
|------|------|-------|
| Personnel | 5€/mois | Sportifs autonomes |
| Élève | 0€ (payé par le coach) | Élèves |
| Coach | 50€/mois | Coaches professionnels |

### Commissions sur Réservations
- MyTrackLy prélève **10% de commission** (`PLATFORM_FEE_PERCENT = 10`) sur chaque paiement de réservation via Stripe Connect
- Les paiements se font en **Direct Charge** : le client paie directement sur le compte Stripe Express du coach, et la plateforme prélève sa commission automatiquement

### Stripe Connect (Coaches)
- Chaque coach doit créer un **compte Stripe Express** (individuel, FR)
- Onboarding KYC via Stripe
- Webhooks pour synchroniser statut KYC et paiements
- Facturation automatique avec `invoice_creation: { enabled: true }`
- Données financières stockées sur le user coach : `stripeAccountId`, `stripeChargesEnabled`, `stripePayoutsEnabled`, `hourlyRate`, `taxStatus`, `isTaxExempt`

### Infrastructure estimée
- Hébergement : ~20€/mois
- PostgreSQL managed : ~10€/mois
- Total infra : ~43€/mois

---

## 🏗️ 4. ARCHITECTURE TECHNIQUE

### Stack Frontend
| Technologie | Usage |
|-------------|-------|
| React 19 | Framework UI |
| Vite 7 | Build tool + dev server |
| TypeScript/TSX | Typage statique |
| Tailwind CSS 3 | Styling (couleurs indigo/purple) |
| React Router v6 | Navigation |
| Context API | État global (Auth, Toast, Theme) |
| Recharts | Graphiques et statistiques |
| Framer Motion | Animations |
| Radix UI | Composants accessibles (Dialog, Dropdown, Select, etc.) |
| jsPDF + autotable | Export PDF |
| date-fns | Manipulation de dates |
| @uiw/react-heat-map | Heatmap pour habitudes |
| lucide-react | Icônes |
| @stripe/stripe-js | Intégration Stripe côté client |

### Stack Backend
| Technologie | Usage |
|-------------|-------|
| Node.js + Express 5 | Serveur HTTP |
| TypeScript | Typage |
| Prisma ORM 5 | Accès BDD + migrations |
| PostgreSQL | Base de données principale |
| JWT (jsonwebtoken) | Authentification |
| bcrypt | Hachage des mots de passe |
| nodemailer + Resend | Envoi d'emails |
| Stripe SDK | Paiements + Connect |
| Google APIs | Intégration Google Calendar |
| node-cron | Tâches planifiées (streak, rappels) |
| jsPDF | Génération PDF côté backend |

### Déploiement
- **Frontend** : Vercel (`https://my-track-ly.vercel.app`)
- **Backend** : Railway (`https://mytrackly-production.up.railway.app`)
- **Config Render** : `render.yaml` présent (fallback)
- **Docker** : `docker-compose.yml` disponible pour déploiement local

### Variables d'environnement backend (`.env`)
```
DATABASE_URL
JWT_SECRET
FRONTEND_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_CONNECT_WEBHOOK_SECRET
STRIPE_PRICE_ID_PERSONNEL
STRIPE_PRICE_ID_COACH
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI
EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS
RESEND_API_KEY
ALLOWED_ORIGINS
PORT
```

---

## 🗄️ 5. BASE DE DONNÉES (Prisma — PostgreSQL)

### Modèles principaux

#### `User` — Utilisateur (central)
```
id, email, passwordHash (nullable pour fiches virtuelles), role, name, goalType
coachId → relation self-referential Coach-Élève
isVirtual (Boolean) — true = fiche client sans accès app
allowEmails (Boolean) — contrôle l'envoi d'emails
slotDuration, autoConfirmReservations, hourlyRate, bufferTime
stripeAccountId, stripeOnboardingComplete, stripeChargesEnabled, stripePayoutsEnabled
stripeCustomerId, stripeSubscriptionId, stripeSubscriptionStatus
businessName, businessSiret, businessAddress, taxStatus, isTaxExempt, taxRate
googleCalendarAccessToken, googleCalendarRefreshToken, googleCalendarExpiry, googleCalendarId
myTrackLyCalendarId
```

#### `TrainingSession` — Séance d'entraînement
```
id, userId, date, durationMinutes, notes, coachComment
→ SessionExercise[] (liste des exercices)
```

#### `Exercise` — Bibliothèque d'exercices
```
id, name, category (strength/cardio/flexibility/other)
muscleGroups (JSON), defaultUnit (reps/time/distance/weight)
isCustom, createdByUserId
```

#### `SessionExercise` — Exercice dans une séance
```
id, sessionId, exerciseId
sets, repsPerSet (JSON, ex: [7,7,5,4]), repsUniform (Int)
weightKg, durationSeconds, restSeconds, orderIndex, notes
```

#### `Measurement` — Mensurations corporelles
```
id, userId, date
bodyWeightKg, leftArmCm, rightArmCm, leftCalfCm, rightCalfCm
chestCm, waistCm, hipsCm, leftThighCm, rightThighCm, neckCm, shouldersCm, notes
UNIQUE(userId, date) — une mesure par jour
```

#### `Habit` — Habitude à suivre
```
id, userId, name, category (hydration/sleep/nutrition/exercise/wellness)
targetFrequency (DAILY/WEEKLY/MONTHLY), targetCount, currentStreak, longestStreak
lastLogDate, reminderTime, reminderEnabled, startDate
```

#### `HabitLog` — Log d'une habitude
```
id, habitId, completedAt, value
UNIQUE(habitId, completedAt)
```

#### `InvitationCode` — Code d'invitation coach → élève
```
id, code (unique), coachId, used, usedByUserId, expiresAt, usedAt
```

#### `PasswordResetToken` — Reset mot de passe
```
id, userId, token (unique), expiresAt
```

#### `Reservation` — Réservation de séance
```
id, coachId, studentId (nullable — peut être un invité)
guestName, guestEmail — pour les réservations sans compte
startDateTime, endDateTime, sessionType, serviceId, location, notes
status (pending/approved/confirmed/cancelled/refused)
totalPrice, isPaid
taxAmount, platformFee, coachEarning
stripeSessionId, stripeInvoiceId, stripeInvoiceUrl
googleEventId
```

#### `CoachAvailability` — Créneaux disponibles du coach
```
id, coachId, dayOfWeek (0-6), startTime (HH:mm), endTime (HH:mm), isActive
```

#### `CoachService` — Services proposés par le coach
```
id, coachId, title, description, duration (minutes), price, location, isActive
```

#### `CoachNote` — Notes privées du coach sur un élève
```
id, coachId, studentId, content
```

---

## 📁 6. STRUCTURE DES FICHIERS

### Frontend (`/src`)
```
src/
├── App.jsx                    ← Routing principal (React Router)
├── main.jsx                   ← Point d'entrée
├── index.css                  ← Styles globaux + variables CSS (mode sombre)
├── contexts/
│   ├── AuthContext.jsx         ← Auth JWT, user courant, refetchUser
│   ├── ToastContext.jsx        ← Notifications toast
│   └── ThemeContext.jsx        ← Mode clair/sombre
├── hooks/                     ← Hooks React Query / fetch custom
│   └── useTrainingSessions, useMeasurements, useHabits, useStats, etc.
├── components/
│   ├── composants/            ← Composants UI réutilisables
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorDisplay.tsx
│   ├── layout/
│   │   └── DashboardLayout.tsx ← Layout avec sidebar adaptatif selon le rôle
│   ├── landing/               ← Composants de la landing page
│   ├── habits/                ← Composants habitudes
│   ├── stats/                 ← Composants statistiques (charts, cards)
│   └── pages/
│       ├── Auth/              ← Login, Register, EmailConfirmation, ForgotPassword, ResetPassword
│       ├── landingpage/       ← Landing + pages fonctionnalités (Tracking, Measurements, Habits, Science, Coaching, Plans)
│       ├── dashboard/
│       │   ├── Home.tsx           ← Dashboard personnel
│       │   ├── NewTrainingSession.tsx ← Créer une séance
│       │   ├── TrainingHistory.tsx    ← Historique des séances
│       │   ├── Measurements.tsx       ← Mensurations personnelles
│       │   ├── Habits.tsx             ← Gestion habitudes
│       │   ├── statistics.tsx         ← Page statistiques avancées
│       │   ├── ProfilePage.tsx        ← Profil utilisateur
│       │   ├── SettingsPage.tsx       ← Paramètres
│       │   ├── student/
│       │   │   ├── StudentHome.tsx    ← Dashboard élève
│       │   │   └── Reservations.tsx   ← Réservations élève
│       │   └── coach/
│       │       ├── CoachHome.tsx      ← Dashboard coach
│       │       ├── Students.tsx       ← Gestion élèves
│       │       ├── StudentProfile.tsx  ← Profil détaillé d'un élève
│       │       ├── Sessions.tsx       ← Séances de tous les élèves
│       │       ├── MeasurementsCoach.tsx ← Mensurations des élèves
│       │       ├── Reservations.tsx   ← Agenda coach
│       │       ├── Availabilities.tsx  ← Créneaux disponibles coach
│       │       └── Payments.tsx       ← Revenus Stripe coach
│       ├── PublicBooking.tsx  ← Page publique de réservation (/book/:coachId)
│       └── NotFound.tsx
└── dashboard-new/             ← Composants du nouveau dashboard (refacto en cours)
    ├── header.tsx, hero-section.tsx, stats-cards.tsx
    ├── ai-insights.tsx, badges-section.tsx, muscle-map.tsx
    ├── habits.tsx, measurements.tsx, recent-activity.tsx
    ├── progression-chart.tsx, statistics-card.tsx, statistics-chart.tsx
    └── tips.tsx
```

### Backend (`/backend/src`)
```
backend/src/
├── index.ts                   ← Point d'entrée Express + montage de toutes les routes + CRON
├── config/
│   └── database.ts            ← Client Prisma (singleton)
├── middleware/
│   └── auth.ts                ← Middleware JWT (authenticateToken)
├── controllers/
│   ├── authController.ts      ← Inscription, login, confirmation email, reset password
│   ├── trainingController.ts  ← CRUD séances + stats + coach operations
│   ├── exerciseController.ts  ← Bibliothèque d'exercices
│   ├── measurementController.ts ← CRUD mensurations
│   ├── habitController.ts     ← CRUD habitudes + logs
│   ├── statsController.ts     ← Statistiques avancées + stats élèves (coach)
│   ├── studentController.ts   ← Gestion élèves (liste, détails, fiches virtuelles)
│   ├── invitationController.ts ← Codes d'invitation coach
│   ├── coachNoteController.ts  ← Notes privées coach
│   ├── availabilityController.ts ← Créneaux disponibilités coach
│   ├── calendarController.ts   ← Intégration Google Calendar (OAuth, sync réservations)
│   └── stripeController.ts    ← Stripe Connect, abonnements, checkout, webhooks
├── routes/
│   ├── authRoutes.ts, trainingRoutes.ts, exerciceRoute.ts
│   ├── measurementRoutes.ts, habitRoutes.ts, statsRoutes.ts
│   ├── studentRoutes.ts, invitationRoutes.ts, coachNoteRoutes.ts
│   ├── availabilityRoutes.ts, calendarRoutes.ts, stripeRoutes.ts
│   └── emailRoutes.ts
├── services/
│   └── (services métier réutilisables)
├── email/
│   ├── emailService.ts        ← Service email (nodemailer + Resend)
│   ├── emailUtils.ts          ← Utilitaires (formatage dates)
│   └── templates/             ← Templates HTML emails
├── cron/
│   ├── streakJob.ts           ← CRON de mise à jour des streaks
│   └── reminderJob.ts         ← CRON de rappels habitudes
├── models/
├── scripts/
└── utils/
```

---

## 🔌 7. API ENDPOINTS COMPLETS

### Authentification (`/api/auth`)
```
POST   /api/auth/register         — Inscription (+ email confirmation)
POST   /api/auth/login            — Connexion (retourne JWT)
GET    /api/auth/me               — Utilisateur courant
PUT    /api/auth/me               — Modifier le profil
PUT    /api/auth/password         — Changer le mot de passe
POST   /api/auth/forgot-password  — Demande de reset
POST   /api/auth/reset-password   — Reset avec token
```

### Séances d'entraînement (`/api/training-sessions`)
```
GET    /                          — Liste des séances (filtres: dateFrom, dateTo, limit, offset)
POST   /                          — Créer une séance (+ exercices custom auto-créés)
GET    /stats                     — Stats dashboard (totalSessions, totalVolume, currentStreak, weeklyFrequency, lastSession)
GET    /:id                       — Détails d'une séance
PUT    /:id                       — Modifier une séance
DELETE /:id                       — Supprimer une séance
GET    /coach/students            — Toutes les séances des élèves du coach
POST   /coach/:studentId          — Créer une séance pour un élève (coach)
PUT    /:id/coach-comment         — Ajouter/modifier commentaire coach sur une séance
```

### Exercices (`/api/exercises`)
```
GET    /                          — Bibliothèque (prédéfinis + custom, filtres: category, search)
POST   /                          — Créer un exercice custom
```

### Mensurations (`/api/measurements`)
```
GET    /                          — Liste (filtres date)
POST   /                          — Créer/mettre à jour une mensuration
GET    /stats                     — Stats et tendances de poids
GET    /latest                    — Dernière mensuration
PUT    /:id                       — Modifier
DELETE /:id                       — Supprimer
GET    /coach/student/:studentId  — Mensurations d'un élève (coach)
```

### Habitudes (`/api/habits`)
```
GET    /                          — Liste des habitudes
POST   /                          — Créer une habitude
GET    /:id                       — Détails
PUT    /:id                       — Modifier
DELETE /:id                       — Supprimer
GET    /:id/logs                  — Logs d'une habitude (avec date range)
POST   /:id/logs                  — Logger une habitude
DELETE /:id/logs/:logId           — Supprimer un log
```

### Statistiques (`/api/stats`)
```
GET    /overview                  — Vue d'ensemble dashboard
GET    /sessions                  — Stats séances détaillées
GET    /measurements              — Stats mensurations
GET    /habits                    — Stats habitudes
GET    /coach/students/:id        — Stats détaillées d'un élève (coach)
GET    /preferences               — Préférences d'affichage
PUT    /preferences               — Sauvegarder préférences
```

### Élèves — côté Coach (`/api/students`)
```
GET    /                          — Liste des élèves du coach
GET    /:studentId                — Détails d'un élève
POST   /virtual                   — Créer une fiche client virtuelle (sans accès app)
PUT    /virtual/:studentId        — Modifier une fiche virtuelle
DELETE /virtual/:studentId        — Supprimer une fiche virtuelle
```

### Invitations (`/api/invitations`)
```
GET    /                          — Codes d'invitation du coach (utilisés + disponibles)
POST   /                          — Créer un code d'invitation
```

### Notes Coach (`/api/coach-notes`)
```
GET    /:studentId                — Notes du coach sur un élève
POST   /                          — Créer une note
PUT    /:id                       — Modifier
DELETE /:id                       — Supprimer
```

### Disponibilités (`/api/availability`)
```
GET    /                          — Créneaux du coach connecté
POST   /                          — Ajouter un créneau
PUT    /:id                       — Modifier un créneau
DELETE /:id                       — Supprimer un créneau
GET    /coach/:coachId            — Créneaux publics d'un coach (pour la page de réservation)
```

### Calendrier / Google Calendar (`/api/calendar`)
```
GET    /reservations              — Réservations du coach (agenda)
POST   /reservations              — Créer une réservation
GET    /reservations/:id          — Détails d'une réservation
PUT    /reservations/:id          — Modifier (statut, notes)
DELETE /reservations/:id          — Annuler
GET    /auth-url                  — URL OAuth Google Calendar
GET    /oauth2callback            — Callback OAuth
GET    /status                    — Statut connexion Google Calendar
DELETE /disconnect                — Déconnecter Google Calendar
```

### Stripe (`/api/stripe`)
```
POST   /connect/create-account    — Créer compte Stripe Express (coach)
POST   /connect/create-link       — Lien onboarding Stripe
POST   /connect/login-link        — Lien dashboard Stripe Express
POST   /connect/sync-status       — Synchroniser statut compte
GET    /earnings                  — Revenus et transactions du coach
GET    /revenue-stats             — Stats revenus (mois en cours vs dernier)
POST   /checkout                  — Créer session de paiement (réservation élève)
GET    /pay/:reservationId        — Paiement public sans compte
GET    /verify-session            — Vérifier statut paiement
GET    /verify-subscription-session — Vérifier abonnement après paiement
POST   /subscription/checkout    — Créer checkout d'abonnement (personnel/coach)
POST   /subscription/portal       — Portail Stripe de gestion d'abonnement
POST   /webhook                   — Webhook Stripe principal
POST   /webhook/connect           — Webhook Stripe Connect
```

### Email (`/api/email`)
```
POST   /send-confirmation         — Envoyer email de confirmation
GET    /confirm                   — Confirmer l'email (via token)
```

---

## ✅ 8. FONCTIONNALITÉS — ÉTAT RÉEL (Avril 2026)

### ✅ Complètes et fonctionnelles

#### Authentification
- ✅ Inscription / Connexion / Déconnexion
- ✅ Confirmation d'email (token + page dédiée)
- ✅ Reset de mot de passe (email + token)
- ✅ Système de rôles (personnel, élève, coach)
- ✅ Navigation adaptative selon le rôle
- ✅ Protection d'abonnement : redirect vers `/features/pricing` si pas d'abonnement actif

#### Séances d'entraînement
- ✅ Création complète (exercices, séries, reps uniformes OU variables, poids, durée, notes)
- ✅ Exercices custom auto-créés lors de la création de séance
- ✅ Calcul automatique du volume total (reps × poids)
- ✅ Historique paginé avec filtres par date
- ✅ Vue détaillée d'une séance
- ✅ Suppression de séance
- ✅ Modification de séance (backend complet, frontend disponible)
- ✅ Stats : totalSessions, totalVolume, currentStreak, weeklyFrequency, lastSession

#### Bibliothèque d'exercices
- ✅ Exercices prédéfinis (seed disponible : squat, développé couché, soulevé de terre, etc.)
- ✅ Exercices custom créés par l'utilisateur
- ✅ Filtres par catégorie + recherche par nom
- ✅ Catégories : strength, cardio, flexibility, other

#### Mensurations
- ✅ Modèle complet (12 mesures : poids, bras, mollets, poitrine, taille, hanches, cuisses, cou, épaules)
- ✅ Backend complet (CRUD + stats)
- ✅ Frontend page mensurations (graphiques de progression)
- ✅ Stats tendances : variation de poids, comparaisons

#### Habitudes
- ✅ Création d'habitudes (catégorie, fréquence cible, objectif quantifié, heure de rappel)
- ✅ Logging quotidien avec valeur optionnelle
- ✅ Streak courant et plus long streak
- ✅ Heatmap de régularité
- ✅ Rappels automatiques (CRON job + email)

#### Statistiques avancées
- ✅ Dashboard statistiques avec Recharts
- ✅ Graphiques : évolution volume, sessions par semaine, répartition groupes musculaires, évolution poids
- ✅ Filtres par période (7j, 30j, 90j, 1an)
- ✅ PRs par exercice
- ✅ Personnalisation des widgets (localStorage)
- ✅ Détection de rôle (stats adaptées)

#### Dashboard Coach
- ✅ Vue d'ensemble (nombre d'élèves, actions rapides)
- ✅ Liste des élèves avec infos clés
- ✅ Génération et gestion de codes d'invitation (copie, statut)
- ✅ Page profil détaillé d'un élève (header, stats, graphiques, historique)
- ✅ Voir/filtrer toutes les séances de tous les élèves
- ✅ Création de séances pour un élève
- ✅ Commentaires coach sur les séances
- ✅ Mensurations des élèves

#### Fiches Clients Virtuels (implémenté en février 2026)
- ✅ Créer une fiche client sans accès à l'app (`isVirtual = true`, `passwordHash nullable`)
- ✅ Ajouter séances/mensurations pour ces clients
- ✅ Contrôle des emails par client (`allowEmails`)
- ✅ Notes privées du coach sur chaque élève (CoachNote)
- ✅ Stats détaillées : top exercices, volume, fréquence

#### Système de Réservation
- ✅ Page publique de réservation (`/book/:coachId`) sans connexion requise
- ✅ Réservation avec ou sans compte (guestName + guestEmail)
- ✅ Gestion des créneaux de disponibilité du coach (jours + horaires)
- ✅ Services configurables (titre, durée, prix, lieu)
- ✅ Statuts : pending → approved/refused → confirmed/cancelled
- ✅ Dashboard réservations coach (vue agenda + liste)
- ✅ Dashboard réservations élève

#### Paiements Stripe
- ✅ Abonnements personnels (personnel + coach) via Stripe Subscription
- ✅ Stripe Connect Express pour les coaches (KYC, onboarding, dashboard)
- ✅ Direct Charge : paiement de réservations (10% commission platform)
- ✅ Factures automatiques Stripe avec URL partageable
- ✅ Webhooks : `checkout.session.completed`, `customer.subscription.updated/deleted`, `account.updated`
- ✅ Portail client Stripe (gestion abonnement)
- ✅ Revenus détaillés : transactions, revenus par client, évolution mensuelle

#### Google Calendar
- ✅ Connexion OAuth Google Calendar du coach
- ✅ Synchronisation automatique des réservations confirmées et payées
- ✅ Création d'événements Google Calendar à la confirmation
- ✅ Déconnexion Google Calendar

#### Emails / Notifications
- ✅ Confirmation d'email à l'inscription
- ✅ Confirmation de séance créée
- ✅ Notification au coach quand un élève crée une séance
- ✅ Notification au coach quand un élève utilise un code d'invitation
- ✅ Notification à l'élève quand le coach ajoute un commentaire
- ✅ Notification à l'élève quand le coach crée une séance pour lui
- ✅ Email paiement réservation confirmé (élève + coach)
- ✅ Rappels habitudes automatiques (CRON job)
- ✅ Contrôle par utilisateur (`allowEmails`)

#### Sécurité
- ✅ JWT (Bearer token dans Authorization header)
- ✅ bcrypt (hachage mot de passe, salt ≥ 10)
- ✅ Middleware authentification sur toutes les routes protégées
- ✅ Vérification des permissions (un coach ne voit que ses élèves)
- ✅ CORS configuré avec origines autorisées (liste blanche)

### ❌ Non implémentées

- ❌ Messagerie/chat en temps réel (WebSocket) — routes `/dashboard/chat` et `/dashboard/messagerie` affichent "Bientôt disponible"
- ❌ Programmes d'entraînement — route `/dashboard/programs` affiche "Bientôt disponible"
- ❌ Export CSV/PDF des statistiques (frontend) — jsPDF installé, mais pas de UI
- ❌ Intégrations Apple Health / Google Fit
- ❌ Application mobile
- ❌ Tests unitaires, d'intégration, E2E (aucun test écrit)
- ❌ Rate limiting API
- ❌ Validation côté backend avec Zod/Joi
- ❌ Conformité RGPD complète

---

## 🔐 9. FLUX D'AUTHENTIFICATION & ABONNEMENTS

### Inscription
1. L'utilisateur choisit son plan sur `/features/pricing`
2. Il crée son compte (`POST /api/auth/register`)
3. Un email de confirmation est envoyé
4. Il clique sur le lien → email confirmé (`GET /api/email/confirm`)
5. Il souscrit à son abonnement via Stripe Checkout (`POST /api/stripe/subscription/checkout`)
6. Webhook Stripe met à jour `stripeSubscriptionStatus = "active"` en BDD
7. `ProtectedRoute` vérifie le statut : si pas `active` ou `trialing` → redirect `/features/pricing`

### Pour les élèves
1. Le coach génère un code d'invitation (`POST /api/invitations`)
2. L'élève s'inscrit avec ce code
3. L'association coach-élève est automatique (coachId assigné)
4. L'élève n'a pas d'abonnement Stripe → le coach paie pour ses élèves

### Inscription élève via code
```
POST /api/auth/register { email, password, name, invitationCode }
→ Vérification du code → association coachId → role = "eleve"
→ Email de notification au coach
```

---

## 🎨 10. DESIGN SYSTEM

- **Couleurs primaires** : Indigo / Purple (variantes Tailwind CSS)
- **Variable CSS** : `--primary` définie dans `index.css`, utilisée partout
- **Mode sombre** : Supporté via `ThemeContext` et classes Tailwind
- **Typographie** : Moderne, lisible
- **Composants Radix UI** : Dialog, Dropdown, Select, Checkbox, Avatar
- **Animations** : Framer Motion pour transitions
- **Responsive** : Mobile-first, sidebar responsive
- **Icônes** : lucide-react

### Identité conceptuelle (Marketing)
Le design doit refléter la proposition de valeur **neurobiologique** : chaque interaction visuelle (heatmap qui se remplit, streak qui augmente, volume qui monte) déclenche un signal dopaminergique visuel. Les visualisations sont conçues pour être **récompensantes** à regarder.

---

## 📧 11. SYSTÈME D'EMAILS

### Service utilisé
- **Nodemailer** (SMTP configurable) + **Resend** (service cloud)
- `allowEmails` sur chaque User : si `false`, aucun email n'est envoyé

### Templates disponibles
- `emailConfirmation.html` — Confirmation d'email
- `trainingSessionConfirmation.html` — Confirmation de séance
- `coachStudentSessionNotification.html` — Notif coach quand élève crée séance
- `studentInvitationUsed.html` — Notif coach quand code utilisé
- `coachCommentNotification.html` — Notif élève quand coach commente
- `coachCreatedSessionNotification.html` — Notif élève quand coach crée séance
- `paymentSuccessStudent.html` — Confirmation paiement réservation (élève)
- `paymentSuccessCoach.html` — Confirmation paiement reçu (coach)

---

## ⚙️ 12. TÂCHES CRON

### `streakJob.ts`
- Mise à jour automatique des streaks d'habitudes (quotidien)
- Réinitialise le `currentStreak` si aucun log le jour précédent

### `reminderJob.ts`
- Envoie des rappels email aux utilisateurs qui ont une habitude avec `reminderEnabled = true` et `reminderTime` configuré
- Compare l'heure actuelle à `reminderTime` pour déclencher l'envoi

---

## 📐 13. CALCULS MÉTIER CLÉS

### Volume d'entraînement
```javascript
// Reps uniformes : 6 séries × 8 reps × 80kg = 3840 kg de volume
volume = sets * repsUniform * weightKg

// Reps variables : [7,7,5,5,4] × 80kg
volume = repsPerSet.reduce((sum, r) => sum + r, 0) * weightKg
```

### Streak d'entraînement
- Calculé en triant les séances par date décroissante
- La séance la plus récente doit être aujourd'hui ou hier (sinon streak = 0)
- Compte les jours consécutifs où il y a eu au moins une séance

### Fréquence hebdomadaire
- Compte les séances sur les 28 derniers jours
- Divise par 4 → `weeklyFrequency = recentSessions / 4`

### Commission Stripe
- `applicationFeeCentimes = totalPrice * (10/100) * 100` (en centimes)
- `coachEarning = totalPrice - applicationFeeCentimes / 100`

---

## 🗺️ 14. ROUTAGE FRONTEND COMPLET

### Routes publiques
```
/                          → Landing page
/features/tracking         → Page fonctionnalité Tracking
/features/measurements     → Page fonctionnalité Mensurations
/features/habits           → Page fonctionnalité Habitudes
/features/science          → Page Science (dopamine + neurosciences)
/features/coaching         → Page fonctionnalité Coaching
/features/pricing          → Page Plans / Tarification (PlansPage)
/book/:coachId             → Page publique de réservation chez un coach
/login                     → Connexion (redirect si déjà connecté)
/register                  → Inscription (redirect si déjà connecté)
/email-confirmation        → Page "vérifiez vos emails"
/confirm-email             → Page de confirmation email (via token URL)
/forgot-password           → Demande de reset
/reset-password            → Reset avec token
/plans                     → Alias de /features/pricing
```

### Routes protégées (`/dashboard/*`)
> Toutes nécessitent : authentifié + abonnement actif (sauf élèves)

```
/dashboard                            → DashboardHome (redirige selon rôle)
/dashboard/students                   → Gestion des élèves (coach)
/dashboard/coach/student/:id          → Profil détaillé d'un élève (coach)
/dashboard/sessions                   → Séances de tous les élèves (coach)
/dashboard/training/new               → Créer une séance
/dashboard/training/history           → Historique des séances
/dashboard/measurements               → Mensurations (dispatcher selon rôle)
/dashboard/my-measurements            → Mes mensurations personnelles (coach)
/dashboard/habits                     → Habitudes
/dashboard/reservations               → Réservations (dispatcher selon rôle)
/dashboard/calendar                   → Calendrier (coach seulement)
/dashboard/availabilities             → Créneaux disponibilités (coach)
/dashboard/payments                   → Revenus Stripe (coach)
/dashboard/profile                    → Profil utilisateur
/dashboard/settings                   → Paramètres
/dashboard/statistics                 → Statistiques avancées
/dashboard/programs                   → Soon™
/dashboard/chat                       → Soon™
/dashboard/messagerie                 → Soon™
```

---

## 📊 15. LANDING PAGE — STRUCTURE

La landing page (`/`) contient des sections marketing :
1. **Hero** — Accroche + CTA "Essai gratuit 14 jours"
2. **Fonctionnalités** — Tracking, Mensurations, Habitudes, Coaching
3. **Science** (dédiée `/features/science`) — Neurosciences, dopamine, pourquoi tracker améliore la santé mentale
4. **Coaching** — Présentation de l'espace coach et système de réservation
5. **Plans & Tarification** — 3 plans détaillés

La page `/features/science` est une **page contenu** de ~2500 mots, scientifiquement fondée, qui explique le lien entre le tracking fitness et la libération de dopamine (sources : NIH PMC, ENS Planet-Vie, Théorie d'Autodétermination Deci & Ryan).

---

## 🏗️ 16. ÉTAT DU PROJET — BILAN AVRIL 2026

### Phase actuelle
- **Phase** : Développement actif — MVP étendu
- **Statut** : Application fonctionnelle, déployée, en cours de finalisation

### Ce qui fonctionne bien
- ✅ Architecture backend solide et modulaire
- ✅ Authentification + rôles + protection d'abonnement
- ✅ Système complet de gestion de séances d'entraînement
- ✅ Mensurations + habitudes + statistiques
- ✅ Système de réservation coach-élève (public + privé)
- ✅ Paiements Stripe Connect (commission 10%, factures auto)
- ✅ Google Calendar sync
- ✅ Fiches clients virtuels (coach uniquement)
- ✅ Design moderne et cohérent

### Ce qui manque
- ❌ Messagerie en temps réel
- ❌ Programmes d'entraînement
- ❌ Export CSV/PDF
- ❌ Tests automatisés
- ❌ Rate limiting + validation Zod
- ❌ Application mobile

### Déploiement
- Frontend : Vercel `https://my-track-ly.vercel.app`
- Backend : Railway `https://mytrackly-production.up.railway.app`
- PostgreSQL : managed (Railway ou provider externe)

---

## 💡 17. DÉCISIONS TECHNIQUES IMPORTANTES

### Fiches clients virtuels (`isVirtual`)
Au lieu de créer un modèle séparé, on a réutilisé le modèle `User` avec `isVirtual = true`. Cela permet de réutiliser toutes les relations existantes (TrainingSession, Measurement, etc.) sans refactorisation. Le `passwordHash` est nullable pour ces users, et le login les refuse explicitement.

### Stripe Direct Charge
Le paiement va **directement** sur le compte Stripe Express du coach. La plateforme prélève la commission via `payment_intent_data.application_fee_amount`. Pas de transfert manuel nécessaire.

### Exercices custom lors de la création de séance
Si un exercice "custom" est ajouté dans le formulaire de séance (avec un ID temporaire `temp_*`), le backend `CreateTrainingSession` crée automatiquement l'exercice en BDD et remplace l'ID temporaire. Pas besoin d'appeler un endpoint séparé.

### Streaming des abonnements
La `ProtectedRoute` vérifie `stripeSubscriptionStatus`. Elle appelle `/api/stripe/verify-subscription-session` après un paiement pour mettre à jour le statut avant de rediriger. Le webhook Stripe garantit la mise à jour en async.

### Ordre des routes (Express)
`/stats` est déclaré AVANT `/:id` dans trainingRoutes pour éviter que "stats" soit interprété comme un ID.

---

## 📑 18. DOCUMENTS DE RÉFÉRENCE INTERNES

Tous ces fichiers `.md` sont présents à la racine du projet :

| Fichier | Description |
|---------|-------------|
| `CONTEXT_APP.md` | Contexte initial (jan 2025) — partiellement obsolète |
| `ARCHITECTURE.md` | Architecture technique V1 — schéma BDD, API, roadmap |
| `FONCTIONNALITES.md` | Liste complète des fonctionnalités avec statut (jan 2025) |
| `BACKEND_TODO.md` | État du câblage backend — historique des problèmes résolus |
| `ANALYSE_DASHBOARD_BACKEND.md` | Analyse des bugs dashboard backend identifiés et corrigés |
| `BACKEND_TRAINING_GUIDE.md` | Guide de création du système d'entraînement complet |
| `MyTrackLy-dopamine-page.md` | Directive pour la page Science (dopamine) avec sources |
| `PLAN_fiches_clients.md` | Plan et suivi de l'implémentation des fiches clients virtuels (fév 2026) |
| `PLAN_page_statistiques.md` | Plan et suivi de l'implémentation de la page statistiques |
| `sources.md` | Sources scientifiques utilisées pour la page Science |
| `CONTEXT_AVRIL2026.md` | **CE FICHIER** — Contexte master mis à jour avril 2026 |

---

## 🚀 19. PROCHAINES PRIORITÉS SUGGÉRÉES

Sur la base de l'analyse complète du projet, voici les chantiers prioritaires :

1. **Messagerie coach-élève** — Fonctionnalité très attendue, routes déjà prévues (`/dashboard/chat`) mais affichant "Soon". Implémenter un chat simple (sans WebSocket dans un premier temps, polling toutes les 5s).

2. **Programmes d'entraînement** — Permettre au coach de créer des programmes (séquences de séances) et de les assigner à des élèves.

3. **Tests automatisés** — Aucun test écrit. Priorité : tests d'intégration des contrôleurs critiques (auth, training, stripe).

4. **Validation avec Zod** — Ajouter une couche de validation des données entrantes sur toutes les routes backend.

5. **Export PDF/CSV** — jsPDF est installé mais l'UI n'expose pas encore cette fonctionnalité.

6. **Rate limiting** — Protection contre les abus API (express-rate-limit).

---

*Document généré le 5 avril 2026 par analyse complète du dépôt `Amolyy25/MyTrackLy`.*
*Tous les fichiers du projet ont été lus et synthétisés dans ce contexte.*
