# 🚀 DÉMARRAGE RAPIDE - APPLICATION AFRIONE

## ⚡ Installation en 5 minutes

### Étape 1 : Base de données (2 min)

```bash
# 1. Créer la base et toutes les tables
mysql -u root -p < backend/mysql/schema_complet.sql

# 2. Insérer les 8 produits
mysql -u root -p afrionedb < backend/mysql/seeds_products.sql
```

### Étape 2 : Backend (2 min)

```bash
cd backend

# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env
# Copiez ceci dans backend/.env :
```

Créez `backend/.env` :
```env
# Base de données
DB_NAME=afrionedb
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_PORT=3306

# JWT
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi

# Serveur
PORT=4000
NODE_ENV=development
```

```bash
# 3. Créer le compte admin
node scripts/createAdmin.js

# Vous verrez :
# ✅ Compte administrateur créé avec succès!
# Téléphone  : +225ADMIN
# Mot de passe : admin123

# 4. Démarrer le serveur
npm run dev
```

Vous devriez voir :
```
🚀 Serveur backend démarré sur http://localhost:4000
✓ Connexion à la base de données MySQL établie
⏰ Initialisation des CRON jobs...
✅ CRON job "Revenus quotidiens" programmé (00:01 UTC)
✅ CRON job "Reset streaks" programmé (00:05 UTC)
✅ CRON job "Expiration récompenses" programmé (toutes les heures)
✅ Tous les CRON jobs sont actifs
```

### Étape 3 : Frontend (1 min)

```bash
# Dans un autre terminal
cd ..  # Retour à la racine du projet
npm run dev
```

---

## ✅ VÉRIFICATION RAPIDE

### Tester l'API

```bash
# 1. Santé de l'API
curl http://localhost:4000/

# 2. Liste des produits
curl http://localhost:4000/api/products

# Vous devriez voir les 8 produits AFRIONE
```

### Tester l'inscription

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+22501234567",
    "password": "test123",
    "display_name": "Test User"
  }'
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Inscription réussie ! Vous avez reçu 300 FCFA de bonus.",
  "data": {
    "user": {
      "id": "...",
      "phone": "+22501234567",
      "balance": 300,
      "referral_code": "ABC123"
    },
    "token": "eyJhbGc..."
  }
}
```

### Se connecter en tant qu'admin

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+225ADMIN",
    "password": "admin123"
  }'
```

---

## 🎯 FONCTIONNALITÉS OPÉRATIONNELLES

### ✅ Backend 100% fonctionnel

1. **Authentification**
   - ✅ Inscription avec bonus 300 FCFA
   - ✅ Code de parrainage généré automatiquement
   - ✅ Système de parrainage 3 niveaux
   - ✅ Login
   - ✅ Profil

2. **Produits**
   - ✅ 8 produits AFRIONE (3K à 1M FCFA)
   - ✅ Liste des produits
   - ✅ Détails produit

3. **Achats**
   - ✅ Achat de produit
   - ✅ Vérification du solde
   - ✅ Création user_product actif
   - ✅ Distribution automatique des commissions

4. **Parrainage**
   - ✅ Code unique par utilisateur
   - ✅ Validation du code
   - ✅ Chaîne 3 niveaux (25%, 3%, 2%)
   - ✅ Statistiques d'équipe

5. **Transactions**
   - ✅ Historique complet
   - ✅ Statistiques
   - ✅ Filtres par type

6. **Retraits**
   - ✅ Demande de retrait
   - ✅ Frais 15% automatiques
   - ✅ Validation admin
   - ✅ Workflow complet

7. **Check-ins**
   - ✅ Pointage quotidien (50 FCFA)
   - ✅ Jours consécutifs
   - ✅ Reset automatique

8. **Admin**
   - ✅ Dashboard complet
   - ✅ Gestion utilisateurs
   - ✅ Validation retraits
   - ✅ Statistiques globales

9. **CRON Jobs** ⭐
   - ✅ Revenus quotidiens (00:01)
   - ✅ Reset check-ins (00:05)
   - ✅ Expiration récompenses (toutes les heures)

---

## 📊 COMPTES DE TEST

### Admin
```
Téléphone : +225ADMIN
Mot de passe : admin123
Rôle : Administrateur
```

### Utilisateur test (à créer)
```
# Via l'API ou le frontend
Téléphone : +22501234567
Mot de passe : test123
Balance initiale : 300 FCFA (bonus)
```

---

## 🧪 SCÉNARIO DE TEST COMPLET

### 1. Inscription utilisateur 1
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+225USER1",
    "password": "test123",
    "display_name": "User 1"
  }'
