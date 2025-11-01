# 📚 GUIDE DU SCHÉMA COMPLET

## 🎯 Vue d'ensemble

Le fichier `backend/mysql/schema_complet.sql` contient **TOUTES** les tables nécessaires pour un système complet avec :

✅ **15 tables** au total
✅ **Relations complètes** entre toutes les tables
✅ **Triggers automatiques** pour génération du code de parrainage
✅ **Procédure stockée** pour les achats avec commissions
✅ **Paramètres système** configurables

---

## 📊 Liste des tables

| # | Table | Rôle | Lignes estimées |
|---|-------|------|-----------------|
| 1 | profiles | Utilisateurs (version étendue) | 1000+ |
| 2 | products | Produits d'investissement | 10-50 |
| 3 | purchases | Achats effectués | 5000+ |
| 4 | user_products | Produits actifs (revenus quotidiens) | 5000+ |
| 5 | transactions | Historique financier complet | 50000+ |
| 6 | referrals | Réseau de parrainage | 3000+ |
| 7 | team_commissions | Commissions gagnées | 10000+ |
| 8 | bank_accounts | Comptes bancaires des utilisateurs | 1000+ |
| 9 | withdrawal_requests | Demandes de retrait | 5000+ |
| 10 | daily_checkins | Check-ins quotidiens | 30000+ |
| 11 | rewards | Bonus et récompenses | 10000+ |
| 12 | notifications | Notifications utilisateurs | 20000+ |
| 13 | system_settings | Configuration du système | 10-50 |
| 14 | admin_logs | Logs administrateur | 10000+ |
| 15 | support_messages | Messages de support | 1000+ |

---

## 🚀 Installation

### Option 1 : Schéma complet (Recommandé pour nouveau projet)

```bash
mysql -u root -p < backend/mysql/schema_complet.sql
```

Cela créera :
- La base de données `afrionedb`
- Les 15 tables
- Les triggers
- Les procédures stockées
- Les données initiales (system_settings)

### Option 2 : Migration depuis le schéma basique

Si vous avez déjà utilisé `schema.sql` :

```bash
# Sauvegarder d'abord vos données !
mysqldump -u root -p afrionedb > backup.sql

# Puis exécuter le schéma complet
mysql -u root -p < backend/mysql/schema_complet.sql
```

---

## 🔑 Nouveaux champs dans `profiles`

```sql
-- Champs ajoutés à la table profiles
referral_code VARCHAR(10)           -- Code de parrainage unique (auto-généré)
referred_by VARCHAR(36)             -- ID du parrain
total_referrals INT                 -- Nombre de filleuls
total_earnings DECIMAL(10, 2)       -- Gains totaux
total_invested DECIMAL(10, 2)       -- Total investi
total_withdrawn DECIMAL(10, 2)      -- Total retiré
referral_earnings DECIMAL(10, 2)    -- Gains de parrainage
signup_bonus_claimed BOOLEAN        -- Bonus d'inscription réclamé
last_checkin_date DATE              -- Dernier check-in
consecutive_checkins INT            -- Jours consécutifs
```

---

## 🎯 Cas d'utilisation principaux

### 1. Inscription d'un utilisateur

```sql
-- L'utilisateur s'inscrit
INSERT INTO profiles (phone, password, display_name, referred_by)
VALUES ('+225XXXXXXXX', 'hash...', 'John Doe', 'autre_user_id');

-- Le trigger génère automatiquement le referral_code

-- Créer la relation de parrainage
INSERT INTO referrals (referrer_id, referred_id, level, commission_rate)
VALUES ('parrain_id', LAST_INSERT_ID(), 1, 25.00);

-- Créer le bonus d'inscription
INSERT INTO rewards (user_id, type, amount, status)
VALUES (LAST_INSERT_ID(), 'signup', 300.00, 'pending');
```

### 2. Achat d'un produit

