import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ScreenType } from '../App';
import api from '../services/api';

interface BalanceDetailsScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const BalanceDetailsScreen: React.FC<BalanceDetailsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'withdrawal' | 'deposit'>('revenue');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); },[]);
  const load = async()=>{
    setLoading(true);
    try {
      // Charger les transactions (revenus)
      const txRes = await api.getTransactions(100,0);
      if(txRes.success&&txRes.data) {
        console.log('Transactions chargées:', txRes.data.length);
        setTransactions(txRes.data);
      }
      
      // Charger les retraits depuis withdrawal_requests
      const wRes = await api.getMyWithdrawals();
      if(wRes.success&&wRes.data) {
        console.log('Retraits chargés:', wRes.data.length);
        setWithdrawals(wRes.data);
      } else {
        console.error('Erreur retraits:', wRes);
      }
      
      // Charger les dépôts depuis manual_deposits
      const dRes = await api.getMyManualDeposits();
      if(dRes.success&&dRes.data) {
        console.log('Dépôts chargés:', dRes.data.length);
        setDeposits(dRes.data);
      } else {
        console.error('Erreur dépôts:', dRes);
      }
    }
    finally { setLoading(false); }
  };

  const revenueTx = transactions.filter(t=>['reward','commission','daily_revenue','signup_bonus','bonus'].includes(t.type));
  const withdrawalTx = withdrawals;
  const depositTx = deposits;

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (item: any) => {
    const status = item.status;
    if (status === 'approved' || status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-blue-500" />;
    } else if (status === 'rejected') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else if (status === 'pending') {
      return <Clock className="w-5 h-5 text-orange-500" />;
    }
    return null;
  };

  const renderList = (items:any[], type:'revenue'|'withdrawal'|'deposit') => (
    items.length===0 ? (<div className="text-center py-8 text-gray-500">Aucune donnée</div>) : (
      <div className="space-y-3">
        {items.map((t:any)=> {
          // Pour les revenus (transactions)
          if(type === 'revenue') {
            return (
              <div key={t.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{t.description || t.type}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-green-600 font-bold text-right text-lg">+ {Number(t.amount).toLocaleString()}</div>
                    {getStatusIcon(t)}
                  </div>
                </div>
                
                {/* Statut pour revenus */}
                {t.status && (
                  <div className="mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.status === 'approved' || t.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {t.status === 'approved' || t.status === 'completed' ? '✓ Complété' :
                       t.status === 'rejected' ? '✗ Rejeté' : '⏱ En attente'}
                    </span>
                  </div>
                )}
              </div>
            );
          }
          
          // Pour les retraits (withdrawal_requests)
          if(type === 'withdrawal') {
            return (
              <div key={t.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Retrait</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-red-500 font-bold text-right text-lg">- {Number(t.amount).toLocaleString()}</div>
                    {getStatusIcon(t)}
                  </div>
                </div>
                
                {/* Statut */}
                {t.status && (
                  <div className="mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.status === 'approved' || t.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {t.status === 'approved' || t.status === 'completed' ? '✓ Approuvé' :
                       t.status === 'rejected' ? '✗ Rejeté' : '⏱ En attente'}
                    </span>
                  </div>
                )}
                
                {/* Détails */}
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 mt-2">
                  {t.fee && <div>Frais: {t.fee.toLocaleString()} FCFA</div>}
                  {t.net_amount && <div className="font-semibold text-green-600">Montant net: {t.net_amount.toLocaleString()} FCFA</div>}
                  {t.bank_name && <div className="mt-1">Banque: {t.bank_name}</div>}
                  {t.rejection_reason && <div className="mt-1 text-red-600">Raison: {t.rejection_reason}</div>}
                </div>
              </div>
            );
          }
          
          // Pour les dépôts (manual_deposits)
          if(type === 'deposit') {
            return (
              <div key={t.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Dépôt</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-green-600 font-bold text-right text-lg">+ {Number(t.amount).toLocaleString()}</div>
                    {getStatusIcon(t)}
                  </div>
                </div>
                
                {/* Statut */}
                {t.status && (
                  <div className="mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.status === 'approved' || t.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {t.status === 'approved' || t.status === 'completed' ? '✓ Approuvé' :
                       t.status === 'rejected' ? '✗ Rejeté' : '⏱ En attente'}
                    </span>
                  </div>
                )}
                
                {/* Détails */}
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 mt-2">
                  {t.bank_name && <div>Méthode: {t.bank_name}</div>}
                  {t.deposit_number && <div>N° dépôt: {t.deposit_number}</div>}
                  {t.rejection_reason && <div className="mt-1 text-red-600">Raison: {t.rejection_reason}</div>}
                </div>
              </div>
            );
          }
        })}
      </div>
    )
  );

  return (
    <div className="font-serif min-h-screen bg-white">
      <div className="flex items-center p-4 border-b border-gray-200">
        <button onClick={() => onNavigate('profile')} className="mr-4"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3"><span className="text-white font-bold text-sm">R</span></div>
          <span className="text-yellow-500 font-semibold">REDMY</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">Détails du solde</span>
      </div>

      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('revenue')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab==='revenue'?'text-yellow-500 border-b-2 border-yellow-500':'text-gray-500'}`}>Revenus</button>
        <button onClick={() => setActiveTab('deposit')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab==='deposit'?'text-yellow-500 border-b-2 border-yellow-500':'text-gray-500'}`}>Dépôts</button>
        <button onClick={() => setActiveTab('withdrawal')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab==='withdrawal'?'text-yellow-500 border-b-2 border-yellow-500':'text-gray-500'}`}>Retraits</button>
      </div>

      <div className="flex-1 bg-yellow-100 p-4">
        {loading ? (<div className="text-center py-8 text-gray-500">Chargement...</div>) : (
          activeTab==='revenue' ? renderList(revenueTx, 'revenue') : 
          activeTab==='deposit' ? renderList(depositTx, 'deposit') :
          renderList(withdrawalTx, 'withdrawal')
        )}
      </div>
    </div>
  );
};

export default BalanceDetailsScreen;
