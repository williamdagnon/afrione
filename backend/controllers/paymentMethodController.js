import pool from '../config/database.js';

export const getAllPaymentMethods = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payment_methods WHERE is_active = TRUE ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur chargement banques', error: error.message });
  }
};

export const createPaymentMethod = async (req, res) => {
  try {
    const { bank_name, account_number, account_holder } = req.body;
    if (!bank_name || !account_number || !account_holder) return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    const [result] = await pool.query('INSERT INTO payment_methods (bank_name, account_number, account_holder) VALUES (?, ?, ?)', [bank_name, account_number, account_holder]);
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur création banque', error: error.message });
  }
};

export const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_name, account_number, account_holder, is_active } = req.body;
    await pool.query('UPDATE payment_methods SET bank_name=?, account_number=?, account_holder=?, is_active=? WHERE id=?', [bank_name, account_number, account_holder, is_active, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur MAJ banque', error: error.message });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM payment_methods WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression banque', error: error.message });
  }
};
