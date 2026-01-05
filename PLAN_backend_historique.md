# PLAN : Backend pour la page Historique

**Date** : 2 janvier 2025

---

## 📋 Étape 1 : ANALYSE DU CONTEXTE

### Fichiers examinés

- `backend/src/controllers/trainingController.ts` - Fonction `getTrainingSessions` (lignes 21-60)
- `backend/src/routes/trainingRoutes.ts` - Route `GET /` (ligne 20)
- `src/hooks/useTrainingSessions.ts` - Hook `useTrainingSessions` qui appelle l'API
- `src/components/pages/dashboard/TrainingHistory.tsx` - Page historique créée

### Compréhension de la structure

**Backend - Ce qui existe déjà :**

- ✅ Route `GET /api/training-sessions` existe et fonctionne
- ✅ Fonction `getTrainingSessions` implémentée
- ✅ Support des filtres `dateFrom` et `dateTo` (query params)
- ✅ Support de la pagination `limit` et `offset` (query params)
- ✅ Retourne les séances avec leurs exercices (include)
- ✅ Tri par date décroissante (plus récent en premier)
- ✅ Filtrage par `userId` (sécurité)

**Frontend - Ce qui est utilisé :**

- Hook `useTrainingSessions(filters)` avec `dateFrom` et `dateTo`
- Affichage de la liste des séances
- Calcul du volume et des reps totales côté frontend
- Suppression de séance via `useDeleteTrainingSession`

### Conventions de code identifiées

- **Backend :**

  - Utilisation de Prisma ORM
  - Fonction utilitaire `getUserIdFromRequest` pour extraire userId
  - Gestion d'erreurs avec try/catch et status codes appropriés
  - Query params pour les filtres et la pagination
  - Include des relations (exercises avec exercise)

- **Frontend :**
  - Hooks personnalisés pour les appels API
  - Gestion des états loading/error
  - Calculs côté client (volume, reps)

---

## 📋 Étape 2 : ÉTAT ACTUEL DU BACKEND

### ✅ Ce qui fonctionne déjà

**Route** : `GET /api/training-sessions`

**Query params supportés** :

- `dateFrom` : Date de début (format ISO ou YYYY-MM-DD)
- `dateTo` : Date de fin (format ISO ou YYYY-MM-DD)
- `limit` : Nombre de résultats (défaut: 50)
- `offset` : Nombre de résultats à sauter (défaut: 0)

**Réponse** :

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "date": "2025-01-02T10:00:00Z",
    "durationMinutes": 60,
    "notes": "Bonne séance",
    "exercises": [
      {
        "id": "uuid",
        "exerciseId": "uuid",
        "exercise": {
          "id": "uuid",
          "name": "Développé couché",
          "category": "strength",
          ...
        },
        "sets": 3,
        "repsUniform": 8,
        "repsPerSet": null,
        "weightKg": 50,
        "restSeconds": 90,
        "orderIndex": 0,
        "notes": "..."
      }
    ],
    "createdAt": "2025-01-02T10:00:00Z",
    "updatedAt": "2025-01-02T10:00:00Z"
  }
]
```

**Fonctionnalités** :

- ✅ Filtrage par date (dateFrom, dateTo)
- ✅ Pagination (limit, offset)
- ✅ Tri par date décroissante
- ✅ Include des exercices avec leurs détails
- ✅ Sécurité : filtre automatique par userId

---

## 📋 Étape 3 : AMÉLIORATIONS POSSIBLES (OPTIONNEL)

### Améliorations suggérées (non obligatoires)

#### 1. **Pagination améliorée**

**Actuellement** :

- Pagination basique avec `limit` et `offset`
- Le frontend ne sait pas combien de séances il y a au total

**Amélioration possible** :

```typescript
// Retourner aussi le total
const total = await prisma.trainingSession.count({ where });

res.json({
  sessions,
  pagination: {
    total,
    limit: Number(limit),
    offset: Number(offset),
    hasMore: offset + sessions.length < total,
  },
});
```

**Avantage** : Permet d'afficher "Page X sur Y" et de désactiver le bouton "Suivant" si on est à la fin

#### 2. **Tri personnalisable**

**Actuellement** :

- Tri fixe par date décroissante

**Amélioration possible** :

```typescript
const { sortBy = "date", sortOrder = "desc" } = req.query;

const orderBy: any = {};
orderBy[sortBy as string] = sortOrder === "asc" ? "asc" : "desc";

// Utilisation
orderBy: orderBy,
```

**Avantage** : Permet de trier par date, volume, nombre d'exercices, etc.

#### 3. **Filtres supplémentaires**

**Améliorations possibles** :

- Filtre par durée minimale/maximale
- Filtre par nombre d'exercices
- Filtre par exercice spécifique (chercher les séances contenant un exercice)

**Exemple** :

```typescript
const { minDuration, maxDuration, minExercises, exerciseId } = req.query;

if (minDuration || maxDuration) {
  where.durationMinutes = {};
  if (minDuration) where.durationMinutes.gte = Number(minDuration);
  if (maxDuration) where.durationMinutes.lte = Number(maxDuration);
}

if (exerciseId) {
  where.exercises = {
    some: {
      exerciseId: exerciseId as string,
    },
  };
}
```

#### 4. **Agrégations (stats par période)**

**Amélioration possible** :

- Ajouter des stats dans la réponse (volume total de la période, nombre de séances, etc.)

**Exemple** :

```typescript
const stats = {
  totalSessions: sessions.length,
  totalVolume: sessions.reduce((sum, s) => {
    // Calculer le volume de chaque séance
    return sum + calculateVolume(s);
  }, 0),
  averageDuration:
    sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) /
    sessions.length,
};

