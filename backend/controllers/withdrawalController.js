import pool from '../config/database.js';
import { createTransaction } from './transactionController.js';

/**
 * Récupérer mes demandes de retrait
 */
export const getMyWithdrawals = async (req, res) => {
  try {
    const userId = req.user.id;

    const [withdrawals] = await pool.query(`
      SELECT 
        wr.id, wr.amount, wr.fee, wr.net_amount, wr.status,
        wr.rejection_reason, wr.created_at, wr.processed_at,
        ba.bank_name, ba.account_number, ba.account_holder
      FROM withdrawal_requests wr
      INNER JOIN bank_accounts ba ON wr.bank_account_id = ba.id
      WHERE wr.user_id = ?
      ORDER BY wr.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    console.error('Erreur getMyWithdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des retraits'
    });
  }
};

/**
 * Créer une demande de retrait
 */
export const createWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bank_account_id } = req.body;

    // Validation de base
    if (!amount || !bank_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Montant et compte bancaire requis'
      });
    }

    const parsedAmount = parseFloat(amount);

    // Vérifier le montant minimum
    const [settings] = await pool.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['min_withdrawal_amount']
    );

    const minAmount = parseFloat(settings[0]?.setting_value || 1000);

    if (parsedAmount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Le montant minimum de retrait est de ${minAmount} FCFA`
      });
    }

    // Vérifier le compte bancaire
    const [bankAccount] = await pool.query(
      'SELECT id, is_verified, status FROM bank_accounts WHERE id = ? AND user_id = ?',
      [bank_account_id, userId]
    );

    if (bankAccount.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Compte bancaire non trouvé'
      });
    }

    if (!bankAccount[0].is_verified || bankAccount[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Compte bancaire non vérifié'
      });
    }

    // Calculer les frais
    const [feeSettings] = await pool.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['withdrawal_fee_rate']
    );

    const feeRate = parseFloat(feeSettings[0]?.setting_value || 15);
    const fee = (parsedAmount * feeRate) / 100;
    const netAmount = parsedAmount - fee;

    // Créer la demande de retrait
    // Les triggers s'occupent de:
    // - la vérification du solde
    // - la vérification de la limite quotidienne
    // - la mise à jour du solde
    // - la création de la transaction
    // - la création de la notification
    const [result] = await pool.query(
      'INSERT INTO withdrawal_requests (user_id, amount, fee, fee_percentage, net_amount, bank_account_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, parsedAmount, fee, feeRate, netAmount, bank_account_id, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Demande de retrait créée avec succès',
      data: {
        id: result.insertId,
        amount: parsedAmount,
        fee,
        net_amount: netAmount,
        status: 'pending'
      }
    });
  } catch (error) {
    // Diagnostic utile pour comprendre comment le driver expose l'erreur
    console.error('Erreur createWithdrawal:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      message: error.message
    });

    // MySQL SIGNAL uses SQLSTATE '45000' and errno 1644 (ER_SIGNAL_EXCEPTION)
    const isSignalError = error.code === 'ER_SIGNAL_EXCEPTION' || error.errno === 1644 || error.sqlState === '45000';
    if (isSignalError) {
      // prefer sqlMessage (message from MySQL) then error.message
      const rawMsg = (error.sqlMessage || error.message || 'Erreur de retrait').toString();
      const rawLower = rawMsg.toLowerCase();

      // Normaliser et mapper les messages de trigger vers un texte utilisateur clair
      let userMessage = rawMsg;
      if (rawLower.includes('limite') && rawLower.includes('retrait')) {
        userMessage = 'Limite quotidienne de retrait atteinte';
      } else if (rawLower.includes('solde insuffisant')) {
        userMessage = 'Solde insuffisant';
      } else if (rawLower.includes('limite de 2') && rawLower.includes('retraits')) {
        userMessage = 'Limite quotidienne de retrait atteinte';
      }

      return res.status(400).json({
        success: false,
        message: userMessage
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la demande de retrait'
    });
  }
};

/**
 * Annuler une demande de retrait
 */
export const cancelWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Récupérer la demande
    const [withdrawal] = await pool.query(
      'SELECT * FROM withdrawal_requests WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (withdrawal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande de retrait non trouvée'
      });
    }

    if (withdrawal[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Seules les demandes en attente peuvent être annulées'
      });
    }

    // Mettre à jour le statut - les triggers s'occupent du reste :
    // - Remboursement du solde
    // - Mise à jour de la transaction
    // - Création de la notification
    await pool.query(
      'UPDATE withdrawal_requests SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    res.json({
      success: true,
      message: 'Demande de retrait annulée'
    });
  } catch (error) {
    console.error('Erreur cancelWithdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la demande'
    });
  }
};

/**
 * ADMIN: Récupérer toutes les demandes de retrait
 */
export const getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        wr.id, wr.amount, wr.fee, wr.net_amount, wr.status,
        wr.created_at, wr.processed_at,
        p.id as user_id, p.display_name, p.phone,
        ba.bank_name, ba.account_number, ba.account_holder
      FROM withdrawal_requests wr
      INNER JOIN profiles p ON wr.user_id = p.id
      INNER JOIN bank_accounts ba ON wr.bank_account_id = ba.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE wr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY wr.created_at ASC';

    const [withdrawals] = await pool.query(query, params);

    res.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    console.error('Erreur getAllWithdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des retraits'
    });
  }
};

/**
 * ADMIN: Approuver une demande de retrait
 */
export const approveWithdrawal = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;

    const [withdrawal] = await pool.query(
      'SELECT * FROM withdrawal_requests WHERE id = ?',
      [id]
    );

    if (withdrawal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande de retrait non trouvée'
      });
    }

    if (withdrawal[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cette demande ne peut plus être approuvée'
      });
    }

    // Les triggers s'occupent de :
    // - la mise à jour de la transaction
    // - la notification de l'utilisateur
    await pool.query(`
      UPDATE withdrawal_requests 
      SET status = 'completed', processed_by = ?, processed_at = NOW() 
      WHERE id = ?
    `, [adminId, id]);

    // Logger l'action admin
    await pool.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'approve_withdrawal', 'withdrawal_request', ?, ?)
    `, [adminId, id, JSON.stringify({ amount: withdrawal[0].amount })]);

    res.json({
      success: true,
      message: 'Retrait approuvé'
    });
  } catch (error) {
    console.error('Erreur approveWithdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation du retrait'
    });
  }
};

/**
 * ADMIN: Rejeter une demande de retrait
 */
export const rejectWithdrawal = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const [withdrawal] = await pool.query(
      'SELECT * FROM withdrawal_requests WHERE id = ?',
      [id]
    );

    if (withdrawal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande de retrait non trouvée'
      });
    }

    if (withdrawal[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cette demande ne peut plus être rejetée'
      });
    }

    // Les triggers s'occupent :
    // - Du remboursement du montant
    // - De la mise à jour de la transaction
    // - De la notification de l'utilisateur
    await pool.query(`
      UPDATE withdrawal_requests 
      SET status = 'rejected', rejection_reason = ?, processed_by = ?, processed_at = NOW() 
      WHERE id = ?
    `, [reason, adminId, id]);

    // Logger l'action admin
    await pool.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'reject_withdrawal', 'withdrawal_request', ?, ?)
    `, [adminId, id, JSON.stringify({ amount: withdrawal[0].amount, reason })]);

    res.json({
      success: true,
      message: 'Retrait rejeté et montant remboursé'
    });
  } catch (error) {
    console.error('Erreur rejectWithdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet du retrait'
    });
  }
};

