import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Ban, Check, DollarSign, Eye } from 'lucide-react';
import api from '../../services/api';
import { ScreenType } from '../../App';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface UserManagementProps {
  onNavigate: (screen: ScreenType) => void;
}

interface User {
  id: number;
  phone: string;
  display_name: string;
  email?: string;
  balance: number;
  total_earnings?: number;
  role: string;
  referral_code?: string;
  is_active: boolean;
  created_at: string;
  // Nouveaux champs
  active_investments?: number;
  completed_investments?: number;
  total_deposits_approved?: number;
  total_withdrawals_approved?: number;
  commission_total?: number;
  filleuls_count?: number;
}

interface UserProduct {
  id: number;
  user_id: number;
  product_id: number;
  purchase_id?: number | null;
  product_name?: string;
  purchase_price?: number;
  earned_so_far?: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
}

interface UserDetails {
  id: number;
  phone: string;
  display_name: string;
  email?: string;
  balance: number;
  total_earnings?: number;
  created_at?: string;
  stats?: Record<string, number | string | null>;
  deposits?: Array<{ id: number; amount: number; status: string; created_at: string }>;
  withdrawals?: Array<{ id: number; amount: number; status: string; created_at: string }>;
  user_products?: UserProduct[];
}

const UserManagement: React.FC<UserManagementProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAdjustBalance, setShowAdjustBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract'>('add');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  
  // État de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 20; // 20 utilisateurs par page

  // useCallback to satisfy hook dependencies
  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await api.getAllUsers(itemsPerPage, offset, searchTerm);
      if (response.success && response.data) {
        setUsers(response.data);
        if (response.total) {
          setTotalUsers(response.total);
        }
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Réinitialiser à la première page
  };

  const loadUserDetails = async (userId: number) => {
    try {
      const response = await api.getUserById(userId);
      console.debug('Response getUserById:', response);
      if (response.success && response.data) {
        setUserDetails(response.data as UserDetails);
        setShowUserDetails(true);
      } else {
        toast.error(response.message || 'Erreur lors du chargement des détails');
      }
    } catch (error: unknown) {
      console.error('Erreur chargement détails:', error);
      const msg = (error as { message?: string })?.message || String(error);
      toast.error('Erreur lors du chargement des détails: ' + msg);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await api.updateUserStatus(user.id, !user.is_active);
      if (response.success) {
        toast.success(`Utilisateur ${!user.is_active ? 'activé' : 'désactivé'}`);
        loadUsers();
      }
    } catch (error: unknown) {
      console.error('Erreur mise à jour statut:', error);
      const msg = (error as { message?: string })?.message || String(error);
      toast.error(msg || 'Erreur lors de la mise à jour');
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !balanceAmount) return;

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Montant invalide');
      return;
    }

    try {
      const response = await api.updateUserBalance(selectedUser.id, amount, balanceOperation);
      if (response.success) {
        toast.success('Solde mis à jour');
        setShowAdjustBalance(false);
        setBalanceAmount('');
        loadUsers();
      }
    } catch (error: unknown) {
      console.error('Erreur ajustement solde:', error);
      const msg = (error as { message?: string })?.message || String(error);
      toast.error(msg || 'Erreur lors de l\'ajustement');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-serif">
      {/* Header */}
      <div className="bg-yellow-500 text-white p-4">
        <div className="flex items-center mb-3">
          <button onClick={() => onNavigate('admin-dashboard' as ScreenType)} className="mr-3">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Gestion des utilisateurs</h1>
            <p className="text-yellow-100 text-sm">
              {users.length} utilisateur(s) sur cette page
              {totalUsers > 0 && <span> / {totalUsers} total</span>}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par téléphone, nom, email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-800"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="p-4 space-y-3 pb-32">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun utilisateur trouvé
          </div>
        ) : (
          users.map((user) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-4 shadow"
            >
              {/* User Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{user.display_name}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                  {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                </div>
                <div className="flex flex-col items-end">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                  </div>
                  {!user.is_active && (
                    <div className="mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                      Inactif
                    </div>
                  )}
                </div>
              </div>

              {/* Balance & Stats */}
              <div className="bg-gray-50 rounded p-3 mb-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Solde :</span>
                  <span className="font-bold text-green-600">{user.balance.toLocaleString()} FCFA</span>
                </div>
                {user.total_earnings !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenus totaux :</span>
                    <span className="font-semibold text-blue-600">{user.total_earnings.toLocaleString()} FCFA</span>
                  </div>

                )}

                
                {/* Investissements */}
                {(user.active_investments || user.completed_investments) && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Investissements :</span>
                    <span className="text-xs">
                      <span className="font-semibold text-orange-600">{user.active_investments || 0}</span>
                      <span className="text-gray-500"> en cours, </span>
                      <span className="font-semibold text-green-600">{user.completed_investments || 0}</span>
                      <span className="text-gray-500"> terminés</span>
                    </span>
                  </div>
                )}
                
                {/* Dépôts & Retraits */}
                {(user.total_deposits_approved || user.total_withdrawals_approved) && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Transactions :</span>
                    <span className="text-xs">
                      <span className="font-semibold text-blue-600">{user.total_deposits_approved || 0}</span>
                      <span className="text-gray-500"> dépôts, </span>
                      <span className="font-semibold text-red-600">{user.total_withdrawals_approved || 0}</span>
                      <span className="text-gray-500"> retraits</span>
                    </span>
                  </div>
                )}
                
                {/* Commissions & Filleuls */}
                {(user.commission_total || user.filleuls_count) && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Réseau :</span>
                    <span className="text-xs">
                      <span className="font-semibold text-purple-600">{user.filleuls_count || 0}</span>
                      <span className="text-gray-500"> filleuls, </span>
                      <span className="font-semibold text-emerald-600">{(user.commission_total || 0).toLocaleString()}</span>
                      <span className="text-gray-500"> FCFA commissions</span>
                    </span>
                  </div>
                )}
                
                {user.referral_code && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Code parrainage :</span>
                    <span className="font-mono text-xs bg-yellow-100 px-2 py-0.5 rounded">{user.referral_code}</span>
                  </div>
                )}
              </div>

              {/* Date */}
              <p className="text-xs text-gray-400 mb-3">
                Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </p>

              {/* Actions */}
              {user.role !== 'admin' && (
                <div className="flex gap-2 flex-wrap">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => loadUserDetails(user.id)}
                    className="flex-1 bg-indigo-500 text-white py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Détails
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowAdjustBalance(true);
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm flex items-center justify-center"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Solde
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleStatus(user)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center ${
                      user.is_active 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {user.is_active ? (
                      <>
                        <Ban className="w-4 h-4 mr-1" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Activer
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> - {users.length} utilisateur(s) affiché(s)
            {totalUsers > 0 && <span className="ml-2 text-gray-500">/ {totalUsers} total</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              ← Précédent
            </button>
            <button
              onClick={() => {
                if (users.length === itemsPerPage) {
                  setCurrentPage(p => p + 1);
                }
              }}
              disabled={users.length < itemsPerPage}
              className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-full sm:max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Détails de {userDetails.display_name}</h3>

            {/* User Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="font-semibold text-gray-800">{userDetails.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Solde</p>
                <p className="font-bold text-green-600">{userDetails.balance?.toLocaleString() || 0} FCFA</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Revenus totaux</p>
                <p className="font-semibold text-blue-600">{userDetails.total_earnings?.toLocaleString() || 0} FCFA</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Inscrit le</p>
                <p className="text-sm text-gray-700">{userDetails.created_at ? new Date(userDetails.created_at).toLocaleDateString('fr-FR') : '-'}</p>
              </div>
            </div>

            {/* Investment Details */}
            {userDetails.stats && (
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-800 border-b pb-2">📊 Investissements</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-orange-50 rounded">
                    <p className="text-xs text-gray-600">En cours</p>
                    <p className="font-bold text-orange-600">{userDetails.stats.active_purchases || 0}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-xs text-gray-600">Terminés</p>
                    <p className="font-bold text-green-600">{userDetails.stats.completed_purchases || 0}</p>
                  </div>
                </div>

                {/* Deposits */}
                <h4 className="font-semibold text-gray-800 border-b pb-2 mt-4">💰 Dépôts</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Total dépôts</p>
                    <p className="font-bold text-blue-600">{userDetails.stats.total_manual_deposits || 0}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded">
                    <p className="text-xs text-gray-600">Approuvés</p>
                    <p className="font-bold text-indigo-600">{userDetails.stats.approved_deposits || 0}</p>
                  </div>
                </div>
                <div className="p-3 bg-cyan-50 rounded text-center">
                  <p className="text-xs text-gray-600">Total crédité</p>
                  <p className="font-bold text-cyan-600">{userDetails.stats.total_deposits_amount?.toLocaleString() || 0} FCFA</p>
                </div>

                {/* Withdrawals */}
                <h4 className="font-semibold text-gray-800 border-b pb-2 mt-4">🏦 Retraits</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-red-50 rounded">
                    <p className="text-xs text-gray-600">Total retraits</p>
                    <p className="font-bold text-red-600">{userDetails.stats.total_withdrawal_requests || 0}</p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded">
                    <p className="text-xs text-gray-600">Approuvés</p>
                    <p className="font-bold text-rose-600">{userDetails.stats.approved_withdrawals || 0}</p>
                  </div>
                </div>
                <div className="p-3 bg-pink-50 rounded text-center">
                  <p className="text-xs text-gray-600">Total déboursé</p>
                  <p className="font-bold text-pink-600">{userDetails.stats.total_withdrawals_amount?.toLocaleString() || 0} FCFA</p>
                </div>

                {/* Network */}
                <h4 className="font-semibold text-gray-800 border-b pb-2 mt-4">🤝 Réseau</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-50 rounded">
                    <p className="text-xs text-gray-600">Total filleuls</p>
                    <p className="font-bold text-purple-600">{userDetails.stats.total_referrals || 0}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded">
                    <p className="text-xs text-gray-600">Commissions totales</p>
                    <p className="font-bold text-emerald-600">{userDetails.stats.commission_total?.toLocaleString() || 0} FCFA</p>
                  </div>
                </div>
              </div>
      )}

        {/* Liste des produits utilisateurs (investissements) */}
                {userDetails.user_products && userDetails.user_products.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">📦 Investissements récents</h4>
                    {userDetails.user_products.map((up: UserProduct) => (
                      <div key={up.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{up.product_name}</div>
                          <div className="text-xs text-gray-500">Démarré: {up.start_date ? new Date(up.start_date).toLocaleDateString('fr-FR') : '-'}</div>
                          <div className="text-xs text-gray-500">Gagné: {up.earned_so_far?.toLocaleString() || 0} FCFA</div>
                        </div>
                        <div className="flex gap-2">
                          {up.status === 'active' && (
                            <button
                              onClick={async () => {
                                if (!confirm("Confirmer l'arrêt de cet investissement ? (aucun remboursement automatique)")) return;
                                try {
                                  const resp = await api.adminStopUserProduct(up.id);
                                  if (resp.success) {
                                    toast.success('Investissement arrêté');
                                    await loadUserDetails(userDetails.id);
                                  } else {
                                    toast.error(resp.message || 'Erreur');
                                  }
                                } catch (err: unknown) {
                                  console.error('Erreur arrêt investissement:', err);
                                  const msg = (err as { message?: string })?.message || String(err);
                                  toast.error(msg || "Erreur lors de l'opération");
                                }
                              }}
                              className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                            >
                              Arrêter
                            </button>
                            )}

                          {up.status === 'cancelled' && (
                            <button
                              onClick={async () => {
                                if (!confirm("Confirmer la réactivation de cet investissement ?")) return;
                                try {
                                  const resp = await api.adminReactivateUserProduct(up.id);
                                  if (resp.success) {
                                    toast.success('Investissement réactivé');
                                    await loadUserDetails(userDetails.id);
                                  } else {
                                    toast.error(resp.message || 'Erreur');
                                  }
                                } catch (err: unknown) {
                                  console.error('Erreur réactivation investissement:', err);
                                  const msg = (err as { message?: string })?.message || String(err);
                                  toast.error(msg || "Erreur lors de l'opération");
                                }
                              }}
                              className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                            >
                              Annuler
                            </button>
                          )}

                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(up.purchase_id?.toString() || '');
                              toast.success("ID d'achat copié");
                            }}
                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-sm"
                          >
                            Copier ID
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

            <div className="flex gap-2">
              <button
                onClick={() => setShowUserDetails(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showAdjustBalance && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ajuster le solde</h3>
            <p className="text-sm text-gray-600 mb-4">
              Utilisateur : <span className="font-semibold">{selectedUser.display_name}</span><br />
              Solde actuel : <span className="font-semibold">{selectedUser.balance.toLocaleString()} FCFA</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Opération</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBalanceOperation('add')}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    balanceOperation === 'add'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setBalanceOperation('subtract')}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    balanceOperation === 'subtract'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Retirer
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant (FCFA)</label>
              <input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAdjustBalance(false);
                  setBalanceAmount('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleAdjustBalance}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