res.json({
  sessions,
  stats,
});
```

---

## 📋 Étape 4 : PLAN D'IMPLÉMENTATION BACKEND

### ✅ Ce qui est DÉJÀ FAIT (rien à faire)

1. **Route `GET /api/training-sessions`** ✅

   - Existe et fonctionne
   - Supporte les filtres `dateFrom` et `dateTo`
   - Supporte la pagination `limit` et `offset`
   - Retourne les séances avec leurs exercices

2. **Sécurité** ✅

   - Middleware `authenticateToken` appliqué
   - Filtrage automatique par `userId`

3. **Format de réponse** ✅
   - Inclut tous les champs nécessaires
   - Inclut les exercices avec leurs détails

### 🔧 Améliorations optionnelles (si besoin)

#### Option 1 : Pagination améliorée avec total

**Fichier** : `backend/src/controllers/trainingController.ts`

**Modification** :

```typescript
export async function getTrainingSessions(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { dateFrom, dateTo, limit = 50, offset = 0 } = req.query;

    const where: any = { userId };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    // Compter le total AVANT de récupérer les résultats
    const total = await prisma.trainingSession.count({ where });

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

    // Retourner avec les infos de pagination
    res.json({
      sessions,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + sessions.length < total,
      },
    });
  } catch (error) {
    console.log("Error :", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}
```

**Impact frontend** : Il faudra adapter le hook `useTrainingSessions` pour gérer la nouvelle structure de réponse.

#### Option 2 : Tri personnalisable

**Fichier** : `backend/src/controllers/trainingController.ts`

**Modification** :

```typescript
const { dateFrom, dateTo, limit = 50, offset = 0, sortBy = "date", sortOrder = "desc" } = req.query;

// Validation des champs de tri autorisés
const allowedSortFields = ["date", "durationMinutes", "createdAt"];
const sortField = allowedSortFields.includes(sortBy as string)
  ? (sortBy as string)
  : "date";

const orderBy: any = {};
orderBy[sortField] = sortOrder === "asc" ? "asc" : "desc";

// Utilisation
orderBy: orderBy,
```

#### Option 3 : Filtres supplémentaires

**Fichier** : `backend/src/controllers/trainingController.ts`

**Modification** :

```typescript
const {
  dateFrom,
  dateTo,
  limit = 50,
  offset = 0,
  minDuration,
  maxDuration,
  exerciseId,
} = req.query;

// ... filtres existants ...

if (minDuration || maxDuration) {
  where.durationMinutes = {};
  if (minDuration) where.durationMinutes.gte = Number(minDuration);
  if (maxDuration) where.durationMinutes.lte = Number(maxDuration);
}

if (exerciseId) {
  where.exercises = {
    some: {
      exerciseId: exerciseId as string,
    },
  };
}
```

---

## 📊 Statut actuel

**Date** : 2 janvier 2025  
**Progression** : ✅ **BACKEND DÉJÀ FONCTIONNEL**

### ✅ Conclusion

**Le backend est DÉJÀ PRÊT pour la page historique !**

La route `GET /api/training-sessions` :

- ✅ Existe et fonctionne
- ✅ Supporte les filtres de date (`dateFrom`, `dateTo`)
- ✅ Supporte la pagination (`limit`, `offset`)
- ✅ Retourne les séances avec tous les détails nécessaires
- ✅ Est sécurisée (filtrage par userId)

**Aucune modification backend n'est nécessaire** pour que la page historique fonctionne.

Les améliorations proposées sont **optionnelles** et peuvent être ajoutées plus tard si besoin.

---

## 📝 Checklist Backend (pour référence)

### ✅ Déjà implémenté

- [x] Route `GET /api/training-sessions` existe
- [x] Filtres `dateFrom` et `dateTo` fonctionnent
- [x] Pagination `limit` et `offset` fonctionnent
- [x] Retourne les séances avec exercices
- [x] Tri par date décroissante
- [x] Sécurité (filtrage par userId)
- [x] Authentification requise

### 🔧 Améliorations optionnelles (si besoin)

- [ ] Pagination avec total (pour afficher "X sur Y séances")
- [ ] Tri personnalisable (par date, durée, etc.)
- [ ] Filtres supplémentaires (durée, exercice spécifique)
- [ ] Agrégations (stats de la période)

---

## 🧪 Tests à effectuer

### Test 1 : Récupérer toutes les séances

```bash
curl http://localhost:3000/api/training-sessions \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Test 2 : Filtrer par date

```bash
curl "http://localhost:3000/api/training-sessions?dateFrom=2025-01-01&dateTo=2025-01-31" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Test 3 : Pagination

```bash
curl "http://localhost:3000/api/training-sessions?limit=10&offset=0" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 💡 Recommandations

### Pour l'instant

- ✅ **Aucune modification backend nécessaire**
- ✅ La page historique fonctionne avec l'API existante

### Pour plus tard (si besoin)

1. **Pagination améliorée** : Utile si l'utilisateur a beaucoup de séances (> 50)
2. **Tri personnalisable** : Utile pour trier par volume, durée, etc.
3. **Filtres avancés** : Utile pour des recherches plus précises

---

## ✅ Conclusion

**Le backend est prêt !** 🎉

La route `GET /api/training-sessions` répond déjà à tous les besoins de la page historique :

- Liste des séances
- Filtrage par date
- Pagination
- Détails complets (exercices inclus)

Aucune modification n'est nécessaire pour l'instant. Les améliorations proposées sont optionnelles et peuvent être ajoutées plus tard selon les besoins.
