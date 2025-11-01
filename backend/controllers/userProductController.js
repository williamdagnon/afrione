import pool from '../config/database.js';

/**
 * Récupérer tous mes produits actifs
 */
export const getMyUserProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'active' } = req.query;

    const [userProducts] = await pool.query(`
      SELECT 
        up.id, up.purchase_price, up.daily_revenue, up.total_revenue,
        up.earned_so_far, up.days_elapsed, up.start_date, up.end_date,
        up.next_payout_date, up.status, up.created_at,
        p.id as product_id, p.name as product_name, p.image as product_image,
        p.duration
      FROM user_products up
      INNER JOIN products p ON up.product_id = p.id
      WHERE up.user_id = ? AND up.status = ?
      ORDER BY up.created_at DESC
    `, [userId, status]);

    res.json({
      success: true,
      data: userProducts
    });
  } catch (error) {
    console.error('Erreur getMyUserProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits'
    });
  }
};

/**
 * Récupérer les détails d'un produit utilisateur
 */
export const getUserProductById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [userProduct] = await pool.query(`
      SELECT 
        up.*,
        p.id as product_id, p.name as product_name, p.image as product_image,
        p.description as product_description
      FROM user_products up
      INNER JOIN products p ON up.product_id = p.id
      WHERE up.id = ? AND up.user_id = ?
    `, [id, userId]);

    if (userProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      data: userProduct[0]
    });
  } catch (error) {
    console.error('Erreur getUserProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit'
    });
  }
};

/**
 * Récupérer les statistiques de mes produits
 */
export const getUserProductsStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_products,
        SUM(CASE WHEN status = 'active' THEN daily_revenue ELSE 0 END) as total_daily_revenue,
        SUM(earned_so_far) as total_earned,
        SUM(CASE WHEN status = 'active' THEN total_revenue - earned_so_far ELSE 0 END) as remaining_revenue
      FROM user_products
      WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Erreur getUserProductsStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

