# 📋 RÉFÉRENCE RAPIDE - TABLES ET CHAMPS

## 📊 Vue d'ensemble

**Base de données :** `afrionedb`  
**Nombre de tables :** 15  
**Fichier SQL :** `backend/mysql/schema_complet.sql`

---

## 1️⃣ PROFILES (Utilisateurs)

**Rôle :** Comptes utilisateurs avec finances et parrainage

| Champ | Type | Description |
|-------|------|-------------|
| `id` | VARCHAR(36) PK | ID unique (UUID) |
| `phone` | VARCHAR(20) UNIQUE | Numéro de téléphone |
| `password` | VARCHAR(255) | Mot de passe hashé |
| `display_name` | VARCHAR(255) | Nom affiché |
| `email` | VARCHAR(255) | Email (optionnel) |
| `balance` | DECIMAL(10,2) | Solde actuel |
| `total_earnings` | DECIMAL(10,2) | Gains totaux |
| `total_invested` | DECIMAL(10,2) | Total investi |
| `total_withdrawn` | DECIMAL(10,2) | Total retiré |
| `referral_code` | VARCHAR(10) UNIQUE | Code de parrainage |
| `referred_by` | VARCHAR(36) FK | ID du parrain |
| `total_referrals` | INT | Nombre de filleuls |
| `referral_earnings` | DECIMAL(10,2) | Gains de parrainage |
| `signup_bonus_claimed` | BOOLEAN | Bonus réclamé |
| `last_checkin_date` | DATE | Dernier check-in |
| `consecutive_checkins` | INT | Jours consécutifs |
| `role` | VARCHAR(20) | 'user' ou 'admin' |
| `is_active` | BOOLEAN | Compte actif |

---

## 2️⃣ PRODUCTS (Produits)

**Rôle :** Catalogue des produits d'investissement

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `name` | VARCHAR(255) | Nom du produit |
| `price` | INT | Prix en FCFA |
| `duration` | VARCHAR(50) | Ex: "60 jours" |
| `duration_days` | INT | Durée en jours |
| `daily_revenue` | INT | Revenu quotidien |
| `total_revenue` | INT | Revenu total possible |
| `image` | TEXT | URL de l'image |
| `description` | TEXT | Description |
| `is_active` | BOOLEAN | Produit actif |

---

## 3️⃣ PURCHASES (Achats)

**Rôle :** Historique des achats

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Acheteur |
| `product_id` | INT FK | Produit acheté |
| `price` | INT | Prix payé |
| `total_amount` | DECIMAL(10,2) | Montant total |
| `status` | ENUM | 'pending', 'completed', 'failed' |
| `created_at` | TIMESTAMP | Date d'achat |

---

## 4️⃣ USER_PRODUCTS (Produits actifs)

**Rôle :** Produits actifs générant des revenus quotidiens

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Propriétaire |
| `product_id` | INT FK | Produit |
| `purchase_id` | INT FK | Achat source |
| `purchase_price` | DECIMAL(10,2) | Prix payé |
| `daily_revenue` | DECIMAL(10,2) | Revenu/jour |
| `total_revenue` | DECIMAL(10,2) | Revenu total |
| `earned_so_far` | DECIMAL(10,2) | Déjà gagné |
| `days_elapsed` | INT | Jours écoulés |
| `start_date` | DATE | Date de début |
| `end_date` | DATE | Date de fin |
| `next_payout_date` | DATE | Prochain paiement |
| `status` | ENUM | 'active', 'completed', 'cancelled' |

---

## 5️⃣ TRANSACTIONS (Historique financier)

**Rôle :** Historique COMPLET de toutes les opérations

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Utilisateur |
| `type` | ENUM | Type de transaction |
| `amount` | DECIMAL(10,2) | Montant |
| `balance_before` | DECIMAL(10,2) | Solde avant |
| `balance_after` | DECIMAL(10,2) | Solde après |
| `description` | TEXT | Description |
| `reference_id` | INT | ID de référence |
| `reference_type` | VARCHAR(50) | Type de référence |
| `status` | ENUM | 'pending', 'completed', 'failed' |
| `created_at` | TIMESTAMP | Date |

**Types :**
- `deposit` - Rechargement
- `withdrawal` - Retrait
- `purchase` - Achat
- `commission` - Commission parrainage
- `bonus` - Bonus divers
- `checkin` - Check-in quotidien
- `referral_bonus` - Bonus parrainage
- `daily_revenue` - Revenu quotidien

