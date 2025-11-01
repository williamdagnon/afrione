import express from 'express';
import { getMyTeam, getReferralStats, validateReferralCode } from '../controllers/referralController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/referrals/validate-code - Valider un code (public - pas d'auth)
router.post('/validate-code', validateReferralCode);

// Routes protégées
router.use(authMiddleware);

// GET /api/referrals/my-team - Mon équipe
router.get('/my-team', getMyTeam);

// GET /api/referrals/stats - Mes statistiques de parrainage
router.get('/stats', getReferralStats);

export default router;

