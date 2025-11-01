# Futuristia - Plateforme d'Investissement

Application web full-stack de gestion financière et d'investissement développée avec React, TypeScript, Node.js et PostgreSQL.

## 🚀 Fonctionnalités

### Frontend
- ✅ Authentification (inscription, connexion, déconnexion)
- ✅ Tableau de bord utilisateur avec solde en temps réel
- ✅ Catalogue de produits d'investissement
- ✅ Système d'achat de produits
- ✅ Rechargement de solde
- ✅ Retrait de fonds
- ✅ Gestion du profil utilisateur
- ✅ Système de notifications
- ✅ Interface moderne et responsive avec Tailwind CSS
- ✅ Animations fluides avec Framer Motion

### Backend
- ✅ API RESTful avec Express.js
- ✅ Authentification JWT sécurisée
- ✅ Base de données PostgreSQL/Supabase
- ✅ Gestion des utilisateurs (profiles)
- ✅ Gestion des produits
- ✅ Système d'achats avec transactions atomiques
- ✅ Gestion des notifications
- ✅ Validation des données
- ✅ Gestion des erreurs

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- PostgreSQL (v12 ou supérieur) ou compte Supabase
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le repository
```bash
git clone <repository-url>
cd project
```

### 2. Installer les dépendances

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. Configuration de la base de données

#### Créer la base de données
```bash
psql -U postgres
CREATE DATABASE futuristia;
```

#### Exécuter les migrations
```bash
psql -U postgres -d futuristia -f backend/supabase/schema.sql
psql -U postgres -d futuristia -f backend/supabase/seeds.sql
```

### 4. Configuration des variables d'environnement

#### Frontend (.env)
Créez un fichier `.env` à la racine du projet :
```env
VITE_API_URL=http://localhost:4000/api
```

#### Backend (backend/.env)
Créez un fichier `backend/.env` :
```env
DATABASE_URL=postgresql://username:password@localhost:5432/futuristia
JWT_SECRET=votre-secret-jwt-super-securise
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
```

**Important :** Remplacez `username` et `password` par vos identifiants PostgreSQL.

## 🚀 Démarrage

### Mode développement

#### 1. Démarrer le backend
```bash
cd backend
npm run dev
```
Le serveur backend sera accessible sur `http://localhost:4000`

#### 2. Démarrer le frontend (dans un nouveau terminal)
```bash
npm run dev
```
L'application frontend sera accessible sur `http://localhost:5173`

## 📚 API Documentation

Une fois le backend démarré, la documentation Swagger est disponible sur :
```
http://localhost:4000/api-docs
```

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Obtenir le profil (authentifié)

#### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit (admin)

#### Achats
- `POST /api/purchases` - Effectuer un achat (authentifié)
- `GET /api/purchases` - Historique des achats (authentifié)

#### Profil
- `PUT /api/profile` - Mettre à jour le profil (authentifié)
- `POST /api/profile/recharge` - Recharger le solde (authentifié)
- `POST /api/profile/withdraw` - Retirer des fonds (authentifié)

#### Notifications
- `GET /api/notifications` - Liste des notifications (authentifié)
- `PUT /api/notifications/:id/read` - Marquer comme lue (authentifié)
- `PUT /api/notifications/read-all` - Tout marquer comme lu (authentifié)

## 🔒 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Après connexion, incluez le token dans l'en-tête Authorization :
```
Authorization: Bearer <votre-token>
```

## 🗄️ Structure de la base de données

### Tables principales

- **profiles** - Informations utilisateurs (id, phone, password, balance, role)
- **products** - Produits d'investissement (id, name, price, duration, daily_revenue, total_revenue)
- **purchases** - Historique des achats (id, user_id, product_id, price, created_at)
- **notifications** - Notifications utilisateurs (id, user_id, title, body, is_read)

## 🏗️ Structure du projet

```
project/
├── src/                      # Code source frontend
│   ├── components/          # Composants React
│   ├── services/            # Services API
│   └── App.tsx              # Composant principal
├── backend/                 # Code source backend
│   ├── config/              # Configuration (DB, JWT)
│   ├── controllers/         # Contrôleurs
│   ├── routes/              # Routes API
│   ├── middlewares/         # Middlewares (auth, etc.)
│   ├── src/                 # Point d'entrée
│   └── supabase/            # Schémas SQL
└── README.md                # Ce fichier
```

## 🧪 Test de l'application

### Créer un compte utilisateur de test

Utilisez l'API ou l'interface pour créer un compte :
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+22513739186",
    "password": "virtuix123",
    "display_name": "Utilisateur Test"
  }'
```

### Tester un achat

1. Connectez-vous avec votre compte
2. Rechargez votre solde
3. Achetez un produit depuis l'onglet "Produits"

## 📦 Build pour production

### Frontend
```bash
npm run build
```
Les fichiers seront générés dans `dist/`

### Backend
```bash
cd backend
npm start
```

## 🛡️ Sécurité

- Les mots de passe sont hashés avec bcrypt
- Authentification JWT avec expiration
- Validation des données côté serveur
- Transactions SQL atomiques pour les achats
- Protection contre les injections SQL avec paramètres préparés

## 📝 Notes importantes

1. **Montant minimum de recharge :** 2 000 FCFA
2. **Montant minimum de retrait :** 1 000 FCFA
3. **Frais de retrait :** 15% du montant
4. **Transactions :** Toutes les opérations financières sont atomiques

## 🔧 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez les identifiants dans le fichier `.env`
- Assurez-vous que la base de données `futuristia` existe

### Erreur CORS
- Vérifiez que le backend est configuré pour accepter les requêtes du frontend
- Le middleware CORS est déjà configuré dans `backend/src/index.js`

### Token invalide
- Assurez-vous que le JWT_SECRET est identique entre les requêtes
- Vérifiez que le token n'a pas expiré (durée par défaut : 7 jours)

## 👨‍💻 Développement

### Technologies utilisées

**Frontend :**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Hot Toast
- Lucide Icons

**Backend :**
- Node.js
- Express.js
- PostgreSQL
- JWT
- Bcrypt
- Swagger UI

## 📄 Licence

Ce projet est sous licence privée.

## 🤝 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository.

