# 🗺️ SCHÉMA DES RELATIONS - BASE DE DONNÉES AFRIONE

## Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SYSTÈME AFRIONE                               │
│                    Base de données : afrionedb                       │
│                         15 tables                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Diagramme Entité-Relations

```
                                    ┌──────────────┐
                                    │   PROFILES   │ ◄─── Table centrale
                                    │  (Users)     │
                                    └──────┬───────┘
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     │                     │                     │
                     ▼                     ▼                     ▼
            ┌────────────────┐    ┌────────────────┐   ┌────────────────┐
            │   REFERRALS    │    │  TRANSACTIONS  │   │   PURCHASES    │
            │  (Parrainage)  │    │  (Historique)  │   │    (Achats)    │
            └────────────────┘    └────────────────┘   └────┬───────────┘
                     │                                       │
                     │                                       │
                     ▼                                       ▼
            ┌────────────────┐                      ┌────────────────┐
            │TEAM_COMMISSIONS│                      │ USER_PRODUCTS  │
            │ (Commissions)  │                      │(Produits actifs)│
            └────────────────┘                      └────────────────┘
                                                             ▲
                                                             │
                                    ┌────────────────────────┘
                                    │
                           ┌────────┴────────┐
                           │    PRODUCTS     │
                           │  (Catalogue)    │
                           └─────────────────┘


                    ┌──────────────┐
                    │   PROFILES   │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ BANK_ACCOUNTS  │ │DAILY_CHECKINS  │ │    REWARDS     │
│   (Comptes)    │ │  (Check-ins)   │ │    (Bonus)     │
└────────┬───────┘ └────────────────┘ └────────────────┘
         │
         ▼
┌────────────────┐
│  WITHDRAWALS   │
│   (Retraits)   │
└────────────────┘


                    ┌──────────────┐
                    │   PROFILES   │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ NOTIFICATIONS  │ │  ADMIN_LOGS    │ │SUPPORT_MESSAGES│
│                │ │                │ │                │
└────────────────┘ └────────────────┘ └────────────────┘


                    ┌──────────────┐
                    │SYSTEM_SETTINGS│ ◄─── Configuration
                    │              │
                    └──────────────┘
```

---

## 🔗 Relations détaillées

### 1. PROFILES (Table centrale)

```
PROFILES
├── id (PK)
├── referral_code (UNIQUE) ────────┐
├── referred_by (FK → profiles.id) │  Auto-référence
│                                  │  (Parrainage)
└──────────────────────────────────┘

Relations :
• 1 Profile ──→ N Referrals (comme referrer)
• 1 Profile ──→ N Referrals (comme referred)
• 1 Profile ──→ N Transactions
• 1 Profile ──→ N Purchases
• 1 Profile ──→ N User_Products
• 1 Profile ──→ N Bank_Accounts
• 1 Profile ──→ N Withdrawal_Requests
• 1 Profile ──→ N Daily_Checkins
• 1 Profile ──→ N Rewards
• 1 Profile ──→ N Notifications
• 1 Profile ──→ N Team_Commissions (reçues)
• 1 Profile ──→ N Team_Commissions (données)
• 1 Profile ──→ N Admin_Logs (si admin)
• 1 Profile ──→ N Support_Messages
```

### 2. PRODUCTS → PURCHASES → USER_PRODUCTS

```
PRODUCTS                 PURCHASES              USER_PRODUCTS
┌──────────┐           ┌───────────┐          ┌──────────────┐
│ id (PK)  │───────┐   │ id (PK)   │──────┐   │ id (PK)      │
│ name     │       └──→│ product_id│      └──→│ purchase_id  │
│ price    │           │ user_id   │          │ user_id      │
│ duration │           │ price     │          │ product_id   │
└──────────┘           └───────────┘          │ daily_revenue│
                                              │ earned_so_far│
                                              │ status       │
                                              │ end_date     │
                                              └──────────────┘

Flux :
1. User achète Product → Crée Purchase
2. Purchase → Crée User_Product (actif)
3. CRON quotidien → Verse daily_revenue
4. Après end_date → Status = 'completed'
```

### 3. Système de parrainage (3 niveaux)

```
PROFILES                 REFERRALS              TEAM_COMMISSIONS
┌──────────┐           ┌───────────┐          ┌─────────────────┐
│User A    │◄─────────│referrer_id│◄────────│ referrer_id (A) │
│(Parrain) │          │referred_id│         │ referred_id (B) │
└────┬─────┘          │level      │         │ purchase_id     │
     │                │comm_rate  │         │ commission_amt  │
     │                └───────────┘         └─────────────────┘
     │
     └──→ User B (Niveau 1 : 25%)
          └──→ User C (Niveau 2 : 3%)
               └──→ User D (Niveau 3 : 2%)

Quand User D achète 10,000 FCFA :
• User C gagne : 2,500 FCFA (25% niveau 1)
• User B gagne :   300 FCFA (3% niveau 2)
• User A gagne :   200 FCFA (2% niveau 3)
```

