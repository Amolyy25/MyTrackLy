# Guide Backend - Système d'Entraînement MyTrackLy

Ce guide détaillé t'explique comment créer le backend complet pour le système d'entraînement. Tu vas apprendre étape par étape comment mettre en place les APIs nécessaires.

## 📋 Table des matières

1. [Structure de la base de données](#1-structure-de-la-base-de-données)
2. [Endpoints API à créer](#2-endpoints-api-à-créer)
3. [Étape 1 : Mise à jour du schéma Prisma](#étape-1--mise-à-jour-du-schéma-prisma)
4. [Étape 2 : Créer les contrôleurs](#étape-2--créer-les-contrôleurs)
5. [Étape 3 : Créer les routes](#étape-3--créer-les-routes)
6. [Étape 4 : Validation des données](#étape-4--validation-des-données)
7. [Étape 5 : Tester les endpoints](#étape-5--tester-les-endpoints)
8. [Bonus : Calculs et statistiques](#bonus--calculs-et-statistiques)

---

## 1. Structure de la base de données

### Tables nécessaires

```
users (déjà existante)
  ↓
training_sessions (séances d'entraînement)
  ↓
session_exercises (exercices dans une séance)
  ↓
exercises (bibliothèque d'exercices)
```

---

## 2. Endpoints API à créer

### Training Sessions

```
GET    /api/training-sessions              # Liste des séances
POST   /api/training-sessions              # Créer une séance
GET    /api/training-sessions/:id          # Détails d'une séance
PUT    /api/training-sessions/:id          # Modifier une séance
DELETE /api/training-sessions/:id          # Supprimer une séance
GET    /api/training-sessions/stats        # Statistiques dashboard
```

### Exercises

```
GET    /api/exercises                      # Liste des exercices
POST   /api/exercises                      # Créer un exercice custom
GET    /api/exercises/:id                  # Détails d'un exercice
```

---

## Étape 1 : Mise à jour du schéma Prisma

### 1.1 Ouvre `backend/prisma/schema.prisma`

Ajoute les modèles suivants après le modèle `User` :

```prisma
model TrainingSession {
  id              String            @id @default(uuid())
  userId          String            @map("user_id")
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime
  durationMinutes Int?              @map("duration_minutes")
  notes           String?
  exercises       SessionExercise[]
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  @@map("training_sessions")
  @@index([userId, date])
}

model Exercise {
  id            String            @id @default(uuid())
  name          String
  category      String            // 'strength', 'cardio', 'flexibility', 'other'
  muscleGroups  Json?             @map("muscle_groups") // ['chest', 'triceps']
  defaultUnit   String            @map("default_unit") // 'reps', 'time', 'distance', 'weight'
  isCustom      Boolean           @default(false) @map("is_custom")
  createdByUserId String?         @map("created_by_user_id")
  createdBy     User?             @relation(fields: [createdByUserId], references: [id], onDelete: SetNull)
  sessions      SessionExercise[]
  createdAt     DateTime          @default(now()) @map("created_at")

  @@map("exercises")
}

model SessionExercise {
  id            String          @id @default(uuid())
  sessionId     String          @map("session_id")
  session       TrainingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exerciseId    String          @map("exercise_id")
  exercise      Exercise        @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  sets          Int
  repsPerSet    Json?           @map("reps_per_set") // [7, 7, 5, 5, 4]
  repsUniform   Int?            @map("reps_uniform") // 8 (si toutes les séries sont identiques)
  weightKg      Float?          @map("weight_kg")
  durationSeconds Int?          @map("duration_seconds")
  restSeconds   Int?            @map("rest_seconds")
  orderIndex    Int             @map("order_index")
  notes         String?
  createdAt     DateTime        @default(now()) @map("created_at")

  @@map("session_exercises")
  @@index([sessionId])
}
```

### 1.2 Mettre à jour le modèle User

Ajoute ces relations dans le modèle `User` existant :

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash String    @map("password_hash")
  name          String
  goalType      String?   @map("goal_type")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Nouvelles relations
  trainingSessions  TrainingSession[]
  customExercises   Exercise[]

  @@map("users")
}
```

### 1.3 Appliquer les migrations

```bash
cd backend
npx prisma db push
npx prisma generate
```

---

## Étape 2 : Créer les contrôleurs

### 2.1 Créer `backend/src/controllers/trainingController.ts`

```typescript
import { Request, Response } from "express";
import prisma from "../config/database";

// GET /api/training-sessions - Liste des séances
export async function getTrainingSessions(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;

    // Paramètres de requête optionnels
    const { dateFrom, dateTo, limit = 50, offset = 0 } = req.query;

    // Construire les filtres
    const where: any = { userId };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching training sessions:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// POST /api/training-sessions - Créer une séance
export async function createTrainingSession(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;

    const { date, durationMinutes, notes, exercises } = req.body;

    // Validation
    if (!date || !exercises || exercises.length === 0) {
      return res.status(400).json({
        message: "Date et au moins un exercice sont requis",
      });
    }

    // Créer la séance avec les exercices
    const session = await prisma.trainingSession.create({
      data: {
        userId,
        date: new Date(date),
        durationMinutes,
        notes,
        exercises: {
          create: exercises.map((ex: any, index: number) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            repsPerSet: ex.repsPerSet,
            repsUniform: ex.repsUniform,
            weightKg: ex.weightKg,
            durationSeconds: ex.durationSeconds,
            restSeconds: ex.restSeconds,
            orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : index,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating training session:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// GET /api/training-sessions/:id - Détails d'une séance
export async function getTrainingSession(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;
    const { id } = req.params;

    const session = await prisma.trainingSession.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching training session:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// PUT /api/training-sessions/:id - Modifier une séance
export async function updateTrainingSession(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;
    const { id } = req.params;
    const { date, durationMinutes, notes, exercises } = req.body;

    // Vérifier que la séance appartient à l'utilisateur
    const existingSession = await prisma.trainingSession.findFirst({
      where: { id, userId },
    });

    if (!existingSession) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    // Supprimer les anciens exercices et créer les nouveaux
    await prisma.sessionExercise.deleteMany({
      where: { sessionId: id },
    });

    const session = await prisma.trainingSession.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        durationMinutes,
        notes,
        exercises: exercises
          ? {
              create: exercises.map((ex: any, index: number) => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets,
                repsPerSet: ex.repsPerSet,
                repsUniform: ex.repsUniform,
                weightKg: ex.weightKg,
                durationSeconds: ex.durationSeconds,
                restSeconds: ex.restSeconds,
                orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : index,
                notes: ex.notes,
              })),
            }
          : undefined,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    res.json(session);
  } catch (error) {
    console.error("Error updating training session:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// DELETE /api/training-sessions/:id - Supprimer une séance
export async function deleteTrainingSession(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;
    const { id } = req.params;

    // Vérifier que la séance appartient à l'utilisateur
    const session = await prisma.trainingSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    await prisma.trainingSession.delete({
      where: { id },
    });

    res.json({ message: "Séance supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting training session:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// GET /api/training-sessions/stats - Statistiques pour le dashboard
export async function getTrainingStats(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;

    // Statistiques de base
    const totalSessions = await prisma.trainingSession.count({
      where: { userId },
    });

    // Volume total et exercices
    const sessions = await prisma.trainingSession.findMany({
      where: { userId },
      include: {
        exercises: true,
      },
    });

    let totalVolume = 0;
    let totalExercises = 0;

    sessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        totalExercises++;
        const reps = ex.repsUniform
          ? ex.sets * ex.repsUniform
          : ex.repsPerSet
          ? (ex.repsPerSet as number[]).reduce((sum, r) => sum + r, 0)
          : 0;
        totalVolume += reps * (ex.weightKg || 0);
      });
    });

    // Streak (jours consécutifs)
    const sortedSessions = await prisma.trainingSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: { date: true },
    });

    let currentStreak = 0;
    if (sortedSessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let checkDate = new Date(sortedSessions[0].date);
      checkDate.setHours(0, 0, 0, 0);

      // Vérifier si la dernière séance est aujourd'hui ou hier
      const daysDiff = Math.floor(
        (today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedSessions.length; i++) {
          const prevDate = new Date(sortedSessions[i - 1].date);
          prevDate.setHours(0, 0, 0, 0);

          const currDate = new Date(sortedSessions[i].date);
          currDate.setHours(0, 0, 0, 0);

          const diff = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Fréquence hebdomadaire (4 dernières semaines)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentSessions = await prisma.trainingSession.count({
      where: {
        userId,
        date: {
          gte: fourWeeksAgo,
        },
      },
    });

    const weeklyFrequency = recentSessions / 4;

    // Dernière séance
    const lastSession = await prisma.trainingSession.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    res.json({
      totalSessions,
      totalExercises,
      totalVolume,
      currentStreak,
      weeklyFrequency,
      lastSession,
    });
  } catch (error) {
    console.error("Error fetching training stats:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}
```

### 2.2 Créer `backend/src/controllers/exerciseController.ts`

```typescript
import { Request, Response } from "express";
import prisma from "../config/database";

// GET /api/exercises - Liste des exercices
export async function getExercises(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;

    const { category, search } = req.query;

    // Construire les filtres
    const where: any = {
      OR: [
        { isCustom: false }, // Exercices prédéfinis
        { isCustom: true, createdByUserId: userId }, // Exercices custom de l'utilisateur
      ],
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive",
      };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// POST /api/exercises - Créer un exercice custom
export async function createExercise(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;

    const { name, category, muscleGroups, defaultUnit } = req.body;

    if (!name || !category || !defaultUnit) {
      return res.status(400).json({
        message: "Nom, catégorie et unité par défaut sont requis",
      });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        category,
        muscleGroups,
        defaultUnit,
        isCustom: true,
        createdByUserId: userId,
      },
    });

    res.status(201).json(exercise);
  } catch (error) {
    console.error("Error creating exercise:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// GET /api/exercises/:id - Détails d'un exercice
export async function getExercise(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ message: "Exercice non trouvé" });
    }

    res.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}
```

---

## Étape 3 : Créer les routes

### 3.1 Créer `backend/src/routes/trainingRoutes.ts`

```typescript
import { Router } from "express";
import {
  getTrainingSessions,
  createTrainingSession,
  getTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  getTrainingStats,
} from "../controllers/trainingController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticateToken);

router.get("/stats", getTrainingStats);
router.get("/", getTrainingSessions);
router.post("/", createTrainingSession);
router.get("/:id", getTrainingSession);
router.put("/:id", updateTrainingSession);
router.delete("/:id", deleteTrainingSession);

export default router;
```

### 3.2 Créer `backend/src/routes/exerciseRoutes.ts`

```typescript
import { Router } from "express";
import {
  getExercises,
  createExercise,
  getExercise,
} from "../controllers/exerciseController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticateToken);

router.get("/", getExercises);
router.post("/", createExercise);
router.get("/:id", getExercise);

export default router;
```

### 3.3 Ajouter les routes dans `backend/src/index.ts`

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import emailRoutes from "./routes/emailRoutes";
import trainingRoutes from "./routes/trainingRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/training-sessions", trainingRoutes);
app.use("/api/exercises", exerciseRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API fonctionnel" });
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
```

---

## Étape 4 : Validation des données

Pour améliorer la sécurité, ajoute une validation basique dans tes contrôleurs :

```typescript
// Exemple de validation pour createTrainingSession
if (!date || !exercises || exercises.length === 0) {
  return res.status(400).json({
    message: "Date et au moins un exercice sont requis",
  });
}

// Valider chaque exercice
for (const ex of exercises) {
  if (!ex.exerciseId || !ex.sets || ex.sets < 1) {
    return res.status(400).json({
      message: "Chaque exercice doit avoir un ID et au moins une série",
    });
  }

  if (!ex.repsUniform && !ex.repsPerSet) {
    return res.status(400).json({
      message:
        "Chaque exercice doit avoir des répétitions (uniformes ou variables)",
    });
  }
}
```

---

## Étape 5 : Tester les endpoints

### 5.1 Populer la base de données avec des exercices

Crée un script `backend/prisma/seed.ts` :

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const exercises = [
    {
      name: "Développé couché",
      category: "strength",
      muscleGroups: ["chest", "triceps", "shoulders"],
      defaultUnit: "reps",
    },
    {
      name: "Squat",
      category: "strength",
      muscleGroups: ["quadriceps", "glutes", "hamstrings"],
      defaultUnit: "reps",
    },
    {
      name: "Soulevé de terre",
      category: "strength",
      muscleGroups: ["back", "glutes", "hamstrings"],
      defaultUnit: "reps",
    },
    {
      name: "Développé militaire",
      category: "strength",
      muscleGroups: ["shoulders", "triceps"],
      defaultUnit: "reps",
    },
    {
      name: "Tractions",
      category: "strength",
      muscleGroups: ["back", "biceps"],
      defaultUnit: "reps",
    },
    {
      name: "Dips",
      category: "strength",
      muscleGroups: ["chest", "triceps", "shoulders"],
      defaultUnit: "reps",
    },
    {
      name: "Curl biceps",
      category: "strength",
      muscleGroups: ["biceps"],
      defaultUnit: "reps",
    },
    {
      name: "Extensions triceps",
      category: "strength",
      muscleGroups: ["triceps"],
      defaultUnit: "reps",
    },
    {
      name: "Leg press",
      category: "strength",
      muscleGroups: ["quadriceps", "glutes"],
      defaultUnit: "reps",
    },
    {
      name: "Rowing",
      category: "strength",
      muscleGroups: ["back"],
      defaultUnit: "reps",
    },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: exercise,
    });
  }

  console.log("✅ Exercices créés avec succès");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Ajoute dans `package.json` :

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Lance le seed :

```bash
npx prisma db seed
```

### 5.2 Tester avec curl ou Postman

**Récupérer le token d'authentification** (connexion) :

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ton@email.com","password":"tonmotdepasse"}'
```

**Récupérer les exercices** :

```bash
curl http://localhost:3000/api/exercises \
  -H "Authorization: Bearer TON_TOKEN"
```

**Créer une séance** :

```bash
curl -X POST http://localhost:3000/api/training-sessions \
  -H "Authorization: Bearer TON_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-23",
    "durationMinutes": 75,
    "notes": "Bonne séance push",
    "exercises": [
      {
        "exerciseId": "ID_EXERCICE",
        "sets": 4,
        "repsUniform": 8,
        "weightKg": 80,
        "restSeconds": 90
      }
    ]
  }'
```

**Récupérer les statistiques** :

```bash
curl http://localhost:3000/api/training-sessions/stats \
  -H "Authorization: Bearer TON_TOKEN"
```

---

## Bonus : Calculs et statistiques

### Fonction helper pour calculer le volume

Crée `backend/src/utils/trainingCalculations.ts` :

```typescript
export interface ExerciseData {
  sets: number;
  repsUniform?: number;
  repsPerSet?: number[];
  weightKg?: number;
}

export function calculateTotalReps(exercise: ExerciseData): number {
  if (exercise.repsUniform) {
    return exercise.sets * exercise.repsUniform;
  }

  if (exercise.repsPerSet && Array.isArray(exercise.repsPerSet)) {
    return exercise.repsPerSet.reduce((sum, reps) => sum + reps, 0);
  }

  return 0;
}

export function calculateVolume(exercise: ExerciseData): number {
  const totalReps = calculateTotalReps(exercise);
  return totalReps * (exercise.weightKg || 0);
}
```

Utilise ces fonctions dans tes contrôleurs pour les statistiques.

---

## 🎉 Félicitations !

Tu as maintenant un backend fonctionnel pour le système d'entraînement. Le frontend est déjà prêt et connecté à ces endpoints.

### Prochaines étapes

1. Lance le backend : `pnpm run dev`
2. Teste la création de séances depuis le frontend
3. Vérifie que les données sont bien sauvegardées
4. Ajoute d'autres exercices dans la base

Si tu rencontres des erreurs, vérifie :

- Que le serveur backend est lancé
- Que les migrations Prisma sont appliquées
- Que le token d'authentification est valide
- Les logs dans la console backend pour voir les erreurs
