import React, { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { ScreenType } from '../App';

interface WithdrawScreenProps {
  onNavigate: (screen: ScreenType) => void;
  userBalance: number;
}

const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ onNavigate, userBalance }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');

  const handleSubmit = () => {
    if (!withdrawAmount || !selectedCard) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    const amount = parseInt(withdrawAmount);
    if (amount < 1000) {
      alert('Le montant minimum de retrait est de 1 000 FCFA');
      return;
    }
    
    if (amount > userBalance) {
      alert('Solde insuffisant');
      return;
    }
    
    alert(`Demande de retrait de ${amount} FCFA soumise avec succès !`);
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
              <span className="text-yellow-600 font-bold text-sm">O</span>
            </div>
            <span className="text-3xl font-bold text-gray-800">FCFA {userBalance}</span>
          </div>
        </div>

        {/* Bank Card Selection */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-3">Veuillez sélectionner votre carte bancaire</p>
          <button 
            onClick={() => onNavigate('bank-accounts')}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-yellow-300 transition-colors"
          >
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-400">- - - - - - - - - - - - - - - -</span>
            </div>
            <span className="text-gray-400">&gt;</span>
          </button>
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
            <span>Montant reçu : FCFA 0</span>
            <span>Taux de frais : 15%</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-yellow-400 text-white py-3 rounded-full font-medium text-sm hover:bg-yellow-500 transition-colors mb-6"
        >
          Confirmer
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