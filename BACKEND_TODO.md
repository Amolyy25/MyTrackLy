# 📋 État du câblage Backend - Dashboard

**Date d'analyse** : 2 janvier 2025

---

## 🔍 Analyse de l'existant

### ✅ Ce qui est déjà fait

1. **Schéma Prisma** ✅
   - Modèles `User`, `TrainingSession`, `Exercise`, `SessionExercise` créés
   - Relations correctement définies
   - Champs nécessaires présents

2. **Contrôleurs partiellement créés**
   - `trainingController.ts` : **5 fonctions implémentées** (getTrainingSessions, CreateTrainingSession, getTrainingSession, updateTrainingSession, deleteTrainingSession, getTrainingStats)
   - `exerciseController.ts` : **VIDE** ❌

3. **Routes partiellement créées**
   - `trainingRoutes.ts` : Seulement 2 routes définies (stats + sessions)
   - `authRoutes.ts` : ✅ Complet
   - `emailRoutes.ts` : ✅ Complet

4. **Serveur Express**
   - Configuration CORS ✅
   - Middleware JSON ✅
   - Routes auth et email montées ✅
   - Route training montée ✅
   - **MANQUE** : Route `/api/exercises` ❌

---

## ❌ Problèmes identifiés

### 🔴 CRITIQUE - Routes manquantes/incorrectes

#### 1. **Routes Training Sessions** (`trainingRoutes.ts`)

**Actuellement :**
```typescript
router.get("/stats", getTrainingStats);          // ✅ OK
router.post("/sessions", getTrainingSessions);   // ❌ ERREUR : mauvais nom + mauvaise méthode
```

**Problèmes :**
- Route `POST /sessions` devrait être `GET /` (récupérer les séances)
- Route `POST /` manque (créer une séance)
- Route `GET /:id` manque (récupérer une séance)
- Route `PUT /:id` manque (modifier une séance)
- Route `DELETE /:id` manque (supprimer une séance)
- **AUCUNE PROTECTION PAR AUTH MIDDLEWARE** ⚠️

**Ce que le frontend attend :**
```typescript
GET    /api/training-sessions        → Liste des séances
POST   /api/training-sessions        → Créer une séance
GET    /api/training-sessions/stats  → Stats du dashboard
GET    /api/training-sessions/:id    → Une séance
PUT    /api/training-sessions/:id    → Modifier une séance
DELETE /api/training-sessions/:id    → Supprimer une séance
```

---

#### 2. **Routes Exercises** (INEXISTANTES ❌)

**Actuellement :**
- Aucune route définie
- Fichier non monté dans `index.ts`
- Controller vide

**Ce que le frontend attend :**
```typescript
GET  /api/exercises       → Liste des exercices (avec filtres category, search)
POST /api/exercises       → Créer un exercice personnalisé
```

---

### 🟡 MOYEN - Controllers incomplets

#### 1. **`exerciseController.ts`** (VIDE)

Il manque :
- `getExercises()` : Récupérer la liste des exercices (avec filtres)
- `createExercise()` : Créer un exercice personnalisé

#### 2. **`trainingController.ts`** (Fonctions existent mais non routées)

Fonctions créées mais **pas dans les routes** :
- `CreateTrainingSession` ✅ (existe mais non routé)
- `getTrainingSession` ✅ (existe mais non routé)
- `updateTrainingSession` ✅ (existe mais non routé)
- `deleteTrainingSession` ✅ (existe mais non routé)

---

### 🟠 IMPORTANT - Sécurité

**Middleware d'authentification** (`authMiddleware`) :
- ✅ Existe (créé pour les routes auth)
- ❌ **PAS appliqué sur les routes training**
- ❌ **PAS appliqué sur les routes exercises**

**Toutes les routes doivent être protégées** sauf :
- `/api/auth/register`
- `/api/auth/login`

---

### 🔵 OPTIONNEL - Base de données

**Exercices prédéfinis** :
- La base de données est vide
- Aucun exercice de base (Développé couché, Squat, etc.)
- **Besoin d'un script de seed**

