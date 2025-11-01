import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Récupérer tous les produits
 * @access  Public
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Récupérer un produit par ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    Créer un nouveau produit (Admin seulement)
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Mettre à jour un produit (Admin seulement)
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Supprimer un produit (Admin seulement)
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;

