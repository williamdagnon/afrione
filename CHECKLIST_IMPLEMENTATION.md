# ✅ CHECKLIST D'IMPLÉMENTATION - AFRIONE

## 📋 PHASE 1 : INSTALLATION DE LA BASE DE DONNÉES

### Étape 1.1 : Préparation
- [ ] MySQL installé et fonctionnel
- [ ] Accès root ou utilisateur avec privilèges
- [ ] Fichier `backend/mysql/schema_complet.sql` disponible

### Étape 1.2 : Création de la base
```bash
mysql -u root -p < backend/mysql/schema_complet.sql
```
- [ ] Commande exécutée sans erreur
- [ ] Base `afrionedb` créée

### Étape 1.3 : Vérification
```bash
mysql -u root -p afrionedb -e "SHOW TABLES;"
```
- [ ] 15 tables affichées :
  - [ ] profiles
  - [ ] products
  - [ ] purchases
  - [ ] user_products
  - [ ] transactions
  - [ ] referrals
  - [ ] team_commissions
  - [ ] bank_accounts
  - [ ] withdrawal_requests
  - [ ] daily_checkins
  - [ ] rewards
  - [ ] notifications
  - [ ] system_settings
  - [ ] admin_logs
  - [ ] support_messages

### Étape 1.4 : Vérification des paramètres
```bash
mysql -u root -p afrionedb -e "SELECT * FROM system_settings;"
```
- [ ] 10 paramètres affichés
- [ ] Valeurs par défaut correctes

### Étape 1.5 : Configuration backend
- [ ] Fichier `backend/.env` modifié avec :
  ```env
  DB_NAME=afrionedb
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=votre_mot_de_passe
  DB_PORT=3306
  ```
- [ ] Connexion testée et fonctionnelle

---

## 📋 PHASE 2 : ADAPTATION DU BACKEND

### Étape 2.1 : Contrôleurs existants (MySQL)
- [ ] `backend/controllers/authController.js` ✅ DÉJÀ FAIT
- [ ] `backend/controllers/productController.js` - À adapter
- [ ] `backend/controllers/purchaseController.js` - À adapter
- [ ] `backend/controllers/profileController.js` - À adapter
- [ ] `backend/controllers/notificationController.js` - À adapter

### Étape 2.2 : Nouveaux contrôleurs à créer
- [ ] `backend/controllers/transactionController.js`
  - [ ] GET `/api/transactions` - Historique
  - [ ] GET `/api/transactions/:id` - Détail
  
- [ ] `backend/controllers/referralController.js`
  - [ ] GET `/api/referrals/my-team` - Mon équipe
  - [ ] GET `/api/referrals/stats` - Statistiques
  - [ ] POST `/api/referrals/validate-code` - Valider code
  
- [ ] `backend/controllers/teamCommissionController.js`
  - [ ] GET `/api/commissions` - Mes commissions
  - [ ] GET `/api/commissions/stats` - Stats
  
- [ ] `backend/controllers/bankAccountController.js`
  - [ ] GET `/api/bank-accounts` - Liste
  - [ ] POST `/api/bank-accounts` - Ajouter
  - [ ] PUT `/api/bank-accounts/:id` - Modifier
  - [ ] DELETE `/api/bank-accounts/:id` - Supprimer
  
- [ ] `backend/controllers/withdrawalController.js`
  - [ ] GET `/api/withdrawals` - Mes demandes
  - [ ] POST `/api/withdrawals` - Nouvelle demande
  - [ ] PUT `/api/withdrawals/:id/cancel` - Annuler
  - [ ] PUT `/api/withdrawals/:id/process` - Traiter (admin)
  
- [ ] `backend/controllers/checkinController.js`
  - [ ] POST `/api/checkins` - Faire un check-in
  - [ ] GET `/api/checkins/status` - Statut du jour
  - [ ] GET `/api/checkins/history` - Historique
  
- [ ] `backend/controllers/rewardController.js`
  - [ ] GET `/api/rewards` - Mes récompenses
  - [ ] POST `/api/rewards/:id/claim` - Réclamer
  - [ ] GET `/api/rewards/pending` - En attente

