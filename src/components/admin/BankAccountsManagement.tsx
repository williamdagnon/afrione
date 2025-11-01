import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ArrowLeft, CheckCircle, Slash, XCircle } from 'lucide-react';
import { ScreenType } from '../../App';
import toast from 'react-hot-toast';

interface BankAccountsManagementProps {
  onNavigate: (screen: ScreenType) => void;
}

const BankAccountsManagement: React.FC<BankAccountsManagementProps> = ({ onNavigate }) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number|null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const res = await api.getAllBankAccountsAdmin();
    if(res.success && res.data) setAccounts(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleVerify = async (id: number) => {
    if (!window.confirm('Valider et activer ce compte ?')) return;
    setProcessingId(id);
    try {
      const res = await api.verifyBankAccountAdmin(id);
      if(res.success) {
        toast.success('Compte validé');
        fetchAll();
      } else toast.error(res.message);
    } catch(e:any){
      toast.error(e?.message||'Erreur validation.');
    }
    setProcessingId(null);
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Motif du rejet :');
    if (!reason) return;
    setProcessingId(id);
    try {
      const res = await api.rejectBankAccountAdmin(id, reason);
      if(res.success) {
        toast.success('Compte rejeté');
        fetchAll();
      } else toast.error(res.message);
    } catch(e:any){
      toast.error(e?.message||'Erreur rejet.');
    }
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-serif">
      {/* Header */}
      <div className="bg-yellow-500 text-white p-4 flex items-center">
        <button onClick={() => onNavigate('admin-dashboard' as ScreenType)} className="mr-3">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Comptes bancaires utilisateurs</h1>
          <p className="text-yellow-100 text-sm">Validation, audit et gestion globale</p>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 space-y-3 pb-24">
        {loading ? (<div className="py-8 text-gray-500 text-center">Chargement...</div>) :
        accounts.length === 0 ? (<div className="py-8 text-gray-400 text-center">Aucun compte bancaire utilisateur</div>) :
        accounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-lg shadow p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-800">{acc.bank_name} <span className="text-sm text-gray-500 font-light">({acc.account_number})</span></div>
                <div className="text-sm text-gray-600">{acc.account_holder}</div>
                <div className="text-xs text-gray-400">Crée le {new Date(acc.created_at).toLocaleDateString()}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                acc.status==='active'? 'bg-green-100 text-green-600'
                : acc.status==='rejected' ? 'bg-red-100 text-red-600'
                : acc.status==='pending' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>{
                acc.status==='active' ? 'Validé' : acc.status==='pending' ? 'En attente' : 'Rejeté'
              }</div>
            </div>
            <div className="flex items-center mt-2 gap-3">
              <div className="text-xs text-gray-700 bg-gray-50 rounded p-1.5">User: <b>{acc.display_name}</b> {acc.phone}</div>
              {acc.verification_note && <div className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded">Note: {acc.verification_note}</div>}
            </div>
            <div className="flex gap-2 mt-3">
              {acc.status==='pending' && (
                <>
                  <button onClick={()=>handleVerify(acc.id)} disabled={processingId===acc.id}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2"/>{processingId===acc.id?'Traitement...':'Valider'}
                  </button>
                  <button onClick={()=>handleReject(acc.id)} disabled={processingId===acc.id}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center">
                    <Slash className="w-4 h-4 mr-2"/>Rejeter
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankAccountsManagement;
