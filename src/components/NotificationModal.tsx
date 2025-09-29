import React from 'react';
import { X, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationModalProps {
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center font-serif justify-center p-4 z-50">
      <motion.div initial={{ y: 10, scale: 0.995 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white hover:bg-yellow-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
  <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Message</h3>
            <p className="text-sm text-gray-600">Notification</p>
          </div>
        </div>

        {/* Content */}
        <div className="text-sm text-gray-700 leading-relaxed mb-4">
          <p className="mb-3">
            Nous sommes passionnés par les jeux, la technologie et la création du futur du divertissement immersif. 
            Depuis 2013, Futuristia repousse sans cesse les limites du jeu en réalité virtuelle, offrant des expériences 
            innovantes aux utilisateurs du monde entier.
          </p>
          
          <div className="space-y-2">
            <p><span className="font-medium">1.</span> Bonus d'inscription : 300 FCFA.</p>
            <p><span className="font-medium">2.</span> Bonus de connexion quotidien : 50 FCFA.</p>
            <p><span className="font-medium">3.</span> Invitez vos amis, familles et alliés à investir et recevez un bonus en espèces allant jusqu'à 35 % de leur investissement.</p>
            <p><span className="font-medium">4.</span> Les retraits sont illimités et peuvent être effectués plusieurs fois à tout moment.</p>
            <p><span className="font-medium">5.</span> Futuristia sera lancé en Côte d'Ivoire, au Burkina Faso, au Cameroun, au Togo et au Bénin le 22 septembre.</p>
            <p><span className="font-medium">6.</span> Rejoignez notre groupe Telegram pour plus d'informations sur les gains.</p>
          </div>
        </div>

        {/* Telegram Link */}
        <div className="flex items-center justify-center">
          <motion.button whileTap={{ scale: 0.98 }} className="flex items-center text-blue-500 text-sm hover:underline">
            <div className="w-6 h-6 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
              <span className="text-white text-xs">T</span>
            </div>
            Cliquez pour accéder au canal Telegram officiel &gt;
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationModal;