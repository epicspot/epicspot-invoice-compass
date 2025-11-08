#!/bin/bash

# Script de déploiement local pour Time4VPS
# Usage: ./deploy.sh

set -e

echo "🚀 Démarrage du déploiement EPICSPOT..."

# Variables
APP_DIR="/var/www/epicspot"
BACKEND_DIR="$APP_DIR/backend"

# Mise à jour du code
echo "📥 Récupération des dernières modifications..."
cd $APP_DIR
git pull origin main

# Installation des dépendances backend
echo "📦 Installation des dépendances backend..."
cd $BACKEND_DIR
npm install --production

# Build et installation frontend
echo "🎨 Build du frontend..."
cd $APP_DIR
npm install
npm run build

# Redémarrage du backend
echo "🔄 Redémarrage du backend..."
pm2 restart epicspot-backend || pm2 start $BACKEND_DIR/server.js --name epicspot-backend
pm2 save

# Vérification
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Statut de l'application:"
pm2 status epicspot-backend

echo ""
echo "📝 Logs récents:"
pm2 logs epicspot-backend --lines 20 --nostream
