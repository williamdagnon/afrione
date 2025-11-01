-- ========================================================================
-- SCHÉMA COMPLET MySQL pour AFRIONE/Futuristia
-- Inclut TOUTES les tables nécessaires pour un fonctionnement complet
-- ========================================================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS afrionedb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE afrionedb;

-- ========================================================================
-- 1. PROFILES (Utilisateurs) - VERSION COMPLÈTE
-- ========================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  phone VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  
  -- Finances
  balance DECIMAL(10, 2) DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  total_invested DECIMAL(10, 2) DEFAULT 0,
  total_withdrawn DECIMAL(10, 2) DEFAULT 0,
  
  -- Parrainage
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by VARCHAR(36),
  total_referrals INT DEFAULT 0,
  referral_earnings DECIMAL(10, 2) DEFAULT 0,
  
  -- Bonus et récompenses
  signup_bonus_claimed BOOLEAN DEFAULT FALSE,
  last_checkin_date DATE,
  consecutive_checkins INT DEFAULT 0,
  total_checkin_bonus DECIMAL(10, 2) DEFAULT 0,
  
  -- Sécurité et administration
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referred_by) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_phone (phone),
  INDEX idx_role (role),
  INDEX idx_referral_code (referral_code),
  INDEX idx_referred_by (referred_by),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 2. PRODUCTS (Produits)
-- ========================================================================

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  duration VARCHAR(50),
  duration_days INT NOT NULL,
  daily_revenue INT,
  total_revenue INT,
  image TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT -1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_price (price),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 3. PURCHASES (Achats)
-- ========================================================================

CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36),
  product_id INT,
  price INT NOT NULL,
  quantity INT DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'balance',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 4. USER_PRODUCTS (Produits actifs des utilisateurs)
-- ========================================================================

CREATE TABLE IF NOT EXISTS user_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  purchase_id INT NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  daily_revenue DECIMAL(10, 2) NOT NULL,
  total_revenue DECIMAL(10, 2) NOT NULL,
  earned_so_far DECIMAL(10, 2) DEFAULT 0,
  duration_days INT NOT NULL,
  days_elapsed INT DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  last_payout_date DATE,
  next_payout_date DATE,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_next_payout (next_payout_date),
  INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 5. TRANSACTIONS (Historique des transactions)
-- ========================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('deposit', 'withdrawal', 'purchase', 'commission', 'bonus', 'checkin', 'referral_bonus', 'daily_revenue', 'refund') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  description TEXT,
  reference_id INT,
  reference_type VARCHAR(50),
  metadata JSON,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 6. REFERRALS (Système de parrainage)
-- ========================================================================

CREATE TABLE IF NOT EXISTS referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id VARCHAR(36) NOT NULL,
  referred_id VARCHAR(36) NOT NULL,
  level INT NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  total_commission DECIMAL(10, 2) DEFAULT 0,
  total_purchases INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_referral (referrer_id, referred_id),
  INDEX idx_referrer (referrer_id),
  INDEX idx_referred (referred_id),
  INDEX idx_level (level),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 7. TEAM_COMMISSIONS (Commissions d'équipe)
-- ========================================================================

CREATE TABLE IF NOT EXISTS team_commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id VARCHAR(36) NOT NULL,
  referred_id VARCHAR(36) NOT NULL,
  purchase_id INT NOT NULL,
  level INT NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  purchase_amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'cancelled') DEFAULT 'paid',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  INDEX idx_referrer (referrer_id),
  INDEX idx_referred (referred_id),
  INDEX idx_purchase (purchase_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 8. BANK_ACCOUNTS (Comptes bancaires)
-- ========================================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_holder VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  bank_code VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'active', 'rejected', 'suspended') DEFAULT 'pending',
  verification_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 9. WITHDRAWAL_REQUESTS (Demandes de retrait)
-- ========================================================================

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  fee DECIMAL(10, 2) NOT NULL,
  fee_percentage DECIMAL(5, 2) DEFAULT 15.00,
  net_amount DECIMAL(10, 2) NOT NULL,
  bank_account_id INT NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'rejected', 'cancelled') DEFAULT 'pending',
  rejection_reason TEXT,
  admin_note TEXT,
  processed_by VARCHAR(36),
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

-- ========================================================================
-- 10. DAILY_CHECKINS (Pointages quotidiens)
-- ========================================================================

CREATE TABLE IF NOT EXISTS daily_checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  checkin_date DATE NOT NULL,
  reward_amount DECIMAL(10, 2) DEFAULT 50.00,
  consecutive_days INT DEFAULT 1,
  bonus_multiplier DECIMAL(5, 2) DEFAULT 1.00,
  total_reward DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_checkin (user_id, checkin_date),
  INDEX idx_user_id (user_id),
  INDEX idx_checkin_date (checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 11. REWARDS (Récompenses et bonus)
-- ========================================================================

CREATE TABLE IF NOT EXISTS rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('signup', 'checkin', 'referral', 'purchase_bonus', 'special', 'level_up') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  source_user_id VARCHAR(36),
  source_transaction_id INT,
  metadata JSON,
  status ENUM('pending', 'claimed', 'expired', 'cancelled') DEFAULT 'pending',
  expires_at TIMESTAMP NULL,
  claimed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (source_user_id) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 12. NOTIFICATIONS (Notifications)
-- ========================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36),
  title VARCHAR(255),
  body TEXT,
  type VARCHAR(50) DEFAULT 'info',
  action_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 13. SYSTEM_SETTINGS (Paramètres système)
