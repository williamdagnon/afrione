import React from 'react';
import { ScreenType } from '../App';
import { motion } from 'framer-motion';

interface BottomNavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentScreen, onNavigate }) => {
  return (
    <div className="bg-black p-4">
      <div className="flex justify-around">
        <motion.button 
          onClick={() => onNavigate('home')}
          className={`px-2 py-2 bg-white rounded-full flex flex-col items-center text-sm font-medium transition-colors ${
            currentScreen === 'home' 
              ? 'bg-yellow-600 text-black' 
              : 'text-white hover:bg-yellow-500'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <img src="https://i.postimg.cc/2jX24Rhh/home-1.png" alt="home" className='w-8 h-8' />
          
        </motion.button>
        <motion.button 
          onClick={() => onNavigate('product')}
          className={`px-2 py-2 bg-white rounded-full text-sm font-medium transition-colors ${
            currentScreen === 'product' 
              ? 'bg-yellow-600 text-black' 
              : 'text-white hover:bg-yellow-600'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <img src="https://i.postimg.cc/qMNh5SGV/order.png" alt="products" className='w-8 h-8'/>

        </motion.button>
        <motion.button 
          onClick={() => onNavigate('team')}
          className={`px-2 py-2 bg-white rounded-full text-sm font-medium transition-colors ${
            currentScreen === 'team' 
              ? 'bg-yellow-600 text-black' 
              : 'text-white hover:bg-yellow-600'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <img src="https://i.postimg.cc/sXsdBMcM/group.png" alt="team" className='w-8 h-8'/>
        </motion.button>
        <motion.button 
          onClick={() => onNavigate('profile')}
          className={`px-2 py-2 bg-white rounded-full text-sm font-medium transition-colors ${
            currentScreen === 'profile' 
              ? 'bg-yellow-600 text-black' 
              : 'text-white hover:bg-yellow-600'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <img src="https://i.postimg.cc/x8FLJbKN/profile-user.png" alt="profile" className='w-8 h-8'/>
        </motion.button>
      </div>
    </div>
  );
};

export default BottomNavigation;