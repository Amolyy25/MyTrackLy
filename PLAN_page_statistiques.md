# PLAN : Page Statistiques avec Dashboard Personnalisable

## 📋 Checklist (cocher au fur et à mesure)

- [ ] **Analyse du contexte** terminée
  - [x] Fichiers environnants analysés
  - [x] Conventions de code identifiées
  - [x] Logique métier comprise
  - [x] Patterns de hooks et API identifiés
  - [x] Bibliothèque de graphiques (Recharts) confirmée

- [ ] **Plan validé** par l'utilisateur
  - [ ] Étapes détaillées approuvées
  - [ ] Fichiers impactés confirmés

- [ ] **Backend - Endpoints statistiques**
  - [ ] Créer `statsController.ts` avec endpoints:
    - [ ] `GET /api/stats/sessions?range=30d` - Stats sessions
    - [ ] `GET /api/stats/measurements?range=30d` - Stats mensurations
    - [ ] `GET /api/stats/habits?range=30d` - Stats habitudes (si implémenté)
    - [ ] `GET /api/stats/overview?range=30d` - Vue d'ensemble
    - [ ] `GET /api/coach/students/:id/stats?range=30d` - Stats élève (coach)
  - [ ] Créer `statsRoutes.ts` et l'intégrer dans `index.ts`
  - [ ] Ajouter logique de calcul des stats (volume, PRs, progression, etc.)

- [ ] **Frontend - Hooks et types**
  - [ ] Créer `hooks/useStats.ts` pour récupérer les stats
  - [ ] Créer `hooks/useStatsPreferences.ts` pour gérer les préférences
  - [ ] Ajouter types dans `types/index.ts`:
    - [ ] `StatsPreferences`
    - [ ] `StatsData`
    - [ ] `DateRange`
    - [ ] Types pour chaque type de stats

- [ ] **Frontend - Composants de base**
  - [ ] Créer `components/stats/StatCard.tsx` (carte réutilisable)
  - [ ] Créer `components/stats/CustomizePanel.tsx` (panneau de personnalisation)
  - [ ] Créer `components/stats/DateRangePicker.tsx` (sélecteur de période)

- [ ] **Frontend - Composants de graphiques**
  - [ ] Créer `components/stats/charts/LineChart.tsx` (évolution poids, volume)
  - [ ] Créer `components/stats/charts/BarChart.tsx` (sessions/semaine, comparaisons)
  - [ ] Créer `components/stats/charts/PieChart.tsx` (groupes musculaires)
  - [ ] Créer `components/stats/charts/AreaChart.tsx` (tendances volume)
  - [ ] Créer `components/stats/charts/Heatmap.tsx` (habitudes, activité)
  - [ ] Créer `components/stats/charts/ProgressBar.tsx` (objectifs)

- [ ] **Frontend - Page principale**
  - [ ] Créer `pages/dashboard/statistics.tsx` (page principale)
  - [ ] Implémenter détection de rôle (personnel/élève/coach)
  - [ ] Implémenter filtres globaux (date range)
  - [ ] Implémenter layout responsive (grid)
  - [ ] Ajouter loading states et empty states

- [ ] **Frontend - Statistiques par rôle**
  - [ ] Statistiques PERSONNEL:
    - [ ] Cards quick stats (sessions, volume, streak, progress)
    - [ ] Graphique évolution volume (line chart)
    - [ ] Graphique poids (line chart)
    - [ ] Graphique sessions/semaine (bar chart)
    - [ ] Graphique groupes musculaires (pie chart)
    - [ ] Graphique habitudes (heatmap si disponible)
    - [ ] Liste des PRs par exercice
  - [ ] Statistiques ÉLÈVE (même que personnel +):
    - [ ] Sessions assignées vs complétées
    - [ ] Nombre de commentaires coach
    - [ ] Taux de compliance
  - [ ] Statistiques COACH:
    - [ ] Sélecteur d'élève (dropdown)
    - [ ] Stats globales (total élèves, sessions, etc.)
    - [ ] Stats par élève (quand sélectionné)
    - [ ] Graphique comparaison élèves (bar chart)
    - [ ] Liste élèves nécessitant attention

- [ ] **Frontend - Système de personnalisation**
  - [ ] Implémenter localStorage pour préférences temporaires
  - [ ] Créer interface de personnalisation (toggle visibility)
  - [ ] Implémenter drag & drop pour réordonner (optionnel)
  - [ ] Ajouter bouton "Pin to top" pour favoris
  - [ ] Sauvegarder préférences dans DB (endpoint backend)

