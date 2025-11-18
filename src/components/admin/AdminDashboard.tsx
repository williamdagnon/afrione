import React, { useState, useEffect } from 'react';
import { Users, DollarSign, ShoppingCart, TrendingUp, Clock, CheckCircle, Settings, Gift } from 'lucide-react';
import api from '../../services/api';
import { ScreenType } from '../../App';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface AdminDashboardProps {
  onNavigate: (screen: ScreenType) => void;
}

interface DashboardStats {
  total_users: number;
  new_users_today: number;
  total_balance: number;
  total_purchases: number;
  purchases_today: number;
  pending_withdrawals: number;
  active_products: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.getAdminDashboard();
      if (response.success && response.data) {
        // Le backend retourne data.stats
        setStats(response.data.stats || response.data);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-yellow-500 text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-serif pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6">
        <h1 className="text-2xl font-bold">Panel Administrateur</h1>
        <p className="text-yellow-100 text-sm mt-1">AFRIONE - Gestion complète</p>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Total Users */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_users || 0}</p>
              <p className="text-green-500 text-xs mt-1">
                +{stats?.new_users_today || 0} aujourd'hui
              </p>
            </div>
            <Users className="w-10 h-10 text-yellow-500" />
          </div>
        </motion.div>

        {/* Total Balance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Solde Total</p>
              <p className="text-xl font-bold text-gray-800">
                {(stats?.total_balance || 0).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-1">FCFA</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </motion.div>

        {/* Total Purchases */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Achats</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_purchases || 0}</p>
              <p className="text-blue-500 text-xs mt-1">
                +{stats?.purchases_today || 0} aujourd'hui
              </p>
            </div>
            <ShoppingCart className="w-10 h-10 text-blue-500" />
          </div>
        </motion.div>

        {/* Active Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Produits actifs</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats?.active_products || 0}
              </p>
              <p className="text-purple-500 text-xs mt-1">en vente</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Actions rapides</h2>
        
        <div className="space-y-2">
          {/* Pending Withdrawals */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('admin-withdrawals' as ScreenType)}
            className="w-full bg-white rounded-lg p-4 shadow flex items-center justify-between hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-500 mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Retraits en attente</p>
                <p className="text-sm text-gray-500">À valider</p>
              </div>
            </div>
            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">
              {stats?.pending_withdrawals || 0}
            </div>
          </motion.button>

          {/* User Management */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('admin-users' as ScreenType)}
            className="w-full bg-white rounded-lg p-4 shadow flex items-center justify-between hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 text-purple-500 mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Gérer les utilisateurs</p>
                <p className="text-sm text-gray-500">Voir tous</p>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </motion.button>

          {/* Product Management */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('admin-products' as ScreenType)}
            className="w-full bg-white rounded-lg p-4 shadow flex items-center justify-between hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-blue-500 mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Gérer les produits</p>
                <p className="text-sm text-gray-500">CRUD produits</p>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </motion.button>

          {/* User Products Management (admin) */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('admin-user-products' as ScreenType)}
            className="w-full bg-white rounded-lg p-4 shadow flex items-center justify-between hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-indigo-500 mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Gérer les produits utilisateurs</p>
                <p className="text-sm text-gray-500">Arrêter / Réactiver</p>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </motion.button>

          {/* PATCH AI - Dépôts manuels */}
          {/* <motion.button
            whileTap={{ scale:0.98 }}
            onClick={()=>onNavigate('admin-manual-deposits' as ScreenType)}
            className="w-full bg-white rounded-lg p-4 shadow flex items-center justify-between hover:bg-yellow-50 transition-colors">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-yellow-500 mr-3" />
                <div className="text-left">
                   <p className="font-semibold text-gray-800">Dépôts manuels</p> 
                  <p className="text-sm text-gray-500">À approuver</p>
                </div>
              </div>
              <span className="text-gray-400">&gt;</span>
          </motion.button> */}

          {/* Comptes bancaires utilisateurs */}
          <motion.button
            whileTap={{ scale:0.98 }}
            onClick={()=>onNavigate('admin-bank-accounts' as ScreenType)}
            className="w-full bg-white rounded-lg p-4 shadow flex items-center justify-between hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-500 mr-3"/>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Comptes bancaires utilisateurs</p>
                <p className="text-sm text-gray-500">Audit & validation</p>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </motion.button>

          {/* Settings */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('admin-settings' as ScreenType)}
            className="w-full bg-white rounded-lg p-4 shadow flex items-center justify-between hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-green-500 mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Paramètres système</p>
                <p className="text-sm text-gray-500">Configuration</p>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </motion.button>

          {/* Payment Methods */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('admin-payment-methods' as ScreenType)}
            className="w-full bg-white rounded-lg p-4 shadow flex items-center justify-between hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-yellow-600 mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Méthodes de paiement</p>
                <p className="text-sm text-gray-500">Banques (ajout/activation)</p>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </motion.button>
        </div>
      </div>

      {/* Back to App */}
      <div className="p-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('home')}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
        >
          Retour à l'application
        </motion.button>
      </div>
    </div>
  );
};

export default AdminDashboard;