-- ========================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  updated_by VARCHAR(36),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_key (setting_key),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 14. ADMIN_LOGS (Logs administrateur)
-- ========================================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(100),
  details TEXT,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 15. SUPPORT_MESSAGES (Messages support client)
-- ========================================================================

CREATE TABLE IF NOT EXISTS support_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  category VARCHAR(50) DEFAULT 'general',
  admin_reply TEXT,
  replied_by VARCHAR(36),
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (replied_by) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TRIGGERS ET PROCÉDURES STOCKÉES
-- ========================================================================

-- Trigger : Générer un code de parrainage unique à l'insertion
DELIMITER //

CREATE TRIGGER before_profile_insert
BEFORE INSERT ON profiles
FOR EACH ROW
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    SET NEW.referral_code = UPPER(SUBSTRING(MD5(RAND()), 1, 6));
  END IF;
END //

DELIMITER ;

-- Procédure : Effectuer un achat avec gestion des commissions
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS process_purchase(
  IN p_user_id VARCHAR(36),
  IN p_product_id INT,
  OUT result VARCHAR(20),
  OUT new_balance DECIMAL(10, 2)
)
BEGIN
  DECLARE p_price DECIMAL(10, 2);
  DECLARE user_balance DECIMAL(10, 2);
  DECLARE purchase_id INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET result = 'error';
  END;

  START TRANSACTION;

  -- Récupérer le prix du produit
  SELECT price INTO p_price FROM products WHERE id = p_product_id AND is_active = TRUE FOR UPDATE;
  
  IF p_price IS NULL THEN
    SET result = 'product_not_found';
    ROLLBACK;
  ELSE
    -- Récupérer le solde de l'utilisateur
    SELECT balance INTO user_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

    IF user_balance IS NULL THEN
      SET result = 'no_profile';
      ROLLBACK;
    ELSEIF user_balance < p_price THEN
      SET result = 'insufficient';
      ROLLBACK;
    ELSE
      -- Déduire le montant
      UPDATE profiles SET balance = balance - p_price, total_invested = total_invested + p_price 
      WHERE id = p_user_id;
      
      -- Enregistrer l'achat
      INSERT INTO purchases(user_id, product_id, price, total_amount) 
      VALUES (p_user_id, p_product_id, p_price, p_price);
      
      SET purchase_id = LAST_INSERT_ID();
      
      -- Enregistrer la transaction
      INSERT INTO transactions(user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type)
      VALUES (p_user_id, 'purchase', p_price, user_balance, user_balance - p_price, 
              CONCAT('Achat produit #', p_product_id), purchase_id, 'purchase');
      
      -- Récupérer le nouveau solde
      SELECT balance INTO new_balance FROM profiles WHERE id = p_user_id;
      
      COMMIT;
      SET result = 'ok';
    END IF;
  END IF;
END //

DELIMITER ;

-- ========================================================================
-- DONNÉES INITIALES
-- ========================================================================

-- Paramètres système par défaut
INSERT INTO system_settings (setting_key, setting_value, description, data_type, category, is_public) VALUES
('signup_bonus', '300', 'Bonus d\'inscription en FCFA', 'number', 'rewards', TRUE),
('daily_checkin_bonus', '50', 'Bonus de check-in quotidien en FCFA', 'number', 'rewards', TRUE),
('referral_level1_rate', '25', 'Taux de commission niveau 1 (%)', 'number', 'referral', TRUE),
('referral_level2_rate', '3', 'Taux de commission niveau 2 (%)', 'number', 'referral', TRUE),
('referral_level3_rate', '2', 'Taux de commission niveau 3 (%)', 'number', 'referral', TRUE),
('withdrawal_fee_rate', '15', 'Taux de frais de retrait (%)', 'number', 'financial', TRUE),
('min_withdrawal_amount', '1000', 'Montant minimum de retrait en FCFA', 'number', 'financial', TRUE),
('min_deposit_amount', '2000', 'Montant minimum de dépôt en FCFA', 'number', 'financial', TRUE),
('platform_name', 'AFRIONE', 'Nom de la plateforme', 'string', 'general', TRUE),
('support_email', 'support@afrione.com', 'Email de support', 'string', 'general', TRUE)
ON DUPLICATE KEY UPDATE setting_value=setting_value;

-- ========================================================================
-- FIN DU SCHÉMA
-- ========================================================================

-- PATCH AI - Table Payment Methods / Banques
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PATCH AI - Table Manual Deposits (dépôts manuels)
CREATE TABLE IF NOT EXISTS manual_deposits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  payment_method_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  deposit_number VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  admin_note VARCHAR(255),
  admin_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (admin_id) REFERENCES profiles(id)
);

