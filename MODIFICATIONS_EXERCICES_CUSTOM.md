# Modifications - Exercices Custom & Bibliothèque

**Date** : 2 janvier 2025

---

## ✅ Modifications effectuées

### 1. Backend - Séparation Bibliothèque / Ma bibliothèque

#### Controller `exerciseController.ts`

- ✅ `getExercises()` : Retourne les exercices prédéfinis (pour tous) + exercices custom de l'utilisateur uniquement
- ✅ `getMyExercises()` : Nouvelle fonction pour récupérer uniquement les exercices custom de l'utilisateur
- ✅ `seedLaffayExercises()` : Route spéciale pour ajouter les exercices Laffay dans la DB

#### Routes `exerciceRoute.ts`

- ✅ `GET /api/exercises` : Tous les exercices (prédéfinis + custom de l'utilisateur)
- ✅ `GET /api/exercises/my-library` : Uniquement les exercices custom de l'utilisateur
- ✅ `POST /api/exercises/seed-laffay` : Route spéciale pour seed les exercices Laffay

#### Modèle `exercicesLaffay.ts`

- ✅ Export ajouté pour permettre l'import dans le controller
- ✅ Format JSON conforme au schéma Prisma :
  - `nom` → `name`
  - `type: "poids_de_corps"` → `category: "strength"`
  - `groupe_musculaire_principal + groupes_musculaires_secondaires` → `muscleGroups` (array)
  - `defaultUnit: "reps"` (tous les exercices Laffay sont en répétitions)
  - `isCustom: false` (exercices prédéfinis pour tous)
  - `createdByUserId: null`

### 2. Frontend - Interface séparée

#### Hook `useExercises.ts`

- ✅ `useMyExercises()` : Nouveau hook pour récupérer uniquement les exercices custom de l'utilisateur

#### Composant `NewTrainingSession.tsx`

- ✅ Séparation visuelle entre "Bibliothèque" (exercices prédéfinis) et "Ma bibliothèque" (exercices custom)
- ✅ Les exercices custom sont affichés avec un fond indigo pour les distinguer
- ✅ Filtrage automatique : `predefinedExercises` et `customExercises`

---

## 🔒 Sécurité

### Filtrage par utilisateur

- ✅ Les exercices custom sont **automatiquement filtrés** par `createdByUserId`
- ✅ Un utilisateur ne voit **que ses propres exercices custom**
- ✅ Les exercices prédéfinis sont visibles par **tous les utilisateurs**

### Route de seed

- ⚠️ La route `/api/exercises/seed-laffay` n'a **pas d'authentification** pour l'instant
- 💡 **Recommandation** : Ajouter un middleware admin ou une clé secrète pour protéger cette route

---

## 📋 Utilisation

### Seed les exercices Laffay

```bash
curl -X POST http://localhost:3000/api/exercises/seed-laffay
```

**Résultat attendu** :

```json
{
  "message": "13 exercices Laffay créés",
  "created": 13,
  "total": 13
}
```

**Note** : La route utilise `upsert` basé sur le nom, donc on peut l'appeler plusieurs fois sans créer de doublons.

### Récupérer tous les exercices (prédéfinis + custom de l'utilisateur)

```bash
curl http://localhost:3000/api/exercises \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Récupérer uniquement les exercices custom de l'utilisateur

```bash
curl http://localhost:3000/api/exercises/my-library \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 🎨 Interface Frontend

### Structure de l'affichage

```
┌─────────────────────────────────────┐
│  Ajouter un exercice                │
├─────────────────────────────────────┤
│  [Bibliothèque] [Créer un exercice] │
├─────────────────────────────────────┤
│  Bibliothèque                        │
│  ┌─────────┐ ┌─────────┐           │
│  │ Exo 1   │ │ Exo 2   │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  Ma bibliothèque                    │
│  ┌─────────┐ ┌─────────┐           │
│  │ Mon Exo │ │ Autre   │           │
│  └─────────┘ └─────────┘           │
└─────────────────────────────────────┘
```

### Styles

- **Bibliothèque** : Fond gris (`bg-gray-50`)
- **Ma bibliothèque** : Fond indigo (`bg-indigo-50`) pour distinguer visuellement

---

## ✅ Vérifications

### Backend

- [x] Les exercices custom sont bien filtrés par `createdByUserId`
- [x] Les exercices prédéfinis sont visibles par tous
- [x] La route de seed fonctionne
- [x] Le format JSON des exercices Laffay est conforme au schéma Prisma

### Frontend

- [x] Séparation visuelle entre "Bibliothèque" et "Ma bibliothèque"
- [x] Les exercices custom sont bien affichés dans "Ma bibliothèque"
- [x] Les exercices prédéfinis sont bien affichés dans "Bibliothèque"

---

## 🚀 Prochaines étapes (optionnel)

1. **Sécuriser la route de seed** : Ajouter un middleware admin ou une clé secrète
2. **Améliorer l'interface** : Ajouter des icônes ou badges pour distinguer les types d'exercices
3. **Recherche** : Ajouter une barre de recherche dans chaque section
4. **Catégories** : Filtrer par catégorie dans "Bibliothèque" et "Ma bibliothèque"

---

## 📝 Notes importantes

- Les exercices custom créés lors de l'enregistrement d'une séance sont **automatiquement** associés à l'utilisateur via `createdByUserId`
- Les exercices Laffay sont créés avec `isCustom: false` et `createdByUserId: null`, donc visibles par **tous les utilisateurs**
- La route `/api/exercises` retourne les exercices prédéfinis + les exercices custom de l'utilisateur connecté uniquement
