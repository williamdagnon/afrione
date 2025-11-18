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
import { User as UserType } from '../services/api';

interface ProfileScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  userBalance: number;
  currentUser: UserType | null;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onLogout, userBalance, currentUser }) => {
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
    }

    
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen font-serif flex flex-col bg-gray-50">
      {/* Profile Header */}
      <div className="bg-yellow-400 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate('home')}
            className="mr-2 p-2 rounded-full hover:bg-yellow-800/30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Retour à l'accueil"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold">{currentUser?.phone || 'Utilisateur'}</p>
              <div className="flex items-center mt-1">
                <span className="bg-white text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                  {currentUser?.role === 'admin' ? 'ADMIN' : 'LV1'}
                </span>
              </div>
            </div>
          </div>
          <span className="w-8" />
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
              src="https://i.postimg.cc/HnYCqmQZ/photo-5807811900899789801-y.jpg" 
              alt="AFRIONE"
              className="w-16 h-12 object-cover rounded-lg mr-4"
            />
            <div>
              <h3 className="font-semibold text-gray-800">Centre de Tâches</h3>
              <p className="text-sm text-gray-600">Voir les détails de vos achats ici</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('task-center')}
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

        {/* Admin Panel Button (only for admins) */}
        {currentUser?.role === 'admin' && (
          <div className="mt-4">
            {/* <button
              onClick={() => onNavigate('admin-dashboard' as ScreenType)}
              className="w-full bg-purple-600 text-white py-3 rounded-full font-medium text-sm hover:bg-purple-700 transition-colors"
            >
              🔐 Panel Administrateur
            </button> */}
          </div>
        )}

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
