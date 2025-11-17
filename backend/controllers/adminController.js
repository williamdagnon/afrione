import pool from '../config/database.js';

/**
 * Récupérer le dashboard admin
 */
export const getDashboard = async (req, res) => {
  try {
    // Statistiques globales
    const [globalStats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM profiles WHERE is_active = TRUE) as total_users,
        (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = CURDATE()) as new_users_today,
        (SELECT COALESCE(SUM(balance), 0) FROM profiles) as total_balance,
        (SELECT COUNT(*) FROM purchases) as total_purchases,
        (SELECT COUNT(*) FROM purchases WHERE DATE(created_at) = CURDATE()) as purchases_today,
        (SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'pending') as pending_withdrawals,
        (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as active_products
    `);

    // Dernières transactions
    const [recentTransactions] = await pool.query(`
      SELECT 
        t.id, t.type, t.amount, t.created_at,
        p.display_name, p.phone
      FROM transactions t
      INNER JOIN profiles p ON t.user_id = p.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    // Derniers utilisateurs
    const [recentUsers] = await pool.query(`
      SELECT id, display_name, phone, balance, created_at
      FROM profiles
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: globalStats[0],
        recentTransactions,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Erreur getDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dashboard'
    });
  }
};

/**
 * Récupérer les statistiques avancées
 */
export const getAdvancedStats = async (req, res) => {
  try {
    const { period = '7days' } = req.query;

    let dateFilter = 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    if (period === '30days') {
      dateFilter = 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else if (period === '90days') {
      dateFilter = 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)';
    }

    // Inscriptions par jour
    const [signups] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM profiles
      WHERE ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Achats par jour
    const [purchases] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count, SUM(price) as total
      FROM purchases
      WHERE ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Retraits par statut
    const [withdrawals] = await pool.query(`
      SELECT status, COUNT(*) as count, SUM(amount) as total
      FROM withdrawal_requests
      WHERE ${dateFilter}
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        signups,
        purchases,
        withdrawals
      }
    });
  } catch (error) {
    console.error('Erreur getAdvancedStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * Récupérer tous les utilisateurs
 */
export const getAllUsers = async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        p.id, p.phone, p.display_name, p.email, p.balance, p.total_earnings,
        p.total_referrals, p.referral_code, p.role, p.is_active, p.created_at,
        (SELECT COUNT(*) FROM purchases WHERE user_id = p.id AND status = 'active') as active_investments,
        (SELECT COUNT(*) FROM purchases WHERE user_id = p.id AND status = 'completed') as completed_investments,
        (SELECT COUNT(*) FROM manual_deposits WHERE user_id = p.id AND status = 'approved') as total_deposits_approved,
        (SELECT COUNT(*) FROM withdrawal_requests WHERE user_id = p.id AND status = 'completed') as total_withdrawals_approved,
        (SELECT COALESCE(SUM(commission_amount), 0) FROM team_commissions WHERE referrer_id = p.id) as commission_total,
        (SELECT COUNT(*) FROM referrals WHERE referrer_id = p.id) as filleuls_count
      FROM profiles p
    `;

    const params = [];

    if (search) {
      query += ' WHERE p.phone LIKE ? OR p.display_name LIKE ? OR p.email LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.query(query, params);

    // Récupérer le nombre total d'utilisateurs
    let countQuery = 'SELECT COUNT(*) as total FROM profiles p';
    const countParams = [];
    
    if (search) {
      countQuery += ' WHERE p.phone LIKE ? OR p.display_name LIKE ? OR p.email LIKE ?';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: users,
      total: total,
      count: users.length
    });
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

/**
 * Récupérer les détails d'un utilisateur
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await pool.query(`
      SELECT *
      FROM profiles
      WHERE id = ?
    `, [id]);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Statistiques supplémentaires détaillées - Requête simplifiée
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM purchases WHERE user_id = ? AND status = 'active') as active_purchases,
        (SELECT COUNT(*) FROM purchases WHERE user_id = ? AND status = 'completed') as completed_purchases,
        (SELECT COUNT(*) FROM manual_deposits WHERE user_id = ? AND status = 'approved') as approved_deposits,
        (SELECT COUNT(*) FROM manual_deposits WHERE user_id = ?) as total_manual_deposits,
        (SELECT COUNT(*) FROM withdrawal_requests WHERE user_id = ? AND status = 'completed') as approved_withdrawals,
        (SELECT COUNT(*) FROM withdrawal_requests WHERE user_id = ?) as total_withdrawal_requests,
        (SELECT COALESCE(COUNT(*), 0) FROM referrals WHERE referrer_id = ?) as total_referrals,
        (SELECT COALESCE(SUM(amount), 0) FROM manual_deposits WHERE user_id = ? AND status = 'approved') as total_deposits_amount,
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE user_id = ? AND status = 'completed') as total_withdrawals_amount,
        (SELECT COALESCE(SUM(commission_amount), 0) FROM team_commissions WHERE referrer_id = ?) as commission_total
    `, [id, id, id, id, id, id, id, id, id, id]);

    // Détails des dépôts - simplifié
    const [deposits] = await pool.query(`
      SELECT id, amount, status, created_at
      FROM manual_deposits
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [id]);

    // Détails des retraits - simplifié
    const [withdrawals] = await pool.query(`
      SELECT id, amount, status, created_at
      FROM withdrawal_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [id]);

    // Détails des produits utilisateur (investissements actifs récents)
    const [userProducts] = await pool.query(`
      SELECT up.id, up.purchase_id, up.purchase_price, up.daily_revenue, up.total_revenue, up.earned_so_far, up.days_elapsed, up.start_date, up.end_date, up.status,
        p.id as product_id, p.name as product_name, p.image as product_image
      FROM user_products up
      INNER JOIN products p ON up.product_id = p.id
      WHERE up.user_id = ?
      ORDER BY up.created_at DESC
      LIMIT 20
    `, [id]);

    res.json({
      success: true,
      data: {
        ...user[0],
        stats: stats[0],
        deposits: deposits,
        withdrawals: withdrawals,
        user_products: userProducts
      }
    });
  } catch (error) {
    console.error('Erreur getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails utilisateur',
      error: error.message
    });
  }
};

