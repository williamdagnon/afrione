import pool from '../config/database.js';
import { calculateAndDistributeCommissions } from './commissionCalculator.js';

/**
 * Créer un user_product actif après un achat
 * @param {string} userId - ID de l'utilisateur
 * @param {number} productId - ID du produit
 * @param {number} purchaseId - ID de l'achat
 */
export const createUserProduct = async (userId, productId, purchaseId) => {
  try {
    // Récupérer les détails du produit
    const [product] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (product.length === 0) {
      throw new Error('Produit non trouvé');
    }

    const prod = product[0];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(prod.duration_days));

    const tomorrow = new Date(startDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Créer le user_product
    await pool.query(`
      INSERT INTO user_products (
        user_id, product_id, purchase_id, purchase_price,
        daily_revenue, total_revenue, duration_days,
        start_date, end_date, next_payout_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      userId,
      productId,
      purchaseId,
      prod.price,
      prod.daily_revenue,
      prod.total_revenue,
      prod.duration_days,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      tomorrow.toISOString().split('T')[0]
    ]);

    console.log(`✅ User product créé pour user ${userId}, produit ${productId}`);
  } catch (error) {
    console.error('Erreur createUserProduct:', error);
    throw error;
  }
};

/**
 * Traiter un achat complet (débit, commission, user_product, etc.)
 * @param {string} userId - ID de l'utilisateur
 * @param {number} productId - ID du produit
 * @returns {Promise<Object>} Résultat de l'achat
 */
export const processPurchase = async (userId, productId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Récupérer le produit
    const [product] = await connection.query(
      'SELECT * FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );

    if (product.length === 0) {
      await connection.rollback();
      return {
        success: false,
        message: 'Produit non trouvé ou inactif'
      };
    }

    const prod = product[0];
    const price = parseFloat(prod.price);

    // 2. Vérifier le solde
    const [user] = await connection.query(
      'SELECT balance FROM profiles WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      await connection.rollback();
      return {
        success: false,
        message: 'Utilisateur non trouvé'
      };
    }

    const balance = parseFloat(user[0].balance);

    if (balance < price) {
      await connection.rollback();
      return {
        success: false,
        message: 'Solde insuffisant'
      };
    }

    // 3. Débiter le compte
    const newBalance = balance - price;
    await connection.query(`
      UPDATE profiles 
      SET 
        balance = ?,
        total_invested = total_invested + ?
      WHERE id = ?
    `, [newBalance, price, userId]);

    // 4. Créer l'achat
    const [purchaseResult] = await connection.query(`
      INSERT INTO purchases (user_id, product_id, price, total_amount, status)
      VALUES (?, ?, ?, ?, 'completed')
    `, [userId, productId, price, price]);

    const purchaseId = purchaseResult.insertId;

    // 5. Créer la transaction
    await connection.query(`
      INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after,
        description, reference_id, reference_type, status
      ) VALUES (?, 'purchase', ?, ?, ?, ?, ?, 'purchase', 'completed')
    `, [
      userId,
      price,
      balance,
      newBalance,
      `Achat ${prod.name}`,
      purchaseId
    ]);

    // 6. Créer le user_product
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(prod.duration_days));
    const tomorrow = new Date(startDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await connection.query(`
      INSERT INTO user_products (
        user_id, product_id, purchase_id, purchase_price,
        daily_revenue, total_revenue, duration_days,
        start_date, end_date, next_payout_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      userId,
      productId,
      purchaseId,
      price,
      prod.daily_revenue,
      prod.total_revenue,
      prod.duration_days,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      tomorrow.toISOString().split('T')[0]
    ]);

    // 7. Créer une notification
    await connection.query(`
      INSERT INTO notifications (user_id, title, body, type)
      VALUES (?, ?, ?, 'purchase')
    `, [
      userId,
      'Achat réussi !',
      `Vous avez acheté ${prod.name}. Revenu quotidien : ${prod.daily_revenue} FCFA.`
    ]);

    await connection.commit();

    // 8. Distribuer les commissions (en dehors de la transaction principale)
    let commissions = [];
    try {
      commissions = await calculateAndDistributeCommissions(purchaseId, userId, price);
    } catch (error) {
      console.error('Erreur lors de la distribution des commissions:', error);
      // Ne pas bloquer l'achat si les commissions échouent
    }

    return {
      success: true,
      message: 'Achat effectué avec succès',
      data: {
        purchase_id: purchaseId,
        product_name: prod.name,
        amount: price,
        new_balance: newBalance,
        commissions_distributed: commissions.length
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error('Erreur processPurchase:', error);
    return {
      success: false,
      message: 'Erreur lors du traitement de l\'achat',
      error: error.message
    };
  } finally {
    connection.release();
  }
};

