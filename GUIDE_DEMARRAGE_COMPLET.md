# 🚀 GUIDE DE DÉMARRAGE COMPLET - AFRIONE PROJECT

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Installation MySQL](#installation-mysql)
3. [Configuration Backend](#configuration-backend)
4. [Configuration Frontend](#configuration-frontend)
5. [Démarrage de l'application](#démarrage-de-lapplication)
6. [Création du compte admin](#création-du-compte-admin)
7. [Tests de vérification](#tests-de-vérification)
8. [Résolution des problèmes](#résolution-des-problèmes)

---

## 🔧 PRÉREQUIS

### Logiciels nécessaires

- ✅ **Node.js** (v18 ou supérieur) - [Télécharger](https://nodejs.org/)
- ✅ **MySQL** (v8 ou supérieur) - [Télécharger](https://dev.mysql.com/downloads/mysql/)
- ✅ **Git** (optionnel) - [Télécharger](https://git-scm.com/)
- ✅ Un éditeur de code (VS Code recommandé)
- ✅ Un client MySQL (MySQL Workbench, HeidiSQL, ou ligne de commande)

### Vérifier les installations

```bash
# Vérifier Node.js
node --version
# Devrait afficher v18.x.x ou supérieur

# Vérifier npm
npm --version
# Devrait afficher 9.x.x ou supérieur

# Vérifier MySQL
mysql --version
# Devrait afficher mysql Ver 8.x.x
```

---

## 🗄️ INSTALLATION MYSQL

### 1. Installation (Windows)

1. Télécharger MySQL Installer depuis [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Lancer l'installateur
3. Choisir "Developer Default" ou "Server only"
4. Suivre les instructions
5. **Définir un mot de passe root** (⚠️ IMPORTANT : notez-le bien !)
6. Terminer l'installation

### 2. Création de la base de données

```bash
# Se connecter à MySQL
mysql -u root -p
# Entrer votre mot de passe root
```

```sql
-- Créer la base de données
CREATE DATABASE afrionedb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Vérifier
SHOW DATABASES;

-- Quitter
EXIT;
```

### 3. Créer le schéma

```bash
# Depuis le dossier du projet
mysql -u root -p afrionedb < backend/mysql/schema_complet.sql
```

### 4. Insérer les produits de test

```bash
mysql -u root -p afrionedb < backend/mysql/seeds_products.sql
```

### 5. Vérification

```bash
mysql -u root -p afrionedb
```

```sql
-- Vérifier les tables
SHOW TABLES;

-- Devrait afficher :
-- admin_logs, bank_accounts, daily_checkins, notifications,
-- products, profiles, purchases, referrals, rewards,
-- support_messages, system_settings, team_commissions,
-- transactions, user_products, withdrawal_requests

-- Vérifier les produits
SELECT id, name, price, daily_revenue FROM products;

-- Devrait afficher les 8 produits AFRIONE

EXIT;
```

---

## ⚙️ CONFIGURATION BACKEND

### 1. Aller dans le dossier backend

```bash
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

Si vous rencontrez des erreurs, essayez :
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 3. Créer le fichier `.env`

Créez le fichier `backend/.env` avec ce contenu :

```env
# Configuration de la base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=afrionedb
DB_PORT=3306

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise_changez_moi_en_production

# Configuration du serveur
PORT=4000
NODE_ENV=development

# Bonus d'inscription (en FCFA)
SIGNUP_BONUS=300

# Récompense check-in quotidien (en FCFA)
DAILY_CHECKIN_REWARD=50
```

**⚠️ IMPORTANT :** Remplacez :
- `votre_mot_de_passe_mysql` par votre mot de passe MySQL root
- `votre_secret_jwt_tres_long_et_securise_changez_moi_en_production` par une chaîne aléatoire longue

### 4. Tester le démarrage du backend

```bash
npm run dev
```

**Vous devriez voir :**
```
🚀 Serveur backend démarré sur http://localhost:4000
✓ Connexion à la base de données MySQL établie
⏰ Initialisation des CRON jobs...
✅ CRON job "Revenus quotidiens" programmé (00:01 UTC)
✅ CRON job "Reset streaks" programmé (00:05 UTC)
✅ CRON job "Expiration récompenses" programmé (toutes les heures)
✅ Tous les CRON jobs sont actifs
```

✅ **Backend configuré avec succès !**

---

## 🎨 CONFIGURATION FRONTEND

### 1. Retourner à la racine du projet

```bash
cd ..
# Vous êtes maintenant dans le dossier racine (où se trouve package.json)
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Créer le fichier `.env`

Créez le fichier `.env` à la racine du projet avec ce contenu :

```env
VITE_API_URL=http://localhost:4000/api
```

### 4. Tester le démarrage du frontend

```bash
npm run dev
```

**Vous devriez voir :**
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ **Frontend configuré avec succès !**

---

## 🏃 DÉMARRAGE DE L'APPLICATION

### Option 1 : Deux terminaux séparés (Recommandé)

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

### Option 2 : Script PowerShell (Windows)

Créez un fichier `start-all.ps1` :
```powershell
# Démarrer le backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Attendre 3 secondes
Start-Sleep -Seconds 3

# Démarrer le frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

Exécutez :
```powershell
.\start-all.ps1
```

### Option 3 : Script Bash (Linux/Mac)

Créez un fichier `start-all.sh` :
```bash
#!/bin/bash

# Démarrer le backend en arrière-plan
cd backend && npm run dev &

# Attendre 3 secondes
sleep 3

# Démarrer le frontend
cd .. && npm run dev
```

Rendez-le exécutable et lancez-le :
```bash
chmod +x start-all.sh
./start-all.sh
```

---

## 👤 CRÉATION DU COMPTE ADMIN

### Méthode 1 : Script Node.js (Recommandé)

```bash
cd backend
npm run create-admin
```

Suivez les instructions :
```
--- Création d'un compte administrateur ---
Entrez le numéro de téléphone de l'administrateur (ex: +2376XXXXXXXX) : +237ADMIN001
Entrez le mot de passe de l'administrateur : admin123456
✅ Compte administrateur créé/mis à jour avec le numéro : +237ADMIN001
```

### Méthode 2 : SQL direct

```bash
mysql -u root -p afrionedb
```

```sql
-- Remplacez les valeurs par celles de votre choix
INSERT INTO profiles (phone, display_name, password, balance, role, referral_code)
VALUES (
  '+237ADMIN001',
  'Administrateur',
  '$2a$10$[hash_bcrypt_du_mot_de_passe]',  -- Utilisez bcrypt pour hasher
  0,
  'admin',
  'ADMIN1'
);
```

**Note :** Pour hasher le mot de passe avec bcrypt, utilisez le script Node.js (Méthode 1).

### Vérification

```bash
mysql -u root -p afrionedb
```

```sql
SELECT id, phone, display_name, role FROM profiles WHERE role = 'admin';
```

Vous devriez voir votre compte admin.

---

## 🧪 TESTS DE VÉRIFICATION

### 1. Test Backend - API

```bash
# Tester l'endpoint des produits
curl http://localhost:4000/api/products
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "AFRIONE 001",
      "price": 3000,
      ...
    },
    ...
  ]
}
```

### 2. Test Frontend - Interface

1. Ouvrir le navigateur : http://localhost:5173
2. ✅ La page de connexion s'affiche
3. Cliquer sur "S'inscrire"
4. Créer un compte de test
5. ✅ Redirection vers la page d'accueil
6. ✅ Solde de 300 FCFA (bonus d'inscription)
7. Aller sur "Produits"
8. ✅ Les 8 produits AFRIONE s'affichent

### 3. Test Complet - Parcours utilisateur

#### a) Inscription
1. Page d'accueil → "S'inscrire"
2. Téléphone : `+2250777123456`
3. Mot de passe : `test123`
4. Soumettre
5. ✅ Compte créé, solde : 300 FCFA

#### b) Check-in
1. Aller sur "Pointage"
2. Cliquer sur "Effectuer le check-in"
3. ✅ +50 FCFA, solde : 350 FCFA

#### c) Recharge
1. Aller sur "Recharger"
2. Montant : 5000
3. Soumettre
4. ✅ Solde : 5350 FCFA

#### d) Achat de produit
1. Aller sur "Produits"
2. Sélectionner "AFRIONE 001" (3000 FCFA)
3. Confirmer l'achat
4. ✅ Solde : 2350 FCFA
5. ✅ Notification d'achat

#### e) Parrainage
1. Aller sur "Équipe"
2. ✅ Code de parrainage affiché (ex: `A1B2C3`)
3. Copier le lien de parrainage
4. S'inscrire avec un nouveau compte en utilisant ce code
5. ✅ Le filleul apparaît dans la liste
6. Le filleul achète un produit
7. ✅ Commission de 25% créditée au parrain

#### f) Retrait
1. Aller sur "Comptes bancaires"
2. Ajouter un compte :
   - Nom de la banque : Ecobank
   - Numéro de compte : 1234567890
   - Titulaire : Votre Nom
3. ✅ Compte ajouté
4. Aller sur "Retrait"
5. Sélectionner le compte
6. Montant : 1000
7. Soumettre
8. ✅ Demande créée (status: pending)
9. ✅ Notification "Demande en cours"

---

## ❗ RÉSOLUTION DES PROBLÈMES

### Problème : Backend ne démarre pas

**Erreur : `Error: connect ECONNREFUSED`**

✅ **Solution :** MySQL n'est pas démarré
```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

**Erreur : `ER_ACCESS_DENIED_ERROR`**

✅ **Solution :** Mauvais mot de passe dans `backend/.env`
- Vérifiez `DB_PASSWORD` dans `backend/.env`

**Erreur : `ER_BAD_DB_ERROR: Unknown database`**

✅ **Solution :** Base de données non créée
```bash
mysql -u root -p
CREATE DATABASE afrionedb;
EXIT;
```

### Problème : Produits ne chargent pas

**Erreur : `[]` (liste vide)**

✅ **Solution :** Produits non insérés
```bash
mysql -u root -p afrionedb < backend/mysql/seeds_products.sql
```

### Problème : Frontend ne se connecte pas au backend

**Erreur : `CORS error` ou `Network error`**

✅ **Solution :** Vérifier l'URL de l'API
- Fichier `.env` à la racine :
  ```env
  VITE_API_URL=http://localhost:4000/api
  ```
- Redémarrer le frontend après modification

**✅ Solution 2 :** Vérifier CORS dans `backend/src/index.js` :
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Problème : JWT token invalide

**Erreur : `Token invalide ou expiré`**

✅ **Solution :** Déconnexion et reconnexion
- Cliquer sur "Profil" → "Déconnexion"
- Se reconnecter

### Problème : `npm install` échoue

**Erreur : `ETARGET` ou `ERESOLVE`**

✅ **Solution :**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

---

## 📊 RÉSUMÉ DES PORTS

- **Backend** : http://localhost:4000
- **Frontend** : http://localhost:5173
- **MySQL** : localhost:3306

---

## 🎉 FÉLICITATIONS !

Si vous êtes arrivé ici sans erreur, votre application est **100% opérationnelle** !

### Prochaines étapes :

1. ✅ Tester toutes les fonctionnalités
2. ✅ Créer des utilisateurs de test
3. ✅ Tester le système de parrainage
4. ✅ Accéder au dashboard admin (à venir)
5. ✅ Personnaliser l'application selon vos besoins

**Bon développement ! 🚀**

