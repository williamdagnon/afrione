# 📊 ANALYSE COMPLÈTE - Tables nécessaires pour le Backend

## 🔍 Analyse du Frontend

Après avoir parcouru tous les composants frontend, voici les fonctionnalités identifiées :

### ✅ Déjà implémenté (4 tables)
1. **profiles** - Utilisateurs
2. **products** - Produits
3. **purchases** - Achats
4. **notifications** - Notifications

### ❌ Manquant (10+ tables nécessaires)
5. **referrals** - Système de parrainage
6. **transactions** - Historique des transactions
7. **bank_accounts** - Comptes bancaires liés
8. **daily_checkins** - Enregistrements quotidiens
9. **rewards** - Récompenses et bonus
10. **team_commissions** - Commissions d'équipe
11. **withdrawal_requests** - Demandes de retrait
12. **admin_users** - Administrateurs
13. **system_settings** - Paramètres système
14. **user_products** - Produits actifs des utilisateurs

---

## 📋 TABLES DÉTAILLÉES

### 1. ✅ profiles (DÉJÀ CRÉÉE - à compléter)

```sql
CREATE TABLE profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  phone VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0,
  role VARCHAR(20) DEFAULT 'user',
  
  -- NOUVEAUX CHAMPS À AJOUTER :
  referral_code VARCHAR(10) UNIQUE NOT NULL,  -- Code de parrainage unique
  referred_by VARCHAR(36),                     -- ID du parrain
  total_referrals INT DEFAULT 0,               -- Nombre total de filleuls
  total_earnings DECIMAL(10, 2) DEFAULT 0,    -- Gains totaux cumulés
  signup_bonus_claimed BOOLEAN DEFAULT FALSE, -- Bonus d'inscription réclamé
  last_checkin_date DATE,                     -- Dernière connexion quotidienne
  consecutive_checkins INT DEFAULT 0,         -- Jours consécutifs
  is_active BOOLEAN DEFAULT TRUE,             -- Compte actif
  email VARCHAR(255),                         -- Email (optionnel)
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referred_by) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_phone (phone),
  INDEX idx_role (role),
  INDEX idx_referral_code (referral_code),
  INDEX idx_referred_by (referred_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Champs clés :**
- `referral_code` : Code unique pour parrainer (ex: QAVYLD)
- `referred_by` : ID du parrain (relation auto-référentielle)
- `total_earnings` : Gains totaux (revenus + commissions + bonus)

---

### 2. ❌ referrals (NOUVELLE TABLE)

**But :** Gérer le système de parrainage à plusieurs niveaux

```sql
CREATE TABLE referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id VARCHAR(36) NOT NULL,           -- Celui qui parraine
  referred_id VARCHAR(36) NOT NULL,           -- Celui qui est parrainé
  level INT NOT NULL,                         -- Niveau (1, 2, 3)
  commission_rate DECIMAL(5, 2) NOT NULL,     -- Taux de commission (25%, 3%, 2%)
  total_commission DECIMAL(10, 2) DEFAULT 0,  -- Commission totale gagnée
  status VARCHAR(20) DEFAULT 'active',        -- active, inactive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_referral (referrer_id, referred_id),
  INDEX idx_referrer (referrer_id),
  INDEX idx_referred (referred_id),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Relations :**
- Niveau 1 : Filleuls directs (25% commission)
- Niveau 2 : Filleuls des filleuls (3% commission)
- Niveau 3 : Filleuls de niveau 2 (2% commission)

---

### 3. ❌ transactions (NOUVELLE TABLE)

**But :** Historique complet de toutes les transactions

