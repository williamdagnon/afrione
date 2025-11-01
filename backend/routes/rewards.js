import express from 'express';
import { getMyRewards, claimReward, getPendingRewards } from '../controllers/rewardController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// GET /api/rewards - Mes récompenses
router.get('/', getMyRewards);

// GET /api/rewards/pending - Récompenses en attente
router.get('/pending', getPendingRewards);

// POST /api/rewards/:id/claim - Réclamer une récompense
router.post('/:id/claim', claimReward);

export default router;

