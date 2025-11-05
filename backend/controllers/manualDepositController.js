import pool from '../config/database.js';

export const createManualDeposit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_method_id, amount, deposit_number, transaction_id } = req.body;
    if (!payment_method_id || !amount || !deposit_number || !transaction_id) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires' });
    }
    // Vérifier le montant minimum de dépôt
    const [settings] = await pool.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['min_deposit_amount']
    );
    const minDeposit = parseFloat(settings[0]?.setting_value || 2000);
    if (parseFloat(amount) < minDeposit) {
      return res.status(400).json({ success: false, message: `Le montant minimum de dépôt est de ${minDeposit} FCFA` });
    }
    const [result] = await pool.query(
      `INSERT INTO manual_deposits (user_id, payment_method_id, amount, deposit_number, transaction_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, payment_method_id, amount, deposit_number, transaction_id]
    );
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur création dépôt', error: error.message });
  }
};

export const getUserManualDeposits = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM manual_deposits WHERE user_id=? ORDER BY created_at DESC', [userId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur historique dépôts', error: error.message });
  }
};

export const listAllDeposits = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, p.display_name AS user_name, p.phone, m.bank_name, m.account_holder, m.account_number
       FROM manual_deposits d
       JOIN profiles p ON d.user_id=p.id
       JOIN payment_methods m ON d.payment_method_id=m.id
       ORDER BY d.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur admin liste dépôts', error: error.message });
  }
};

export const approveManualDeposit = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    await connection.beginTransaction();
    // Vérifier dépôt
    const [deposits] = await connection.query('SELECT * FROM manual_deposits WHERE id=? AND status="pending"', [id]);
    if (deposits.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Dépôt non trouvé ou déjà traité' });
    }
    const deposit = deposits[0];
  // Récupérer le solde avant mise à jour
  const [profileRows] = await connection.query('SELECT balance FROM profiles WHERE id = ?', [deposit.user_id]);
  const balanceBefore = parseFloat(profileRows[0]?.balance || 0);
  const newBalance = balanceBefore + parseFloat(deposit.amount);

  // Créditer le solde
  await connection.query('UPDATE profiles SET balance=? WHERE id=?', [newBalance, deposit.user_id]);
    // Statut et log dépôt
    await connection.query('UPDATE manual_deposits SET status="approved", admin_id=?, processed_at=NOW() WHERE id=?', [adminId, id]);
  // Transaction (inclure balance_before/after)
  await connection.query('INSERT INTO transactions (user_id, amount, type, balance_before, balance_after, status, description) VALUES (?, ?, "deposit", ?, ?, "completed", ?)', [deposit.user_id, deposit.amount, balanceBefore, newBalance, 'Dépôt manuel validé']);
    // Notification
    await connection.query('INSERT INTO notifications (user_id, title, body, is_read) VALUES (?, "Dépôt validé", "Votre dépôt manuel a été validé et crédité !", 0)', [deposit.user_id]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: 'Erreur approbation dépôt', error: error.message });
  } finally { if (connection) connection.release(); }
};

export const rejectManualDeposit = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { admin_note } = req.body;
    const adminId = req.user.id;
    await connection.beginTransaction();
    const [deposits] = await connection.query('SELECT * FROM manual_deposits WHERE id=? AND status="pending"', [id]);
    if (deposits.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Dépôt non trouvé ou déjà traité' });
    }
    await connection.query('UPDATE manual_deposits SET status="rejected", admin_note=?, admin_id=?, processed_at=NOW() WHERE id=?', [admin_note, adminId, id]);
    // Notification rejet utilisateur
    await connection.query('INSERT INTO notifications (user_id, title, body, is_read) VALUES (?, "Dépôt rejeté", ?, 0)', [deposits[0].user_id, `Votre dépôt a été rejeté : ${admin_note || ""}`]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: 'Erreur rejet dépôt', error: error.message });
  } finally { if (connection) connection.release(); }
};
