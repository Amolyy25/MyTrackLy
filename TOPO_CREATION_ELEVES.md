# 📋 Topo : Système de Création d'Élèves et Codes d'Invitation

## 🎯 Objectif

Implémenter un système complet permettant aux coaches de créer des codes d'invitation pour inviter des élèves à rejoindre leur compte, sans système de paiement pour l'instant.

---

## 🗄️ Base de Données

### Nouveau Modèle : `InvitationCode`

**Fichier** : `backend/prisma/schema.prisma`

```prisma
model InvitationCode {
  id            String    @id @default(uuid())
  code          String    @unique // Code unique et complexe (16 caractères)
  coachId       String    @map("coach_id")
  coach         User      @relation(fields: [coachId], references: [id], onDelete: Cascade)
  used          Boolean   @default(false) // Si le code a été utilisé
  usedByUserId  String?   @map("used_by_user_id") // ID de l'élève qui a utilisé le code
  usedBy        User?     @relation("UsedInvitationCodes", fields: [usedByUserId], references: [id], onDelete: SetNull)
  expiresAt     DateTime? @map("expires_at") // Date d'expiration (optionnelle)
  createdAt     DateTime  @default(now()) @map("created_at")
  usedAt        DateTime? @map("used_at") // Date d'utilisation

  @@map("invitation_codes")
  @@index([coachId])
  @@index([code])
}
```

**Modifications au modèle `User`** :

- Ajout de la relation `invitationCodes` : liste des codes créés par le coach
- Ajout de la relation `usedInvitationCodes` : codes utilisés par l'élève

---

## 🔧 Backend

### 1. Contrôleur : `invitationController.ts`

**Fichier** : `backend/src/controllers/invitationController.ts`

#### Fonctionnalités :

**a) Génération de code d'invitation**

- **Fonction** : `generateInvitationCode()`
  - Génère un code unique de 16 caractères
  - Utilise `crypto.randomBytes` pour la sécurité
  - Caractères : majuscules, minuscules, chiffres, caractères spéciaux

**b) Créer un code d'invitation**

- **Route** : `POST /api/invitations`
- **Authentification** : Requise (coach uniquement)
- **Fonction** : `createInvitationCode()`
  - Vérifie que l'utilisateur est un coach
  - Génère un code unique (vérifie l'unicité jusqu'à 10 tentatives)
  - Crée le code dans la base de données
  - Retourne le code créé

**c) Lister les codes d'invitation**

- **Route** : `GET /api/invitations`
- **Authentification** : Requise (coach uniquement)
- **Fonction** : `getInvitationCodes()`
  - Récupère tous les codes créés par le coach
  - Inclut les informations sur l'élève qui a utilisé le code (si utilisé)
  - Tri par date de création (plus récent en premier)

**d) Valider un code d'invitation**

- **Route** : `POST /api/invitations/validate`
- **Authentification** : Non requise (publique)
- **Fonction** : `validateInvitationCode()`
  - Vérifie que le code existe
  - Vérifie que le code n'a pas déjà été utilisé
  - Vérifie que le code n'a pas expiré (si expiration définie)
  - Vérifie que le coach associé existe toujours
  - Retourne les informations du coach si valide

### 2. Contrôleur : `studentController.ts`

**Fichier** : `backend/src/controllers/studentController.ts`

#### Fonctionnalités :

**a) Lister les élèves d'un coach**

- **Route** : `GET /api/students`
- **Authentification** : Requise (coach uniquement)
- **Fonction** : `getStudents()`
  - Récupère tous les élèves liés au coach
  - Inclut les statistiques (nombre de séances, mensurations)
  - Tri par date de création (plus récent en premier)

**b) Obtenir les détails d'un élève**

- **Route** : `GET /api/students/:studentId`
- **Authentification** : Requise (coach uniquement)
- **Fonction** : `getStudentDetails()`
  - Vérifie que l'élève appartient bien au coach
  - Récupère les 10 dernières séances avec exercices
  - Récupère les 10 dernières mensurations
  - Inclut les statistiques complètes

### 3. Modifications : `authController.ts`

**Fichier** : `backend/src/controllers/authController.ts`

#### Modifications dans `register()` :

1. **Validation du code d'invitation** (pour les élèves) :

   - Si un code est fourni, vérifie qu'il existe
   - Vérifie qu'il n'est pas déjà utilisé
   - Vérifie qu'il n'a pas expiré
   - Récupère le `coachId` depuis le code
   - Si pas de code fourni, `coachId` reste `undefined` (pour les tests)

2. **Marquage du code comme utilisé** :
   - Après création de l'utilisateur élève
   - Met à jour le code : `used = true`, `usedByUserId = user.id`, `usedAt = now()`

### 4. Routes

**Fichier** : `backend/src/routes/invitationRoutes.ts`

- `POST /api/invitations` → Créer un code (protégé)
- `GET /api/invitations` → Lister les codes (protégé)
- `POST /api/invitations/validate` → Valider un code (publique)

**Fichier** : `backend/src/routes/studentRoutes.ts`

- `GET /api/students` → Lister les élèves (protégé)
- `GET /api/students/:studentId` → Détails d'un élève (protégé)

**Fichier** : `backend/src/index.ts`

- Ajout des routes : `/api/invitations` et `/api/students`

---

## 🎨 Frontend

### 1. Page : `Students.tsx`

**Fichier** : `src/components/pages/dashboard/coach/Students.tsx`

#### Fonctionnalités :

**a) Création de codes d'invitation**

- Bouton pour afficher/masquer le formulaire
- Génération d'un code via l'API
- Affichage du code généré
- Bouton pour copier le code dans le presse-papiers

**b) Liste des codes d'invitation**