### 4. Système de retrait

```
PROFILES              BANK_ACCOUNTS         WITHDRAWAL_REQUESTS
┌──────────┐        ┌──────────────┐       ┌──────────────────┐
│ id       │───┐    │ id (PK)      │──┐    │ id (PK)          │
│ balance  │   └───→│ user_id      │  └───→│ bank_account_id  │
└──────────┘        │ bank_name    │       │ user_id          │
                    │ account_num  │       │ amount           │
                    │ is_verified  │       │ fee (15%)        │
                    └──────────────┘       │ net_amount       │
                                           │ status           │
                                           │ processed_by     │
                                           └──────────────────┘

Workflow :
1. User ajoute Bank_Account → status 'pending'
2. Admin vérifie → is_verified = true
3. User demande retrait → Withdrawal_Request créée
4. Admin approuve → status 'completed'
5. Argent transféré vers Bank_Account
```

### 5. Transactions (Historique complet)

```
TRANSACTIONS
┌────────────────────┐
│ id (PK)            │
│ user_id (FK)       │◄─── Toutes les opérations
│ type               │     financières sont ici
│ amount             │
│ balance_before     │     Types :
│ balance_after      │     • deposit
│ reference_id       │     • withdrawal
│ reference_type     │     • purchase
│ status             │     • commission
│ created_at         │     • bonus
└────────────────────┘     • checkin
                           • referral_bonus
                           • daily_revenue
```

---

## 📋 Types de données clés

### ENUM utilisés

```sql
-- Transactions
type: 'deposit', 'withdrawal', 'purchase', 'commission', 
      'bonus', 'checkin', 'referral_bonus', 'daily_revenue'

status: 'pending', 'completed', 'failed', 'cancelled'

-- Purchases
status: 'pending', 'completed', 'failed', 'refunded'

-- User_Products
status: 'active', 'completed', 'cancelled'

-- Bank_Accounts
status: 'pending', 'active', 'rejected', 'suspended'

-- Withdrawal_Requests
status: 'pending', 'processing', 'completed', 'rejected', 'cancelled'

-- Rewards
type: 'signup', 'checkin', 'referral', 'purchase_bonus', 'special'
status: 'pending', 'claimed', 'expired', 'cancelled'

-- Support_Messages
priority: 'low', 'normal', 'high', 'urgent'
status: 'open', 'in_progress', 'resolved', 'closed'
```

---

## 🔄 Flux de données principaux

### Flux 1 : Inscription

```
1. POST /api/auth/register
   ↓
2. INSERT INTO profiles
   ↓
3. TRIGGER génère referral_code
   ↓
4. Si referred_by fourni:
   → INSERT INTO referrals (niveau 1, 2, 3)
   ↓
5. INSERT INTO rewards (signup_bonus: 300 FCFA)
   ↓
6. INSERT INTO transactions (type: 'bonus')
   ↓
7. UPDATE profiles SET balance = 300
```

### Flux 2 : Achat produit

```
1. POST /api/purchases
   ↓
2. CALL process_purchase(user_id, product_id)
   ↓
3. UPDATE profiles SET balance = balance - price
   ↓
4. INSERT INTO purchases
   ↓
5. INSERT INTO transactions (type: 'purchase')
   ↓
6. INSERT INTO user_products (status: 'active')
   ↓
7. Calculer commissions parrainage:
   ├─→ Niveau 1: 25%
   ├─→ Niveau 2: 3%
   └─→ Niveau 3: 2%
   ↓
8. Pour chaque parrain:
   ├─→ INSERT INTO team_commissions
   ├─→ UPDATE profiles SET balance += commission
   └─→ INSERT INTO transactions (type: 'commission')
```

### Flux 3 : Revenus quotidiens (CRON)

```
CRON quotidien à 00:01
   ↓
SELECT * FROM user_products 
WHERE status = 'active' 
  AND next_payout_date <= CURDATE()
   ↓
Pour chaque user_product:
   ├─→ UPDATE profiles SET balance += daily_revenue
   ├─→ UPDATE user_products SET earned_so_far += daily_revenue
   ├─→ INSERT INTO transactions (type: 'daily_revenue')
   └─→ Si end_date atteinte:
       └─→ UPDATE user_products SET status = 'completed'
```

### Flux 4 : Check-in quotidien

```
1. POST /api/checkins
   ↓
2. Vérifier si déjà fait aujourd'hui:
   SELECT * FROM daily_checkins 
   WHERE user_id = X AND checkin_date = CURDATE()
   ↓
3. Si non fait:
   ├─→ INSERT INTO daily_checkins
   ├─→ UPDATE profiles SET 
   │    balance += 50,
   │    consecutive_checkins += 1
   ├─→ INSERT INTO transactions (type: 'checkin')
   └─→ INSERT INTO notifications (titre: 'Check-in réussi')
```

