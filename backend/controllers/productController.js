import pool from '../config/database.js';

/**
 * @desc    Récupérer tous les produits
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE is_active = TRUE ORDER BY price ASC'
    );

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des produits',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer un produit par ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du produit',
      error: error.message
    });
  }
};

/**
 * @desc    Créer un nouveau produit (Admin seulement)
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, duration, duration_days, daily_revenue, total_revenue, image, description } = req.body;

    // Validation des données
    if (!name || !price || !duration_days) {
      return res.status(400).json({
        success: false,
        message: 'Le nom, le prix et la durée sont requis'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, price, duration, duration_days, daily_revenue, total_revenue, image, description, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [name, price, duration, duration_days, daily_revenue, total_revenue, image, description]
    );

    // Récupérer le produit créé
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: products[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du produit',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un produit (Admin seulement)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Vérifier si le produit existe
    const [existingProduct] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Construire la requête de mise à jour dynamiquement
    const updateFields = [];
    const values = [];
    
    const allowedFields = [
      'name', 'price', 'duration', 'duration_days', 
      'daily_revenue', 'total_revenue', 'image', 
      'description', 'is_active'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour'
      });
    }

    // Ajouter l'ID à la fin des valeurs
    values.push(id);

    // Exécuter la mise à jour
    await pool.query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    // Récupérer le produit mis à jour
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: products[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du produit',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un produit (Admin seulement)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - marquer comme inactif plutôt que supprimer
    const [result] = await pool.query(
      'UPDATE products SET is_active = FALSE WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Produit désactivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du produit',
      error: error.message
    });
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
