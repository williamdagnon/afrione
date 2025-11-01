import express from 'express';
import { createPurchase, getUserPurchases, getAllPurchases } from '../controllers/purchaseController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/purchases
 * @desc    Effectuer un achat de produit
 * @access  Private
 */
router.post('/', authMiddleware, createPurchase);

/**
 * @route   GET /api/purchases/my
 * @desc    Récupérer l'historique des achats de l'utilisateur
 * @access  Private
 */
router.get('/my', authMiddleware, getUserPurchases);

/**
 * @route   GET /api/purchases
 * @desc    Récupérer tous les achats (Admin)
 * @access  Private/Admin
 */
router.get('/', authMiddleware, adminMiddleware, getAllPurchases);

export default router;

