// Client API pour communiquer avec le backend
import type { ReferralTeam, ReferralStats, ReferralCodeValidation } from '../types/referral';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Interface pour la réponse de l'API
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  total?: number;
  count?: number;
}

// Interface pour l'utilisateur
export interface User {
  id: number;
  phone: string;
  display_name: string;
  email?: string;
  balance: number;
  total_earnings?: number;
  role: string;
  referral_code?: string;
  is_active?: boolean;
  created_at?: string;
}

// Interface pour un produit
export interface Product {
  id: number;
  name: string;
  price: number;
  duration: string;
  duration_days?: number;
  daily_revenue: number;
  total_revenue: number;
  image: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

// Interface pour un achat
export interface Purchase {
  id: number;
  user_id?: number;
  product_id: number;
  price: number;
  total_amount?: number;
  status?: string;
  created_at: string;
  product_name?: string;
  product_image?: string;
  duration?: string;
  daily_revenue?: number;
  total_revenue?: number;
}

// Interface pour une notification
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

// Interface pour une transaction
export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'reward' | 'commission';
  amount: number;
  status: string;
  payment_method?: string;
  reference?: string;
  description?: string;
  created_at: string;
}

// Interface pour un compte bancaire
export interface BankAccount {
  id: number;
  user_id: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_default?: boolean;
  created_at?: string;
}

// Interface pour une demande de retrait
export interface WithdrawalRequest {
  id: number;
  user_id: number;
  amount: number;
  bank_account_id: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  processed_at?: string;
}

// Interface pour une méthode de paiement
export interface PaymentMethod {
  id: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_active?: boolean;
  created_at?: string;
}

// Interface pour le parrainage
export interface ReferralInfo {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  level1_count: number;
  level2_count: number;
  level3_count: number;
  total_commissions: number;
}

// Classe pour gérer les appels API
class ApiClient {
  private token: string | null = null;

  constructor() {
    // Récupérer le token depuis le localStorage au démarrage
    this.token = localStorage.getItem('authToken');
  }

  // Définir le token d'authentification
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Supprimer le token d'authentification
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Récupérer le token
  getToken() {
    return this.token;
  }

  // Méthode privée pour faire les requêtes
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    
    const headersObj: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Ajouter le token d'authentification si disponible
    if (this.token) {
      headersObj['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: headersObj,
      } as RequestInit);

      const data = await response.json();

      // ✅ Retourner la réponse JSON même si le statut HTTP n'est pas OK
      // Cela permet au frontend de traiter les erreurs métier correctement
      if (!response.ok) {
        console.warn(`⚠️ Erreur HTTP ${response.status}:`, data);
        // Si la réponse JSON contient déjà un format d'erreur, la retourner
        if (data.success === false || data.message) {
          return data;
        }
        // Sinon, construire une réponse d'erreur
        return {
          success: false,
          message: data.message || `Erreur HTTP ${response.status}`,
          error: data.error,
          data: undefined
        };
      }

