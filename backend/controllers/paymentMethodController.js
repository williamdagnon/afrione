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
    const updates = req.body;

    // Récupérer les données actuelles
    const [currentMethod] = await pool.query('SELECT * FROM payment_methods WHERE id = ?', [id]);
    if (!currentMethod || currentMethod.length === 0) {
      return res.status(404).json({ success: false, message: 'Méthode de paiement non trouvée' });
    }

    // Construire la requête de mise à jour dynamiquement
    const updateFields = [];
    const values = [];
    
    if (updates.bank_name !== undefined) {
      updateFields.push('bank_name = ?');
      values.push(updates.bank_name);
    }
    if (updates.account_number !== undefined) {
      updateFields.push('account_number = ?');
      values.push(updates.account_number);
    }
    if (updates.account_holder !== undefined) {
      updateFields.push('account_holder = ?');
      values.push(updates.account_holder);
    }
    if (updates.is_active !== undefined) {
      updateFields.push('is_active = ?');
      values.push(updates.is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
    }

    // Ajouter l'ID à la fin des valeurs
    values.push(id);

    // Exécuter la mise à jour
    await pool.query(
      `UPDATE payment_methods SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    // Récupérer et renvoyer la méthode mise à jour
    const [updatedMethod] = await pool.query('SELECT * FROM payment_methods WHERE id = ?', [id]);
    res.json({ success: true, data: updatedMethod[0] });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la méthode de paiement:', error);
    res.status(500).json({ success: false, message: 'Erreur MAJ banque', error: error.message });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier les dépôts en attente
    const [pendingDeposits] = await pool.query(
      'SELECT COUNT(*) as count FROM manual_deposits WHERE payment_method_id = ? AND status = ?', 
      [id, 'pending']
    );
    
    if (pendingDeposits[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette méthode de paiement ne peut pas être supprimée car il y a des dépôts en attente'
      });
    }

    // Vérifier si la méthode a été utilisée pour des dépôts approuvés
    const [approvedDeposits] = await pool.query(
      'SELECT COUNT(*) as count FROM manual_deposits WHERE payment_method_id = ? AND status = ?',
      [id, 'approved']
    );

    if (approvedDeposits[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette méthode de paiement ne peut pas être supprimée car elle a été utilisée pour des dépôts approuvés'
      });
    }

    // Désactiver la méthode de paiement au lieu de la supprimer
    await pool.query('UPDATE payment_methods SET is_active = FALSE WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Méthode de paiement désactivée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la méthode de paiement:', error);
    res.status(500).json({ success: false, message: 'Erreur suppression banque', error: error.message });
  }
};
