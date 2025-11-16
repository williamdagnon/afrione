import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../App';
import toast from 'react-hot-toast';
import api from '../services/api';

interface LinkBankCardScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const LinkBankCardScreen: React.FC<LinkBankCardScreenProps> = ({ onNavigate }) => {
  const [selectedBank, setSelectedBank] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoadingMethods(true);
    try {
      const res = await api.getPaymentMethods();
      if (res.success && res.data) {
        setPaymentMethods(res.data);
      }
    } catch (err) {
      console.error('Erreur chargement méthodes de paiement:', err);
      toast.error('Erreur lors du chargement des méthodes de paiement');
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !accountHolder || !accountNumber) {
      toast.error('Tous les champs sont obligatoires');
      return;
    }
    setIsProcessing(true);
    try {
      // Récupérer les détails de la méthode sélectionnée
      const method = paymentMethods.find(m => m.id === parseInt(selectedBank));
      if (!method) {
        toast.error('Méthode de paiement invalide');
        return;
      }

      const res = await api.addBankAccount({
        bank_name: method.bank_name,
        account_holder: accountHolder,
        account_number: accountNumber,
      });
      if (res.success) {
        toast.success('Compte lié avec succès !');
        setSelectedBank('');
        setAccountHolder('');
        setAccountNumber('');
        setTimeout(() => onNavigate('bank-accounts'), 1200);
      } else {
        toast.error(res.message || "Erreur lors de l'ajout du compte bancaire");
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur de liaison.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="font-serif min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <button 
          onClick={() => onNavigate('bank-accounts')}
          className="mr-4"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-yellow-500 font-semibold">REDMY</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">Lier une carte bancaire</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-yellow-400 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bank Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                * Sélectionner une banque
              </label>
              {loadingMethods ? (
                <div className="w-full p-3 rounded-lg bg-white text-gray-600">Chargement des méthodes...</div>
              ) : paymentMethods.length === 0 ? (
                <div className="w-full p-3 rounded-lg bg-white text-gray-600">Aucune méthode de paiement disponible</div>
              ) : (
                <>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 rounded-lg border-0 outline-none text-gray-700"
                    required
                  >
                    <option value="">Veuillez sélectionner</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.bank_name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Display selected method details */}
                  {selectedBank && (
                    <div className="mt-3 p-3 rounded-lg bg-white bg-opacity-90 space-y-2">
                      {(() => {
                        const selected = paymentMethods.find((m) => m.id === parseInt(selectedBank));
                        return selected ? (
                          <>
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Banque: </span>
                              <span className="text-gray-600">{selected.bank_name}</span>
                            </div>
                            {selected.country && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Pays: </span>
                                <span className="text-gray-600">{selected.country}</span>
                              </div>
                            )}
                            {selected.swift_code && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Code SWIFT: </span>
                                <span className="text-gray-600">{selected.swift_code}</span>
                              </div>
                            )}
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                * Nom du titulaire du compte
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Veuillez saisir le nom du titulaire du compte"
                className="w-full p-3 rounded-lg border-0 outline-none text-gray-700 placeholder-gray-400"
                required
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                * Compte bancaire
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Veuillez saisir le numéro de compte bancaire"
                className="w-full p-3 rounded-lg border-0 outline-none text-gray-700 placeholder-gray-400"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-yellow-500 text-white py-3 rounded-full font-medium text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LinkBankCardScreen;
