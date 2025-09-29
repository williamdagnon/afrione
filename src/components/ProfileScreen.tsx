import React from 'react';
import { 
  User, 
  CreditCard, 
  Calendar, 
  Info, 
  FileDigit, 
  Settings, 
  Headphones, 
  Download,
  Link,
  Gift,
  Lock
} from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import { ScreenType } from '../App';
import { motion } from 'framer-motion';

interface ProfileScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  userBalance: number;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onLogout, userBalance }) => {
  const menuItems = [
    {
      icon: Info,
      title: 'À propos de nous',
      color: 'text-blue-500',
      action: () => onNavigate('about')
    },
    {
      icon: FileDigit,
      title: 'Règlement',
      color: 'text-yellow-500',
      action: () => onNavigate('rules')
    },
    {
      icon: Settings,
      title: 'Enregistrements',
      color: 'text-yellow-500',
      action: () => onNavigate('balance-details')
    },
    {
      icon: Headphones,
      title: 'Service Client',
      color: 'text-yellow-500',
      action: () => onNavigate('customer-service')
    },
    
    {
      icon: Link,
      title: 'Lier carte bancaire',
      color: 'text-yellow-500',
      action: () => onNavigate('bank-accounts')
    },

    {
      icon: Gift,
      title: 'Échanger Cadeau',
      color: 'text-yellow-500',
      action: () => alert('Échange de cadeau')
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen font-serif flex flex-col bg-gray-50">
      {/* Profile Header */}
      <div className="bg-yellow-400 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold">+225 13739186</p>
              <div className="flex items-center mt-1">
                <span className="bg-white text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                  LV1
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="bg-yellow-500 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">FCFA {userBalance}</p>
              <p className="text-sm opacity-90">Solde</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => onNavigate('recharge')}
                className="bg-white bg-opacity-20 p-2 rounded-lg"
              >
                <CreditCard className="w-5 h-5" />
                <p className="text-xs mt-1">Recharger</p>
              </button>
              <button 
                onClick={() => onNavigate('withdraw')}
                className="bg-white bg-opacity-20 p-2 rounded-lg"
              >
                <Download className="w-5 h-5" />
                <p className="text-xs mt-1">Retirer</p>
              </button>
              <button 
                onClick={() => onNavigate('balance-details')}
                className="bg-white bg-opacity-20 p-2 rounded-lg"
              >
                <Calendar className="w-5 h-5" />
                <p className="text-xs mt-1">Enreg.</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Center */}
      <div className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
              alt="Futuristia"
              className="w-16 h-12 object-cover rounded-lg mr-4"
            />
            <div>
              <h3 className="font-semibold text-gray-800">Centre de Tâches</h3>
              <p className="text-sm text-gray-600">Complétez les tâches et obtenez des bonus généreux</p>
            </div>
          </div>
          <button 
            onClick={() => alert('Centre de tâches')}
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm"
          >
            ALLER maintenant &gt;
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={item.action}
              className="w-full flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              whileTap={{ scale: 0.995 }}
            >
              <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="flex-1 text-left text-gray-800">{item.title}</span>
              <span className="text-gray-400">&gt;</span>
            </motion.button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-4">
          <button
            onClick={onLogout}
            className="w-full bg-yellow-400 text-white py-3 rounded-full font-medium text-sm hover:bg-yellow-500 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <BottomNavigation currentScreen="profile" onNavigate={onNavigate} />
    </motion.div>
  );
};

export default ProfileScreen;