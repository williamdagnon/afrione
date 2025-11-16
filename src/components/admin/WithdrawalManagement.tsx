import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { ScreenType } from '../../App';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface WithdrawalManagementProps {
  onNavigate: (screen: ScreenType) => void;
}

interface Withdrawal {
  id: number;
  user_id: number;
  display_name: string;
  phone: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  status: string;
  created_at: string;
  admin_note?: string;
}

const WithdrawalManagement: React.FC<WithdrawalManagementProps> = ({ onNavigate }) => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminWithdrawals(filter === 'pending' ? 'pending' : undefined);
      if (response.success && response.data) {
        setWithdrawals(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement retraits:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Confirmer l\'approbation de ce retrait ?')) return;

    try {
      setProcessing(id);
      const response = await api.approveWithdrawal(id);
      if (response.success) {
        toast.success('Retrait approuvé !');
        loadWithdrawals();
      }
    } catch (error: any) {
      console.error('Erreur approbation:', error);
      toast.error(error.message || 'Erreur lors de l\'approbation');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Raison du rejet :');
    if (!reason) return;

    try {
      setProcessing(id);
      const response = await api.rejectWithdrawal(id, reason);
      if (response.success) {
        toast.success('Retrait rejeté');
        loadWithdrawals();
      }
    } catch (error: any) {
      console.error('Erreur rejet:', error);
      toast.error(error.message || 'Erreur lors du rejet');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-serif">
      {/* Header */}
      <div className="bg-yellow-500 text-white p-4">
        <div className="flex items-center">
          <button onClick={() => onNavigate('admin-dashboard' as ScreenType)} className="mr-3">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Gestion des retraits</h1>
            <p className="text-yellow-100 text-sm">Valider les demandes</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b flex">
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-3 font-medium ${
            filter === 'pending'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-500'
          }`}
        >
          En attente
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-3 font-medium ${
            filter === 'all'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-500'
          }`}
        >
          Tous
        </button>
      </div>

      {/* Withdrawals List */}
      <div className="p-4 space-y-3 pb-20">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun retrait {filter === 'pending' ? 'en attente' : ''}
          </div>
        ) : (
          withdrawals.map((withdrawal) => (
            <motion.div 
              key={withdrawal.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-4 shadow"
            >
              {/* User Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{withdrawal.display_name}</p>
                  <p className="text-sm text-gray-500">{withdrawal.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {withdrawal.status === 'pending' && <Clock className="w-5 h-5 text-orange-500" />}
                  {(withdrawal.status === 'approved' || withdrawal.status === 'completed') && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  {withdrawal.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    withdrawal.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                    (withdrawal.status === 'approved' || withdrawal.status === 'completed') ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {withdrawal.status === 'pending' ? 'En attente' :
                     (withdrawal.status === 'approved' || withdrawal.status === 'completed') ? 'Approuvé' : 'Rejeté'}
                  </div>
                </div>
              </div>

              {/* Amount Info */}
              <div className="bg-gray-50 rounded p-3 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant :</span>
                  <span className="font-bold text-green-600">
                    {withdrawal.amount.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Bank Info */}
              <div className="bg-blue-50 rounded p-3 mb-3">
                <p className="text-sm text-gray-600 mb-1">Compte bancaire :</p>
                <p className="font-semibold text-gray-800">{withdrawal.bank_name}</p>
                <p className="text-sm text-gray-700">{withdrawal.account_holder}</p>
                <p className="text-sm text-gray-600 font-mono">{withdrawal.account_number}</p>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-400 mb-3">
                Demandé le {new Date(withdrawal.created_at).toLocaleString('fr-FR')}
              </p>

              {/* Admin Note */}
              {withdrawal.admin_note && (
                <div className="bg-red-50 rounded p-2 mb-3">
                  <p className="text-xs text-red-600 font-medium">Note admin :</p>
                  <p className="text-sm text-red-700">{withdrawal.admin_note}</p>
                </div>
              )}

              {/* Actions */}
              {withdrawal.status === 'pending' && (
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApprove(withdrawal.id)}
                    disabled={processing === withdrawal.id}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {processing === withdrawal.id ? 'En cours...' : 'Approuver'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReject(withdrawal.id)}
                    disabled={processing === withdrawal.id}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default WithdrawalManagement;
