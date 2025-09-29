import React from 'react';
import { Download, CreditCard, Calendar, List } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNavigation from './BottomNavigation';
import { ScreenType } from '../App';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  userBalance: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, userBalance }) => {
  const games = [
    {
      title: 'AETHER',
      image: 'https://i.postimg.cc/QtPCH1hw/Whats-App-Image-2025-09-25-17-07-18-077a1149.jpg'
    },
    {
      title: 'CAELUM',
      image: 'https://i.postimg.cc/vTVB9TmB/Whats-App-Image-2025-09-25-17-07-18-fd660d07.jpg'
    },
    {
      title: 'UNIVERSUM',
      image: 'https://i.postimg.cc/QtPCH1hw/Whats-App-Image-2025-09-25-17-07-18-077a1149.jpg'
    },
    {
      title: 'SPATIUM',
      image: 'https://i.postimg.cc/vTVB9TmB/Whats-App-Image-2025-09-25-17-07-18-fd660d07.jpg'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen font-serif flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="text-center text-white z-10">
          <div className="mb-4">
            <motion.img 
              src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
              alt="Futuristia" 
              className="w-64 h-40 object-cover rounded-lg mx-auto"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <div className="flex items-center justify-center mb-2">
            <div className="w-1 h-12 bg-yellow-400 mr-4"></div>
            <div>
              <p className="text-sm opacity-80">Vers</p>
              <h1 className="text-2xl font-bold">Un avenir illuminé</h1>
            </div>
            <div className="w-1 h-12 bg-yellow-400 ml-4"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-t-3xl p-6 flex-1">
        {/* VR Products */}
        <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div className="text-center" whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <img 
                src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
                alt="VR Headset" 
                className="w-full h-16 object-cover rounded"
              />
            </div>
            <p className="text-xs font-semibold">FCFA {userBalance}</p>
            <p className="text-xs text-yellow-600">Mon Solde</p>
            </motion.div>
          <motion.div className="text-center" whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <img 
                src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
                alt="VR Headset" 
                className="w-full h-16 object-cover rounded"
              />
            </div>
            <p className="text-xs font-semibold">FCFA {userBalance}</p>
            <p className="text-xs text-yellow-600">Revenus cumulés</p>
          </motion.div>
          <motion.div className="text-center" whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <img 
                src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
                alt="VR Controllers" 
                className="w-full h-16 object-cover rounded"
              />
            </div>
            <p className="text-xs text-yellow-600">Service client &gt;</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <img src="https://i.postimg.cc/RVDD0T64/deposit-4.png" alt="futuristia" className="w-12 h-12 mx-auto text-gray-600" />
            </div>
            <button 
              onClick={() => onNavigate('recharge')}
              className="text-xs text-gray-600 hover:text-yellow-600 transition-colors"
            >
              Recharger
            </button>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <img src="https://i.postimg.cc/HnjFSvcv/cash-withdrawal.png" alt="futuristia" className="w-12 h-12 mx-auto text-gray-600" />
            </div>
            <p className="text-xs text-gray-600">Retirer</p>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <img src="https://i.postimg.cc/J4zjFVhz/calendar.png" alt="futuristia" className="w-12 h-12 mx-auto text-gray-600" />
            </div>
            <button 
              onClick={() => onNavigate('check-in')}
              className="text-xs text-gray-600 hover:text-yellow-600 transition-colors"
            >
              Pointage
            </button>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <img src="https://i.postimg.cc/ZR95NHYZ/checklist.png" alt="futuristia" className="w-12 h-12 mx-auto text-gray-600" />
            </div>
            <p className="text-xs text-gray-600">Centre de Tâches</p>
          </div>
        </div>

        {/* Games Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">La lumière transforme l'ombre en espoir</h3>
          <div className="grid grid-cols-4 gap-3">
            {games.map((game, index) => (
              <div key={index} className="text-center">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-full h-16 object-cover rounded-lg mb-1"
                />
                <p className="text-xs font-medium">{game.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen="home" onNavigate={onNavigate} />
    </motion.div>
  );
};

export default HomeScreen;