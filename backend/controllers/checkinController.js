import pool from '../config/database.js';
import { createTransaction } from './transactionController.js';

/**
 * Faire un check-in quotidien
 */
export const doCheckin = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Vérifier si déjà fait aujourd'hui
    const [existing] = await connection.query(
      'SELECT id FROM daily_checkins WHERE user_id = ? AND checkin_date = ?',
      [userId, today]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà fait votre check-in aujourd\'hui'
      });
    }

    // Récupérer les infos utilisateur
    const [user] = await connection.query(
      'SELECT consecutive_checkins, last_checkin_date FROM profiles WHERE id = ?',
      [userId]
    );

    const lastCheckin = user[0].last_checkin_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculer les jours consécutifs
    let consecutiveDays = 1;
    if (lastCheckin && lastCheckin.toISOString().split('T')[0] === yesterdayStr) {
      consecutiveDays = user[0].consecutive_checkins + 1;
    }

    // Récupérer le bonus
    const [settings] = await connection.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['daily_checkin_bonus']
    );

    const bonusAmount = parseFloat(settings[0]?.setting_value || 50);

    // Créer le check-in
    await connection.query(`
      INSERT INTO daily_checkins (user_id, checkin_date, reward_amount, consecutive_days)
      VALUES (?, ?, ?, ?)
    `, [userId, today, bonusAmount, consecutiveDays]);

    // Mettre à jour l'utilisateur
    await connection.query(`
      UPDATE profiles 
      SET 
        balance = balance + ?,
        total_checkin_bonus = total_checkin_bonus + ?,
        consecutive_checkins = ?,
        last_checkin_date = ?
      WHERE id = ?
    `, [bonusAmount, bonusAmount, consecutiveDays, today, userId]);

    // Créer la transaction
    const [userBalance] = await connection.query('SELECT balance FROM profiles WHERE id = ?', [userId]);
    await connection.query(`
      INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after,
        description, status
      ) VALUES (?, 'checkin', ?, ?, ?, ?, 'completed')
    `, [
      userId,
      bonusAmount,
      parseFloat(userBalance[0].balance) - bonusAmount,
      parseFloat(userBalance[0].balance),
      `Check-in quotidien - Jour ${consecutiveDays}`
    ]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Check-in réussi !',
      data: {
        reward: bonusAmount,
        consecutive_days: consecutiveDays
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur doCheckin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du check-in'
    });
  } finally {
    connection.release();
  }
};

/**
 * Vérifier le statut du check-in aujourd'hui
 */
export const getCheckinStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [checkin] = await pool.query(
      'SELECT * FROM daily_checkins WHERE user_id = ? AND checkin_date = ?',
      [userId, today]
    );

    const [user] = await pool.query(
      'SELECT consecutive_checkins, total_checkin_bonus FROM profiles WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        checked_in_today: checkin.length > 0,
        consecutive_days: user[0].consecutive_checkins,
        total_bonus: parseFloat(user[0].total_checkin_bonus || 0)
      }
    });
  } catch (error) {
    console.error('Erreur getCheckinStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut'
    });
  }
};

/**
 * Récupérer l'historique des check-ins
 */
export const getCheckinHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30 } = req.query;

    const [history] = await pool.query(`
      SELECT checkin_date, reward_amount, consecutive_days, created_at
      FROM daily_checkins
      WHERE user_id = ?
      ORDER BY checkin_date DESC
      LIMIT ?
    `, [userId, parseInt(limit)]);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Erreur getCheckinHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

