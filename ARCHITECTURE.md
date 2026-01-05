# Architecture MyTrackLy - V1

## 📋 Table des matières

1. [Structure de la base de données](#structure-de-la-base-de-données)
2. [Améliorations et ajouts pour la V1](#améliorations-et-ajouts-pour-la-v1)
3. [Structure Frontend recommandée](#structure-frontend-recommandée)
4. [API Endpoints recommandés](#api-endpoints-recommandés)
5. [Fonctionnalités à ajouter pour la V1](#fonctionnalités-à-ajouter-pour-la-v1)
6. [Conseils techniques](#conseils-techniques)
7. [Roadmap suggérée](#roadmap-suggérée)
8. [Points d'attention](#points-dattention)

---

## 🗄️ Structure de la base de données

### Schéma complet

```sql
-- Users (table principale)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    goal_type VARCHAR(50) CHECK (goal_type IN ('weight_loss', 'weight_gain', 'maintenance', 'muscle_gain')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Sessions
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises (Bibliothèque d'exercices)
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('strength', 'cardio', 'flexibility', 'other')),
    muscle_groups JSONB, -- ['chest', 'triceps', 'shoulders']
    default_unit VARCHAR(20) CHECK (default_unit IN ('reps', 'time', 'distance', 'weight')),
    is_custom BOOLEAN DEFAULT FALSE, -- exercice créé par l'utilisateur
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session Exercises (relation many-to-many)
CREATE TABLE session_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL, -- nombre de séries
    reps_per_set JSONB, -- [7,7,5,5,4] ou null si uniforme
    reps_uniform INTEGER, -- si toutes les séries ont le même nombre (ex: 8)
    weight_kg DECIMAL(5,2), -- poids utilisé
    duration_seconds INTEGER, -- pour exercices cardio
    rest_seconds INTEGER, -- temps de repos entre séries
    order_index INTEGER NOT NULL, -- ordre dans la séance
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Measurements (Mensurations)
CREATE TABLE measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    body_weight_kg DECIMAL(5,2),
    left_arm_cm DECIMAL(5,2),
    right_arm_cm DECIMAL(5,2),
    left_calf_cm DECIMAL(5,2),
    right_calf_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    left_thigh_cm DECIMAL(5,2),
    right_thigh_cm DECIMAL(5,2),
    neck_cm DECIMAL(5,2),
    shoulders_cm DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date) -- une mesure par jour par utilisateur
);

-- Habits (Habitudes)
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- "Entraînement", "Cheat meal", etc.
    color VARCHAR(7) DEFAULT '#4f46e5', -- couleur hex pour l'affichage
    icon VARCHAR(50), -- emoji ou nom d'icône
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habit Logs
CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, date) -- un log par jour par habitude
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_training_sessions_user_date ON training_sessions(user_id, date DESC);
CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);
CREATE INDEX idx_measurements_user_date ON measurements(user_id, date DESC);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date DESC);
CREATE INDEX idx_habits_user ON habits(user_id);
```

---

## ✨ Améliorations et ajouts pour la V1

### A. Système d'exercices intelligent

**Fonctionnalités :**

- Bibliothèque d'exercices prédéfinis (squat, développé couché, etc.)
- Création d'exercices personnalisés par l'utilisateur
- Système de favoris/récents pour accès rapide
- Suggestions basées sur l'historique

**Exemple de données d'exercices prédéfinis :**

```json
{
  "name": "Squat",
  "category": "strength",
  "muscle_groups": ["quadriceps", "glutes", "hamstrings"],
  "default_unit": "reps"
}
```

### B. Calculs automatiques des répétitions

**Logique de calcul :**

```javascript
// Fonction pour calculer les reps totales
function calculateTotalReps(sets, repsPerSet, repsUniform) {
  if (repsUniform) {
    return sets * repsUniform; // 6 séries × 8 reps = 48
  }
  if (repsPerSet && Array.isArray(repsPerSet)) {
    return repsPerSet.reduce((sum, reps) => sum + reps, 0); // [7,7,5,5,4] = 28
  }
  return 0;
}

// Fonction pour calculer le volume total (reps × poids)
function calculateVolume(sets, repsPerSet, repsUniform, weight) {
  const totalReps = calculateTotalReps(sets, repsPerSet, repsUniform);
  return totalReps * (weight || 0);
}
```

**Interface utilisateur :**

- Option 1 : Entrer le nombre de séries et un nombre uniforme de reps (ex: 6 séries × 8 reps)
- Option 2 : Entrer chaque série individuellement (ex: 7, 7, 5, 5, 4 reps)
- Calcul automatique du total affiché en temps réel

### C. Dashboard intelligent - Messages contextuels

**Système de messages selon l'objectif :**

```typescript
interface GoalMessage {
  goal: "weight_loss" | "weight_gain" | "maintenance" | "muscle_gain";
  weightChange: number; // en kg
  message: string;
  color: "green" | "orange" | "red";
}

function getGoalMessage(goal: string, weightChange: number): GoalMessage {
  if (goal === "weight_loss") {
    if (weightChange < 0) {
      return {
        goal: "weight_loss",
        weightChange,
        message: `Bien joué ! Vous avez perdu ${Math.abs(
          weightChange
        )}kg ce mois. Continuez ainsi ! 💪`,
        color: "green",
      };
    } else if (weightChange > 0) {
      return {
        goal: "weight_loss",
        weightChange,
        message: `Vous avez pris ${weightChange}kg alors que votre objectif est la perte. Pas de panique, continuez vos efforts ! La progression n'est pas toujours linéaire. 🌟`,
        color: "orange",
      };
    }
  }

  if (goal === "weight_gain") {
    if (weightChange > 0) {
      return {
        goal: "weight_gain",
        weightChange,
        message: `Excellent ! Vous avez pris ${weightChange}kg ce mois. Votre progression est au rendez-vous ! 🎉`,
        color: "green",
      };
    } else if (weightChange < 0) {
      return {
        goal: "weight_gain",
        weightChange,
        message: `Vous avez perdu ${Math.abs(
          weightChange
        )}kg alors que votre objectif est la prise. Pas de souci, ajustez votre alimentation et continuez vos entraînements ! 💪`,
        color: "orange",
      };
    }
  }

  // Maintenance
  return {
    goal: "maintenance",
    weightChange,
    message: `Votre poids est stable (${
      weightChange > 0 ? "+" : ""
    }${weightChange}kg). Parfait pour maintenir votre forme ! ✨`,
    color: Math.abs(weightChange) < 1 ? "green" : "orange",
  };
}
```

**Toujours la bienveillance :**

- Messages encourageants même en cas d'écart
- Focus sur la progression, pas sur l'échec
- Suggestions constructives plutôt que critiques

### D. Statistiques avancées

**Métriques à calculer :**

1. **Volume total** : `Σ(reps × poids)` par exercice
2. **Fréquence d'entraînement** : jours/semaine, jours/mois
3. **Exercices les plus fréquents** : top 10 des exercices les plus réalisés
4. **Progression par exercice** : graphique de progression du poids/reps
5. **Temps total d'entraînement** : somme de toutes les durées
6. **Streak** : jours consécutifs d'entraînement
7. **Répartition par catégorie** : % strength, % cardio, etc.
8. **Tendance des mensurations** : évolution sur 3/6/12 mois

**Exemple de requête SQL pour les stats :**

```sql
-- Volume total par exercice
SELECT
    e.name,
    SUM(se.sets * COALESCE(se.reps_uniform,
        (SELECT SUM(value::int) FROM jsonb_array_elements_text(se.reps_per_set))
    ) * COALESCE(se.weight_kg, 0)) as total_volume
FROM session_exercises se
JOIN exercises e ON se.exercise_id = e.id
WHERE se.session_id IN (
    SELECT id FROM training_sessions WHERE user_id = $1
)
GROUP BY e.name
ORDER BY total_volume DESC;
```

### E. Habitudes - Améliorations

**Fonctionnalités supplémentaires :**

- **Rappels/Notifications** : rappel pour logger une habitude
- **Calendrier visuel** : heatmap style GitHub pour voir la régularité
- **Statistiques par habitude** : % de complétion mensuel, streak
- **Habitudes suggérées** : "Entraînement", "Cheat meal", "Hydratation", etc.

---

## 📁 Structure Frontend recommandée

```
src/
├── pages/
│   ├── Dashboard.tsx              # Dashboard principal avec stats
│   ├── Training/
│   │   ├── NewSession.tsx        # Créer une séance
│   │   ├── SessionHistory.tsx    # Historique des séances
│   │   ├── SessionDetail.tsx     # Détails d'une séance
│   │   └── ExerciseLibrary.tsx   # Bibliothèque d'exercices
│   ├── Measurements/
│   │   ├── Measurements.tsx      # Liste des mensurations
│   │   ├── NewMeasurement.tsx    # Ajouter une mensuration
│   │   └── MeasurementsChart.tsx # Graphiques de progression
│   ├── Habits/
│   │   ├── Habits.tsx            # Liste des habitudes
│   │   ├── HabitCalendar.tsx     # Calendrier heatmap
│   │   └── NewHabit.tsx          # Créer une habitude
│   ├── Statistics/
│   │   └── Statistics.tsx        # Stats détaillées
│   └── Settings/
│       ├── Profile.tsx           # Profil utilisateur
│       └── Goals.tsx             # Objectifs
├── components/
│   ├── charts/
│   │   ├── LineChart.tsx         # Graphique ligne
│   │   ├── BarChart.tsx          # Graphique barres
│   │   └── ProgressChart.tsx     # Graphique progression
│   ├── forms/
│   │   ├── ExerciseForm.tsx      # Formulaire exercice
│   │   ├── MeasurementForm.tsx   # Formulaire mensuration
│   │   └── HabitLogForm.tsx      # Formulaire log habitude
│   ├── cards/
│   │   ├── StatCard.tsx          # Card de statistique
│   │   ├── GoalCard.tsx          # Card objectif
│   │   └── SessionCard.tsx       # Card séance
│   └── common/
│       ├── Layout.tsx            # Layout principal
│       └── Loading.tsx           # Composant loading
├── hooks/
│   ├── useTrainingSessions.ts   # Hook pour séances
│   ├── useMeasurements.ts        # Hook pour mensurations
│   ├── useHabits.ts              # Hook pour habitudes
│   ├── useStatistics.ts          # Hook pour stats
│   └── useAuth.ts                # Hook pour authentification
├── services/
│   └── api.ts                    # Appels API centralisés
├── types/
│   └── index.ts                  # Types TypeScript
├── utils/
│   ├── calculations.ts           # Fonctions de calcul
│   ├── dateHelpers.ts            # Helpers dates
│   └── validators.ts             # Validations
└── contexts/
    └── AuthContext.tsx           # Context auth
```

---

## 🔌 API Endpoints recommandés

### Authentification

```
POST   /api/auth/register          # Inscription
POST   /api/auth/login             # Connexion
POST   /api/auth/logout            # Déconnexion
GET    /api/auth/me                # Utilisateur actuel
PUT    /api/auth/me                # Modifier profil
PUT    /api/auth/password          # Changer mot de passe
```

### Training Sessions

```
GET    /api/training-sessions                    # Liste (avec filtres: date_from, date_to)
POST   /api/training-sessions                    # Créer
GET    /api/training-sessions/:id                # Détails
PUT    /api/training-sessions/:id                # Modifier
DELETE /api/training-sessions/:id                # Supprimer
GET    /api/training-sessions/stats              # Stats globales
```

### Exercises

```
GET    /api/exercises                            # Bibliothèque (avec filtres)
POST   /api/exercises                            # Créer exercice custom
GET    /api/exercises/:id                        # Détails
PUT    /api/exercises/:id                        # Modifier
DELETE /api/exercises/:id                        # Supprimer (si custom)
GET    /api/exercises/favorites                  # Exercices favoris
POST   /api/exercises/:id/favorite              # Ajouter aux favoris
DELETE /api/exercises/:id/favorite               # Retirer des favoris
GET    /api/exercises/recent                     # Exercices récents
```

### Measurements

```
GET    /api/measurements                         # Liste (avec date range)
POST   /api/measurements                         # Créer
GET    /api/measurements/:id                     # Détails
PUT    /api/measurements/:id                     # Modifier
DELETE /api/measurements/:id                     # Supprimer
GET    /api/measurements/stats                   # Stats et tendances
GET    /api/measurements/latest                  # Dernière mesure
```

### Habits

```
GET    /api/habits                               # Liste des habitudes
POST   /api/habits                               # Créer habitude
GET    /api/habits/:id                           # Détails
PUT    /api/habits/:id                           # Modifier
DELETE /api/habits/:id                           # Supprimer
GET    /api/habits/:id/logs                     # Logs d'une habitude (avec date range)
POST   /api/habits/:id/logs                     # Logger une habitude
DELETE /api/habits/:id/logs/:logId              # Supprimer un log
GET    /api/habits/stats                         # Stats globales habitudes
```

### Statistics

```
GET    /api/statistics/overview                  # Vue d'ensemble (dashboard)
GET    /api/statistics/training                  # Stats entraînement détaillées
GET    /api/statistics/measurements             # Stats mensurations
GET    /api/statistics/habits                    # Stats habitudes
GET    /api/statistics/streak                   # Streak actuel
GET    /api/statistics/progression              # Progression par exercice
```

### Export

```
GET    /api/export/pdf                          # Export PDF des stats
GET    /api/export/csv                          # Export CSV
```

---

## 🚀 Fonctionnalités à ajouter pour la V1

### A. Système de poids (charges)

**Fonctionnalités :**

- Enregistrer le poids utilisé par série
- Calculer le volume total : `Σ(poids × reps)`
- Graphique de progression du poids par exercice
- PR (Personal Record) : détection automatique des records

**Exemple d'interface :**

```
Exercice: Développé couché
Série 1: [80kg] × [8 reps]
Série 2: [80kg] × [8 reps]
Série 3: [75kg] × [6 reps]

Volume total: 1,750kg (80×8 + 80×8 + 75×6)
```

### B. Templates de séances

**Fonctionnalités :**

- Créer des templates de séances réutilisables
- Dupliquer une séance précédente
- Programmes pré-établis (Full Body, Push/Pull/Legs, etc.)
- Sauvegarder une séance comme template

**Structure :**

```typescript
interface SessionTemplate {
  id: string;
  name: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
}
```

### C. Photos de progression

**Fonctionnalités :**

- Upload de photos avec les mensurations
- Comparaison avant/après (slider)
- Timeline visuelle des photos
- Stockage cloud (S3, Cloudinary)

**Structure DB additionnelle :**

```sql
CREATE TABLE progress_photos (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    measurement_id UUID REFERENCES measurements(id),
    photo_url TEXT NOT NULL,
    photo_type VARCHAR(20) CHECK (photo_type IN ('front', 'side', 'back')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### D. Export de données

**Formats :**

- **PDF** : Rapport mensuel avec graphiques et stats
- **CSV** : Données brutes pour analyse Excel
- **JSON** : Export complet pour backup

**Contenu du PDF :**

- Résumé mensuel
- Graphiques de progression
- Top exercices
- Statistiques détaillées

### E. Notifications intelligentes

**Types de notifications :**

- Rappel si pas d'entraînement depuis X jours
- Félicitations pour les objectifs atteints
- Rappels pour les mensurations (hebdomadaire)
- Rappels pour logger les habitudes
- Notifications de streak (ex: "5 jours consécutifs ! 🔥")

**Configuration :**

```typescript
interface NotificationSettings {
  trainingReminder: boolean;
  measurementReminder: boolean;
  habitReminder: boolean;
  achievementNotifications: boolean;
  streakNotifications: boolean;
}
```

---

## 🛠️ Conseils techniques

### Base de données

**Recommandations :**

- **PostgreSQL** : Meilleur support JSON, transactions, performance
- **Index** : Sur `user_id`, `date` pour requêtes fréquentes
- **Soft delete** : Ajouter `deleted_at` pour garder l'historique
- **Migrations** : Utiliser Prisma, TypeORM, ou Knex pour versionner
- **Backup** : Automatique quotidien
- **Connection pooling** : Pour gérer les connexions efficacement

**Exemple Prisma Schema :**

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  passwordHash String @map("password_hash")
  name      String
  goalType  String?  @map("goal_type")
  sessions  TrainingSession[]
  measurements Measurement[]
  habits    Habit[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
}
```

### Backend

**Stack recommandée :**

- **Node.js/Express** ou **Python/FastAPI**
- **Validation** : Zod (TypeScript) ou Pydantic (Python)
- **Rate limiting** : express-rate-limit ou slowapi
- **Pagination** : Cursor-based ou offset-based
- **Cache** : Redis pour stats fréquentes
- **File upload** : Multer (Node) ou FastAPI UploadFile

**Structure backend :**

```
backend/
├── src/
│   ├── controllers/      # Logique métier
│   ├── services/         # Services réutilisables
│   ├── models/           # Modèles DB
│   ├── routes/           # Routes API
│   ├── middleware/       # Auth, validation, etc.
│   ├── utils/            # Helpers
│   └── types/            # Types TypeScript
├── prisma/               # Schéma Prisma
└── tests/                # Tests
```

### Frontend

**Stack recommandée :**

- **React Query** : Cache, synchronisation, optimistic updates
- **Formik + Yup** : Formulaires et validation
- **Recharts** : Graphiques performants
- **Date-fns** : Manipulation de dates
- **React Router** : Navigation
- **Zustand** ou **Context API** : State management

**Exemple React Query :**

```typescript
// hooks/useTrainingSessions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useTrainingSessions(filters?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ["training-sessions", filters],
    queryFn: () => api.getTrainingSessions(filters),
  });
}

export function useCreateTrainingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createTrainingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
    },
  });
}
```

### Sécurité

**Points essentiels :**

- **JWT** : Access token + Refresh token
- **Hashage** : bcrypt avec salt rounds ≥ 10
- **Validation** : Toujours côté serveur
- **CORS** : Configuré pour votre domaine
- **Rate limiting** : Protection contre les abus
- **HTTPS** : Obligatoire en production
- **Sanitization** : Nettoyer les inputs utilisateur

**Exemple middleware auth :**

```typescript
export async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token invalide" });
  }
}
```

---

## 📅 Roadmap suggérée

### Phase 1 : MVP (2-3 semaines)

**Semaine 1 :**

- ✅ Setup backend (Express/FastAPI + DB)
- ✅ Authentification (register/login)
- ✅ CRUD séances d'entraînement
- ✅ Calculs automatiques reps

**Semaine 2 :**

- ✅ Dashboard basique avec stats
- ✅ Bibliothèque d'exercices
- ✅ Interface création séance

**Semaine 3 :**

- ✅ Tests et corrections
- ✅ Déploiement staging
- ✅ Feedback utilisateurs

### Phase 2 : Fonctionnalités core (1-2 semaines)

**Semaine 4 :**

- ✅ Mensurations avec graphiques
- ✅ Habitudes avec calendrier
- ✅ Messages intelligents selon objectif

**Semaine 5 :**

- ✅ Amélioration dashboard
- ✅ Notifications de base
- ✅ Tests d'intégration

### Phase 3 : Statistiques avancées (1 semaine)

**Semaine 6 :**

- ✅ Statistiques détaillées
- ✅ Graphiques de progression
- ✅ Export PDF/CSV
- ✅ Optimisations performance

### Phase 4 : Améliorations UX (1 semaine)

**Semaine 7 :**

- ✅ Templates de séances
- ✅ Photos de progression
- ✅ Notifications intelligentes
- ✅ Mobile responsive

### Phase 5 : Espace Coach (Futur)

**Fonctionnalités :**

- Gestion multi-clients
- Programmes partagés
- Rapports clients
- Messagerie intégrée

---

## ⚠️ Points d'attention

### Performance

1. **Indexation** : Index sur toutes les colonnes utilisées dans WHERE/ORDER BY
2. **Pagination** : Toujours paginer les listes (limite 50-100 items)
3. **Cache** : Mettre en cache les stats calculées (Redis)
4. **Lazy loading** : Charger les données à la demande
5. **Optimistic updates** : Mettre à jour l'UI avant la réponse serveur

### UX/UI

1. **Validation temps réel** : Feedback immédiat sur les formulaires
2. **Loading states** : Indicateurs de chargement partout
3. **Error handling** : Messages d'erreur clairs et actionnables
4. **Mobile first** : Design responsive dès le début
5. **Accessibility** : ARIA labels, navigation clavier

### Données

1. **Backup automatique** : Quotidien avec rétention 30 jours
2. **Export utilisateur** : Permettre l'export complet des données (RGPD)
3. **Soft delete** : Ne jamais supprimer définitivement
4. **Versioning** : Historique des modifications importantes
5. **Data integrity** : Contraintes DB pour garantir la cohérence

### Scalabilité

1. **Architecture modulaire** : Facile à étendre
2. **Microservices ready** : Structure permettant la séparation future
3. **CDN** : Pour les assets statiques
4. **Database sharding** : Prévoir pour croissance
5. **Monitoring** : Logs, métriques, alertes

### Tests

1. **Unit tests** : Fonctions de calcul, validations
2. **Integration tests** : Flux complets (créer séance, etc.)
3. **E2E tests** : Scénarios utilisateur critiques
4. **Performance tests** : Charge, stress testing
5. **Security tests** : Injection SQL, XSS, etc.

---

## 📝 Notes importantes

### Calculs automatiques - Détails

**Cas d'usage :**

1. **Série uniforme** :

   - Input : 6 séries, 8 reps
   - Calcul : 6 × 8 = 48 reps totales

2. **Série variable** :

   - Input : 5 séries, [7, 7, 5, 5, 4] reps
   - Calcul : 7 + 7 + 5 + 5 + 4 = 28 reps totales

3. **Avec poids** :
   - Input : 4 séries × 8 reps × 80kg
   - Volume : 4 × 8 × 80 = 2,560kg

### Messages bienveillants - Exemples

**Perte de poids + prise de poids :**

> "Vous avez pris 2kg ce mois alors que votre objectif est la perte. Pas de panique ! La progression n'est pas toujours linéaire. Continuez vos efforts, ajustez si besoin, et vous y arriverez ! 💪"

**Prise de poids + perte de poids :**

> "Vous avez perdu 1kg ce mois alors que votre objectif est la prise. C'est normal, surtout si vous avez augmenté votre activité. Ajustez votre alimentation et continuez vos entraînements ! 🌟"

**Toujours positif et encourageant !**

---

## 🎯 Objectifs V1

- ✅ Système d'entraînement complet et fonctionnel
- ✅ Suivi des mensurations avec visualisation
- ✅ Système d'habitudes simple et efficace
- ✅ Dashboard intelligent avec messages contextuels
- ✅ Statistiques de base
- ✅ Interface intuitive et responsive
- ✅ Performance optimale
- ✅ Sécurité renforcée

**Prêt pour le lancement ! 🚀**
