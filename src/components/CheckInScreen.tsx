import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../App';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api'; // <-- pour accès API

interface CheckInScreenProps {
  onNavigate: (screen: ScreenType) => void;
  userBalance: number;
  onCheckIn: () => Promise<boolean>;
}

const CheckInScreen: React.FC<CheckInScreenProps> = ({ onNavigate, userBalance, onCheckIn }) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [bonus, setBonus] = useState(0);
  const [days, setDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    fetchCheckinStatus();
  }, []);

  const fetchCheckinStatus = async () => {
    setLoading(true);
    try {
      const result = await api.getCheckInStatus();
      if (result.success && result.data) {
        setBonus(result.data.total_bonus || 0);
        setDays(result.data.consecutive_days || 0);
        setCheckedIn(result.data.checked_in_today);
      }
    } catch (e) {
      setBonus(0); setDays(0); setCheckedIn(false);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    const success = await onCheckIn();
    if (success) {
      toast.success('Enregistrement réussi ! Bonus crédité.');
      await fetchCheckinStatus();
    }
    setIsCheckingIn(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif min-h-screen bg-white">
      <div className="flex items-center p-4 border-b border-gray-200">
        <button onClick={() => onNavigate('home')} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">
              <img src="https://i.postimg.cc/x1q7GZ8s/photo-5767022527770201183-y.jpg" alt="afrione" className='h-full w-full rounded-2xl'/>
            </span>
          </div>
          <span className="text-yellow-500 font-semibold">AFRIONE</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">Enregistrement</span>
      </div>
      <div className="p-4">
        <motion.div className="bg-yellow-400 text-white p-4 rounded-t-lg text-center" initial={{ y: -10 }} animate={{ y: 0 }}>
          <h2 className="text-2xl font-bold">FCFA {bonus}</h2>
          <p className="text-sm opacity-90">Bonus accumulé</p>
        </motion.div>
        <div className="bg-yellow-500 text-white p-6 rounded-b-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <img src="https://i.postimg.cc/x1q7GZ8s/photo-5767022527770201183-y.jpg" alt="VR Gaming" className="w-20 h-16 object-cover rounded-lg mb-2"/>
              <h3 className="font-bold text-lg">Récompense quotidienne</h3>
              <p className="text-sm opacity-90">Obtenez des récompenses chaque jour</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">FCFA 50</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-400 text-white p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Jours d'enregistrement</h3>
              <p className="text-sm opacity-90">Total des jours enregistrés</p>
              <p className="text-2xl font-bold mt-2">{days} Jours</p>
            </div>
            <div>
              <img src="https://i.postimg.cc/x1q7GZ8s/photo-5767022527770201183-y.jpg" alt="VR Setup" className="w-20 h-16 object-cover rounded-lg"/>
            </div>
          </div>
        </div>
        <motion.button
          onClick={handleCheckIn}
          disabled={checkedIn || isCheckingIn || loading}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-full font-medium text-sm mb-6 transition-colors ${
            (checkedIn || loading) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-400 text-white hover:bg-yellow-500'
          }`}
        >
          {loading ? 'Chargement...' : isCheckingIn ? 'Traitement...' : (checkedIn ? 'Déjà enregistré aujourd\'hui' : 'S\'enregistrer')}
        </motion.button>
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