      return data;
    } catch (error) {
      console.error('Erreur API (network):', error);
      throw error;
    }
  }

  // ========== AUTHENTIFICATION ==========

  // Connexion
  async login(phone: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Inscription
  async register(
    phone: string, 
    password: string, 
    display_name?: string,
    referralCode?: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, password, display_name, referred_by_code: referralCode }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Récupérer le profil
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/profile');
  }

  // ========== PRODUITS ==========

  // Récupérer tous les produits
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('/products');
  }

  // Récupérer un produit par ID
  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  // ========== ACHATS ==========

  // Effectuer un achat
  async createPurchase(product_id: number): Promise<ApiResponse<{ 
    purchase: Purchase; 
    user_product: any;
    new_balance: number 
  }>> {
    return this.request<{ purchase: Purchase; user_product: any; new_balance: number }>('/purchases', {
      method: 'POST',
      body: JSON.stringify({ product_id }),
    });
  }

  // Récupérer l'historique des achats de l'utilisateur
  async getPurchases(): Promise<ApiResponse<Purchase[]>> {
    return this.request<Purchase[]>('/purchases/my');
  }

  // ========== PROFIL ==========

  // Mettre à jour le profil
  async updateProfile(data: { display_name?: string; email?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Recharger le solde
  async recharge(amount: number, payment_method?: string, reference?: string): Promise<ApiResponse<{ new_balance: number }>> {
    return this.request<{ new_balance: number }>('/profile/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount, payment_method, reference }),
    });
  }

  // Créer une demande de retrait
  async withdraw(amount: number, bank_account_id: number): Promise<ApiResponse<{ 
    withdrawal_request_id: number;
    amount: number;
    status: string;
  }>> {
    return this.request<{ withdrawal_request_id: number; amount: number; status: string }>('/profile/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, bank_account_id }),
    });
  }

  // ========== NOTIFICATIONS ==========

  // Récupérer les notifications
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/notifications');
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(id: number): Promise<ApiResponse<Notification>> {
    return this.request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Marquer toutes les notifications comme lues
  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Supprimer une notification
  async deleteNotification(id: number): Promise<ApiResponse> {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== TRANSACTIONS ==========

  // Récupérer les transactions de l'utilisateur
  async getTransactions(limit?: number, offset?: number): Promise<ApiResponse<Transaction[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<Transaction[]>(`/transactions?${params.toString()}`);
  }

  // ========== COMPTES BANCAIRES ==========

  // Récupérer les comptes bancaires
  async getBankAccounts(): Promise<ApiResponse<BankAccount[]>> {
    return this.request<BankAccount[]>('/bank-accounts');
  }

  // Ajouter un compte bancaire
  async addBankAccount(data: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  }): Promise<ApiResponse<BankAccount>> {
    return this.request<BankAccount>('/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Supprimer un compte bancaire
  async deleteBankAccount(id: number): Promise<ApiResponse> {
    return this.request(`/bank-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== DEMANDES DE RETRAIT ==========

  // Récupérer les demandes de retrait
  async getWithdrawalRequests(): Promise<ApiResponse<WithdrawalRequest[]>> {
    return this.request<WithdrawalRequest[]>('/withdrawals/my');
  }

  // Récupérer mes retraits (alias pour getWithdrawalRequests)
  async getMyWithdrawals(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/withdrawals');
  }

  // Récupérer mes dépôts manuels
  async getMyManualDeposits(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/manual-deposits');
  }

  // ========== PARRAINAGE ==========

  // Récupérer les informations de mon équipe de parrainage
  async getReferralTeam(): Promise<ApiResponse<ReferralTeam>> {
    return this.request<ReferralTeam>('/referrals/my-team');
  }

  // Compatibilité : ancien nom `getReferralInfo` utilisé ailleurs dans le code
  async getReferralInfo(): Promise<ApiResponse<ReferralTeam>> {
    return this.getReferralTeam();
  }

  // Récupérer les statistiques de parrainage
  async getReferralStats(): Promise<ApiResponse<ReferralStats>> {
    return this.request<ReferralStats>('/referrals/stats');
  }

  // Valider un code de parrainage
  async validateReferralCode(code: string): Promise<ApiResponse<ReferralCodeValidation>> {
    return this.request<ReferralCodeValidation>('/referrals/validate-code', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  // Compatibilité : obtenir la liste des filleuls (ancien nom `getReferrals`)
  // Le backend expose uniquement les détails du niveau 1 via `/referrals/my-team`.
  // Cette méthode retourne la liste des filleuls de niveau 1 si demandé (ou par défaut),
  // et renvoie une liste vide avec un message pour les niveaux 2/3 (non disponibles).
  async getReferrals(level?: number): Promise<ApiResponse<any[]>> {
    try {
      const teamResp = await this.getReferralTeam();
      if (!teamResp.success) {
        return { success: false, message: teamResp.message, data: [] };
      }

      const team = teamResp.data as ReferralTeam | undefined;

      if (!level || level === 1) {
        return { success: true, data: team?.level1Users || [] };
      }

      // Niveau 2 et 3 ne sont pas fournis comme listes par le backend actuellement
      return {
        success: true,
        data: [],
        message: `Listing for level ${level} not available from backend; only level 1 returned`
      };
    } catch (error) {
      console.error('Erreur getReferrals:', error);
      return { success: false, message: 'Erreur lors de la récupération des filleuls', data: [] };
    }
  }

  // ========== CHECK-IN ==========

  // Effectuer le check-in quotidien
  async dailyCheckIn(): Promise<ApiResponse<{
    streak: number;
    reward_amount: number;
    new_balance: number;
  }>> {
    return this.request<{
      streak: number;
      reward_amount: number;
      new_balance: number;
    }>('/checkins', {
      method: 'POST',
    });
  }

  // Récupérer le statut du check-in
  async getCheckInStatus(): Promise<ApiResponse<{
    streak: number;
    last_checkin: string | null;
    can_checkin: boolean;
  }>> {
    return this.request<{
      streak: number;
      last_checkin: string | null;
      can_checkin: boolean;
    }>('/checkins/status');
  }

  // ========== PRODUITS UTILISATEUR ==========

  // Récupérer les produits actifs de l'utilisateur
  async getUserProducts(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/user-products');
  }

  // ========== RÉCOMPENSES ==========

  // Récupérer les récompenses disponibles
  async getRewards(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/rewards');
  }

  // Réclamer une récompense
  async claimReward(reward_id: number): Promise<ApiResponse<{
    reward_amount: number;
    new_balance: number;
  }>> {
    return this.request<{
      reward_amount: number;
      new_balance: number;
    }>(`/rewards/${reward_id}/claim`, {
      method: 'POST',
    });
  }

  // ========== ADMIN ==========

  // Dashboard admin
  async getAdminDashboard(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/dashboard');
  }

  // Gestion des utilisateurs
  async getAllUsers(limit?: number, offset?: number, search?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (search) params.append('search', search);
    
    return this.request<any[]>(`/admin/users${params.toString() ? '?' + params.toString() : ''}`);
  }

  async getUserById(userId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}`);
  }

  async updateUserStatus(userId: number, is_active: boolean): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active }),
    });
  }

  async updateUserBalance(userId: number, amount: number, operation: 'add' | 'subtract'): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ amount, operation }),
    });
  }

  // Gestion des retraits (admin)
  async getAdminWithdrawals(status?: string): Promise<ApiResponse<any[]>> {
    const params = status ? `?status=${status}` : '';
    return this.request<any[]>(`/admin/withdrawals${params}`);
  }

  async approveWithdrawal(withdrawalId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/withdrawals/${withdrawalId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectWithdrawal(withdrawalId: number, reason: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ admin_note: reason }),
    });
  }

  // Gestion des produits (admin)
  async createProduct(data: {
    name: string;
    price: number;
    duration: string;
    duration_days: number;
    daily_revenue: number;
    total_revenue: number;
    image: string;
    description?: string;
  }): Promise<ApiResponse<Product>> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(productId: number, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(productId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Admin: arrêter un produit utilisateur (investment)
  async adminStopUserProduct(userProductId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/user-products/${userProductId}/stop`, {
      method: 'PUT'
    });
  }

  async adminReactivateUserProduct(userProductId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/user-products/${userProductId}/reactivate`, {
      method: 'PUT'
    });
  }

  async getAdminUserProducts(params?: { status?: string; user_id?: string | number; product_id?: string | number; limit?: number; offset?: number }): Promise<ApiResponse<any[]>> {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.user_id) q.append('user_id', String(params.user_id));
    if (params?.product_id) q.append('product_id', String(params.product_id));
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.offset) q.append('offset', String(params.offset));
    return this.request<any[]>(`/admin/user-products${q.toString() ? '?' + q.toString() : ''}`);
  }

  // Statistiques admin
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/stats');
  }

  // Logs admin
  async getAdminLogs(limit?: number): Promise<ApiResponse<any[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/admin/logs${params}`);
  }

  // Paramètres système
  async getSystemSettings(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/settings');
  }

  async updateSystemSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Méthodes de paiement
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return this.request<PaymentMethod[]>('/payment-methods');
  }

  async createPaymentMethod(data: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  }): Promise<ApiResponse<PaymentMethod>> {
    return this.request<PaymentMethod>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Mettre à jour une méthode de paiement (admin)
  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<ApiResponse<PaymentMethod>> {
    return this.request<PaymentMethod>(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Supprimer une méthode de paiement (admin)
  async deletePaymentMethod(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/payment-methods/${id}`, {
      method: 'DELETE'
    });
  }

  async createManualDeposit(payload: { 
    payment_method_id: number;
    amount: number;
    deposit_number: string;
    transaction_id: string;
  }): Promise<ApiResponse<{
    id: number;
    status: string;
    amount: number;
  }>> {
    return this.request('/manual-deposits', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // PATCH AI: Admin gestion dépôts manuels
  async getManualDepositsAdmin(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/manual-deposits/admin');
  }
  async approveManualDeposit(id:number): Promise<ApiResponse<any>> {
    return this.request<any>(`/manual-deposits/admin/${id}/approve`,{method:'PUT'});
  }
  async rejectManualDeposit(id:number,reason:string):Promise<ApiResponse<any>>{
    return this.request<any>(`/manual-deposits/admin/${id}/reject`,{method:'PUT',body:JSON.stringify({admin_note:reason})});
  }

  // Gestion admin comptes bancaires
  async getAllBankAccountsAdmin(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/admin/bank-accounts/all");
  }
  async verifyBankAccountAdmin(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/bank-accounts/${id}/verify`, { method: 'PUT' });
  }
  async rejectBankAccountAdmin(id:number, reason:string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/bank-accounts/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) });
  }
}

// Exporter une instance unique du client API
export const api = new ApiClient();

export default api;
