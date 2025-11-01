import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Ban, Check, DollarSign } from 'lucide-react';
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
}

const UserManagement: React.FC<UserManagementProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAdjustBalance, setShowAdjustBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract'>('add');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers(100, 0);
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await api.updateUserStatus(user.id, !user.is_active);
      if (response.success) {
        toast.success(`Utilisateur ${!user.is_active ? 'activé' : 'désactivé'}`);
        loadUsers();
      }
    } catch (error: any) {
      console.error('Erreur mise à jour statut:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
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
    } catch (error: any) {
      console.error('Erreur ajustement solde:', error);
      toast.error(error.message || 'Erreur lors de l\'ajustement');
    }
  };

  const filteredUsers = users.filter(user =>
    user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-yellow-100 text-sm">{users.length} utilisateur(s)</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par téléphone, nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-800"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="p-4 space-y-3 pb-20">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun utilisateur trouvé
          </div>
        ) : (
          filteredUsers.map((user) => (
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
                {user.referral_code && (
                  <div className="flex justify-between text-sm">
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
                <div className="flex gap-2">
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