- [ ] `backend/controllers/userProductController.js`
  - [ ] GET `/api/user-products` - Mes produits actifs
  - [ ] GET `/api/user-products/:id` - Détail
  - [ ] GET `/api/user-products/stats` - Statistiques

### Étape 2.3 : Routes à créer
- [ ] `backend/routes/transactions.js`
- [ ] `backend/routes/referrals.js`
- [ ] `backend/routes/teamCommissions.js`
- [ ] `backend/routes/bankAccounts.js`
- [ ] `backend/routes/withdrawals.js`
- [ ] `backend/routes/checkins.js`
- [ ] `backend/routes/rewards.js`
- [ ] `backend/routes/userProducts.js`

### Étape 2.4 : Middlewares
- [ ] Middleware pour vérifier les rôles (admin/user)
- [ ] Middleware pour valider les montants
- [ ] Middleware pour gérer les erreurs MySQL

---

## 📋 PHASE 3 : LOGIQUE MÉTIER

### Étape 3.1 : Système de parrainage
- [ ] Créer fonction `generateReferralCode()`
- [ ] Créer fonction `findReferralChain(userId, maxLevel=3)`
- [ ] Créer fonction `calculateCommissions(purchaseId, amount)`
- [ ] Créer fonction `distributeCommissions(purchaseId)`
- [ ] Tester avec 3 utilisateurs en chaîne

### Étape 3.2 : Système de transactions
- [ ] Créer fonction `createTransaction(userId, type, amount, ...)`
- [ ] Créer fonction `updateBalance(userId, amount, type)`
- [ ] Garantir atomicité (BEGIN TRANSACTION ... COMMIT)
- [ ] Tester avec différents types

### Étape 3.3 : Système de produits actifs
- [ ] Lors d'un achat → créer user_product
- [ ] Calculer end_date, next_payout_date
- [ ] Tester création

### Étape 3.4 : Système de retraits
- [ ] Validation : balance >= amount
- [ ] Calcul des frais (15%)
- [ ] Créer withdrawal_request
- [ ] Workflow approval admin
- [ ] Tester le cycle complet

### Étape 3.5 : Système de check-in
- [ ] Vérifier : 1 check-in max par jour
- [ ] Calculer consecutive_days
- [ ] Créditer 50 FCFA
- [ ] Mettre à jour last_checkin_date
- [ ] Tester journalier

### Étape 3.6 : Système de récompenses
- [ ] Bonus d'inscription (300 FCFA)
- [ ] Bonus de check-in (50 FCFA)
- [ ] Bonus de parrainage (variable)
- [ ] Système d'expiration
- [ ] Tester chaque type

---

## 📋 PHASE 4 : CRON JOBS

### Étape 4.1 : Revenus quotidiens ⭐ PRIORITAIRE
- [ ] Créer script `backend/cron/dailyRevenue.js`
- [ ] Requête : sélectionner user_products actifs
- [ ] Pour chaque : verser daily_revenue
- [ ] Mettre à jour earned_so_far, days_elapsed
- [ ] Créer transaction
- [ ] Marquer completed si end_date atteinte
- [ ] Planifier : tous les jours à 00:01
- [ ] Tester manuellement

### Étape 4.2 : Reset check-ins
- [ ] Créer script `backend/cron/resetCheckins.js`
- [ ] Requête : profils avec last_checkin > 2 jours
- [ ] Reset consecutive_checkins = 0
- [ ] Planifier : tous les jours à 00:05
- [ ] Tester manuellement

### Étape 4.3 : Expiration récompenses
- [ ] Créer script `backend/cron/expireRewards.js`
- [ ] Requête : rewards pending et expires_at dépassé
- [ ] Marquer status = 'expired'
- [ ] Planifier : toutes les heures
- [ ] Tester manuellement

