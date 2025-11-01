import pool from '../config/database.js';

/**
 * Récupérer l'historique des transactions de l'utilisateur
 */
export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        id, type, amount, balance_before, balance_after,
        description, reference_id, reference_type, status, created_at
      FROM transactions
      WHERE user_id = ?
    `;

    const params = [userId];

    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [transactions] = await pool.query(query, params);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Erreur getMyTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des transactions'
    });
  }
};

/**
 * Récupérer les statistiques des transactions
 */
export const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN type = 'commission' THEN amount ELSE 0 END) as total_commissions,
        SUM(CASE WHEN type = 'daily_revenue' THEN amount ELSE 0 END) as total_daily_revenue,
        SUM(CASE WHEN type = 'bonus' THEN amount ELSE 0 END) as total_bonuses
      FROM transactions
      WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Erreur getTransactionStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * Créer une transaction (helper function - utilisé par d'autres contrôleurs)
 */
export const createTransaction = async (userId, type, amount, description, referenceId = null, referenceType = null) => {
  try {
    // Récupérer le solde actuel
    const [user] = await pool.query('SELECT balance FROM profiles WHERE id = ?', [userId]);
    
    if (user.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }

    const balanceBefore = parseFloat(user[0].balance);
    let balanceAfter = balanceBefore;

    // Calculer le nouveau solde selon le type
    if (['deposit', 'commission', 'bonus', 'checkin', 'referral_bonus', 'daily_revenue', 'refund'].includes(type)) {
      balanceAfter = balanceBefore + parseFloat(amount);
    } else if (['withdrawal', 'purchase'].includes(type)) {
      balanceAfter = balanceBefore - parseFloat(amount);
    }

    // Insérer la transaction
    const [result] = await pool.query(`
      INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after,
        description, reference_id, reference_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `, [userId, type, amount, balanceBefore, balanceAfter, description, referenceId, referenceType]);

    // Mettre à jour le solde de l'utilisateur
    await pool.query('UPDATE profiles SET balance = ? WHERE id = ?', [balanceAfter, userId]);

    return {
      transactionId: result.insertId,
      balanceBefore,
      balanceAfter
    };
  } catch (error) {
    console.error('Erreur createTransaction:', error);
    throw error;
  }
};

