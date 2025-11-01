import pool from '../config/database.js';

/**
 * @desc    Récupérer le profil de l'utilisateur
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT 
        id, phone, display_name, email, balance, total_earnings, 
        role, referral_code, is_active, created_at
       FROM profiles 
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour le profil de l'utilisateur
 * @route   PUT /api/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { display_name, email } = req.body;
    const userId = req.user.id;

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const values = [];

    if (display_name) {
      updates.push('display_name = ?');
      values.push(display_name);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }

    values.push(userId);

    await pool.query(
      `UPDATE profiles 
       SET ${updates.join(', ')} 
       WHERE id = ?`,
      values
    );

    // Récupérer le profil mis à jour
    const [users] = await pool.query(
      `SELECT 
        id, phone, display_name, email, balance, total_earnings,
        role, referral_code, is_active, created_at
       FROM profiles 
       WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: users[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

/**
 * @desc    Recharger le solde de l'utilisateur
 * @route   POST /api/profile/recharge
 * @access  Private
 */
export const rechargeBalance = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { amount, payment_method = 'card', reference } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }

    await connection.beginTransaction();

    // Mettre à jour le solde
    await connection.query(
      'UPDATE profiles SET balance = balance + ? WHERE id = ?',
      [amount, userId]
    );

    // Enregistrer la transaction
    await connection.query(
      `INSERT INTO transactions (user_id, type, amount, status, payment_method, reference, description)
       VALUES (?, 'deposit', ?, 'completed', ?, ?, ?)`,
      [userId, amount, payment_method, reference || null, `Rechargement de ${amount} FCFA`]
    );

    // Créer une notification
    await connection.query(
      `INSERT INTO notifications (user_id, title, body, is_read) 
       VALUES (?, ?, ?, FALSE)`,
      [userId, 'Rechargement effectué', `Votre compte a été rechargé de ${amount} FCFA`]
    );

    await connection.commit();

    // Récupérer le nouveau solde
    const [users] = await connection.query(
      'SELECT balance FROM profiles WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Rechargement effectué avec succès',
      data: {
        new_balance: users[0].balance
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors du rechargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du rechargement',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * @desc    Retirer du solde (créer une demande de retrait)
 * @route   POST /api/profile/withdraw
 * @access  Private
 */
export const withdrawBalance = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { amount, bank_account_id } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }

    if (!bank_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Compte bancaire requis'
      });
    }

    await connection.beginTransaction();

    // Vérifier le solde actuel
    const [users] = await connection.query(
      'SELECT balance FROM profiles WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
      });
    }

    const currentBalance = parseFloat(users[0].balance);

    if (currentBalance < amount) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Solde insuffisant pour effectuer ce retrait'
      });
    }

    // Vérifier que le compte bancaire appartient à l'utilisateur
    const [bankAccounts] = await connection.query(
      'SELECT id FROM bank_accounts WHERE id = ? AND user_id = ?',
      [bank_account_id, userId]
    );

    if (bankAccounts.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Compte bancaire non trouvé'
      });
    }

    // Créer une demande de retrait (en attente d'approbation admin)
    const [result] = await connection.query(
      `INSERT INTO withdrawal_requests 
       (user_id, amount, bank_account_id, status) 
       VALUES (?, ?, ?, 'pending')`,
      [userId, amount, bank_account_id]
    );

    // Geler le montant dans le solde (optionnel - à implémenter si nécessaire)
    // await connection.query(
    //   'UPDATE profiles SET balance = balance - ? WHERE id = ?',
    //   [amount, userId]
    // );

    // Créer une notification
    await connection.query(
      `INSERT INTO notifications (user_id, title, body, is_read) 
       VALUES (?, ?, ?, FALSE)`,
      [userId, 'Demande de retrait', `Votre demande de retrait de ${amount} FCFA est en cours de traitement`]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Demande de retrait créée avec succès. En attente d\'approbation.',
      data: {
        withdrawal_request_id: result.insertId,
        amount: amount,
        status: 'pending'
      }
    });
  } catch (error) {
    await connection.rollback();
    // Log détaillé pour diagnostiquer les erreurs provenant de MySQL (triggers)
    console.error('Erreur lors du retrait:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      message: error.message
    });

    const isSignalError = error.code === 'ER_SIGNAL_EXCEPTION' || error.errno === 1644 || error.sqlState === '45000';
    if (isSignalError) {
      const rawMsg = (error.sqlMessage || error.message || '').toString();
      const rawLower = rawMsg.toLowerCase();
      let userMessage = rawMsg;
      if (rawLower.includes('limite') && rawLower.includes('retrait')) {
        userMessage = 'Limite quotidienne de retrait atteinte';
      } else if (rawLower.includes('solde insuffisant')) {
        userMessage = 'Solde insuffisant pour effectuer ce retrait';
      }

      return res.status(400).json({
        success: false,
        message: userMessage
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du retrait',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

export default {
  getProfile,
  updateProfile,
  rechargeBalance,
  withdrawBalance
};
