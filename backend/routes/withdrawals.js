import express from 'express';
import {
  getMyWithdrawals,
  createWithdrawal,
  cancelWithdrawal
} from '../controllers/withdrawalController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// GET /api/withdrawals - Mes demandes de retrait
router.get('/', getMyWithdrawals);

// POST /api/withdrawals - Créer une demande
router.post('/', createWithdrawal);

// PUT /api/withdrawals/:id/cancel - Annuler une demande
router.put('/:id/cancel', cancelWithdrawal);

export default router;

