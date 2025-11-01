import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../App';
import api from '../services/api';

interface BalanceDetailsScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const BalanceDetailsScreen: React.FC<BalanceDetailsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'withdrawal'>('revenue');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); },[]);
  const load = async()=>{
    setLoading(true);
    try { const r = await api.getTransactions(100,0); if(r.success&&r.data) setTransactions(r.data); }
    finally { setLoading(false); }
  };

  const revenueTx = transactions.filter(t=>['deposit','reward','commission','daily_revenue','signup_bonus','bonus'].includes(t.type));
  const withdrawalTx = transactions.filter(t=>t.type==='withdrawal');

  const renderList = (items:any[]) => (
    items.length===0 ? (<div className="text-center py-8 text-gray-500">Aucune donnée</div>) : (
      <div className="space-y-2">
        {items.map((t:any)=> (
          <div key={t.id} className="bg-white rounded-lg p-4 shadow-sm flex justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{t.description || t.type}</h3>
              <p className="text-sm text-gray-500">{new Date(t.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <div className={`${t.type==='withdrawal' ? 'text-red-500':'text-green-600'} font-bold`}>
              {t.type==='withdrawal' ? '-' : '+'} FCFA {Number(t.amount).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="font-serif min-h-screen bg-white">
      <div className="flex items-center p-4 border-b border-gray-200">
        <button onClick={() => onNavigate('profile')} className="mr-4"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3"><span className="text-white font-bold text-sm">A</span></div>
          <span className="text-yellow-500 font-semibold">AFRIONE</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">Détails du solde</span>
      </div>

      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('revenue')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab==='revenue'?'text-yellow-500 border-b-2 border-yellow-500':'text-gray-500'}`}>Relevés de revenus</button>
        <button onClick={() => setActiveTab('withdrawal')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab==='withdrawal'?'text-yellow-500 border-b-2 border-yellow-500':'text-gray-500'}`}>Relevés de retrait</button>
      </div>

      <div className="flex-1 bg-yellow-100 p-4">
        {loading ? (<div className="text-center py-8 text-gray-500">Chargement...</div>) : (
          activeTab==='revenue' ? renderList(revenueTx) : renderList(withdrawalTx)
        )}
      </div>
    </div>
  );
};

export default BalanceDetailsScreen;