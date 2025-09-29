import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../App';

interface BalanceDetailsScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const BalanceDetailsScreen: React.FC<BalanceDetailsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'withdrawal'>('revenue');

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
        <span className="ml-4 text-yellow-500 font-medium">Détails du solde</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'revenue'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-500'
          }`}
        >
          Relevés de revenus
        </button>
        <button
          onClick={() => setActiveTab('withdrawal')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'withdrawal'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-500'
          }`}
        >
          Relevés de retrait
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-yellow-100 p-4">
        {activeTab === 'revenue' && (
          <div>
            {/* Revenue Record */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">Récompense d'inscription</h3>
                  <p className="text-sm text-gray-500">09/24/2025 12:09:42</p>
                </div>
                <div className="text-yellow-500 font-bold">+FCFA 200</div>
              </div>
            </div>

            {/* No more data message */}
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune donnée supplémentaire</p>
            </div>
          </div>
        )}

        {activeTab === 'withdrawal' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-yellow-500 text-white px-6 py-3 rounded-full mb-4 inline-block">
                Chargement...
              </div>
              <p className="text-gray-500">Chargement des données de retrait</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceDetailsScreen;