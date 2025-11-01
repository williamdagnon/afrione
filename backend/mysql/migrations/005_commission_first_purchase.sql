-- Migration SQL pour mettre à jour le schéma et ajouter les commentaires
USE futuristia;

-- Ajouter un commentaire sur la table team_commissions
ALTER TABLE team_commissions COMMENT = 'Commissions de parrainage - Uniquement sur le premier achat de chaque filleul';

-- Ajouter un commentaire sur la colonne commission_amount
ALTER TABLE team_commissions MODIFY COLUMN commission_amount DECIMAL(10,2) NOT NULL COMMENT 'Montant de la commission (calculé sur le montant du premier achat uniquement)';

-- Ajouter un commentaire dans system_settings
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES 
('commission_info', 'first_purchase_only', 'Les commissions sont calculées uniquement sur le premier achat des filleuls')
ON DUPLICATE KEY UPDATE description = VALUES(description);