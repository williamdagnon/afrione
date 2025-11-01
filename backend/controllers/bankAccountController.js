import pool from '../config/database.js';

/**
 * Récupérer tous les comptes bancaires de l'utilisateur
 */
export const getMyBankAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const [accounts] = await pool.query(`
      SELECT 
        id, bank_name, account_holder, account_number,
        is_default, is_verified, status, created_at
      FROM bank_accounts
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Erreur getMyBankAccounts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des comptes bancaires'
    });
  }
};

/**
 * Ajouter un nouveau compte bancaire
 */
export const createBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bank_name, account_holder, account_number } = req.body;

    // Validation
    if (!bank_name || !account_holder || !account_number) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Vérifier si c'est le premier compte
    const [existing] = await pool.query(
      'SELECT COUNT(*) as count FROM bank_accounts WHERE user_id = ?',
      [userId]
    );

    const isFirstAccount = existing[0].count === 0;

    // Créer le compte comme vérifié directement
    const [result] = await pool.query(`
      INSERT INTO bank_accounts (
        user_id, bank_name, account_holder, account_number,
        is_default, status, is_verified
      ) VALUES (?, ?, ?, ?, ?, 'active', TRUE)
    `, [userId, bank_name, account_holder, account_number, isFirstAccount]);

    res.status(201).json({
      success: true,
      message: 'Compte bancaire ajouté avec succès',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Erreur createBankAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du compte bancaire'
    });
  }
};

/**
 * Définir un compte comme compte par défaut
 */
export const setDefaultBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Vérifier que le compte appartient à l'utilisateur
    const [account] = await pool.query(
      'SELECT id FROM bank_accounts WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (account.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Compte bancaire non trouvé'
      });
    }

    // Retirer le statut par défaut de tous les comptes
    await pool.query(
      'UPDATE bank_accounts SET is_default = FALSE WHERE user_id = ?',
      [userId]
    );

    // Définir le nouveau compte par défaut
    await pool.query(
      'UPDATE bank_accounts SET is_default = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Compte par défaut mis à jour'
    });
  } catch (error) {
    console.error('Erreur setDefaultBankAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du compte par défaut'
    });
  }
};

/**
 * Supprimer un compte bancaire
 */
export const deleteBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Vérifier que le compte appartient à l'utilisateur
    const [account] = await pool.query(
      'SELECT id, is_default FROM bank_accounts WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (account.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Compte bancaire non trouvé'
      });
    }

    // Vérifier qu'il n'y a pas de retraits en cours avec ce compte
    const [pendingWithdrawals] = await pool.query(
      'SELECT COUNT(*) as count FROM withdrawal_requests WHERE bank_account_id = ? AND status IN (\'pending\', \'processing\')',
      [id]
    );

    if (pendingWithdrawals[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un compte avec des retraits en cours'
      });
    }

    // Supprimer le compte
    await pool.query('DELETE FROM bank_accounts WHERE id = ?', [id]);

    // Si c'était le compte par défaut, définir un autre compte comme par défaut
    if (account[0].is_default) {
      await pool.query(`
        UPDATE bank_accounts 
        SET is_default = TRUE 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);
    }

    res.json({
      success: true,
      message: 'Compte bancaire supprimé'
    });
  } catch (error) {
    console.error('Erreur deleteBankAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du compte bancaire'
    });
  }
};

/**
 * ADMIN: Récupérer tous les comptes bancaires en attente de vérification
 */
export const getPendingBankAccounts = async (req, res) => {
  try {
    const [accounts] = await pool.query(`
      SELECT 
        ba.id, ba.bank_name, ba.account_holder, ba.account_number,
        ba.status, ba.created_at,
        p.id as user_id, p.display_name, p.phone
      FROM bank_accounts ba
      INNER JOIN profiles p ON ba.user_id = p.id
      WHERE ba.status = 'pending'
      ORDER BY ba.created_at ASC
    `);

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Erreur getPendingBankAccounts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des comptes en attente'
    });
  }
};

/**
 * ADMIN: Vérifier un compte bancaire
 */
export const verifyBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`
      UPDATE bank_accounts 
      SET status = 'active', is_verified = TRUE 
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Compte bancaire vérifié'
    });
  } catch (error) {
    console.error('Erreur verifyBankAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du compte'
    });
  }
};

/**
 * ADMIN: Rejeter un compte bancaire
 */
export const rejectBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.query(`
      UPDATE bank_accounts 
      SET status = 'rejected', verification_note = ? 
      WHERE id = ?
    `, [reason, id]);

    res.json({
      success: true,
      message: 'Compte bancaire rejeté'
    });
  } catch (error) {
    console.error('Erreur rejectBankAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet du compte'
    });
  }
};

/**
 * ADMIN: Récupérer tous les comptes bancaires (pour audit)
 */
export const getAllBankAccounts = async (req, res) => {
  try {
    const [accounts] = await pool.query(`
      SELECT 
        ba.id, ba.bank_name, ba.account_holder, ba.account_number,
        ba.status, ba.is_verified, ba.created_at, ba.verification_note,
        p.id as user_id, p.display_name, p.phone
      FROM bank_accounts ba
      INNER JOIN profiles p ON ba.user_id = p.id
      ORDER BY ba.created_at DESC
    `);
    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Erreur getAllBankAccounts:', error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération de tous les comptes bancaires" });
  }
};