### Étape 4.4 : Configuration CRON
- [ ] Créer fichier crontab ou utiliser node-cron
- [ ] Exemple avec node-cron :
  ```javascript
  const cron = require('node-cron');
  
  // Tous les jours à 00:01
  cron.schedule('1 0 * * *', () => {
    require('./cron/dailyRevenue')();
  });
  
  // Tous les jours à 00:05
  cron.schedule('5 0 * * *', () => {
    require('./cron/resetCheckins')();
  });
  
  // Toutes les heures
  cron.schedule('0 * * * *', () => {
    require('./cron/expireRewards')();
  });
  ```
- [ ] Tester l'exécution

---

## 📋 PHASE 5 : INTÉGRATION FRONTEND

### Étape 5.1 : API Client
- [ ] Adapter `src/api/client.ts` pour toutes les nouvelles routes
- [ ] Ajouter fonctions :
  - [ ] `getTransactions()`
  - [ ] `getMyTeam()`
  - [ ] `getCommissions()`
  - [ ] `getBankAccounts()`
  - [ ] `addBankAccount(data)`
  - [ ] `createWithdrawal(data)`
  - [ ] `doCheckin()`
  - [ ] `getRewards()`
  - [ ] `claimReward(id)`
  - [ ] `getUserProducts()`

### Étape 5.2 : Adaptation des composants
- [ ] `TeamScreen.tsx`
  - [ ] Remplacer données hardcodées
  - [ ] Appeler API `/api/referrals/my-team`
  - [ ] Afficher vraies stats

- [ ] `BalanceDetailsScreen.tsx`
  - [ ] Onglet Revenus → `/api/transactions?type=revenue`
  - [ ] Onglet Retraits → `/api/transactions?type=withdrawal`

- [ ] `BankAccountsScreen.tsx`
  - [ ] Charger `/api/bank-accounts`
  - [ ] Afficher la liste

- [ ] `LinkBankCardScreen.tsx`
  - [ ] Soumettre à `/api/bank-accounts`
  - [ ] Gérer la réponse

- [ ] `CheckInScreen.tsx`
  - [ ] Vérifier status : `/api/checkins/status`
  - [ ] Faire check-in : POST `/api/checkins`
  - [ ] Afficher vraies stats

- [ ] `WithdrawScreen.tsx`
  - [ ] Charger comptes : `/api/bank-accounts`
  - [ ] Soumettre : POST `/api/withdrawals`
  - [ ] Calculer frais en temps réel

- [ ] `RechargeScreen.tsx`
  - [ ] Soumettre : POST `/api/transactions/deposit`

- [ ] `ProductScreen.tsx`
  - [ ] Charger produits : `/api/products`
  - [ ] Acheter : POST `/api/purchases`

- [ ] `ProfileScreen.tsx`
  - [ ] Charger stats complètes
  - [ ] Afficher produits actifs : `/api/user-products`

### Étape 5.3 : Nouveaux composants (optionnel)
- [ ] `AdminDashboard.tsx`
  - [ ] Liste des retraits en attente
  - [ ] Validation des comptes bancaires
  - [ ] Statistiques globales

---

## 📋 PHASE 6 : TESTS

### Étape 6.1 : Tests unitaires
- [ ] Tester `generateReferralCode()`
- [ ] Tester `calculateCommissions()`
- [ ] Tester `createTransaction()`
- [ ] Tester `updateBalance()`

### Étape 6.2 : Tests d'intégration
- [ ] Inscription → Bonus 300 FCFA
- [ ] Parrainage → Création relation
- [ ] Achat → Commissions distribuées
- [ ] Check-in → Bonus crédité
- [ ] Retrait → Workflow complet

### Étape 6.3 : Tests du système de parrainage
- [ ] Créer User A
- [ ] User B s'inscrit avec code de A
- [ ] User C s'inscrit avec code de B
- [ ] User C achète un produit
- [ ] Vérifier commissions de A et B
- [ ] Vérifier table team_commissions

### Étape 6.4 : Tests des revenus quotidiens
- [ ] Créer un achat de test
- [ ] Exécuter CRON manuellement
- [ ] Vérifier balance mise à jour
- [ ] Vérifier transaction créée
- [ ] Vérifier user_product mis à jour

