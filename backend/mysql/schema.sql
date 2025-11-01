-- Schema MySQL pour Futuristia
-- Remplace le schéma PostgreSQL/Supabase

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS futuristia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE futuristia;

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  phone VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  duration VARCHAR(50),
  daily_revenue INT,
  total_revenue INT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des achats
CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36),
  product_id INT,
  price INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36),
  title VARCHAR(255),
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Procédure stockée pour les achats atomiques
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS attempt_purchase(
  IN p_user VARCHAR(36),
  IN p_product_id INT,
  OUT result VARCHAR(20)
)
BEGIN
  DECLARE p_price INT;
  DECLARE user_balance DECIMAL(10, 2);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET result = 'error';
  END;

  START TRANSACTION;

  -- Récupérer le prix du produit avec verrou
  SELECT price INTO p_price FROM products WHERE id = p_product_id FOR UPDATE;

  -- Récupérer le solde de l'utilisateur avec verrou
  SELECT balance INTO user_balance FROM profiles WHERE id = p_user FOR UPDATE;

  -- Vérifier si le profil existe
  IF user_balance IS NULL THEN
    SET result = 'no_profile';
    ROLLBACK;
  -- Vérifier le solde suffisant
  ELSEIF user_balance < p_price THEN
    SET result = 'insufficient';
    ROLLBACK;
  ELSE
    -- Déduire le montant
    UPDATE profiles SET balance = balance - p_price WHERE id = p_user;
    
    -- Enregistrer l'achat
    INSERT INTO purchases(user_id, product_id, price) VALUES (p_user, p_product_id, p_price);
    
    COMMIT;
    SET result = 'ok';
  END IF;
END //

DELIMITER ;

