import express from 'express';
import { createManualDeposit, getUserManualDeposits, listAllDeposits, approveManualDeposit, rejectManualDeposit } from '../controllers/manualDepositController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();

// Utilisateur
router.post('/', authMiddleware, createManualDeposit);
router.get('/', authMiddleware, getUserManualDeposits);

// Admin
router.get('/admin', authMiddleware, adminMiddleware, listAllDeposits);
router.put('/admin/:id/approve', authMiddleware, adminMiddleware, approveManualDeposit);
router.put('/admin/:id/reject', authMiddleware, adminMiddleware, rejectManualDeposit);

export default router;
