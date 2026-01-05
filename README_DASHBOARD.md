# Dashboard MyTrackLy - Frontend

## 🎯 Ce qui a été créé

### 1. Structure complète du Dashboard

**`src/components/layout/DashboardLayout.tsx`**
- Layout avec sidebar responsive
- Navigation entre les pages
- Profil utilisateur avec déconnexion
- Menu mobile hamburger

### 2. Page Home (Dashboard principal)

**`src/components/pages/dashboard/Home.tsx`**
- Affichage des statistiques principales (séances, volume, streak, fréquence)
- Message contextuel selon l'objectif de l'utilisateur
- Séances récentes
- Call-to-action vers "Nouvelle séance"

### 3. Page New Training Session

**`src/components/pages/dashboard/NewTrainingSession.tsx`**
- Formulaire complet pour créer une séance
- Ajout d'exercices depuis une bibliothèque
- **Calcul automatique des répétitions** :
  - Mode uniforme : toutes les séries identiques (ex: 4×8)
  - Mode variable : chaque série différente (ex: 7, 7, 5, 5, 4)
- Calcul du volume total (reps × poids)
- Résumé en temps réel de la séance
- Notes par exercice et pour la séance

### 4. Types TypeScript

**`src/types/index.ts`**
- Interfaces pour tous les modèles de données
- Types pour les formulaires
- Types pour les statistiques

### 5. Hooks personnalisés

**`src/hooks/useTrainingSessions.ts`**
- `useTrainingSessions()` : récupérer les séances
- `useCreateTrainingSession()` : créer une séance
- `useTrainingStats()` : récupérer les stats dashboard
- `useDeleteTrainingSession()` : supprimer une séance

**`src/hooks/useExercises.ts`**
- `useExercises()` : récupérer les exercices
- `useCreateExercise()` : créer un exercice custom

### 6. Navigation configurée

Routes ajoutées dans `App.jsx` :
- `/dashboard` → Home
- `/dashboard/training/new` → Nouvelle séance
- `/dashboard/training/history` → Historique (à venir)
- `/dashboard/measurements` → Mensurations (à venir)
- `/dashboard/habits` → Habitudes (à venir)
- `/dashboard/statistics` → Statistiques (à venir)

---

## 🚀 Comment utiliser

### 1. Lance le frontend

```bash
cd carnet-entrainement
pnpm dev
```

### 2. Crée le backend

Suis le guide **`BACKEND_TRAINING_GUIDE.md`** pour créer toutes les APIs nécessaires.

### 3. Teste le dashboard

1. Connecte-toi avec ton compte
2. Tu arrives sur la page Home avec des **données mockées**
3. Clique sur "Nouvelle séance" pour tester le formulaire
4. Une fois le backend créé, les vraies données s'afficheront

---

## 📝 Fonctionnalités principales

### Page Home (Dashboard)

