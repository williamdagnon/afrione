import express from 'express';
import {
  getDashboard,
  getAdvancedStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserBalance,
  getSystemSettings,
  updateSystemSetting,
  getAdminLogs
} from '../controllers/adminController.js';
import { adminCancelUserProduct, adminReactivateUserProduct, adminListUserProducts } from '../controllers/userProductController.js';
import {
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} from '../controllers/withdrawalController.js';
import {
  getPendingBankAccounts,
  verifyBankAccount,
  rejectBankAccount,
  getAllBankAccounts
} from '../controllers/bankAccountController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes admin nécessitent authentification + rôle admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboard);
router.get('/stats', getAdvancedStats);

// Gestion des utilisateurs
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/balance', updateUserBalance);

// Gestion des retraits
router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);

// Gestion des comptes bancaires
router.get('/bank-accounts', getPendingBankAccounts);
router.get('/bank-accounts/all', getAllBankAccounts);
router.put('/bank-accounts/:id/verify', verifyBankAccount);
router.put('/bank-accounts/:id/reject', rejectBankAccount);

// Paramètres système
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSetting);

// Logs
router.get('/logs', getAdminLogs);

// Admin: arrêter un produit utilisateur
router.put('/user-products/:id/stop', adminCancelUserProduct);

// Admin: réactiver un produit utilisateur
router.put('/user-products/:id/reactivate', adminReactivateUserProduct);

// Admin: lister les produits utilisateurs
router.get('/user-products', adminListUserProducts);

export default router;

