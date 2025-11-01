import express from 'express';
import { getMyTransactions, getTransactionStats } from '../controllers/transactionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// GET /api/transactions - Récupérer mes transactions
router.get('/', getMyTransactions);

// GET /api/transactions/stats - Récupérer mes statistiques
router.get('/stats', getTransactionStats);

export default router;

