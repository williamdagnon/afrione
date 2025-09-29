import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../App';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface CheckInScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const CheckInScreen: React.FC<CheckInScreenProps> = ({ onNavigate }) => {
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setCheckedIn(true);
    toast.success('Enregistrement réussi ! Vous avez reçu 20 FCFA.');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <button 
          onClick={() => onNavigate('home')}
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
        <span className="ml-4 text-yellow-500 font-medium">Enregistrement</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Bonus Section */}
        <motion.div className="bg-yellow-400 text-white p-4 rounded-t-lg text-center" initial={{ y: -10 }} animate={{ y: 0 }}>
          <h2 className="text-2xl font-bold">FCFA 0</h2>
          <p className="text-sm opacity-90">Bonus accumulé</p>
        </motion.div>

        {/* Daily Reward */}
        <div className="bg-yellow-500 text-white p-6 rounded-b-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <img 
                src="https://images.pexels.com/photos/8721342/pexels-photo-8721342.jpeg?auto=compress&cs=tinysrgb&w=200" 
                alt="VR Gaming"
                className="w-20 h-16 object-cover rounded-lg mb-2"
              />
              <h3 className="font-bold text-lg">Récompense quotidienne</h3>
              <p className="text-sm opacity-90">Obtenez des récompenses chaque jour</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">FCFA 50</p>
            </div>
          </div>
        </div>

        {/* Check-in Days */}
        <div className="bg-yellow-400 text-white p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Jours d'enregistrement</h3>
              <p className="text-sm opacity-90">Total des jours enregistrés</p>
              <p className="text-2xl font-bold mt-2">0 Jours</p>
            </div>
            <div>
              <img 
                src="https://images.pexels.com/photos/8721318/pexels-photo-8721318.jpeg?auto=compress&cs=tinysrgb&w=150" 
                alt="VR Setup"
                className="w-20 h-16 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Check-in Button */}
        <motion.button
          onClick={handleCheckIn}
          disabled={checkedIn}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-full font-medium text-sm mb-6 transition-colors ${
            checkedIn 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-yellow-400 text-white hover:bg-yellow-500'
          }`}
        >
          {checkedIn ? 'Déjà enregistré aujourd\'hui' : 'S\'enregistrer'}
        </motion.button>

        {/* Rules */}
        <div className="bg-yellow-100 p-4 rounded-lg text-sm text-gray-700 space-y-2">
          <p><strong>1.</strong> Recevez un cadeau d'une valeur de 50 FCFA par jour.</p>
          <p><strong>2.</strong> Connectez-vous une fois par jour.</p>
          <p><strong>3.</strong> Connectez-vous à nouveau après minuit chaque jour.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckInScreen;