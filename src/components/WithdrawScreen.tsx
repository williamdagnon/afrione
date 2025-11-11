import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { ScreenType } from '../App';
import { toast } from 'react-hot-toast';
import api from '../services/api';

interface WithdrawScreenProps {
  onNavigate: (screen: ScreenType) => void;
  userBalance: number;
  onWithdraw: (amount: number, bankAccountId: number) => Promise<boolean>;
}

const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ onNavigate, userBalance, onWithdraw }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCard, setSelectedCard] = useState('default');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalsToday, setWithdrawalsToday] = useState(0);
  const MAX_DAILY_WITHDRAWALS = 2;
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    api.getBankAccounts().then(res => {
      setLoadingBanks(false);
      if (res.success && res.data) {
        const valid = res.data.filter(a => a.status === 'active' && a.is_verified);
        setBankAccounts(valid);
        if (valid.length === 1) setSelectedBankId(valid[0].id);
        // Fix : si aucun compte, selectedBankId reste null
      }
    });
    // Récupère le nombre de retraits aujourd'hui pour ce user
    // api.getWithdrawalRequests().then(res => {
    //   if (res.success && res.data) {
    //     const count = res.data.filter(w => {
    //       const d = new Date(w.created_at);
    //       const today = new Date();
    //       return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    //         && ["pending", "approved"].includes(w.status);
    //     }).length;
    //     setWithdrawalsToday(count);
    //   }
    // });
  }, []);

  const handleSubmit = async () => {
    if (bankAccounts.length === 0 || !selectedBankId) {
      toast.error("Aucun compte bancaire vérifié. Ajoutez et faites valider un compte avant de retirer.");
      return;
    }
    if (withdrawalsToday >= MAX_DAILY_WITHDRAWALS) {
      toast.error('Vous avez atteint la limite de 2 retraits aujourd\'hui.');
      return;
    }
    if (!withdrawAmount) {
      toast.error('Veuillez saisir un montant');
      return;
    }
    
    const amount = parseInt(withdrawAmount.replace(/[^\d]/g, ''));
    if (amount < 1000) {
      toast.error('Le montant minimum de retrait est de 1 000 FCFA');
      return;
    }
    
    if (amount > userBalance) {
      toast.error('Solde insuffisant');
      return;
    }

    setIsProcessing(true);
    try {
      const success = await onWithdraw(amount, selectedBankId!);
      if (success) {
        toast.success(`Demande de retrait de ${amount.toLocaleString()} FCFA soumise avec succès !`);
        setTimeout(() => {
          onNavigate('home');
        }, 1500);
      } else {
        // patch : il se peut qu\'on soit rejeté côté backend
        setWithdrawalsToday(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="font-serif min-h-screen bg-yellow-400">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button 
          onClick={() => onNavigate('home')}
          className="text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Retrait</h1>
        <div className="w-6 h-6"></div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-3xl p-6 min-h-screen">
        {/* Current Balance */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm mb-2">Solde actuel</p>
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-yellow-600 font-bold text-sm">
                <img 
                src="https://i.postimg.cc/RFQBphny/photo-5807811900899789803-y.jpg" 
                alt="REDMY"
                className='h-full w-full rounded-2xl' 
                />
              </span>
            </div>
            <span className="text-3xl font-bold text-gray-800">FCFA {userBalance}</span>
          </div>
        </div>

        {/* Bank Card Selection */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-3">Sélectionnez la carte ou compte bancaire vérifié</p>
          {loadingBanks ? (
            <div className="text-center text-gray-400">Chargement des comptes...</div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-red-500 text-sm font-semibold mb-2">
              Aucun compte bancaire vérifié. <button onClick={()=>onNavigate('bank-accounts')} className="underline">Lier une carte</button>
            </div>
          ) : (
            <select 
              value={selectedBankId || ''}
              onChange={e=>setSelectedBankId(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg mb-2"
            >
              <option value="">-- Choisissez un compte --</option>
              {bankAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.bank_name} - {acc.account_number} ({acc.account_holder})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Withdrawal Amount */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-3">Montant du retrait</p>
          <div className="relative">
            <input
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Veuillez saisir le montant du retrait"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-yellow-500"
            />
            <span className="absolute left-3 top-3 text-yellow-500 font-medium">FCFA</span>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Montant reçu : FCFA {withdrawAmount ? Math.floor(parseInt(withdrawAmount.replace(/[^\d]/g, '')) * 0.85).toLocaleString() : 0}</span>
            <span>Taux de frais : 15%</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleSubmit}
          disabled={isProcessing || withdrawalsToday >= MAX_DAILY_WITHDRAWALS || bankAccounts.length === 0 || !selectedBankId}
          className="w-full bg-yellow-400 text-white py-3 rounded-full font-medium text-sm hover:bg-yellow-500 transition-colors mb-6 disabled:opacity-50"
        >
          {isProcessing ? 'Traitement...' : withdrawalsToday >= MAX_DAILY_WITHDRAWALS ? 'Limite atteinte' : 'Confirmer'}
        </button>

        {/* Terms */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>1. Le montant minimum de retrait est de 1 000 FCFA.</p>
          <p>2. Les frais de retrait s'élèvent à 15 % du montant retiré.</p>
          <p>3. Il n'y a pas de limite de temps pour les retraits ; vous pouvez effectuer plusieurs retraits à tout moment.</p>
          <p>4. Les retraits sont généralement crédités sous 4 heures et au plus tard sous 24 heures.</p>
          <p>5. Vous devez posséder au moins un appareil pour activer la fonction de retrait.</p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawScreen;
