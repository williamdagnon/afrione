import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

// Import des routes
import authRoutes from '../routes/authRoutes.js';
import productRoutes from '../routes/productRoutes.js';
import purchaseRoutes from '../routes/purchaseRoutes.js';
import profileRoutes from '../routes/profileRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import transactionRoutes from '../routes/transactions.js';
import referralRoutes from '../routes/referrals.js';
import bankAccountRoutes from '../routes/bankAccounts.js';
import withdrawalRoutes from '../routes/withdrawals.js';
import checkinRoutes from '../routes/checkins.js';
import rewardRoutes from '../routes/rewards.js';
import userProductRoutes from '../routes/userProducts.js';
import adminRoutes from '../routes/admin.js';
import paymentMethodRoutes from '../routes/paymentMethods.js';
import manualDepositRoutes from '../routes/manualDeposits.js';

// Chargement des variables d'environnement
dotenv.config();

import { initCronJobs } from '../cron/index.js';

const app = express();

// --------------------
// CORS
// --------------------
const FRONTEND_URL = process.env.APP_DOMAIN || 'https://invigorating-embrace-production.up.railway.app'; 
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// --------------------
// Middleware JSON
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Swagger
// --------------------
const swaggerPath = path.resolve('docs/swagger.json');
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// --------------------
// Routes de base
// --------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Futuristia backend opérationnelle.',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      purchases: '/api/purchases',
      profile: '/api/profile',
      notifications: '/api/notifications',
      docs: '/api-docs'
    }
  });
});

// --------------------
// Routes API
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/user-products', userProductRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/manual-deposits', manualDepositRoutes);

// --------------------
// Middleware erreurs
// --------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --------------------
// Lancement serveur
// --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs\n`);
  
  // Initialiser les CRON jobs
  initCronJobs();
});
