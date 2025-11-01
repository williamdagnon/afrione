-- ========================================================================
-- SEEDS - PRODUITS AFRIONE
-- Basé sur le tableau de la page Règlement
-- ========================================================================

USE afrionedb;

-- Supprimer les produits existants pour éviter les doublons
DELETE FROM products;

-- Insérer les 8 produits AFRIONE
INSERT INTO products (name, price, duration, duration_days, daily_revenue, total_revenue, image, description, is_active) VALUES

-- AFRIONE 001
('AFRIONE 001', 
 3000, 
 '120 jours', 
 120, 
 295, 
 35000, 
 'https://i.postimg.cc/nLyNJCQr/photo-5769215319028206521-y.jpg',
 'Investissement de base - Idéal pour commencer avec un revenu quotidien de 295 FCFA pendant 120 jours.',
 TRUE),

-- AFRIONE 002
('AFRIONE 002', 
 7000, 
 '120 jours', 
 120, 
 775, 
 93000, 
 'https://i.postimg.cc/nLyNJCQr/photo-5769215319028206521-y.jpg',
 'Plan intermédiaire - Revenu quotidien de 775 FCFA pendant 120 jours pour un total de 93,000 FCFA.',
 TRUE),

-- AFRIONE 003
('AFRIONE 003', 
 25000, 
 '120 jours', 
 120, 
 4000, 
 480000, 
 'https://i.postimg.cc/nLyNJCQr/photo-5769215319028206521-y.jpg',
 'Plan avancé - Revenu quotidien de 4,000 FCFA pendant 120 jours pour un total de 480,000 FCFA.',
 TRUE),

-- AFRIONE 004 (60,000)
('AFRIONE 004', 
 60000, 
 '120 jours', 
 120, 
 9000, 
 1080000, 
 'https://i.postimg.cc/nLyNJCQr/photo-5769215319028206521-y.jpg',
 'Plan premium - Revenu quotidien de 9,000 FCFA pendant 120 jours pour un total de 1,080,000 FCFA.',
 TRUE),

-- AFRIONE 005 (150,000)
('AFRIONE 005', 
 150000, 
 '120 jours', 
 120, 
 25000, 
 3000000, 
 'https://i.postimg.cc/nLyNJCQr/photo-5769215319028206521-y.jpg',
 'Plan excellence - Revenu quotidien de 25,000 FCFA pendant 120 jours pour un total de 3,000,000 FCFA.',
 TRUE),

-- AFRIONE 006 (300,000)
('AFRIONE 006', 
 300000, 
 '120 jours', 
 120, 
 45000, 
 5400000, 
 'https://i.postimg.cc/nLyNJCQr/photo-5769215319028206521-y.jpg',
 'Plan VIP - Revenu quotidien de 45,000 FCFA pendant 120 jours pour un total de 5,400,000 FCFA.',
 TRUE),

-- AFRIONE 007 (650,000)
('AFRIONE 007', 
 650000, 
 '120 jours', 
 120, 
 100000, 
 12000000, 
 'https://i.postimg.cc/nLyNJCQr/photo-5769215319028206521-y.jpg',
 'Plan Platinium - Revenu quotidien de 100,000 FCFA pendant 120 jours pour un total de 12,000,000 FCFA.',
 TRUE),

-- AFRIONE 008 (1,000,000)
('AFRIONE 008', 
 1000000, 
 '120 jours', 
 120, 
 260000, 
 31200000, 
 'https://i.postimg.cc/nLyNJCQr/photo-5769215319028206521-y.jpg',
 'Plan Diamond - Revenu quotidien de 260,000 FCFA pendant 120 jours pour un total de 31,200,000 FCFA.',
 TRUE);

-- Vérifier l'insertion
SELECT 
    id, 
    name, 
    CONCAT(FORMAT(price, 0), ' FCFA') as prix,
    CONCAT(FORMAT(daily_revenue, 0), ' FCFA') as revenu_quotidien,
    CONCAT(FORMAT(total_revenue, 0), ' FCFA') as revenu_total,
    duration,
    is_active
FROM products
ORDER BY price ASC;

-- ========================================================================
-- Résumé des produits insérés
-- ========================================================================
SELECT 
    COUNT(*) as total_produits,
    MIN(price) as prix_min,
    MAX(price) as prix_max,
    SUM(total_revenue) as revenu_total_possible
FROM products;

