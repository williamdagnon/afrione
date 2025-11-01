import pool from '../config/database.js';
import { processPurchase } from '../helpers/purchaseHelper.js';

/**
 * @desc    Effectuer un achat de produit
 * @route   POST /api/purchases
 * @access  Private
 */
export const createPurchase = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;

    // Validation
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du produit est requis'
      });
    }

    // Utiliser le helper qui gère tout : achat, user_product, commissions
    const result = await processPurchase(userId, product_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Erreur lors de l\'achat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'achat',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer l'historique des achats de l'utilisateur
 * @route   GET /api/purchases/my
 * @access  Private
 */
export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.id;

    const [purchases] = await pool.query(
      `SELECT 
        p.id, p.price, p.total_amount, p.status, p.created_at,
        pr.id as product_id, pr.name as product_name, pr.image as product_image, 
        pr.duration, pr.daily_revenue, pr.total_revenue
       FROM purchases p
       INNER JOIN products pr ON p.product_id = pr.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des achats',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer tous les achats (Admin)
 * @route   GET /api/purchases
 * @access  Private/Admin
 */
export const getAllPurchases = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [purchases] = await pool.query(
      `SELECT 
        p.id, p.price, p.total_amount, p.status, p.created_at,
        pr.name as product_name,
        u.phone, u.display_name
       FROM purchases p
       INNER JOIN products pr ON p.product_id = pr.id
       INNER JOIN profiles u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des achats',
      error: error.message
    });
  }
};

export default {
  createPurchase,
  getUserPurchases,
  getAllPurchases
};
