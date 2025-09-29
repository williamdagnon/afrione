import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { ScreenType } from '../App';

interface BankAccountsScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const BankAccountsScreen: React.FC<BankAccountsScreenProps> = ({ onNavigate }) => {
  return (
    <div className="font-serif min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <button 
          onClick={() => onNavigate('profile')}
          className="mr-4"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-yellow-500 font-semibold">Futuristia</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">Liste des comptes bancaires</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-yellow-400 rounded-t-lg p-4">
          <button 
            onClick={() => onNavigate('link-bank-card')}
            className="w-full bg-yellow-500 text-white py-3 rounded-full font-medium text-sm hover:bg-yellow-600 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </button>
        </div>
        
        <div className="bg-yellow-100 rounded-b-lg p-8 text-center">
          <p className="text-gray-600">Aucun compte bancaire ajouté</p>
          <p className="text-sm text-gray-500 mt-2">Cliquez sur "Ajouter" pour lier votre première carte bancaire</p>
        </div>
      </div>
    </div>
  );
};

export default BankAccountsScreen;