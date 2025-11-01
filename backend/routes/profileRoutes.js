import express from 'express';
import { getProfile, updateProfile, rechargeBalance, withdrawBalance } from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Récupérer le profil de l'utilisateur
 * @access  Private
 */
router.get('/', authMiddleware, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Mettre à jour le profil de l'utilisateur
 * @access  Private
 */
router.put('/', authMiddleware, updateProfile);

/**
 * @route   POST /api/profile/recharge
 * @desc    Recharger le solde de l'utilisateur
 * @access  Private
 */
router.post('/recharge', authMiddleware, rechargeBalance);

/**
 * @route   POST /api/profile/withdraw
 * @desc    Retirer du solde
 * @access  Private
 */
router.post('/withdraw', authMiddleware, withdrawBalance);

export default router;

