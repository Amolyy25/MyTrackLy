# Troubleshooting - Erreur de timeout SMTP

## Problème
Erreur `ETIMEDOUT` lors de l'envoi d'emails en production :
```
Error: Connection timeout
code: 'ETIMEDOUT',
command: 'CONN'
```

## Solutions appliquées

### 1. Timeouts augmentés
- `connectionTimeout: 30000` (30 secondes au lieu de 5 par défaut)
- `greetingTimeout: 30000` (30 secondes)
- `socketTimeout: 30000` (30 secondes)

### 2. Pool de connexions
- `pool: true` : Réutilise les connexions SMTP
- `maxConnections: 5` : Limite les connexions simultanées
- `maxMessages: 100` : Nombre max de messages par connexion

### 3. Gestion d'erreur améliorée
- Vérification des variables d'environnement
- Logging détaillé des erreurs pour diagnostic

## Vérifications à faire

### 1. Variables d'environnement
Vérifier que ces variables sont bien définies en production :
```env
EMAIL_SENDER=votre-email@votre-domaine.com
EMAIL_PASSWORD=votre-mot-de-passe
```

### 2. Configuration réseau
- Vérifier que le port 465 (SSL) n'est pas bloqué par un firewall
- Vérifier que le serveur peut accéder à `erable.o2switch.net:465`
- Tester la connexion depuis le serveur de production :
  ```bash
  telnet erable.o2switch.net 465
  # ou
  nc -zv erable.o2switch.net 465
  ```

### 3. Alternative : Port 587 (TLS)
Si le port 465 ne fonctionne pas, essayer le port 587 avec TLS :
```typescript
transporter = nodemailer.createTransport({
  host: "erable.o2switch.net",
  port: 587,
  secure: false, // false pour TLS
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // ... autres options
});
```

### 4. Vérifier les logs
Les logs détaillés incluent maintenant :
- Code d'erreur
- Message d'erreur
- Commande qui a échoué
- Réponse du serveur (si disponible)

## Solutions alternatives

### Option 1 : Service d'email tiers
Si le problème persiste, considérer un service d'email tiers :
- **SendGrid** : `@sendgrid/mail`
- **Mailgun** : `mailgun.js`
- **AWS SES** : `@aws-sdk/client-ses`
- **Resend** : `resend`

### Option 2 : Queue d'emails
Pour éviter les timeouts, utiliser une queue d'emails :
- **Bull** avec Redis
- **BullMQ**
- Permet de retry automatique en cas d'échec

### Option 3 : Vérifier avec O2Switch
Contacter le support O2Switch pour :
- Vérifier que le compte email est actif
- Vérifier les restrictions IP
- Vérifier les limites de débit

## Test de connexion

Pour tester la connexion SMTP depuis le serveur :

```bash
# Installer telnet ou nc
# Puis tester :
telnet erable.o2switch.net 465
# ou
nc -zv erable.o2switch.net 465
```

Si la connexion échoue, c'est un problème réseau/firewall.

## Monitoring

Surveiller les logs pour :
- Fréquence des timeouts
- Heures où ça se produit
- Patterns (toujours le même destinataire ?)

Si les timeouts sont fréquents, considérer :
1. Augmenter encore les timeouts
2. Implémenter un système de retry
3. Passer à un service d'email plus fiable

