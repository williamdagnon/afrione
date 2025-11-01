-- ========================================================================
-- TRIGGERS ET TABLES POUR LA GESTION DES RETRAITS
-- ========================================================================

-- Supprimer les triggers existants s'il y en a
DROP TRIGGER IF EXISTS before_withdrawal_request;
DROP TRIGGER IF EXISTS after_withdrawal_request;
DROP TRIGGER IF EXISTS before_withdrawal_cancel;

-- Table de suivi des retraits quotidiens
CREATE TABLE IF NOT EXISTS daily_withdrawal_counts (
    user_id VARCHAR(36) NOT NULL,
    withdrawal_date DATE NOT NULL,
    count INT DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    PRIMARY KEY (user_id, withdrawal_date),
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Trigger BEFORE INSERT sur withdrawal_requests
DELIMITER //
CREATE TRIGGER before_withdrawal_request
BEFORE INSERT ON withdrawal_requests
FOR EACH ROW
BEGIN
    DECLARE today_count INT;
    DECLARE user_balance DECIMAL(10, 2);
    
    -- Vérifier le solde avec verrou
    SELECT balance INTO user_balance 
    FROM profiles 
    WHERE id = NEW.user_id 
    FOR UPDATE;
    
    IF user_balance < NEW.amount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Solde insuffisant pour effectuer ce retrait';
    END IF;

    -- Vérifier la limite quotidienne
    SELECT COALESCE(COUNT(*), 0) INTO today_count
    FROM withdrawal_requests 
    WHERE user_id = NEW.user_id 
    AND DATE(created_at) = CURDATE()
    AND status != 'cancelled';

    IF today_count >= 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Limite de 2 retraits par jour atteinte';
    END IF;

    -- Débiter le solde immédiatement
    UPDATE profiles 
    SET balance = balance - NEW.amount,
        total_withdrawn = total_withdrawn + NEW.amount
    WHERE id = NEW.user_id;
END//
DELIMITER ;

-- Trigger AFTER INSERT sur withdrawal_requests
DELIMITER //
CREATE TRIGGER after_withdrawal_request
AFTER INSERT ON withdrawal_requests
FOR EACH ROW
BEGIN
    -- Mettre à jour le compteur quotidien
    INSERT INTO daily_withdrawal_counts (user_id, withdrawal_date, count, total_amount)
    VALUES (NEW.user_id, CURDATE(), 1, NEW.amount)
    ON DUPLICATE KEY UPDATE
        count = count + 1,
        total_amount = total_amount + NEW.amount;

    -- Créer une transaction
    INSERT INTO transactions (
        user_id, 
        type,
        amount,
        status,
        description,
        reference_id,
        reference_type
    ) VALUES (
        NEW.user_id,
        'withdrawal',
        NEW.amount,
        'pending',
        CONCAT('Demande de retrait #', NEW.id),
        NEW.id,
        'withdrawal_request'
    );

    -- Créer une notification
    INSERT INTO notifications (
        user_id,
        title,
        body,
        is_read
    ) VALUES (
        NEW.user_id,
        'Demande de retrait créée',
        CONCAT('Votre demande de retrait de ', NEW.amount, ' FCFA a été créée et est en attente de validation. Le montant a été débité de votre solde.'),
        FALSE
    );
END//
DELIMITER ;

-- Trigger BEFORE UPDATE pour la gestion des annulations
DELIMITER //
CREATE TRIGGER before_withdrawal_cancel
BEFORE UPDATE ON withdrawal_requests
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status = 'pending' THEN
        -- Rembourser le solde
        UPDATE profiles 
        SET balance = balance + OLD.amount,
            total_withdrawn = total_withdrawn - OLD.amount
        WHERE id = OLD.user_id;

        -- Mettre à jour les statistiques quotidiennes
        UPDATE daily_withdrawal_counts
        SET count = count - 1,
            total_amount = total_amount - OLD.amount
        WHERE user_id = OLD.user_id 
        AND withdrawal_date = DATE(OLD.created_at);

        -- Mettre à jour le statut de la transaction
        UPDATE transactions
        SET status = 'cancelled'
        WHERE reference_id = OLD.id 
        AND reference_type = 'withdrawal_request';
    END IF;
END//
DELIMITER ;