# Guide : Résoudre les timeouts SMTP sur Railway

## 🎯 Problème

Les emails timeout sur Railway mais fonctionnent en local :

```
errorCode: "ETIMEDOUT"
errorMessage: "Connection timeout"
command: "CONN"
```

## 🔍 Causes possibles

1. **Port 465 (SSL) bloqué** : Railway peut bloquer les connexions SSL sortantes
2. **Restrictions réseau** : Les plateformes cloud ont souvent des restrictions sur les ports SMTP
3. **Timeouts trop courts** : Les connexions sont plus lentes depuis Railway
4. **Pool de connexions** : Les connexions persistantes peuvent causer des problèmes

## ✅ Solutions appliquées

### 1. Détection automatique de l'environnement

Le code détecte maintenant automatiquement si on est sur Railway :

- **Production (Railway)** : Port 587 avec TLS
- **Développement (local)** : Port 465 avec SSL

### 2. Configuration adaptée pour Railway

```typescript
// En production (Railway)
port: 587;
secure: false; // TLS au lieu de SSL
requireTLS: true;
pool: false; // Pas de pool pour éviter les problèmes
```

### 3. Timeouts augmentés

- **Production** : 60 secondes (au lieu de 30)
- **Développement** : 30 secondes

### 4. Retry automatique

- 3 tentatives maximum
- Délai exponentiel entre les tentatives (2s, 4s, 8s)
- Retry uniquement pour les timeouts (`ETIMEDOUT`, `ECONNRESET`)

## 📋 Vérifications à faire sur Railway

### 1. Variables d'environnement

Vérifier que ces variables sont bien configurées dans Railway :

```
EMAIL_SENDER=votre-email@votre-domaine.com
EMAIL_PASSWORD=votre-mot-de-passe
NODE_ENV=production
```

**Note** : `NODE_ENV=production` est important pour que le code utilise le port 587.

### 2. Tester la connexion

Après déploiement, vérifier les logs Railway. Vous devriez voir :

- ✅ "Email envoyé avec succès" si ça fonctionne
- ❌ Les détails de l'erreur si ça échoue encore

### 3. Vérifier les logs détaillés

Les logs incluent maintenant :

- `environment` : dev ou production
- `railwayEnv` : si Railway est détecté
- `errorCode` : code d'erreur exact
- `errorMessage` : message détaillé

## 🔧 Si ça ne fonctionne toujours pas

### Option 1 : Vérifier avec O2Switch

Contacter le support O2Switch pour :

- Vérifier que le compte email est actif
- Vérifier les restrictions IP (Railway peut avoir des IPs dynamiques)
- Demander la whitelist des IPs Railway si nécessaire

### Option 2 : Utiliser un service email cloud

Si le problème persiste, migrer vers un service adapté aux plateformes cloud :

#### **Resend** (Recommandé - Simple et moderne)

```bash
pnpm add resend
```

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "MyTrackLy <noreply@votre-domaine.com>",
  to: to,
  subject: subject,
  html: htmlContent,
});
```

**Avantages** :

- ✅ API moderne et simple
- ✅ Gratuit jusqu'à 3000 emails/mois
- ✅ Pas de problèmes de ports/firewall
- ✅ Très rapide

#### **SendGrid**

```bash
pnpm add @sendgrid/mail
```

#### **Mailgun**

```bash
pnpm add mailgun.js
```

### Option 3 : Queue d'emails avec retry

Pour une solution plus robuste, utiliser une queue :

- **Bull** avec Redis (Railway peut héberger Redis)
- Retry automatique
- Gestion des échecs
- Monitoring

## 📊 Monitoring

Surveiller les logs Railway pour :

- ✅ Taux de succès des emails
- ⏱️ Temps de réponse
- 🔄 Nombre de retries nécessaires
- ❌ Types d'erreurs (timeout, auth, etc.)

## 🎯 Résumé des changements

1. ✅ Détection automatique Railway vs local
2. ✅ Port 587 (TLS) en production au lieu de 465 (SSL)
3. ✅ Timeouts augmentés à 60s en production
4. ✅ Retry automatique avec backoff exponentiel
5. ✅ Logs détaillés pour diagnostic
6. ✅ Pas de pool de connexions en production

## ✅ Checklist

- [ ] Variables d'environnement configurées sur Railway
- [ ] `NODE_ENV=production` défini sur Railway
- [ ] Code déployé avec les nouvelles modifications
- [ ] Test d'envoi d'email effectué
- [ ] Logs vérifiés (succès ou détails de l'erreur)
- [ ] Si échec : contacter O2Switch ou migrer vers Resend/SendGrid

## 🚀 Prochaines étapes

1. **Déployer** les modifications
2. **Tester** l'envoi d'email depuis Railway
3. **Vérifier les logs** pour confirmer que ça fonctionne
4. **Si échec** : considérer la migration vers Resend (plus simple et fiable)
