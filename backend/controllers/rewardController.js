import pool from '../config/database.js';

/**
 * Récupérer toutes mes récompenses
 */
export const getMyRewards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT 
        id, type, amount, description, status,
        expires_at, claimed_at, created_at
      FROM rewards
      WHERE user_id = ?
    `;

    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rewards] = await pool.query(query, params);

    res.json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('Erreur getMyRewards:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des récompenses'
    });
  }
};

/**
 * Réclamer une récompense
 */
export const claimReward = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { id } = req.params;

    // Récupérer la récompense
    const [reward] = await connection.query(
      'SELECT * FROM rewards WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (reward.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Récompense non trouvée'
      });
    }

    if (reward[0].status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cette récompense a déjà été réclamée ou a expiré'
      });
    }

    // Vérifier l'expiration
    if (reward[0].expires_at && new Date(reward[0].expires_at) < new Date()) {
      await connection.query(
        'UPDATE rewards SET status = \'expired\' WHERE id = ?',
        [id]
      );
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cette récompense a expiré'
      });
    }

    // Créditer le montant
    await connection.query(
      'UPDATE profiles SET balance = balance + ? WHERE id = ?',
      [reward[0].amount, userId]
    );

    // Marquer comme réclamée
    await connection.query(
      'UPDATE rewards SET status = \'claimed\', claimed_at = NOW() WHERE id = ?',
      [id]
    );

    // Créer la transaction
    const [user] = await connection.query('SELECT balance FROM profiles WHERE id = ?', [userId]);
    await connection.query(`
      INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after,
        description, reference_id, reference_type, status
      ) VALUES (?, 'bonus', ?, ?, ?, ?, ?, 'reward', 'completed')
    `, [
      userId,
      reward[0].amount,
      parseFloat(user[0].balance) - reward[0].amount,
      parseFloat(user[0].balance),
      reward[0].description || `Récompense ${reward[0].type}`,
      id
    ]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Récompense réclamée avec succès',
      data: {
        amount: parseFloat(reward[0].amount)
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur claimReward:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réclamation de la récompense'
    });
  } finally {
    connection.release();
  }
};

/**
 * Récupérer les récompenses en attente
 */
export const getPendingRewards = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rewards] = await pool.query(`
      SELECT id, type, amount, description, expires_at, created_at
      FROM rewards
      WHERE user_id = ? AND status = 'pending'
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `, [userId]);

    const totalPending = rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);

    res.json({
      success: true,
      data: {
        rewards,
        total_amount: totalPending,
        count: rewards.length
      }
    });
  } catch (error) {
    console.error('Erreur getPendingRewards:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des récompenses en attente'
    });
  }
};