```sql
-- Utiliser la procédure stockée
CALL process_purchase('user_id', product_id, @result, @new_balance);

-- Vérifier le résultat
SELECT @result, @new_balance;

-- Créer le produit actif pour l'utilisateur
INSERT INTO user_products (user_id, product_id, purchase_id, ...)
VALUES (...);

-- Calculer et distribuer les commissions de parrainage
-- (voir section Commissions ci-dessous)
```

### 3. Système de parrainage à 3 niveaux

```sql
-- Niveau 1 : Filleuls directs (25%)
-- Niveau 2 : Filleuls des filleuls (3%)
-- Niveau 3 : Filleuls de niveau 2 (2%)

-- Récupérer la chaîne de parrainage
WITH RECURSIVE referral_chain AS (
  SELECT id, referred_by, 1 as level
  FROM profiles
  WHERE id = 'new_user_id'
  
  UNION ALL
  
  SELECT p.id, p.referred_by, rc.level + 1
  FROM profiles p
  INNER JOIN referral_chain rc ON p.id = rc.referred_by
  WHERE rc.level < 3
)
SELECT * FROM referral_chain WHERE referred_by IS NOT NULL;
```

### 4. Check-in quotidien

```sql
-- Vérifier si déjà fait aujourd'hui
SELECT * FROM daily_checkins 
WHERE user_id = 'user_id' AND checkin_date = CURDATE();

-- Si non, créer le check-in
INSERT INTO daily_checkins (user_id, checkin_date, consecutive_days)
VALUES ('user_id', CURDATE(), 
  (SELECT COALESCE(consecutive_checkins, 0) + 1 FROM profiles WHERE id = 'user_id')
);

-- Créditer le bonus
UPDATE profiles 
SET balance = balance + 50, 
    total_checkin_bonus = total_checkin_bonus + 50,
    consecutive_checkins = consecutive_checkins + 1
WHERE id = 'user_id';
```

### 5. Retrait

```sql
-- Créer la demande de retrait
INSERT INTO withdrawal_requests (
  user_id, amount, fee, net_amount, bank_account_id, status
)
VALUES (
  'user_id',
  10000,
  1500,  -- 15% de frais
  8500,
  bank_account_id,
  'pending'
);

-- Débiter le solde immédiatement (ou à l'approbation selon votre logique)
UPDATE profiles 
SET balance = balance - 10000 
WHERE id = 'user_id' AND balance >= 10000;
```

---

## 🔄 CRON Jobs nécessaires

Pour un fonctionnement automatique, vous devez créer ces tâches planifiées :

### 1. Versement des revenus quotidiens

```sql
-- À exécuter chaque jour à 00:01
UPDATE user_products up
INNER JOIN profiles p ON up.user_id = p.id
SET 
  up.days_elapsed = up.days_elapsed + 1,
  up.earned_so_far = up.earned_so_far + up.daily_revenue,
  up.last_payout_date = CURDATE(),
  up.next_payout_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  p.balance = p.balance + up.daily_revenue,
  p.total_earnings = p.total_earnings + up.daily_revenue
WHERE 
  up.status = 'active' 
  AND CURDATE() >= up.next_payout_date
  AND CURDATE() <= up.end_date;

-- Marquer les produits terminés
UPDATE user_products
SET status = 'completed'
WHERE status = 'active' AND CURDATE() > end_date;
```

### 2. Reset des check-ins non consécutifs

```sql
-- Réinitialiser les compteurs si pas de check-in depuis 2 jours
UPDATE profiles
SET consecutive_checkins = 0
WHERE last_checkin_date < DATE_SUB(CURDATE(), INTERVAL 2 DAY);
```

### 3. Expiration des récompenses

```sql
-- Expirer les récompenses non réclamées
UPDATE rewards
SET status = 'expired'
WHERE status = 'pending' 
  AND expires_at IS NOT NULL 
  AND expires_at < NOW();
```

