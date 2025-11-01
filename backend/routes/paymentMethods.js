import express from 'express';
import { getAllPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../controllers/paymentMethodController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllPaymentMethods);
router.post('/', authMiddleware, adminMiddleware, createPaymentMethod);
router.put('/:id', authMiddleware, adminMiddleware, updatePaymentMethod);
router.delete('/:id', authMiddleware, adminMiddleware, deletePaymentMethod);

export default router;
