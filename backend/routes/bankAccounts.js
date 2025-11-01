import express from 'express';
import {
  getMyBankAccounts,
  createBankAccount,
  setDefaultBankAccount,
  deleteBankAccount
} from '../controllers/bankAccountController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// GET /api/bank-accounts - Mes comptes bancaires
router.get('/', getMyBankAccounts);

// POST /api/bank-accounts - Ajouter un compte
router.post('/', createBankAccount);

// PUT /api/bank-accounts/:id/set-default - Définir comme défaut
router.put('/:id/set-default', setDefaultBankAccount);

// DELETE /api/bank-accounts/:id - Supprimer un compte
router.delete('/:id', deleteBankAccount);

export default router;