### Étape 6.5 : Tests des retraits
- [ ] Ajouter compte bancaire
- [ ] Faire demande de retrait
- [ ] Vérifier status 'pending'
- [ ] Admin approuve
- [ ] Vérifier status 'completed'
- [ ] Vérifier balance mise à jour

---

## 📋 PHASE 7 : OPTIMISATION ET SÉCURITÉ

### Étape 7.1 : Performance
- [ ] Vérifier tous les index utilisés
- [ ] Analyser les requêtes lentes
- [ ] Optimiser les jointures
- [ ] Implémenter pagination

### Étape 7.2 : Sécurité
- [ ] Validation de tous les inputs
- [ ] Protection contre injection SQL
- [ ] Rate limiting sur API
- [ ] HTTPS en production
- [ ] Secrets dans variables d'environnement

### Étape 7.3 : Monitoring
- [ ] Logs des erreurs
- [ ] Logs des transactions importantes
- [ ] Alertes admin pour activités suspectes
- [ ] Dashboard de monitoring

---

## 📋 PHASE 8 : DOCUMENTATION

### Étape 8.1 : Documentation API
- [ ] Documenter tous les endpoints
- [ ] Exemples de requêtes
- [ ] Exemples de réponses
- [ ] Codes d'erreur

### Étape 8.2 : Documentation utilisateur
- [ ] Guide utilisateur
- [ ] FAQ
- [ ] Tutoriels vidéo

### Étape 8.3 : Documentation admin
- [ ] Guide d'administration
- [ ] Gestion des retraits
- [ ] Gestion des utilisateurs

---

## 📋 PHASE 9 : DÉPLOIEMENT

### Étape 9.1 : Préparation
- [ ] Configuration production
- [ ] Variables d'environnement
- [ ] Base de données production
- [ ] Backup automatique

### Étape 9.2 : Migration
- [ ] Exporter données de test
- [ ] Importer en production
- [ ] Vérifier intégrité

### Étape 9.3 : Mise en ligne
- [ ] Déployer backend
- [ ] Déployer frontend
- [ ] Configurer domaine
- [ ] Configurer SSL

### Étape 9.4 : Post-déploiement
- [ ] Vérifier tous les endpoints
- [ ] Tester workflow complet
- [ ] Monitoring actif
- [ ] Support prêt

---

## 📊 INDICATEURS DE SUCCÈS

### Backend
- [ ] ✅ 15 tables créées et fonctionnelles
- [ ] ✅ Tous les contrôleurs implémentés
- [ ] ✅ Toutes les routes testées
- [ ] ✅ CRON jobs actifs et fonctionnels
- [ ] ✅ Système de parrainage opérationnel
- [ ] ✅ Revenus quotidiens automatiques

### Frontend
- [ ] ✅ Tous les composants connectés à l'API
- [ ] ✅ Données en temps réel
- [ ] ✅ Aucune donnée hardcodée
- [ ] ✅ UI réactive et fluide

### Fonctionnel
- [ ] ✅ Inscription avec bonus fonctionne
- [ ] ✅ Parrainage multi-niveaux fonctionne
- [ ] ✅ Achats et revenus fonctionnent
- [ ] ✅ Check-ins quotidiens fonctionnent
- [ ] ✅ Retraits avec validation fonctionnent

---

## 🎯 PROGRESSION GLOBALE

```
Phase 1 : Installation BDD         [░░░░░░░░░░] 0%
Phase 2 : Adaptation Backend       [░░░░░░░░░░] 0%
Phase 3 : Logique Métier          [░░░░░░░░░░] 0%
Phase 4 : CRON Jobs               [░░░░░░░░░░] 0%
Phase 5 : Intégration Frontend    [░░░░░░░░░░] 0%
Phase 6 : Tests                   [░░░░░░░░░░] 0%
Phase 7 : Optimisation            [░░░░░░░░░░] 0%
Phase 8 : Documentation           [░░░░░░░░░░] 0%
Phase 9 : Déploiement             [░░░░░░░░░░] 0%

GLOBAL                            [░░░░░░░░░░] 0%
```

---

**Bon courage pour l'implémentation ! 🚀**

*Cochez les cases au fur et à mesure de votre progression.*

