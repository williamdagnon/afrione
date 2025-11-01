import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Créer l'instance axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================
// TYPES
// ============================================

export interface LoginData {
  phone: string;
  password: string;
}

export interface RegisterData {
  phone: string;
  password: string;
  display_name?: string;
  referral_code?: string;
}

export interface BankAccountData {
  bank_name: string;
  account_holder: string;
  account_number: string;
}

export interface WithdrawalData {
  amount: number;
  bank_account_id: number;
}

// ============================================
// AUTHENTIFICATION
// ============================================
export const authAPI = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// ============================================
// PRODUITS
// ============================================
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id: number) => api.get(`/products/${id}`),
};

// ============================================
// ACHATS
// ============================================
export const purchasesAPI = {
  create: (productId: number) => api.post('/purchases', { product_id: productId }),
  getMyPurchases: () => api.get('/purchases/my'),
};

// ============================================
// TRANSACTIONS
// ============================================
export const transactionsAPI = {
  getAll: (params?: { type?: string; limit?: number; offset?: number }) => 
    api.get('/transactions', { params }),
  getStats: () => api.get('/transactions/stats'),
};

// ============================================
// PARRAINAGE
// ============================================
export const referralsAPI = {
  getMyTeam: () => api.get('/referrals/my-team'),
  getStats: () => api.get('/referrals/stats'),
  validateCode: (code: string) => api.post('/referrals/validate-code', { code }),
};

// ============================================
// COMPTES BANCAIRES
// ============================================
export const bankAccountsAPI = {
  getAll: () => api.get('/bank-accounts'),
  create: (data: BankAccountData) => api.post('/bank-accounts', data),
  setDefault: (id: number) => api.put(`/bank-accounts/${id}/set-default`),
  delete: (id: number) => api.delete(`/bank-accounts/${id}`),
};

// ============================================
// RETRAITS
// ============================================
export const withdrawalsAPI = {
  getAll: () => api.get('/withdrawals'),
  create: (data: WithdrawalData) => api.post('/withdrawals', data),
  cancel: (id: number) => api.put(`/withdrawals/${id}/cancel`),
};

// ============================================
// CHECK-INS
// ============================================
export const checkinsAPI = {
  doCheckin: () => api.post('/checkins'),
  getStatus: () => api.get('/checkins/status'),
  getHistory: () => api.get('/checkins/history'),
};

// ============================================
// RÉCOMPENSES
// ============================================
export const rewardsAPI = {
  getAll: (params?: { status?: string }) => api.get('/rewards', { params }),
  claim: (id: number) => api.post(`/rewards/${id}/claim`),
  getPending: () => api.get('/rewards/pending'),
};

// ============================================
// PRODUITS UTILISATEUR
// ============================================
export const userProductsAPI = {
  getAll: (params?: { status?: string }) => api.get('/user-products', { params }),
  getById: (id: number) => api.get(`/user-products/${id}`),
  getStats: () => api.get('/user-products/stats'),
};

// ============================================
// NOTIFICATIONS
// ============================================
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// ============================================
// ADMIN
// ============================================
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: (params?: { period?: string }) => api.get('/admin/stats', { params }),
  
  // Utilisateurs
  getUsers: (params?: { search?: string; limit?: number; offset?: number }) => 
    api.get('/admin/users', { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUserBalance: (id: string, amount: number, reason: string) => 
    api.put(`/admin/users/${id}/balance`, { amount, reason }),
  
  // Retraits
  getWithdrawals: (status?: string) => api.get('/admin/withdrawals', { params: { status } }),
  approveWithdrawal: (id: number) => api.put(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id: number, reason: string) => 
    api.put(`/admin/withdrawals/${id}/reject`, { reason }),
  
  // Comptes bancaires
  getBankAccounts: (status?: string) => api.get('/admin/bank-accounts', { params: { status } }),
  verifyBankAccount: (id: number) => api.put(`/admin/bank-accounts/${id}/verify`),
  rejectBankAccount: (id: number, reason: string) => 
    api.put(`/admin/bank-accounts/${id}/reject`, { reason }),
  
  // Paramètres
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key: string, value: any) => api.put('/admin/settings', { key, value }),
  
  // Logs
  getLogs: (params?: { limit?: number; offset?: number; action?: string }) => 
    api.get('/admin/logs', { params }),
};

export default api;