---

## 📊 Requêtes utiles

### Statistiques utilisateur

```sql
-- Dashboard utilisateur
SELECT 
  p.id,
  p.display_name,
  p.balance,
  p.total_earnings,
  p.total_invested,
  p.referral_code,
  p.total_referrals,
  COUNT(DISTINCT up.id) as active_products,
  SUM(up.daily_revenue) as daily_income
FROM profiles p
LEFT JOIN user_products up ON p.id = up.user_id AND up.status = 'active'
WHERE p.id = 'user_id'
GROUP BY p.id;
```

### Top parrains

```sql
-- Utilisateurs avec le plus de filleuls
SELECT 
  p.id,
  p.display_name,
  p.referral_code,
  p.total_referrals,
  p.referral_earnings,
  COUNT(DISTINCT r.id) as direct_referrals
FROM profiles p
LEFT JOIN referrals r ON p.id = r.referrer_id AND r.level = 1
GROUP BY p.id
ORDER BY p.total_referrals DESC
LIMIT 10;
```

### Retraits en attente

```sql
-- Liste des retraits à traiter
SELECT 
  wr.id,
  p.display_name,
  p.phone,
  wr.amount,
  wr.net_amount,
  ba.bank_name,
  ba.account_number,
  wr.created_at
FROM withdrawal_requests wr
INNER JOIN profiles p ON wr.user_id = p.id
INNER JOIN bank_accounts ba ON wr.bank_account_id = ba.id
WHERE wr.status = 'pending'
ORDER BY wr.created_at ASC;
```

---

## 🔒 Sécurité

### Contraintes importantes

```sql
-- Vérifier qu'un retrait ne dépasse pas le solde
DELIMITER //
CREATE TRIGGER before_withdrawal_insert
BEFORE INSERT ON withdrawal_requests
FOR EACH ROW
BEGIN
  DECLARE user_balance DECIMAL(10, 2);
  SELECT balance INTO user_balance FROM profiles WHERE id = NEW.user_id;
  
  IF user_balance < NEW.amount THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Solde insuffisant pour ce retrait';
  END IF;
END //
DELIMITER ;
```

---

## 📈 Optimisations

### Index à vérifier régulièrement

```sql
-- Vérifier l'utilisation des index
SHOW INDEX FROM transactions;
SHOW INDEX FROM user_products;

-- Analyser les requêtes lentes
SHOW FULL PROCESSLIST;
```

### Archivage des données anciennes

```sql
-- Archiver les transactions de plus d'1 an
CREATE TABLE transactions_archive LIKE transactions;

INSERT INTO transactions_archive
SELECT * FROM transactions
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM transactions
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## 🆘 Commandes utiles

### Voir la structure

```sql
DESCRIBE profiles;
DESCRIBE user_products;
SHOW TABLES;
```

### Statistiques globales

```sql
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM purchases) as total_purchases,
  (SELECT SUM(balance) FROM profiles) as total_balance,
  (SELECT COUNT(*) FROM user_products WHERE status = 'active') as active_investments;
```

### Backup

```bash
# Backup complet
mysqldump -u root -p afrionedb > backup_$(date +%Y%m%d).sql

# Backup structure seulement
mysqldump -u root -p --no-data afrionedb > structure.sql

# Restore
mysql -u root -p afrionedb < backup_20241029.sql
```

---

## 🎯 Prochaines étapes

1. **Installer le schéma complet**
   ```bash
   mysql -u root -p < backend/mysql/schema_complet.sql
   ```

2. **Mettre à jour backend/.env**
   ```env
   DB_NAME=afrionedb
   ```

3. **Créer les contrôleurs backend** pour ces nouvelles tables

4. **Implémenter les CRON jobs** pour les revenus quotidiens

5. **Tester le système de parrainage**

---

**Le schéma est maintenant 100% complet et prêt pour la production ! 🚀**