/**
 * Modifier le statut d'un utilisateur
 */
export const updateUserStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Statut requis'
      });
    }

    await pool.query(
      'UPDATE profiles SET is_active = ? WHERE id = ?',
      [is_active, id]
    );

    // Logger l'action
    await pool.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'update_status', 'profile', ?, ?)
    `, [adminId, id, JSON.stringify({ is_active })]);

    res.json({
      success: true,
      message: is_active ? 'Utilisateur activé' : 'Utilisateur désactivé'
    });
  } catch (error) {
    console.error('Erreur updateUserStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

/**
 * Modifier le solde d'un utilisateur
 */
export const updateUserBalance = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const adminId = req.user.id;
    const { id } = req.params;
    const { amount, operation } = req.body;

    if (!amount || !operation) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Montant et opération requis'
      });
    }

    const parsedAmount = parseFloat(amount);

    // Récupérer le solde actuel
    const [user] = await connection.query(
      'SELECT balance FROM profiles WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const oldBalance = parseFloat(user[0].balance);
    const adjustAmount = operation === 'add' ? parsedAmount : -parsedAmount;
    const newBalance = oldBalance + adjustAmount;

    // Mettre à jour le solde
    await connection.query(
      'UPDATE profiles SET balance = ? WHERE id = ?',
      [newBalance, id]
    );

    // Créer la transaction
    const transactionType = operation === 'add' ? 'bonus' : 'withdrawal';
    const description = operation === 'add' 
      ? `Ajustement manuel : +${parsedAmount} FCFA par admin`
      : `Ajustement manuel : -${parsedAmount} FCFA par admin`;
    
    await connection.query(`
      INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after,
        status, description
      ) VALUES (?, ?, ?, ?, ?, 'completed', ?)
    `, [id, transactionType, parsedAmount, oldBalance, newBalance, description]);

    // Logger l'action
    await connection.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'update_balance', 'profile', ?, ?)
    `, [adminId, id, JSON.stringify({ amount: parsedAmount, operation, oldBalance, newBalance })]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Solde mis à jour',
      data: {
        old_balance: oldBalance,
        new_balance: newBalance,
        adjusted_amount: adjustAmount
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur updateUserBalance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du solde'
    });
  } finally {
    connection.release();
  }
};

/**
 * Récupérer les paramètres système
 */
export const getSystemSettings = async (req, res) => {
  try {
    const [settings] = await pool.query(`
      SELECT setting_key, setting_value, description, data_type, category
      FROM system_settings
      ORDER BY category, setting_key
    `);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erreur getSystemSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres'
    });
  }
};

/**
 * Mettre à jour un paramètre système
 */
export const updateSystemSetting = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Clé et valeur requises'
      });
    }

    await pool.query(`
      UPDATE system_settings 
      SET setting_value = ?, updated_by = ? 
      WHERE setting_key = ?
    `, [value.toString(), adminId, key]);

    // Logger l'action
    await pool.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'update_setting', 'system_settings', ?, ?)
    `, [adminId, key, JSON.stringify({ value })]);

    res.json({
      success: true,
      message: 'Paramètre mis à jour'
    });
  } catch (error) {
    console.error('Erreur updateSystemSetting:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du paramètre'
    });
  }
};

/**
 * Récupérer les logs admin
 */
export const getAdminLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0, action } = req.query;

    let query = `
      SELECT 
        al.id, al.action, al.target_type, al.target_id,
        al.details, al.created_at,
        p.display_name as admin_name, p.phone as admin_phone
      FROM admin_logs al
      INNER JOIN profiles p ON al.admin_id = p.id
    `;

    const params = [];

    if (action) {
      query += ' WHERE al.action = ?';
      params.push(action);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await pool.query(query, params);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Erreur getAdminLogs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs'
    });
  }
};