- [ ] **Backend - Préférences utilisateur**
  - [ ] Ajouter modèle Prisma `StatsPreferences` (ou JSON dans User)
  - [ ] Créer endpoints:
    - [ ] `GET /api/stats/preferences` - Récupérer préférences
    - [ ] `PUT /api/stats/preferences` - Sauvegarder préférences

- [ ] **Intégration et routing**
  - [ ] Remplacer `<SoonPage title="Statistiques" />` dans `App.jsx`
  - [ ] Ajouter route `/dashboard/statistics` dans `App.jsx`
  - [ ] Ajouter lien "Statistiques" dans navigation (DashboardLayout.tsx)

- [ ] **Tests et validation**
  - [ ] Tester avec données réelles
  - [ ] Vérifier responsive (mobile, tablette, desktop)
  - [ ] Vérifier performance (lazy loading, cache)
  - [ ] Vérifier états vides (pas de données)
  - [ ] Vérifier gestion d'erreurs

- [ ] **Polish et finitions**
  - [ ] Ajouter animations de transition
  - [ ] Ajouter tooltips informatifs
  - [ ] Améliorer UX (skeleton loaders, etc.)
  - [ ] Vérifier accessibilité

## 📁 Fichiers impactés

### Fichiers à créer

**Backend:**
- `backend/src/controllers/statsController.ts`
- `backend/src/routes/statsRoutes.ts`

**Frontend:**
- `src/components/pages/dashboard/statistics.tsx`
- `src/components/stats/StatCard.tsx`
- `src/components/stats/CustomizePanel.tsx`
- `src/components/stats/DateRangePicker.tsx`
- `src/components/stats/charts/LineChart.tsx`
- `src/components/stats/charts/BarChart.tsx`
- `src/components/stats/charts/PieChart.tsx`
- `src/components/stats/charts/AreaChart.tsx`
- `src/components/stats/charts/Heatmap.tsx`
- `src/components/stats/charts/ProgressBar.tsx`
- `src/hooks/useStats.ts`
- `src/hooks/useStatsPreferences.ts`

### Fichiers à modifier

**Backend:**
- `backend/src/index.ts` (ajouter routes stats)
- `backend/prisma/schema.prisma` (ajouter StatsPreferences si nécessaire)

**Frontend:**
- `src/App.jsx` (remplacer SoonPage par Statistics)
- `src/components/layout/DashboardLayout.tsx` (ajouter lien navigation)
- `src/types/index.ts` (ajouter types stats)

## 📝 Notes importantes

### Décisions techniques prises :
- Utiliser Recharts (déjà installé) pour les graphiques
- Suivre les patterns existants pour les hooks (useTrainingSessions, useMeasurements)
- Utiliser localStorage pour préférences temporaires, puis sync DB
- Design system: Violet #6366F1 (primary), responsive mobile-first

### Hypothèses faites :
- Les habitudes ne sont pas encore implémentées (backend), donc stats habitudes seront en "coming soon"
- Les stats seront calculées côté backend pour performance
- Les préférences peuvent être stockées en JSON dans User model (pas besoin de nouvelle table)

### Points à vérifier après déploiement :
- Performance avec beaucoup de données
- Cache des stats (SWR ou React Query si nécessaire)
- Export PDF/CSV (fonctionnalité future)

### TODO futurs :
- Export PDF/CSV des statistiques
- Comparaison avec période précédente (toggle)
- Notifications basées sur stats (ex: "Tu n'as pas fait de séance depuis 3 jours")
- Partage de stats (coach peut partager avec élève)

## 📊 Statut actuel
**Date** : 2 janvier 2025
**Progression** : 15 / 15 étapes terminées ✅
**Statut** : Implémentation complète terminée

### ✅ Réalisations
- Backend : Endpoints statistiques créés et intégrés
- Frontend : Hooks, composants et page principale créés
- Intégration : Routing et navigation mis à jour
- Personnalisation : Système de préférences implémenté (localStorage + API ready)

### 📝 Notes de déploiement
- Les préférences utilisateur sont sauvegardées dans localStorage (API endpoint optionnel pour sync DB)
- Tous les graphiques utilisent Recharts (déjà installé)
- La page s'adapte automatiquement selon le rôle (personnel/élève/coach)
- Les stats sont calculées côté backend pour performance
