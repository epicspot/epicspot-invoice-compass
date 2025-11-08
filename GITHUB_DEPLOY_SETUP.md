# Configuration du déploiement automatique GitHub Actions

Ce guide explique comment configurer le déploiement automatique sur Time4VPS via GitHub Actions.

## 📋 Prérequis

- Un serveur Time4VPS configuré avec l'application EPICSPOT
- Un repository GitHub avec votre code
- Accès SSH au serveur

## 🔐 Configuration des secrets GitHub

### 1. Générer une clé SSH sur votre serveur

```bash
# Se connecter au serveur
ssh root@votre-ip-time4vps

# Générer une nouvelle clé SSH (si pas déjà fait)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
# Appuyez sur Entrée pour accepter l'emplacement par défaut
# Laissez le passphrase vide pour l'automatisation

# Ajouter la clé publique aux clés autorisées
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Afficher la clé privée (à copier)
cat ~/.ssh/github_deploy
```

### 2. Ajouter les secrets dans GitHub

Allez dans votre repository GitHub : **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez ces 4 secrets :

| Nom du secret | Valeur | Description |
|---------------|--------|-------------|
| `SERVER_HOST` | `123.45.67.89` | IP de votre serveur Time4VPS |
| `SERVER_USER` | `root` | Utilisateur SSH (généralement root) |
| `SERVER_PORT` | `22` | Port SSH (22 par défaut) |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH...` | Contenu de `~/.ssh/github_deploy` |

**Important** : Pour `SSH_PRIVATE_KEY`, copiez TOUT le contenu du fichier, y compris les lignes `-----BEGIN` et `-----END`.

## 🚀 Activation du déploiement automatique

### Méthode 1 : Push vers GitHub (automatique)

Une fois les secrets configurés, chaque push sur la branche `main` déclenchera automatiquement :

```bash
git add .
git commit -m "Mon changement"
git push origin main
# ✨ Le déploiement démarre automatiquement !
```

### Méthode 2 : Déploiement manuel via GitHub

1. Allez dans l'onglet **Actions** de votre repository
2. Sélectionnez le workflow **Deploy to Time4VPS**
3. Cliquez sur **Run workflow**

### Méthode 3 : Déploiement manuel sur le serveur

```bash
ssh root@votre-ip-time4vps
cd /var/www/epicspot
./deploy.sh
```

## 📊 Vérifier le déploiement

### Sur GitHub

1. Allez dans l'onglet **Actions**
2. Cliquez sur le dernier workflow exécuté
3. Consultez les logs de chaque étape

### Sur le serveur

```bash
# Vérifier le statut de l'application
ssh root@votre-ip-time4vps "pm2 status"

# Voir les logs
ssh root@votre-ip-time4vps "pm2 logs epicspot-backend"
```

## 🔧 Dépannage

### Erreur "Permission denied (publickey)"

```bash
# Sur le serveur, vérifier les permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_deploy

# Vérifier que la clé publique est bien dans authorized_keys
cat ~/.ssh/authorized_keys | grep github-actions-deploy
```

### Le déploiement échoue lors du build

Vérifiez que le serveur a suffisamment de RAM :
```bash
# Sur le serveur
free -h

# Si nécessaire, augmenter le swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### PM2 ne redémarre pas

```bash
# Sur le serveur
cd /var/www/epicspot/backend
pm2 delete epicspot-backend
pm2 start server.js --name epicspot-backend
pm2 save
pm2 startup
```

## 🎯 Workflow de développement recommandé

1. **Développement local** : Travaillez sur une branche feature
   ```bash
   git checkout -b feature/ma-nouvelle-feature
   # Faites vos modifications
   git commit -m "Ajout de ma feature"
   git push origin feature/ma-nouvelle-feature
   ```

2. **Pull Request** : Créez une PR vers `main` sur GitHub

3. **Review & Merge** : Une fois approuvée, mergez la PR

4. **Déploiement automatique** : Le merge vers `main` déclenche le déploiement

## 📝 Personnalisation du workflow

Éditez `.github/workflows/deploy.yml` pour :

- Ajouter des tests avant le déploiement
- Déployer sur plusieurs serveurs
- Ajouter des notifications (Slack, Discord, email)
- Créer des environnements de staging

Exemple avec tests :
```yaml
- name: Run tests
  run: npm test

- name: Run linting
  run: npm run lint
```

## 🔒 Sécurité

- ✅ Les secrets sont chiffrés dans GitHub
- ✅ La clé SSH est dédiée au déploiement uniquement
- ✅ Les logs ne montrent jamais les secrets
- ⚠️ Ne commitez JAMAIS les fichiers `.env` ou les clés privées

## 📞 Support

En cas de problème :
1. Consultez les logs GitHub Actions
2. Vérifiez les logs PM2 sur le serveur
3. Vérifiez la configuration nginx
4. Consultez les logs système : `journalctl -xe`

---

✅ **Votre déploiement continu est maintenant configuré !**