---

## 6️⃣ REFERRALS (Parrainage)

**Rôle :** Réseau de parrainage multi-niveaux

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `referrer_id` | VARCHAR(36) FK | Parrain |
| `referred_id` | VARCHAR(36) FK | Filleul |
| `level` | INT | Niveau (1, 2, 3) |
| `commission_rate` | DECIMAL(5,2) | Taux (25, 3, 2) |
| `total_commission` | DECIMAL(10,2) | Total gagné |
| `total_purchases` | INT | Achats du filleul |
| `status` | VARCHAR(20) | 'active', 'inactive' |

---

## 7️⃣ TEAM_COMMISSIONS (Commissions)

**Rôle :** Détail des commissions de parrainage

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `referrer_id` | VARCHAR(36) FK | Qui reçoit |
| `referred_id` | VARCHAR(36) FK | Qui a acheté |
| `purchase_id` | INT FK | Achat source |
| `level` | INT | Niveau (1, 2, 3) |
| `commission_rate` | DECIMAL(5,2) | Taux appliqué |
| `purchase_amount` | DECIMAL(10,2) | Montant achat |
| `commission_amount` | DECIMAL(10,2) | Commission gagnée |
| `status` | ENUM | 'pending', 'paid', 'cancelled' |

---

## 8️⃣ BANK_ACCOUNTS (Comptes bancaires)

**Rôle :** Comptes bancaires des utilisateurs

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Propriétaire |
| `bank_name` | VARCHAR(100) | Nom de la banque |
| `account_holder` | VARCHAR(255) | Titulaire |
| `account_number` | VARCHAR(50) | Numéro de compte |
| `is_default` | BOOLEAN | Compte par défaut |
| `is_verified` | BOOLEAN | Vérifié par admin |
| `status` | ENUM | 'pending', 'active', 'rejected' |

---

## 9️⃣ WITHDRAWAL_REQUESTS (Retraits)

**Rôle :** Demandes de retrait avec validation admin

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Demandeur |
| `amount` | DECIMAL(10,2) | Montant demandé |
| `fee` | DECIMAL(10,2) | Frais (15%) |
| `net_amount` | DECIMAL(10,2) | Montant net |
| `bank_account_id` | INT FK | Compte destination |
| `status` | ENUM | État de la demande |
| `rejection_reason` | TEXT | Raison du rejet |
| `processed_by` | VARCHAR(36) FK | Admin |
| `processed_at` | TIMESTAMP | Date traitement |

**Status :**
- `pending` - En attente
- `processing` - En cours
- `completed` - Terminé
- `rejected` - Rejeté
- `cancelled` - Annulé

---

## 🔟 DAILY_CHECKINS (Check-ins)

**Rôle :** Enregistrements quotidiens avec bonus

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Utilisateur |
| `checkin_date` | DATE UNIQUE | Date du check-in |
| `reward_amount` | DECIMAL(10,2) | Récompense (50 FCFA) |
| `consecutive_days` | INT | Jours consécutifs |
| `total_reward` | DECIMAL(10,2) | Récompense totale |

**Contrainte :** 1 check-in par jour maximum

---

## 1️⃣1️⃣ REWARDS (Récompenses)

**Rôle :** Bonus et récompenses divers

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Bénéficiaire |
| `type` | ENUM | Type de récompense |
| `amount` | DECIMAL(10,2) | Montant |
| `description` | TEXT | Description |
| `source_user_id` | VARCHAR(36) FK | Source (parrain) |
| `status` | ENUM | 'pending', 'claimed', 'expired' |
| `expires_at` | TIMESTAMP | Date d'expiration |
| `claimed_at` | TIMESTAMP | Date réclamation |

**Types :**
- `signup` - Inscription (300 FCFA)
- `checkin` - Check-in quotidien
- `referral` - Parrainage
- `purchase_bonus` - Bonus achat
- `special` - Spécial

---

## 1️⃣2️⃣ NOTIFICATIONS

**Rôle :** Notifications utilisateurs

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Destinataire |
| `title` | VARCHAR(255) | Titre |
| `body` | TEXT | Contenu |
| `type` | VARCHAR(50) | Type de notification |
| `is_read` | BOOLEAN | Lu/Non lu |
| `created_at` | TIMESTAMP | Date création |

---

## 1️⃣3️⃣ SYSTEM_SETTINGS (Paramètres)