---

## ✅ TODO Liste détaillée

### 🎯 URGENT (pour que le dashboard fonctionne)

#### 1. **Créer le fichier `exerciseRoutes.ts`**

```typescript
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getExercises,
  createExercise,
} from "../controllers/exerciseController";

const router = Router();

// Toutes les routes exercises nécessitent l'authentification
router.use(authMiddleware);

router.get("/", getExercises);
router.post("/", createExercise);

export default router;
```

**Localisation** : `backend/src/routes/exerciseRoutes.ts`

---

#### 2. **Implémenter `exerciseController.ts`**

```typescript
import { Request, Response } from "express";
import prisma from "../config/database";

// GET /api/exercises
export async function getExercises(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;

    const { category, search } = req.query;

    const where: any = {
      OR: [
        { isCustom: false }, // Exercices globaux
        { createdByUserId: userId }, // Exercices persos de l'user
      ],
    };

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive",
      };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: [{ isCustom: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        category: true,
        muscleGroups: true,
        defaultUnit: true,
        isCustom: true,
      },
    });

    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// POST /api/exercises
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

    // Vérifier si un exercice avec ce nom existe déjà pour cet utilisateur
    const existingExercise = await prisma.exercise.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        OR: [
          { isCustom: false },
          { createdByUserId: userId },
        ],
      },
    });

    if (existingExercise) {
      return res.status(400).json({
        message: "Un exercice avec ce nom existe déjà",
      });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name: name.trim(),
        category,
        muscleGroups: muscleGroups || null,
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
```

**Localisation** : `backend/src/controllers/exerciseController.ts`

---

#### 3. **Corriger `trainingRoutes.ts`**

```typescript
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getTrainingSessions,
  CreateTrainingSession,
  getTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  getTrainingStats,
} from "../controllers/trainingController";

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Stats en premier (avant /:id sinon "stats" sera considéré comme un ID)
router.get("/stats", getTrainingStats);

// CRUD des séances
router.get("/", getTrainingSessions);           // Liste
router.post("/", CreateTrainingSession);        // Créer
router.get("/:id", getTrainingSession);         // Détail
router.put("/:id", updateTrainingSession);      // Modifier
router.delete("/:id", deleteTrainingSession);   // Supprimer

export default router;
```

**Localisation** : `backend/src/routes/trainingRoutes.ts`

**⚠️ IMPORTANT** : Renommer `CreateTrainingSession` en `createTrainingSession` (convention camelCase pour les fonctions)

---

