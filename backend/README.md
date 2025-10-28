# EPICSPOT Backend API

Backend Node.js + Fastify + SQLite pour l'application EPICSPOT_CONSULTING.

## 🚀 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Copier le fichier `.env.example` vers `.env`
```bash
cp .env.example .env
```

2. Modifier les variables d'environnement si nécessaire :
```env
PORT=3000
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

## 🗄️ Initialisation de la base de données

La base de données SQLite est automatiquement créée et initialisée au premier démarrage.

Pour réinitialiser la base :
```bash
rm epicspot.db
npm start
```

## 🏃 Démarrage

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 Endpoints API

### Health Check
- `GET /health` - Vérifier l'état du serveur

### Clients
- `GET /api/clients` - Liste tous les clients
- `GET /api/clients/:id` - Récupérer un client
- `POST /api/clients` - Créer un client
- `PUT /api/clients/:id` - Modifier un client
- `DELETE /api/clients/:id` - Supprimer un client

### Produits
- `GET /api/products` - Liste tous les produits
- `GET /api/products/:id` - Récupérer un produit
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Fournisseurs
- `GET /api/suppliers` - Liste tous les fournisseurs
- `GET /api/suppliers/:id` - Récupérer un fournisseur
- `POST /api/suppliers` - Créer un fournisseur
- `PUT /api/suppliers/:id` - Modifier un fournisseur
- `DELETE /api/suppliers/:id` - Supprimer un fournisseur

### Factures
- `GET /api/invoices` - Liste toutes les factures
- `GET /api/invoices/:id` - Récupérer une facture
- `POST /api/invoices` - Créer une facture
- `PUT /api/invoices/:id` - Modifier une facture
- `DELETE /api/invoices/:id` - Supprimer une facture

### Devis
- `GET /api/quotes` - Liste tous les devis
- `GET /api/quotes/:id` - Récupérer un devis
- `POST /api/quotes` - Créer un devis
- `PUT /api/quotes/:id` - Modifier un devis
- `DELETE /api/quotes/:id` - Supprimer un devis

### Bons de commande
- `GET /api/purchase-orders` - Liste tous les bons de commande
- `GET /api/purchase-orders/:id` - Récupérer un bon de commande
- `POST /api/purchase-orders` - Créer un bon de commande
- `PUT /api/purchase-orders/:id` - Modifier un bon de commande
- `DELETE /api/purchase-orders/:id` - Supprimer un bon de commande

### Utilisateurs
- `GET /api/users` - Liste tous les utilisateurs
- `GET /api/users/:id` - Récupérer un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Leads
- `GET /api/leads` - Liste tous les leads
- `GET /api/leads/:id` - Récupérer un lead
- `POST /api/leads` - Créer un lead
- `PUT /api/leads/:id` - Modifier un lead
- `DELETE /api/leads/:id` - Supprimer un lead

### Rappels
- `GET /api/reminders` - Liste tous les rappels
- `GET /api/reminders/:id` - Récupérer un rappel
- `POST /api/reminders` - Créer un rappel
- `PUT /api/reminders/:id` - Modifier un rappel
- `DELETE /api/reminders/:id` - Supprimer un rappel

### Caisses
- `GET /api/cash-registers` - Liste toutes les caisses
- `GET /api/cash-registers/:id` - Récupérer une caisse
- `POST /api/cash-registers` - Créer une caisse
- `PUT /api/cash-registers/:id` - Modifier une caisse
- `DELETE /api/cash-registers/:id` - Supprimer une caisse
- `GET /api/cash-registers/:registerId/transactions` - Transactions d'une caisse
- `POST /api/cash-registers/:registerId/transactions` - Ajouter une transaction

### Mouvements de stock
- `GET /api/stock-movements` - Liste tous les mouvements
- `GET /api/stock-movements/product/:productId` - Mouvements par produit
- `GET /api/stock-movements/site/:siteId` - Mouvements par site
- `GET /api/stock-movements/stock/:productId/:siteId` - Stock actuel
- `POST /api/stock-movements` - Créer un mouvement

### Entreprise
- `GET /api/company` - Récupérer les infos de l'entreprise
- `PUT /api/company` - Modifier les infos de l'entreprise

## 🗃️ Base de données

La base de données SQLite (`epicspot.db`) est créée automatiquement dans le dossier `backend/`.

### Structure des tables
- `clients` - Informations clients
- `products` - Catalogue produits
- `suppliers` - Fournisseurs
- `users` - Utilisateurs du système
- `quotes` - Devis
- `invoices` - Factures
- `purchase_orders` - Bons de commande
- `leads` - Prospects
- `reminders` - Rappels de paiement
- `cash_registers` - Caisses enregistreuses
- `cash_transactions` - Transactions de caisse
- `stock_movements` - Mouvements de stock
- `company_info` - Informations de l'entreprise

## 🔒 Sécurité

- CORS configuré pour accepter uniquement le frontend défini dans `.env`
- Validation des données entrantes
- Gestion d'erreurs complète
- Foreign keys activées sur SQLite

## 📦 Déploiement

### En local
1. Installer Node.js (v18+)
2. Suivre les étapes d'installation ci-dessus
3. Lancer le serveur

### Sur un serveur
1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Configurer le fichier `.env` avec les bonnes valeurs
4. Lancer avec PM2 ou un autre gestionnaire de processus :
```bash
npm install -g pm2
pm2 start server.js --name epicspot-backend
```

## 🧪 Tests

Pour tester les endpoints :
```bash
# Health check
curl http://localhost:3000/health

# Liste des clients
curl http://localhost:3000/api/clients

# Créer un client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","phone":"0123456789","email":"test@example.com"}'
```

## 📝 Notes

- Le backend fonctionne **100% hors ligne** une fois démarré
- Toutes les données sont stockées dans le fichier SQLite local
- Aucune connexion internet nécessaire pour le fonctionnement
- Pour sauvegarder les données, copier le fichier `epicspot.db`
