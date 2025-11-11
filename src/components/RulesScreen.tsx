import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../App';

interface RulesScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const RulesScreen: React.FC<RulesScreenProps> = ({ onNavigate }) => {
  const products = [
    { name: 'REDMY 001', price: 'FCFA 3,000', dailyRevenue: 'FCFA 400', totalRevenue: 'FCFA 48,000', duration: '120 jours' },
    { name: 'REDMY 002', price: 'FCFA 7,000', dailyRevenue: 'FCFA 1,100', totalRevenue: 'FCFA 93,000', duration: '120 jours' },
    { name: 'REDMY 003', price: 'FCFA 25,000', dailyRevenue: 'FCFA 4,000', totalRevenue: 'FCFA 480,000', duration: '120 jours' },
    { name: 'REDMY 003', price: 'FCFA 60,000', dailyRevenue: 'FCFA 9,000', totalRevenue: 'FCFA 1,080,000', duration: '120 jours' },
    { name: 'REDMY 004', price: 'FCFA 150,000', dailyRevenue: 'FCFA 25,000', totalRevenue: 'FCFA 3,000,000,', duration: '120 jours' },
    { name: 'REDMY 005', price: 'FCFA 300,000', dailyRevenue: 'FCFA 45,000', totalRevenue: 'FCFA 5,400,000', duration: '120 jours' },
    { name: 'REDMY 006', price: 'FCFA 650,000', dailyRevenue: 'FCFA 100,000', totalRevenue: 'FCFA 12,000,000', duration: '120 jours' },
    { name: 'REDMY 007', price: 'FCFA 1,000,000', dailyRevenue: 'FCFA 260,000', totalRevenue: 'FCFA 31,200,000', duration: '120 jours' },
  ];

  return (
    <div className=" font-serif min-h-screen bg-white">
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
            <span className="text-white font-bold text-sm">
              <img 
                src="https://i.postimg.cc/YS4QxJ5x/photo-5764898979974941903-y.jpg" 
                alt="afrione"
                className='h-full w-full rounded-2xl' 
                />
            </span>
          </div>
          <span className="text-yellow-500 font-semibold">REDMY</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">Règlement</span>
      </div>

      {/* Products Table */}
      <div className="p-4">
        <div className="bg-yellow-400 text-white p-2 rounded-t-lg">
          <div className="grid grid-cols-5 gap-2 text-xs font-semibold">
            <div>Produit</div>
            <div>Prix</div>
            <div>Revenu quotidien</div>
            <div>Revenu total</div>
            <div>Temps</div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-b-lg">
          {products.map((product, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 p-2 text-xs border-b border-gray-100 last:border-b-0">
              <div className="font-medium">{product.name}</div>
              <div>{product.price}</div>
              <div>{product.dailyRevenue}</div>
              <div>{product.totalRevenue}</div>
              <div>{product.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Content */}
      <div className="p-6 text-gray-700 leading-relaxed">
        <p className="mb-4">
          REDMY est bien plus qu’une entreprise : c’est un mouvement. 
          Notre mission est d’imaginer et de créer un futur où l’impossible devient réalité, 
          où l’humanité peut voyager à travers le temps et l’espace, guidée par la lumière du progrès.
        </p>

        <p className="mb-4">
          En invitant un ami à s'inscrire et à investir, vous recevez instantanément un 
          bonus de 30 % de son investissement.
        </p>

        <p className="mb-4">
          En investissant avec les membres de votre équipe de niveau 2, vous recevez 
          un bonus de 3 %.
        </p>

        <p className="mb-4">
          En investissant avec les membres de votre équipe de niveau 3, vous recevez 
          un bonus de 2 %.
        </p>

        <p className="mb-4">
          Une fois votre investissement effectué, le bonus sera immédiatement crédité 
          sur votre compte et disponible pour un retrait immédiat.
        </p>

        <div className="space-y-2 mb-4">
          <p><strong>1.</strong> Bonus d'inscription : 300 FCFA</p>
          <p><strong>2.</strong> Bonus de connexion quotidien : 50 FCFA</p>
          <p><strong>3.</strong> Invitez vos abonnés à investir et recevez un bonus de 30 % de leur investissement.</p>
          <p><strong>4.</strong> Il n'y a pas de limite de temps pour retirer votre argent</p>
          <p><strong>6.</strong> Rejoignez notre groupe Telegram pour plus d'informations sur les gains.</p>
        </div>
      </div>
    </div>
  );
};

export default RulesScreen;