### Flux 5 : Demande de retrait

```
1. POST /api/withdrawals
   ↓
2. Vérifier balance >= montant
   ↓
3. Calculer frais (15%)
   ↓
4. INSERT INTO withdrawal_requests (status: 'pending')
   ↓
5. UPDATE profiles SET balance -= montant
   ↓
6. INSERT INTO transactions (type: 'withdrawal', status: 'pending')
   ↓
7. Admin review:
   ├─→ Approuvé:
   │   ├─→ UPDATE withdrawal_requests SET status = 'completed'
   │   └─→ UPDATE transactions SET status = 'completed'
   └─→ Rejeté:
       ├─→ UPDATE withdrawal_requests SET status = 'rejected'
       ├─→ UPDATE profiles SET balance += montant (remboursement)
       └─→ UPDATE transactions SET status = 'cancelled'
```

---

## 🎯 Index importants

```sql
-- PROFILES
INDEX idx_phone (phone)              -- Login rapide
INDEX idx_referral_code (referral_code)  -- Recherche code
INDEX idx_referred_by (referred_by)  -- Chaîne parrainage

-- TRANSACTIONS
INDEX idx_user_id (user_id)          -- Historique user
INDEX idx_type (type)                -- Filtrer par type
INDEX idx_created_at (created_at)    -- Tri chronologique

-- USER_PRODUCTS
INDEX idx_user_id (user_id)          -- Produits d'un user
INDEX idx_next_payout (next_payout_date)  -- CRON quotidien
INDEX idx_status (status)            -- Filtre actifs

-- REFERRALS
INDEX idx_referrer (referrer_id)     -- Mes filleuls
INDEX idx_level (level)              -- Par niveau

-- TEAM_COMMISSIONS
INDEX idx_referrer (referrer_id)     -- Mes commissions
INDEX idx_created_at (created_at)    -- Historique

-- WITHDRAWAL_REQUESTS
INDEX idx_status (status)            -- Retraits en attente
INDEX idx_created_at (created_at)    -- FIFO
```

---

## 💡 Contraintes d'intégrité

```sql
-- Empêcher double check-in
UNIQUE KEY unique_checkin (user_id, checkin_date)

-- Empêcher double parrainage
UNIQUE KEY unique_referral (referrer_id, referred_id)

-- Code de parrainage unique
UNIQUE referral_code

-- ON DELETE CASCADE
referrals, transactions, user_products, etc.
→ Si user supprimé, ses données aussi

-- ON DELETE RESTRICT
user_products.product_id
→ Impossible de supprimer un produit avec achats actifs

-- ON DELETE SET NULL
purchases.user_id
→ Si user supprimé, garde l'historique des achats
```

---

## 📊 Cardinalités

```
profiles ──(1:N)──→ transactions
profiles ──(1:N)──→ purchases
profiles ──(1:N)──→ user_products
profiles ──(1:N)──→ bank_accounts
profiles ──(1:N)──→ withdrawal_requests
profiles ──(1:N)──→ daily_checkins
profiles ──(1:N)──→ rewards
profiles ──(1:N)──→ notifications

profiles ──(1:1)──→ profiles (referred_by - auto-référence)
profiles ──(1:N)──→ referrals (comme referrer)
profiles ──(1:N)──→ referrals (comme referred)

products ──(1:N)──→ purchases
products ──(1:N)──→ user_products

purchases ──(1:1)──→ user_products
purchases ──(1:N)──→ team_commissions

bank_accounts ──(1:N)──→ withdrawal_requests
```

---

## 🎨 Couleurs par domaine fonctionnel

```
🟦 AUTHENTIFICATION & USERS
   └─→ profiles

🟩 CATALOGUE & ACHATS
   └─→ products, purchases, user_products

🟨 PARRAINAGE
   └─→ referrals, team_commissions

🟧 FINANCE
   └─→ transactions, bank_accounts, withdrawal_requests

🟪 GAMIFICATION
   └─→ daily_checkins, rewards

🟥 ADMINISTRATION
   └─→ admin_logs, system_settings, support_messages

⬜ COMMUNICATION
   └─→ notifications
```

---

## ✅ Checklist d'intégrité

Avant la mise en production, vérifiez :

- [ ] Tous les Foreign Keys définis
- [ ] Tous les Index sur colonnes fréquentes
- [ ] Contraintes UNIQUE sur codes, emails
- [ ] ENUM pour valeurs fixes
- [ ] DECIMAL pour montants (pas FLOAT)
- [ ] Triggers pour génération auto
- [ ] Procédures stockées testées
- [ ] Dates avec timezone (TIMESTAMP)
- [ ] Soft delete ou ON DELETE CASCADE approprié
- [ ] Validation côté serveur ET DB

---

**Le schéma est optimisé pour performance, sécurité et maintenabilité ! 🚀**