```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('deposit', 'withdrawal', 'purchase', 'commission', 'bonus', 'checkin', 'referral_bonus', 'daily_revenue') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  description TEXT,
  reference_id INT,                           -- ID de la référence (purchase_id, etc.)
  reference_type VARCHAR(50),                 -- 'purchase', 'withdrawal', etc.
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Types de transactions :**
- `deposit` : Rechargement
- `withdrawal` : Retrait
- `purchase` : Achat de produit
- `commission` : Commission de parrainage
- `bonus` : Bonus divers
- `checkin` : Bonus de connexion quotidienne
- `daily_revenue` : Revenus quotidiens des produits

---

### 4. ❌ bank_accounts (NOUVELLE TABLE)

**But :** Gérer les comptes bancaires des utilisateurs

```sql
CREATE TABLE bank_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,            -- Ex: "Banque du Cameroun"
  account_holder VARCHAR(255) NOT NULL,       -- Nom du titulaire
  account_number VARCHAR(50) NOT NULL,        -- Numéro de compte
  is_default BOOLEAN DEFAULT FALSE,           -- Compte par défaut
  is_verified BOOLEAN DEFAULT FALSE,          -- Vérifié par admin
  status ENUM('pending', 'active', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. ❌ daily_checkins (NOUVELLE TABLE)

**But :** Enregistrer les pointages quotidiens

```sql
CREATE TABLE daily_checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  checkin_date DATE NOT NULL,
  reward_amount DECIMAL(10, 2) DEFAULT 50.00, -- Récompense (50 FCFA)
  consecutive_days INT DEFAULT 1,             -- Jours consécutifs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_checkin (user_id, checkin_date),
  INDEX idx_user_id (user_id),
  INDEX idx_checkin_date (checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Logique :**
- 1 check-in par jour maximum
- Bonus : 50 FCFA par jour
- Suivi des jours consécutifs

---

### 6. ❌ rewards (NOUVELLE TABLE)

**But :** Gérer tous les types de récompenses

```sql
CREATE TABLE rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('signup', 'checkin', 'referral', 'purchase_bonus', 'special') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  source_user_id VARCHAR(36),                 -- Pour les bonus de parrainage
  source_transaction_id INT,                  -- Transaction source
  status ENUM('pending', 'claimed', 'expired') DEFAULT 'pending',
  expires_at TIMESTAMP NULL,
  claimed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (source_user_id) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Types de récompenses :**
- `signup` : 300 FCFA à l'inscription
- `checkin` : 50 FCFA par jour
- `referral` : Bonus de parrainage (25%, 3%, 2%)
- `purchase_bonus` : Bonus sur achat

---

### 7. ❌ team_commissions (NOUVELLE TABLE)

**But :** Historique des commissions de parrainage

```sql
CREATE TABLE team_commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id VARCHAR(36) NOT NULL,           -- Celui qui reçoit la commission
  referred_id VARCHAR(36) NOT NULL,           -- Celui qui a effectué l'achat
  purchase_id INT NOT NULL,                   -- Achat source
  level INT NOT NULL,                         -- Niveau (1, 2, 3)
  commission_rate DECIMAL(5, 2) NOT NULL,     -- Taux appliqué
  purchase_amount DECIMAL(10, 2) NOT NULL,    -- Montant de l'achat
  commission_amount DECIMAL(10, 2) NOT NULL,  -- Commission gagnée
  status ENUM('pending', 'paid', 'cancelled') DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  INDEX idx_referrer (referrer_id),
  INDEX idx_referred (referred_id),
  INDEX idx_purchase (purchase_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 8. ❌ withdrawal_requests (NOUVELLE TABLE)

**But :** Gérer les demandes de retrait

```sql
CREATE TABLE withdrawal_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,             -- Montant demandé
  fee DECIMAL(10, 2) NOT NULL,                -- Frais (15%)
  net_amount DECIMAL(10, 2) NOT NULL,         -- Montant net à recevoir
  bank_account_id INT NOT NULL,               -- Compte bancaire
  status ENUM('pending', 'processing', 'completed', 'rejected', 'cancelled') DEFAULT 'pending',
  admin_note TEXT,                            -- Note de l'admin
  processed_by VARCHAR(36),                   -- ID de l'admin
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  FOREIGN KEY (processed_by) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Workflow :**
1. Utilisateur demande retrait
2. Admin vérifie et approuve
3. Statut passe à 'processing'
4. Transfert effectué → 'completed'

---

### 9. ❌ user_products (NOUVELLE TABLE)

**But :** Produits actifs des utilisateurs (investissements en cours)

```sql
CREATE TABLE user_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  purchase_id INT NOT NULL,                   -- Référence à l'achat
  purchase_price DECIMAL(10, 2) NOT NULL,
  daily_revenue DECIMAL(10, 2) NOT NULL,      -- Revenu quotidien
  total_revenue DECIMAL(10, 2) NOT NULL,      -- Revenu total possible
  earned_so_far DECIMAL(10, 2) DEFAULT 0,     -- Déjà gagné
  duration_days INT NOT NULL,                 -- Durée (ex: 60 jours)
  days_elapsed INT DEFAULT 0,                 -- Jours écoulés
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  last_payout_date DATE,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Logique :**
- Créé automatiquement lors d'un achat
- Un CRON job quotidien verse les revenus
- Status 'completed' quand end_date atteinte

---

### 10. ❌ system_settings (NOUVELLE TABLE)

**But :** Paramètres configurables du système

```sql
CREATE TABLE system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  is_public BOOLEAN DEFAULT FALSE,            -- Visible côté frontend
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Exemples de settings :**
- `signup_bonus` : 300
- `daily_checkin_bonus` : 50
- `referral_level1_rate` : 25
- `referral_level2_rate` : 3
- `referral_level3_rate` : 2
- `withdrawal_fee_rate` : 15
- `min_withdrawal_amount` : 1000
- `min_deposit_amount` : 2000

---

### 11. ❌ admin_logs (NOUVELLE TABLE)

**But :** Logs des actions administrateur

```sql
CREATE TABLE admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,               -- 'approve_withdrawal', 'update_user', etc.
  target_type VARCHAR(50),                    -- 'user', 'withdrawal', 'product'
  target_id VARCHAR(36),                      -- ID de la cible
  details TEXT,                               -- JSON avec détails
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 12. ❌ support_messages (OPTIONNEL)

**But :** Messages du service client

```sql
CREATE TABLE support_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  admin_reply TEXT,
  replied_by VARCHAR(36),
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (replied_by) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔗 SCHÉMA DES RELATIONS

```
profiles (utilisateurs)
  ├─→ referrals (parrainage multi-niveaux)
  ├─→ transactions (historique complet)
  ├─→ bank_accounts (comptes bancaires)
  ├─→ daily_checkins (pointages quotidiens)
  ├─→ rewards (récompenses)
  ├─→ team_commissions (commissions gagnées)
  ├─→ withdrawal_requests (demandes de retrait)
  ├─→ user_products (produits actifs)
  ├─→ purchases (achats) ✓
  ├─→ notifications (notifications) ✓
  └─→ admin_logs (si admin)

products ✓
  ├─→ purchases ✓
  └─→ user_products

purchases ✓
  ├─→ team_commissions
  └─→ user_products
```

---

## 📊 RÉSUMÉ

| Table | Priorité | Statut | Fonctionnalité |
|-------|----------|--------|----------------|
| profiles | ⭐⭐⭐ | Modifiée | Auth + infos utilisateur |
| products | ⭐⭐⭐ | ✅ Créée | Catalogue produits |
| purchases | ⭐⭐⭐ | ✅ Créée | Achats |
| notifications | ⭐⭐⭐ | ✅ Créée | Notifications |
| transactions | ⭐⭐⭐ | ❌ À créer | Historique financier |
| user_products | ⭐⭐⭐ | ❌ À créer | Investissements actifs |
| referrals | ⭐⭐⭐ | ❌ À créer | Système de parrainage |
| team_commissions | ⭐⭐⭐ | ❌ À créer | Commissions équipe |
| bank_accounts | ⭐⭐ | ❌ À créer | Comptes bancaires |
| withdrawal_requests | ⭐⭐ | ❌ À créer | Demandes de retrait |
| daily_checkins | ⭐⭐ | ❌ À créer | Check-in quotidien |
| rewards | ⭐⭐ | ❌ À créer | Bonus et récompenses |
| system_settings | ⭐ | ❌ À créer | Configuration |
| admin_logs | ⭐ | ❌ À créer | Logs admin |
| support_messages | ⭐ | ❌ Optionnel | Service client |

**Priorité ⭐⭐⭐ = Essentiel**
**Priorité ⭐⭐ = Important**
**Priorité ⭐ = Nice to have**

---

## 🎯 ORDRE DE DÉVELOPPEMENT RECOMMANDÉ

### Phase 1 : Essentiel (Priorité ⭐⭐⭐)
1. **transactions** - Historique de tout
2. **user_products** - Gérer les produits actifs et revenus quotidiens
3. **referrals** - Système de parrainage
4. **team_commissions** - Commissions de parrainage

### Phase 2 : Important (Priorité ⭐⭐)
5. **bank_accounts** - Comptes bancaires
6. **withdrawal_requests** - Retraits
7. **daily_checkins** - Check-in quotidien
8. **rewards** - Bonus divers

### Phase 3 : Nice to have (Priorité ⭐)
9. **system_settings** - Configuration
10. **admin_logs** - Audit
11. **support_messages** - Support (optionnel)

---

## 💡 OPTIMISATIONS SUGGÉRÉES

### Index
- Tous les `user_id` indexés ✅
- Tous les `created_at` indexés pour tri ✅
- Index composites pour requêtes fréquentes

### Normalisation
- Séparation claire des responsabilités ✅
- Pas de redondance excessive
- Relations bien définies avec contraintes FK

### Performance
- Utiliser des vues matérialisées pour statistiques complexes
- Cache Redis pour données fréquemment lues
- Pagination pour toutes les listes

### Sécurité
- Contraintes FOREIGN KEY avec ON DELETE appropriés
- Validation des montants (DECIMAL pour précision)
- Status ENUM pour cohérence

---

## 📄 PROCHAINE ÉTAPE

Je vais créer un fichier SQL complet avec toutes ces tables !

Voulez-vous que je crée :
1. ✅ Le fichier SQL complet avec toutes les tables
2. ✅ Les contrôleurs backend pour ces nouvelles tables
3. ✅ La documentation API pour ces endpoints

Dites-moi et je continue ! 🚀

