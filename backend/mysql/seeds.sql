-- Données de test pour MySQL - Futuristia

USE futuristia;

-- Insérer des produits d'exemple
INSERT INTO products (name, price, duration, daily_revenue, total_revenue, image) VALUES
('AFRIONE 001', 2000, '60 jours', 300, 18000, 'https://i.postimg.cc/CxdtC25m/photo-5767022527770201182-y.jpg'),
('AFRIONE 002', 6000, '60 jours', 930, 55800, 'https://i.postimg.cc/CxdtC25m/photo-5767022527770201182-y.jpg'),
('AFRIONE 003', 15000, '60 jours', 2400, 144000, 'https://i.postimg.cc/CxdtC25m/photo-5767022527770201182-y.jpg')
ON DUPLICATE KEY UPDATE name=name;

