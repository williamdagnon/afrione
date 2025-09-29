import React, { useState } from 'react';
import { ArrowLeft, X, Check } from 'lucide-react';
import { ScreenType } from '../App';

interface RechargeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const RechargeScreen: React.FC<RechargeScreenProps> = ({ onNavigate }) => {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('cameroun');

  const predefinedAmounts = ['2,000', '6,000', '15,000', '45,000'];
  const banks = [
    { id: 'cameroun', name: 'Banque du Cameroun', selected: true },
    { id: 'togo', name: 'Banque du Togo', selected: false },
    { id: 'benin', name: 'Banque du Bénin', selected: false },
    { id: 'burkina', name: 'Banque du Burkina Faso', selected: false }
  ];

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount('');
  };

  const handleSubmit = () => {
    const amount = selectedAmount || customAmount;
    if (!amount) {
      alert('Veuillez sélectionner ou saisir un montant');
      return;
    }
    alert(`Recharge de ${amount} FCFA initiée avec ${banks.find(b => b.id === selectedBank)?.name}`);
  };

  return (
    <div className=" font-serif min-h-screen bg-gray-100">
      {/* Header with VR Image */}
      <div className="relative">
        <img 
          src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
          alt="Futuristia"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <button 
              onClick={() => onNavigate('home')}
              className="absolute top-4 left-4 text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button className="absolute top-4 right-4 text-white">
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Arrivée rapide</h1>
          </div>
        </div>
      </div>

      {/* Recharge Form */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Sélectionner le montant de recharge</h2>
        
        {/* Predefined Amounts */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {predefinedAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmountSelect(amount)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                selectedAmount === amount
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                  : 'border-gray-200 text-gray-600 hover:border-yellow-300'
              }`}
            >
              {amount}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-2">Entrer un autre montant</p>
          <div className="relative">
            <input
              type="text"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="Entrer le montant"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-yellow-500 pl-12"
            />
            <span className="absolute left-3 top-3 text-yellow-500 font-medium">FCFA</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-3">Méthode de recharge</p>
          <div className="space-y-2">
            {banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => setSelectedBank(bank.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  selectedBank === bank.id
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded mr-3 flex items-center justify-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  </div>
                  <span className="text-gray-700">{bank.name}</span>
                </div>
                {selectedBank === bank.id && (
                  <Check className="w-5 h-5 text-yellow-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-gray-300 text-gray-500 py-3 rounded-full font-medium text-sm mb-4"
          disabled
        >
          Confirmer
        </button>

        {/* Info Text */}
        <div className="text-center mb-4">
          <p className="text-yellow-500 text-sm">
            Si la recharge n'est pas entrée depuis longtemps, veuillez cliquer ici
          </p>
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>1. Le montant minimum du dépôt est de 2 000 FCFA. Les fonds inférieurs à ce montant ne seront pas crédités.</p>
          <p>2. Le montant du virement doit correspondre au montant indiqué dans l'ordre ; sinon, les fonds ne seront pas crédités.</p>
          <p>3. Veuillez créer un nouvel ordre de virement pour chaque paiement et indiquer le compte du bénéficiaire. Ne l'enregistrez pas.</p>
          <p>4. Veuillez patienter 10 à 20 minutes après la réussite du virement. Si vos fonds n'ont pas été crédités pendant une période prolongée, veuillez soumettre votre reçu de virement en haut de la page.</p>
        </div>
      </div>
    </div>
  );
};

export default RechargeScreen;