# PLAN : Système d'emails de notifications

## 📋 Checklist (cocher au fur et à mesure)

- [ ] **Analyse du contexte** terminée
  - [ ] Fichiers environnants analysés
  - [ ] Conventions de code identifiées
  - [ ] Logique métier comprise

- [ ] **Plan validé** par l'utilisateur
  - [ ] Étapes détaillées approuvées
  - [ ] Fichiers impactés confirmés

- [ ] **Implémentation en cours**
  - [ ] Étape 1 : Créer service email réutilisable
  - [ ] Étape 2 : Créer templates HTML pour chaque type d'email
  - [ ] Étape 3 : Créer fonction utilitaire pour messages intelligents (goalMessages)
  - [ ] Étape 4 : Intégrer email au coach lors de l'utilisation d'un code d'invitation
  - [ ] Étape 5 : Intégrer email à l'élève/personnel lors de création de séance
  - [ ] Étape 6 : Intégrer email au coach lors de création de séance par son élève
  - [ ] Tous les fichiers modifiés
  - [ ] Tests écrits/validés

- [ ] **Validation fonctionnelle**
  - [ ] Fonctionnalité testée et validée
  - [ ] Tests unitaires/feature OK
  - [ ] Pas de régression détectée

- [ ] **Refactor (optionnel)**
  - [ ] Plan de refactor validé
  - [ ] Refactor appliqué
  - [ ] Tests après refactor OK

## 📁 Fichiers impactés
Liste complète des fichiers créés/modifiés :
- `backend/src/email/emailService.ts` (NOUVEAU - service réutilisable)
- `backend/src/email/emailUtils.ts` (NOUVEAU - fonctions utilitaires pour messages intelligents)
- `backend/src/email/templates/studentInvitationUsed.html` (NOUVEAU)
- `backend/src/email/templates/trainingSessionConfirmation.html` (NOUVEAU)
- `backend/src/email/templates/coachStudentSessionNotification.html` (NOUVEAU)
- `backend/src/controllers/authController.ts` (MODIFIÉ - ajout envoi email au coach)
- `backend/src/controllers/trainingController.ts` (MODIFIÉ - ajout envoi emails)

## 📝 Notes importantes
- Décisions techniques prises :
  - Réutiliser le système nodemailer existant
  - Réutiliser la fonction getEmailTemplate existante
  - Créer un service email réutilisable pour éviter la duplication
  - Réutiliser la logique de goalMessages depuis Home.tsx côté backend
- Hypothèses faites :
  - Les stats sont calculées de la même manière que dans getTrainingStats
  - L'email du coach doit être récupéré depuis la base de données
  - Les emails doivent être envoyés de manière asynchrone (ne pas bloquer la réponse)
- Points à vérifier après déploiement :
  - Les emails arrivent bien dans les boîtes de réception
  - Le formatage des templates est correct
  - Les stats affichées dans les emails sont correctes
- TODO futurs :

## 📊 Statut actuel
**Date** : 2025-01-15
**Progression** : 8 / 8 étapes terminées ✅
**Statut** : Implémentation terminée

## ✅ Résumé de l'implémentation

Tous les fichiers ont été créés et modifiés avec succès :

### Fichiers créés :
1. ✅ `backend/src/email/emailService.ts` - Service email réutilisable
2. ✅ `backend/src/email/emailUtils.ts` - Utilitaires (messages intelligents, formatage dates, stats)
3. ✅ `backend/src/email/templates/studentInvitationUsed.html` - Template pour coach (code utilisé)
4. ✅ `backend/src/email/templates/trainingSessionConfirmation.html` - Template pour élève/personnel
5. ✅ `backend/src/email/templates/coachStudentSessionNotification.html` - Template pour coach (séance élève)

### Fichiers modifiés :
1. ✅ `backend/src/controllers/authController.ts` - Intégration email code d'invitation utilisé
2. ✅ `backend/src/controllers/trainingController.ts` - Intégration emails séances

### Fonctionnalités implémentées :
1. ✅ Email au coach quand un élève utilise son code d'invitation
2. ✅ Email de confirmation à l'élève/personnel après création de séance (avec stats et messages intelligents)
3. ✅ Email au coach quand son élève crée une séance (avec stats de l'élève)
4. ✅ Envoi asynchrone (ne bloque pas l'UI)
5. ✅ Gestion des erreurs (loggées mais n'interrompent pas la requête)
6. ✅ Formatage des dates en français
7. ✅ Messages intelligents basés sur goalType et weightChange

### Notes techniques :
- Les emails sont envoyés de manière asynchrone (fire and forget)
- Les erreurs sont loggées mais n'interrompent pas les requêtes principales
- Les templates utilisent des placeholders simples `{{variable}}`
- Le système réutilise le transporter nodemailer existant