- Affichage de tous les codes créés par le coach
- Indicateur visuel : "Disponible" (vert) ou "Utilisé" (gris)
- Informations affichées :
  - Le code lui-même (en police monospace)
  - Date de création
  - Date d'utilisation (si utilisé)
  - Nom et email de l'élève qui a utilisé le code (si utilisé)
- Bouton "Copier" pour les codes non utilisés

**c) Liste des élèves**

- Tableau avec les informations suivantes :
  - Nom complet
  - Email
  - Objectif (perte de poids, prise de poids, etc.)
  - Nombre de séances
  - Nombre de mensurations
  - Date d'inscription
- Message si aucun élève n'a encore rejoint

**d) États et gestion d'erreurs**

- Loading state pendant le chargement
- Gestion des erreurs avec messages d'erreur
- Rafraîchissement automatique après création d'un code

### 2. Modifications : `CoachHome.tsx`

**Fichier** : `src/components/pages/dashboard/coach/CoachHome.tsx`

#### Modifications :

1. **Compteur d'élèves dynamique** :

   - Fetch automatique du nombre d'élèves au chargement
   - Affichage du nombre réel dans la carte "Nombre d'élèves"

2. **Bouton "Créer un élève"** :
   - Transformé en `Link` vers `/dashboard/students`
   - Redirection vers la page de gestion des élèves

### 3. Routes

**Fichier** : `src/App.jsx`

#### Ajouts :

- Import de `Students`
- Route : `/dashboard/students` → `<Students />`

### 4. Navigation

**Fichier** : `src/components/layout/DashboardLayout.tsx`

La navigation pour les coaches inclut déjà le lien "Mes élèves" vers `/dashboard/students` (déjà présent dans `coachNavigation`).

---

## 🔐 Sécurité

### Génération de codes

- Utilisation de `crypto.randomBytes` au lieu de `Math.random()`
- Vérification de l'unicité avant insertion
- Codes de 16 caractères avec caractères spéciaux

### Validation

- Vérification du rôle coach avant création de codes
- Vérification de l'appartenance des élèves au coach
- Codes à usage unique (ne peuvent être utilisés qu'une fois)
- Support pour expiration (optionnel, pas encore utilisé dans l'UI)

---

## 📊 Flux Utilisateur

### Pour un Coach :

1. **Créer un code d'invitation** :

   - Se connecter en tant que coach
   - Aller sur `/dashboard/students`
   - Cliquer sur "Créer un code d'invitation"
   - Cliquer sur "Générer le code"
   - Copier le code généré
   - Partager le code avec l'élève

2. **Voir ses élèves** :
   - Aller sur `/dashboard/students`
   - Voir la liste de tous les élèves
   - Voir les codes d'invitation (disponibles et utilisés)

### Pour un Élève :

1. **S'inscrire avec un code** :
   - Aller sur `/register?plan=eleve`
   - Remplir le formulaire d'inscription
   - Entrer le code d'invitation du coach (optionnel pour les tests)
   - Créer le compte
   - Le code est automatiquement marqué comme utilisé
   - L'élève est lié au coach

---

## 🧪 Mode Test

Pour faciliter les tests, l'inscription d'un élève **fonctionne sans code d'invitation** :

- Le champ code coach est optionnel dans le formulaire
- Si aucun code n'est fourni, `coachId` reste `undefined`
- L'élève peut quand même créer son compte

**Note** : En production, il faudra rendre le code obligatoire.

---

## 📝 Fichiers Créés/Modifiés

### Nouveaux fichiers :

- `backend/src/controllers/invitationController.ts`
- `backend/src/controllers/studentController.ts`
- `backend/src/routes/invitationRoutes.ts`
- `backend/src/routes/studentRoutes.ts`
- `src/components/pages/dashboard/coach/Students.tsx`

### Fichiers modifiés :

- `backend/prisma/schema.prisma` (ajout du modèle `InvitationCode`)
- `backend/src/controllers/authController.ts` (validation et marquage des codes)
- `backend/src/index.ts` (ajout des routes)
- `src/components/pages/dashboard/coach/CoachHome.tsx` (compteur dynamique, lien)
- `src/App.jsx` (ajout de la route `/dashboard/students`)

---

## ✅ Fonctionnalités Implémentées

- [x] Modèle de base de données pour les codes d'invitation
- [x] Génération sécurisée de codes d'invitation
- [x] Création de codes par les coaches
- [x] Liste des codes d'invitation (disponibles/utilisés)
- [x] Validation des codes lors de l'inscription
- [x] Marquage automatique des codes comme utilisés
- [x] Liste des élèves d'un coach
- [x] Détails d'un élève (avec séances et mensurations)
- [x] Interface frontend pour gérer les codes et élèves
- [x] Compteur dynamique d'élèves sur le dashboard coach
- [x] Navigation vers la page de gestion des élèves

---

## 🚀 Prochaines Étapes (Optionnelles)

1. **Rendre le code obligatoire** pour l'inscription élève (actuellement optionnel pour les tests)
2. **Système d'expiration** des codes avec interface UI
3. **Notifications** quand un élève utilise un code
4. **Statistiques avancées** sur les codes (taux d'utilisation, etc.)
5. **Export** de la liste des élèves
6. **Recherche et filtres** dans la liste des élèves
7. **Pagination** pour les grandes listes d'élèves

---

## 📌 Notes Importantes

- Les codes sont **uniques** et **à usage unique**
- Un code ne peut être utilisé que par **un seul élève**
- Les codes sont **liés au coach** qui les a créés
- L'inscription sans code est **temporairement autorisée** pour les tests
- Le système est **prêt pour la production** (il suffit de rendre le code obligatoire)

---

**Date de création** : 2025-01-02  
**Statut** : ✅ Implémentation complète et fonctionnelle