**Statistiques affichées** :
- ✅ Nombre total de séances
- ✅ Volume total soulevé (en tonnes)
- ✅ Streak (jours consécutifs d'entraînement)
- ✅ Fréquence hebdomadaire

**Message contextuel** selon l'objectif :
- 📉 **Perte de poids** : Félicitations si perte, encouragement si gain
- 📈 **Prise de poids/masse** : Félicitations si gain, encouragement si perte
- ⚖️ **Maintenance** : Confirmation que le poids est stable

**Séances récentes** :
- Affichage des 3 dernières séances
- Lien vers l'historique complet

### Page New Training Session

**Informations générales** :
- Date de la séance
- Durée en minutes
- Notes générales

**Ajout d'exercices** :
- Bibliothèque d'exercices prédéfinis (10 exercices de base)
- Possibilité d'ajouter des exercices custom (via API)

**Par exercice** :
- Nombre de séries
- Poids utilisé (kg)
- Temps de repos (secondes)
- **Type de répétitions** :
  - **Uniformes** : ex. 4 séries × 8 reps = 32 reps
  - **Variables** : ex. [7, 7, 5, 5, 4] = 28 reps
- Notes spécifiques à l'exercice

**Calculs automatiques** :
- ✅ Répétitions totales par exercice
- ✅ Volume par exercice (reps × poids)
- ✅ Volume total de la séance
- ✅ Nombre total de séries
- ✅ Nombre total d'exercices

**Résumé de séance** :
- Card récapitulative en bas de page
- Affichage en temps réel des totaux

---

## 🔧 Connexion avec le backend

### Endpoints utilisés

**Training Sessions** :
```
GET    /api/training-sessions         → useTrainingSessions()
POST   /api/training-sessions         → useCreateTrainingSession()
GET    /api/training-sessions/stats   → useTrainingStats()
DELETE /api/training-sessions/:id     → useDeleteTrainingSession()
```

**Exercises** :
```
GET    /api/exercises                 → useExercises()
POST   /api/exercises                 → useCreateExercise()
```

### Format des données envoyées au backend

**Créer une séance** :
```json
{
  "date": "2025-01-23",
  "durationMinutes": 75,
  "notes": "Bonne séance",
  "exercises": [
    {
      "exerciseId": "uuid-de-l-exercice",
      "sets": 4,
      "repsUniform": 8,
      "weightKg": 80,
      "restSeconds": 90,
      "notes": "Sensation de force",
      "orderIndex": 0
    }
  ]
}
```

**Exercice avec reps variables** :
```json
{
  "exerciseId": "uuid",
  "sets": 5,
  "repsPerSet": [7, 7, 5, 5, 4],
  "weightKg": 75,
  "restSeconds": 90,
  "orderIndex": 1
}
```

---

## 🎨 Design et UX

### Style
- Couleurs : Indigo/Purple (premium et professionnel)
- Components : Rounded corners, shadows, smooth transitions
- Responsive : Mobile-first avec sidebar qui devient menu hamburger

### Expérience utilisateur
- ✅ Loading states sur tous les boutons
- ✅ Messages d'erreur clairs
- ✅ Feedback visuel immédiat
- ✅ Calculs en temps réel
- ✅ Navigation intuitive

### Bienveillance
Tous les messages sont **encourageants** et **positifs**, même en cas d'écart par rapport à l'objectif.

---

## 📦 Prochaines étapes

### À implémenter côté frontend
1. **Historique des séances** : Liste avec filtres, détails, édition, suppression
2. **Mensurations** : Ajout, graphiques de progression
3. **Habitudes** : Suivi quotidien avec calendrier heatmap
4. **Statistiques** : Graphiques détaillés, progression par exercice

### À implémenter côté backend
Suis le guide **`BACKEND_TRAINING_GUIDE.md`** qui explique :
1. ✅ Mise à jour du schéma Prisma
2. ✅ Création des contrôleurs
3. ✅ Création des routes
4. ✅ Validation des données
5. ✅ Seed de la base avec des exercices
6. ✅ Tests des endpoints

---

## 💡 Conseils

### Pour le développement

1. **Lance d'abord le backend** :
   ```bash
   cd backend
   pnpm run dev
   ```

2. **Puis le frontend** :
   ```bash
   cd carnet-entrainement
   pnpm dev
   ```

3. **Vérifie que les données s'affichent** :
   - Ouvre la console du navigateur (F12)
   - Vérifie les appels réseau dans l'onglet "Network"
   - Les erreurs s'affichent clairement

### Pour le debug

- Les hooks affichent automatiquement les erreurs dans `error`
- Utilise `console.log(stats)` dans `Home.tsx` pour voir les données
- Vérifie que le token est présent : `localStorage.getItem("token")`

### Pour étendre

- Tous les composants sont modulaires et réutilisables
- Les types TypeScript facilitent l'ajout de nouvelles features
- Les hooks peuvent être étendus facilement

---

## 🎉 Résumé

Tu as maintenant :
✅ Un dashboard complet et fonctionnel
✅ Une page Home avec stats et messages contextuels
✅ Un formulaire avancé pour créer des séances
✅ Des calculs automatiques (reps, volume)
✅ Une architecture propre et extensible
✅ Un guide détaillé pour créer le backend

**Il ne te reste plus qu'à créer le backend en suivant `BACKEND_TRAINING_GUIDE.md` !**