#### 4. **Monter la route exercises dans `index.ts`**

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import emailRoutes from "./routes/emailRoutes";
import trainingRoutes from "./routes/trainingRoutes";
import exerciseRoutes from "./routes/exerciseRoutes"; // ← AJOUTER

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/training-sessions", trainingRoutes);
app.use("/api/exercises", exerciseRoutes); // ← AJOUTER
app.use("/api/email", emailRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API fonctionnel" });
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
```

**Localisation** : `backend/src/index.ts`

---

#### 5. **Vérifier le middleware d'authentification**

**Localisation** : `backend/src/middleware/authMiddleware.ts`

Le fichier devrait ressembler à ça :

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    // Ajouter les infos user à la requête
    (req as any).user = payload;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
}
```

**Si ce fichier n'existe pas** : ⚠️ **CRÉER LE FICHIER**

---

### 🌱 RECOMMANDÉ - Seed de la base de données

#### 6. **Créer un script de seed pour les exercices**

**Localisation** : `backend/prisma/seed.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...");

  // Exercices de force (strength)
  const strengthExercises = [
    { name: "Développé couché", category: "strength", muscleGroups: ["chest", "triceps", "shoulders"], defaultUnit: "reps" },
    { name: "Squat", category: "strength", muscleGroups: ["legs", "glutes"], defaultUnit: "reps" },
    { name: "Soulevé de terre", category: "strength", muscleGroups: ["back", "legs", "glutes"], defaultUnit: "reps" },
    { name: "Développé militaire", category: "strength", muscleGroups: ["shoulders", "triceps"], defaultUnit: "reps" },
    { name: "Tractions", category: "strength", muscleGroups: ["back", "biceps"], defaultUnit: "reps" },
    { name: "Dips", category: "strength", muscleGroups: ["chest", "triceps"], defaultUnit: "reps" },
    { name: "Curl biceps", category: "strength", muscleGroups: ["biceps"], defaultUnit: "reps" },
    { name: "Extensions triceps", category: "strength", muscleGroups: ["triceps"], defaultUnit: "reps" },
    { name: "Leg press", category: "strength", muscleGroups: ["legs", "glutes"], defaultUnit: "reps" },
    { name: "Rowing barre", category: "strength", muscleGroups: ["back", "biceps"], defaultUnit: "reps" },
    { name: "Développé incliné", category: "strength", muscleGroups: ["chest", "shoulders"], defaultUnit: "reps" },
    { name: "Leg curl", category: "strength", muscleGroups: ["hamstrings"], defaultUnit: "reps" },
    { name: "Leg extension", category: "strength", muscleGroups: ["quadriceps"], defaultUnit: "reps" },
    { name: "Presse à épaules", category: "strength", muscleGroups: ["shoulders"], defaultUnit: "reps" },
    { name: "Crunch", category: "strength", muscleGroups: ["abs"], defaultUnit: "reps" },
  ];

  // Exercices cardio
  const cardioExercises = [
    { name: "Course à pied", category: "cardio", muscleGroups: ["legs", "cardio"], defaultUnit: "time" },
    { name: "Vélo", category: "cardio", muscleGroups: ["legs", "cardio"], defaultUnit: "time" },
    { name: "Rameur", category: "cardio", muscleGroups: ["full-body", "cardio"], defaultUnit: "time" },
    { name: "Corde à sauter", category: "cardio", muscleGroups: ["legs", "cardio"], defaultUnit: "time" },
    { name: "Elliptique", category: "cardio", muscleGroups: ["legs", "cardio"], defaultUnit: "time" },
  ];

  // Exercices flexibilité
  const flexibilityExercises = [
    { name: "Étirements dos", category: "flexibility", muscleGroups: ["back"], defaultUnit: "time" },
    { name: "Étirements jambes", category: "flexibility", muscleGroups: ["legs"], defaultUnit: "time" },
    { name: "Yoga", category: "flexibility", muscleGroups: ["full-body"], defaultUnit: "time" },
    { name: "Pilates", category: "flexibility", muscleGroups: ["core", "full-body"], defaultUnit: "time" },
  ];

  const allExercises = [
    ...strengthExercises,
    ...cardioExercises,
    ...flexibilityExercises,
  ];

  for (const exercise of allExercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: {
        name: exercise.name,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        defaultUnit: exercise.defaultUnit,
        isCustom: false,
        createdByUserId: null,
      },
    });
  }

  console.log(`✅ ${allExercises.length} exercices créés`);
  console.log("🌱 Seed terminé !");
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

**Ajouter dans `package.json`** (section `scripts`) :
```json
"scripts": {
  "seed": "ts-node prisma/seed.ts"
}
```

**Exécuter le seed** :
```bash
cd backend
pnpm run seed
```

---

### 🧪 OPTIONNEL - Tests et améliorations

#### 7. **Ajouter la gestion des mesures corporelles**

*Pas urgent pour le dashboard de base, mais prévu dans `ARCHITECTURE.md`*

#### 8. **Ajouter les habitudes (habits)**

*Pas urgent pour le dashboard de base, mais prévu dans `ARCHITECTURE.md`*

#### 9. **Ajouter la pagination**

Les routes `getTrainingSessions` et `getExercises` devraient supporter :
- `limit` : Nombre de résultats par page
- `offset` : Position de départ

*(Déjà implémenté dans `getTrainingSessions` ✅)*

---

## 🚀 Étapes pour tout connecter

### **Ordre recommandé :**

1. ✅ **Vérifier/créer `authMiddleware.ts`**
2. ✅ **Créer `exerciseRoutes.ts`**
3. ✅ **Implémenter `exerciseController.ts`**
4. ✅ **Corriger `trainingRoutes.ts`**
5. ✅ **Monter la route exercises dans `index.ts`**
6. ✅ **Créer et exécuter le script de seed**
7. ✅ **Tester avec le frontend**

---

## 📝 Résumé des fichiers à créer/modifier

### À CRÉER :
- [ ] `backend/src/routes/exerciseRoutes.ts`
- [ ] `backend/src/middleware/authMiddleware.ts` (si n'existe pas)
- [ ] `backend/prisma/seed.ts`

### À MODIFIER :
- [ ] `backend/src/controllers/exerciseController.ts` (actuellement vide)
- [ ] `backend/src/routes/trainingRoutes.ts` (corriger les routes)
- [ ] `backend/src/index.ts` (ajouter route exercises)
- [ ] `backend/package.json` (ajouter script seed)

### À VÉRIFIER :
- [ ] `backend/src/middleware/authMiddleware.ts` existe et fonctionne
- [ ] `backend/.env` contient `DATABASE_URL` et `JWT_SECRET`

---

## 🧪 Comment tester

### 1. **Tester la création d'un exercice personnalisé**

```bash
curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TON_TOKEN" \
  -d '{
    "name": "Mon exercice custom",
    "category": "strength",
    "muscleGroups": ["chest"],
    "defaultUnit": "reps"
  }'
