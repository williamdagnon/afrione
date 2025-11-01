import express from 'express';
import { doCheckin, getCheckinStatus, getCheckinHistory } from '../controllers/checkinController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// POST /api/checkins - Faire un check-in
router.post('/', doCheckin);

// GET /api/checkins/status - Statut du check-in aujourd'hui
router.get('/status', getCheckinStatus);

// GET /api/checkins/history - Historique des check-ins
router.get('/history', getCheckinHistory);

export default router;