```

Sauvegardez le token et le referral_code.

### 2. Inscription utilisateur 2 avec code de parrainage
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+225USER2",
    "password": "test123",
    "display_name": "User 2",
    "referral_code": "CODE_DU_USER1"
  }'
```

User 1 devient le parrain de User 2.

### 3. Check-in quotidien
```bash
curl -X POST http://localhost:4000/api/checkins \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

+50 FCFA ajoutés.

### 4. Acheter un produit
```bash
curl -X POST http://localhost:4000/api/purchases \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1}'
```

Si User 2 achète :
- User 2 paie 3000 FCFA
- User 1 reçoit 750 FCFA (25% de commission niveau 1)

### 5. Vérifier le solde
```bash
curl http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 6. Demander un retrait (User 1)
```bash
# D'abord ajouter un compte bancaire
curl -X POST http://localhost:4000/api/bank-accounts \
  -H "Authorization: Bearer TOKEN_USER1" \
  -H "Content-Type: application/json" \
  -d '{
    "bank_name": "Banque du Cameroun",
    "account_holder": "User 1",
    "account_number": "1234567890"
  }'

# Puis demander le retrait
curl -X POST http://localhost:4000/api/withdrawals \
  -H "Authorization: Bearer TOKEN_USER1" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "bank_account_id": 1
  }'
```

### 7. Valider le retrait (Admin)
```bash
curl -X PUT http://localhost:4000/api/admin/withdrawals/1/approve \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

---

## 🎨 ENDPOINTS DISPONIBLES

### Authentification
```
POST   /api/auth/register     - Inscription
POST   /api/auth/login        - Connexion
GET    /api/auth/profile      - Profil utilisateur
```

### Produits
```
GET    /api/products          - Liste des produits
GET    /api/products/:id      - Détails d'un produit
```

### Achats
```
POST   /api/purchases         - Acheter un produit
GET    /api/purchases/my      - Mes achats
```

### Parrainage
```
GET    /api/referrals/my-team - Mon équipe
GET    /api/referrals/stats   - Mes statistiques
POST   /api/referrals/validate-code - Valider un code
```

### Transactions
```
GET    /api/transactions      - Mon historique
GET    /api/transactions/stats - Mes statistiques
```

### Comptes bancaires
```
GET    /api/bank-accounts     - Mes comptes
POST   /api/bank-accounts     - Ajouter un compte
DELETE /api/bank-accounts/:id - Supprimer
PUT    /api/bank-accounts/:id/set-default - Définir par défaut
```

### Retraits
```
GET    /api/withdrawals       - Mes demandes
POST   /api/withdrawals       - Nouvelle demande
PUT    /api/withdrawals/:id/cancel - Annuler
```

### Check-ins
```
POST   /api/checkins          - Faire un check-in
GET    /api/checkins/status   - Statut du jour
GET    /api/checkins/history  - Historique
```

### Produits utilisateur
```
GET    /api/user-products     - Mes produits actifs
GET    /api/user-products/stats - Statistiques
```

### Admin
```
GET    /api/admin/dashboard   - Dashboard
GET    /api/admin/users       - Liste utilisateurs
PUT    /api/admin/users/:id/balance - Modifier solde
GET    /api/admin/withdrawals - Retraits en attente
PUT    /api/admin/withdrawals/:id/approve - Approuver
PUT    /api/admin/withdrawals/:id/reject - Rejeter
GET    /api/admin/settings    - Paramètres
PUT    /api/admin/settings    - Modifier paramètre
```

---

## 🔧 COMMANDES UTILES

### Tester un CRON manuellement
```bash
cd backend
node cron/dailyRevenue.js
```

### Voir les logs MySQL
```sql
mysql -u root -p afrionedb

SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
SELECT * FROM products;
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
SELECT * FROM referrals;
```

### Réinitialiser la base
```bash
mysql -u root -p afrionedb < backend/mysql/schema_complet.sql
mysql -u root -p afrionedb < backend/mysql/seeds_products.sql
node backend/scripts/createAdmin.js
```

---

## 📚 DOCUMENTATION

Pour plus de détails, consultez :
1. **RECAP_GENERATION_FINALE.md** - Résumé complet
2. **GENERATION_COMPLETE.md** - Documentation technique
3. **GUIDE_SCHEMA_COMPLET.md** - Guide base de données

---

## 🎊 PRÊT À DÉVELOPPER !

✅ Backend opérationnel
✅ Base de données configurée
✅ 8 produits insérés
✅ Compte admin créé
✅ CRON jobs actifs
✅ API complète disponible

**Vous pouvez maintenant développer le frontend !** 🚀