```

### 2. **Tester la récupération des exercices**

```bash
curl http://localhost:3000/api/exercises \
  -H "Authorization: Bearer TON_TOKEN"
```

### 3. **Tester la création d'une séance**

```bash
curl -X POST http://localhost:3000/api/training-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TON_TOKEN" \
  -d '{
    "date": "2025-01-02",
    "durationMinutes": 60,
    "notes": "Bonne séance",
    "exercises": [
      {
        "exerciseId": "ID_EXERCICE",
        "sets": 3,
        "repsUniform": 10,
        "weightKg": 50,
        "restSeconds": 90,
        "orderIndex": 0
      }
    ]
  }'
```

### 4. **Tester les stats du dashboard**

```bash
curl http://localhost:3000/api/training-sessions/stats \
  -H "Authorization: Bearer TON_TOKEN"
```

---

## ⚠️ Erreurs fréquentes

### 1. **"Non authentifié"**
→ Vérifier que `authMiddleware` est bien appliqué
→ Vérifier que le token JWT est valide

### 2. **"Exercice non trouvé"**
→ Exécuter le script de seed
→ Vérifier la base de données avec un client PostgreSQL

### 3. **"Route non trouvée"**
→ Vérifier que `exerciseRoutes` est bien monté dans `index.ts`
→ Redémarrer le serveur backend

### 4. **Erreur Prisma "Field does not exist"**
→ Exécuter `pnpm prisma db push` après modification du schema
→ Exécuter `pnpm prisma generate` pour régénérer le client

---

## 📊 Mapping Frontend ↔️ Backend

| Frontend appelle | Backend route actuelle | Status | À faire |
|------------------|------------------------|--------|---------|
| `GET /api/training-sessions/stats` | `GET /stats` | ✅ OK | - |
| `GET /api/training-sessions` | `POST /sessions` | ❌ ERREUR | Corriger en `GET /` |
| `POST /api/training-sessions` | - | ❌ MANQUE | Créer `POST /` |
| `GET /api/training-sessions/:id` | - | ❌ MANQUE | Créer `GET /:id` |
| `PUT /api/training-sessions/:id` | - | ❌ MANQUE | Créer `PUT /:id` |
| `DELETE /api/training-sessions/:id` | - | ❌ MANQUE | Créer `DELETE /:id` |
| `GET /api/exercises` | - | ❌ MANQUE | Créer route + controller |
| `POST /api/exercises` | - | ❌ MANQUE | Créer route + controller |

---

**Bonne chance ! 🚀**

Une fois ces étapes complétées, le dashboard sera entièrement fonctionnel avec de vraies données de la base de données PostgreSQL.




