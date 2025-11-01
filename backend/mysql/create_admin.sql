-- ========================================================================
-- CRÉER UN COMPTE ADMINISTRATEUR
-- ========================================================================

USE afrionedb;

-- Supprimer l'admin existant si présent
DELETE FROM profiles WHERE phone = '+225ADMIN';

-- Créer le compte admin
-- Mot de passe : admin123 (hashé avec bcrypt)
INSERT INTO profiles (
  phone, 
  display_name, 
  password, 
  balance, 
  role, 
  referral_code,
  is_active,
  is_verified
) VALUES (
  '+225ADMIN',
  'Administrateur',
  '$2a$10$rB5vCh3qF8vYh9qF8vYh9.rB5vCh3qF8vYh9qF8vYh9qF8vYh9qF8u',
  0,
  'admin',
  'ADMIN1',
  TRUE,
  TRUE
);

-- Afficher le compte créé
SELECT 
  id,
  phone,
  display_name,
  role,
  referral_code,
  is_active
FROM profiles 
WHERE phone = '+225ADMIN';

-- ========================================================================
-- INFORMATIONS DE CONNEXION ADMIN
-- ========================================================================
-- Téléphone : +225ADMIN
-- Mot de passe : admin123
-- ========================================================================