**Rôle :** Configuration du système

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `setting_key` | VARCHAR(100) UNIQUE | Clé du paramètre |
| `setting_value` | TEXT | Valeur |
| `description` | TEXT | Description |
| `data_type` | ENUM | 'string', 'number', 'boolean', 'json' |
| `is_public` | BOOLEAN | Visible frontend |

**Paramètres par défaut :**
- `signup_bonus` = 300
- `daily_checkin_bonus` = 50
- `referral_level1_rate` = 25
- `referral_level2_rate` = 3
- `referral_level3_rate` = 2
- `withdrawal_fee_rate` = 15
- `min_withdrawal_amount` = 1000
- `min_deposit_amount` = 2000

---

## 1️⃣4️⃣ ADMIN_LOGS

**Rôle :** Logs des actions admin

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `admin_id` | VARCHAR(36) FK | Admin |
| `action` | VARCHAR(100) | Action effectuée |
| `target_type` | VARCHAR(50) | Type de cible |
| `target_id` | VARCHAR(100) | ID de la cible |
| `details` | TEXT | Détails |
| `ip_address` | VARCHAR(45) | Adresse IP |
| `created_at` | TIMESTAMP | Date |

---

## 1️⃣5️⃣ SUPPORT_MESSAGES

**Rôle :** Messages du service client

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | ID auto-incrémenté |
| `user_id` | VARCHAR(36) FK | Utilisateur |
| `subject` | VARCHAR(255) | Sujet |
| `message` | TEXT | Message |
| `priority` | ENUM | 'low', 'normal', 'high', 'urgent' |
| `status` | ENUM | 'open', 'in_progress', 'resolved' |
| `admin_reply` | TEXT | Réponse admin |
| `replied_by` | VARCHAR(36) FK | Admin |
| `replied_at` | TIMESTAMP | Date réponse |

---

## 🔗 Relations principales

```
profiles (1:N) → purchases
profiles (1:N) → user_products
profiles (1:N) → transactions
profiles (1:N) → referrals (comme referrer ET referred)
profiles (1:N) → team_commissions
profiles (1:N) → bank_accounts
profiles (1:N) → withdrawal_requests
profiles (1:N) → daily_checkins
profiles (1:N) → rewards
profiles (1:N) → notifications

products (1:N) → purchases
products (1:N) → user_products

purchases (1:1) → user_products
purchases (1:N) → team_commissions

bank_accounts (1:N) → withdrawal_requests
```

---

## ⚡ Triggers et Procédures

### Trigger : `before_profile_insert`
- Génère automatiquement le `referral_code` unique

### Procédure : `process_purchase(user_id, product_id)`
- Effectue un achat atomique
- Vérifie le solde
- Débite le compte
- Crée l'achat
- Crée la transaction
- Retourne le résultat

---

## 📊 Index importants

| Table | Index | Colonnes |
|-------|-------|----------|
| profiles | idx_phone | phone |
| profiles | idx_referral_code | referral_code |
| transactions | idx_user_id | user_id |
| transactions | idx_type | type |
| user_products | idx_next_payout | next_payout_date |
| referrals | idx_referrer | referrer_id |
| team_commissions | idx_referrer | referrer_id |
| withdrawal_requests | idx_status | status |

---

## 🎯 Requêtes SQL utiles

### Solde utilisateur
```sql
SELECT balance FROM profiles WHERE id = 'user_id';
```

### Historique transactions
```sql
SELECT * FROM transactions WHERE user_id = 'user_id' ORDER BY created_at DESC LIMIT 20;
```

### Produits actifs
```sql
SELECT * FROM user_products WHERE user_id = 'user_id' AND status = 'active';
```

### Mes filleuls
```sql
SELECT * FROM referrals WHERE referrer_id = 'user_id' ORDER BY level, created_at;
```

### Commissions gagnées
```sql
SELECT SUM(commission_amount) FROM team_commissions WHERE referrer_id = 'user_id';
```

### Retraits en attente (admin)
```sql
SELECT * FROM withdrawal_requests WHERE status = 'pending' ORDER BY created_at;
```

---

**Fin de la référence rapide**

Pour plus de détails, consultez :
- `GUIDE_SCHEMA_COMPLET.md` - Guide complet
- `ANALYSE_TABLES_COMPLETES.md` - Analyse détaillée
- `backend/mysql/schema_complet.sql` - Schéma SQL

