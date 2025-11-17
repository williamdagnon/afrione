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

/**
 * Admin: Stop / cancel a user's active product (investment)
 * @route   PUT /api/admin/user-products/:id/stop
 * @access  Admin
 */
export const adminCancelUserProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const adminId = req.user.id;
    const { id } = req.params; // user_products.id

    // Vérifier que le produit utilisateur existe et est actif
    const [rows] = await connection.query(`SELECT * FROM user_products WHERE id = ? FOR UPDATE`, [id]);
    if (!rows || rows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Produit utilisateur non trouvé' });
    }

    const up = rows[0];
    if (up.status !== 'active') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Le produit n\'est pas actif ou ne peut pas être arrêté' });
    }

    // Mettre à jour le statut en cancelled, enregistrer la date de fin
    await connection.query(`
      UPDATE user_products SET status = 'cancelled', end_date = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [id]);

    // Si lié à un purchase, marquer l'achat comme cancelled aussi (non destructif)
    // Ne pas modifier le statut dans la table `purchases` par défaut.
    // La colonne `purchases.status` est un ENUM limité (pending,completed,failed,refunded)
    // et 'cancelled'/'active' ne sont pas des valeurs valides — cela provoquait
    // l'avertissement WARN_DATA_TRUNCATED en production.
    // Si vous voulez implémenter un remboursement ou changer le statut d'achat,
    // faites-le via un workflow dédié (endpoint de remboursement) qui mettra à
    // jour `purchases.status` vers une valeur supportée (par ex. 'refunded').

    // Logger l'action admin
    await connection.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'cancel_user_product', 'user_product', ?, ?)
    `, [adminId, id, JSON.stringify({ user_product_id: id, purchase_id: up.purchase_id || null })]);

    await connection.commit();

    res.json({ success: true, message: 'Produit utilisateur arrêté avec succès', data: { id } });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur adminCancelUserProduct:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'arrêt du produit utilisateur', error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Admin: Reactivate a cancelled user product
 * @route   PUT /api/admin/user-products/:id/reactivate
 * @access  Admin
 */
export const adminReactivateUserProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const adminId = req.user.id;
    const { id } = req.params; // user_products.id

    const [rows] = await connection.query(`SELECT * FROM user_products WHERE id = ? FOR UPDATE`, [id]);
    if (!rows || rows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Produit utilisateur non trouvé' });
    }

    const up = rows[0];
    if (up.status !== 'cancelled') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Le produit n\'est pas en état annulé' });
    }

    // Reactivate: set status to active and clear end_date
    await connection.query(`UPDATE user_products SET status = 'active', end_date = NULL, updated_at = NOW() WHERE id = ?`, [id]);

    // If linked purchase exists, set it back to 'completed' or 'active' depending on business rules; choose 'active'
    // Ne pas modifier `purchases.status` lors de la réactivation par défaut.
    // Restaurer le statut d'achat doit se faire via un processus métier
    // explicite (par ex. remboursement annulé) et en utilisant une valeur
    // valide pour l'ENUM (ex: 'completed').

    // Log admin action
    await connection.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'reactivate_user_product', 'user_product', ?, ?)
    `, [adminId, id, JSON.stringify({ user_product_id: id, purchase_id: up.purchase_id || null })]);

    await connection.commit();

    res.json({ success: true, message: 'Produit utilisateur réactivé', data: { id } });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur adminReactivateUserProduct:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la réactivation du produit utilisateur', error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Admin: list user_products with optional filters
 * @route GET /api/admin/user-products
 * @access Admin
 */
export const adminListUserProducts = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, user_id, product_id } = req.query;
    
    console.log('🔍 adminListUserProducts - Params reçus:', { status, limit, offset, user_id, product_id });

    let query = `
      SELECT up.id, up.user_id, up.product_id, up.purchase_id, up.purchase_price, up.daily_revenue, up.total_revenue,
        up.earned_so_far, up.days_elapsed, up.start_date, up.end_date, up.status, up.created_at,
        p.name as product_name, pr.display_name as user_display_name, pr.phone as user_phone
      FROM user_products up
      INNER JOIN products p ON up.product_id = p.id
      INNER JOIN profiles pr ON up.user_id = pr.id
    `;

    const params = [];
    const filters = [];
    
    if (status) {
      filters.push('up.status = ?');
      params.push(status);
    }
    
    if (user_id) {
      // Recherche par ID numérique OU par téléphone
      const isNumeric = /^\d+$/.test(user_id);
      if (isNumeric) {
        filters.push('up.user_id = ?');
        params.push(parseInt(user_id));
      } else {
        // Supposé être un téléphone
        filters.push('pr.phone LIKE ?');
        params.push(`%${user_id}%`);
      }
    }

    if (product_id) {
      // Recherche par ID produit OU par nom
      const isNumeric = /^\d+$/.test(product_id);
      if (isNumeric) {
        filters.push('up.product_id = ?');
        params.push(parseInt(product_id));
      } else {
        // Supposé être un nom de produit
        filters.push('p.name LIKE ?');
        params.push(`%${product_id}%`);
      }
    }
    
    if (filters.length) {
      query += ' WHERE ' + filters.join(' AND ');
    }

    query += ' ORDER BY up.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    console.log('🔍 SQL Query:', query);
    console.log('🔍 Query Params:', params);

    const [rows] = await pool.query(query, params);
    console.log('🔍 Résultats trouvés:', rows.length);
    
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('Erreur adminListUserProducts:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des produits utilisateurs', error: error.message });
  }
};

