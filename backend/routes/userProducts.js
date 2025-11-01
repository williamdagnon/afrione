import express from 'express';
import {
  getMyUserProducts,
  getUserProductById,
  getUserProductsStats
} from '../controllers/userProductController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// GET /api/user-products - Mes produits actifs
router.get('/', getMyUserProducts);

// GET /api/user-products/stats - Mes statistiques
router.get('/stats', getUserProductsStats);

// GET /api/user-products/:id - Détails d'un produit
router.get('/:id', getUserProductById);

export default router;

