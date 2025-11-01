import React from 'react';
import { X, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationModalProps {
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center font-serif justify-center p-2 sm:p-4 z-50">
      <motion.div initial={{ y: 10, scale: 0.995 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, opacity: 0 }} 
        className="bg-white rounded-2xl p-3 sm:p-6 max-w-[95vw] sm:max-w-sm w-full relative overflow-y-auto max-h-[90vh] shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Fermer la notification"
        >
          <X className="w-5 h-5 sm:w-4 sm:h-4" />
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
  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
          <p className="mb-3">
            Nous sommes passionnés par les jeux, la technologie et la création du futur investissement technologique. 
            Depuis sa création, notre ambition est claire : rendre la technologie mobile accessible à tous, tout en offrant des produits fiables, performants et élégants.
          </p>
          
          <div className="space-y-2">
            <p><span className="font-medium">1.</span> Bonus d'inscription : 300 FCFA.</p>
            <p><span className="font-medium">2.</span> Bonus de connexion quotidien : 50 FCFA.</p>
            <p><span className="font-medium">3.</span> Invitez vos amis, familles et alliés à investir et recevez un bonus en espèces allant jusqu'à 30 % de leur investissement.</p>
            <p><span className="font-medium">4.</span> Les retraits sont illimités et peuvent être effectués plusieurs fois à tout moment.</p>
            <p><span className="font-medium">5.</span> AFRIONE sera lancé en Côte d'Ivoire, au Burkina Faso, au Cameroun, au Togo et au Bénin le 03 Novembre.</p>
            <p><span className="font-medium">6.</span> Rejoignez notre groupe Telegram pour plus d'informations sur les gains.</p>
          </div>
        </div>

        {/* Telegram Link */}
        <div className="flex items-center justify-center mt-2">
          <motion.button whileTap={{ scale: 0.98 }} className="flex items-center text-blue-500 text-xs sm:text-sm hover:underline px-2 py-2 sm:py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
            onClick={() => window.open('https://t.me/+Px8RNkpxMmc3NzI0', '_blank')}>
            <div className="w-7 h-7 sm:w-6 sm:h-6 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
              <span className="text-white text-xs">T</span>
            </div>
            <span className="hidden xs:inline">Cliquez pour accéder au canal Telegram officiel &gt;</span>
            <span className="inline xs:hidden">Canal Telegram &gt;</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationModal;