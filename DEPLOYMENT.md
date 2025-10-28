# 🚀 Guide de déploiement EPICSPOT

Ce guide explique comment déployer et utiliser l'application EPICSPOT en mode local avec backend Node.js séparé.

## 📋 Prérequis

- **Node.js** v18 ou supérieur ([Télécharger](https://nodejs.org/))
- **Git** (optionnel, pour cloner le projet)
- Un navigateur web moderne

## 🏗️ Architecture

```
epicspot/
├── backend/          # API Node.js + Fastify + SQLite
│   ├── server.js
│   ├── database.js
│   ├── routes/
│   └── epicspot.db   # Base de données (créée auto)
└── src/              # Frontend React
    └── ...
```

## 📦 Installation

### Étape 1 : Exporter le projet

1. **Via GitHub** (recommandé) :
   - Cliquez sur le bouton **GitHub** en haut à droite de Lovable
   - Connectez votre compte GitHub
   - Créez un nouveau repository
   - Clonez le projet sur votre machine :
   ```bash
   git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
   cd VOTRE_REPO
   ```

2. **Via téléchargement** :
   - Téléchargez tous les fichiers du projet
   - Extrayez-les dans un dossier local

### Étape 2 : Installer les dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ..  # Retour à la racine
npm install
```

## ⚙️ Configuration

### Backend

1. Créer le fichier `.env` dans le dossier `backend/` :
```bash
cd backend
cp .env.example .env
```

2. Modifier `.env` si nécessaire :
```env
PORT=3000
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

### Frontend

Créer le fichier `src/config/api.ts` :
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

## 🚀 Démarrage

### Option 1 : Tout démarrer ensemble (recommandé)

Créer un script `start.sh` à la racine :
```bash
#!/bin/bash
# Démarrer le backend
cd backend && npm start &
BACKEND_PID=$!

# Démarrer le frontend
cd .. && npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:8080"

wait
```

Rendre le script exécutable et le lancer :
```bash
chmod +x start.sh
./start.sh
```

### Option 2 : Démarrage séparé

**Terminal 1 - Backend :**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

## 🌐 Accès à l'application

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:3000
- **Health check** : http://localhost:3000/health

## 💾 Sauvegarde des données

Les données sont stockées dans `backend/epicspot.db`.

### Sauvegarder
```bash
cp backend/epicspot.db backend/epicspot.backup.db
```

### Restaurer
```bash
cp backend/epicspot.backup.db backend/epicspot.db
```

### Export automatique
Créer un script `backup.sh` :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp backend/epicspot.db "backups/epicspot_$DATE.db"
echo "Sauvegarde créée : epicspot_$DATE.db"
```

## 🔄 Migration depuis localStorage

Si vous avez des données existantes dans localStorage, créer un script de migration :

1. Ouvrir la console du navigateur (F12)
2. Exécuter :
```javascript
// Exporter toutes les données localStorage
const data = {
  clients: JSON.parse(localStorage.getItem('clients') || '[]'),
  products: JSON.parse(localStorage.getItem('products') || '[]'),
  invoices: JSON.parse(localStorage.getItem('invoices') || '[]'),
  // ... autres collections
};

// Télécharger en JSON
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'epicspot-data.json';
a.click();
```

3. Utiliser un script Node.js pour importer dans SQLite (à créer selon besoins)

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier le port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Tuer le processus si nécessaire
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows
```

### Erreurs CORS
Vérifier que `FRONTEND_URL` dans `.env` correspond bien à l'URL du frontend.

### Base de données corrompue
```bash
rm backend/epicspot.db
cd backend && npm start  # Recrée la DB
```

### Port déjà utilisé
Modifier `PORT` dans `backend/.env` et `vite.config.ts` si nécessaire.

## 📱 Utilisation hors ligne

1. **Premier chargement** : Nécessite une connexion pour charger les assets
2. **Utilisation** : 100% hors ligne après le premier chargement
3. **Backend** : Fonctionne entièrement en local sans internet
4. **Données** : Stockées localement dans SQLite

## 🔐 Sécurité

Pour un environnement de production :

1. **Changer les secrets** :
   - Ajouter JWT pour authentification
   - Configurer HTTPS
   - Limiter CORS aux domaines autorisés

2. **Sécuriser la base** :
   - Mettre des permissions restrictives sur `epicspot.db`
   - Sauvegardes régulières
   - Chiffrement du fichier DB

3. **Variables d'environnement** :
   - Ne jamais commiter `.env`
   - Utiliser des secrets forts

## 📊 Monitoring

### Logs
```bash
# Backend logs
tail -f backend/logs/server.log  # Si configuré

# PM2 (si utilisé)
pm2 logs epicspot-backend
```

### Métriques
- Taille de la DB : `ls -lh backend/epicspot.db`
- Nombre de requêtes : Consulter les logs Fastify

## 🎯 Prochaines étapes

- [ ] Implémenter l'authentification utilisateur
- [ ] Ajouter des migrations de base de données
- [ ] Créer des tests automatisés
- [ ] Configurer un reverse proxy (nginx)
- [ ] Déployer sur un serveur distant

## 📞 Support

Pour toute question, consulter :
- README du backend : `backend/README.md`
- Documentation Fastify : https://www.fastify.io/
- Documentation SQLite : https://www.sqlite.org/

---

✅ **Votre application fonctionne maintenant 100% hors ligne avec un backend robuste et maintenable !**
