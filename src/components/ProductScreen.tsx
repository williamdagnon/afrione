import React, { useState } from 'react';
import BottomNavigation from './BottomNavigation';
import { motion } from 'framer-motion';
import { ScreenType } from '../App';

interface ProductScreenProps {
  onNavigate: (screen: ScreenType) => void;
  userBalance: number;
  onPurchase: (price: number) => boolean;
}

const ProductScreen: React.FC<ProductScreenProps> = ({ onNavigate, userBalance, onPurchase }) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [purchaseError, setPurchaseError] = useState('');

  const products = [
    {
      id: 1,
      name: 'Futuristia 001',
      price: 'FCFA 2,000',
      duration: '60 jours',
      dailyRevenue: 'FCFA 300',
      totalRevenue: 'FCFA 18,000',
      image: 'https://i.postimg.cc/c13kFwvL/WhatsApp_Image_2025-09-24_à_15.31.56_07f62ba4.jpg'
    },
    {
      id: 2,
      name: 'Futuristia 002',
      price: 'FCFA 6,000',
      duration: '60 jours',
      dailyRevenue: 'FCFA 930',
      totalRevenue: 'FCFA 55,800',
      image: 'https://i.postimg.cc/c13kFwvL/WhatsApp_Image_2025-09-24_à_15.31.56_07f62ba4.jpg'
    },
    {
      id: 3,
      name: 'Futuristia 003',
      price: 'FCFA 15,000',
      duration: '60 jours',
      dailyRevenue: 'FCFA 2,400',
      totalRevenue: 'FCFA 144,000',
      image: 'https://i.postimg.cc/c13kFwvL/WhatsApp_Image_2025-09-24_à_15.31.56_07f62ba4.jpg'
    }
  ];

  const handlePurchase = (product: any) => {
    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = () => {
    setPurchaseError('');
    const success = onPurchase(parseInt(selectedProduct.price.replace(/[^\d]/g, '')));
    
    if (success) {
      alert(`Achat de ${selectedProduct.name} réussi !`);
    } else {
      setPurchaseError('Solde insuffisant pour cet achat');
      return;
    }
    
    setShowPurchaseModal(false);
    setSelectedProduct(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen font-serif flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white p-4 text-center border-b">
        <h1 className="text-lg font-semibold text-gray-800">Centre de Produits</h1>
      </div>

      {/* Balance Section */}
      <div className="bg-yellow-400 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-yellow-600 font-bold text-sm">0</span>
            </div>
            <div>
              <p className="text-sm opacity-90">Mes produits &gt;</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">FCFA {userBalance}</p>
            <p className="text-sm opacity-90">Mes revenus &gt;</p>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 p-4 space-y-4">
        {products.map((product) => (
          <motion.div key={product.id} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 200 }} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start space-x-4">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-yellow-600 font-bold text-lg mb-2">{product.price}</p>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Durée :</span>
                    <span>{product.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenus quotidiens :</span>
                    <span>{product.dailyRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenus totaux :</span>
                    <span>{product.totalRevenue}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.button 
              onClick={() => handlePurchase(product)}
              className="w-full bg-yellow-400 text-white py-3 rounded-full font-medium text-sm mt-4 hover:bg-yellow-500 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              ACHETER MAINTENANT
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-32 h-24 object-cover rounded-lg mx-auto mb-4"
              />
              <h3 className="font-semibold text-gray-800 text-lg">{selectedProduct.name}</h3>
              <p className="text-yellow-600 font-bold text-xl">{selectedProduct.price}</p>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-center text-sm text-gray-600 mb-2">
                Revenus réglés toutes les 24h
              </p>
              <p className="text-center text-xs text-gray-500">
                Vous pouvez acheter plusieurs appareils pour augmenter vos revenus
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Durée :</span>
                <span>{selectedProduct.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Revenus quotidiens :</span>
                <span>{selectedProduct.dailyRevenue}</span>
              </div>
              <div className="flex justify-between">
                <span>Revenus totaux :</span>
                <span>{selectedProduct.totalRevenue}</span>
              </div>
            </div>

            {purchaseError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {purchaseError}
              </div>
            )}

            <div className="flex space-x-3">
              <motion.button 
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-medium text-sm hover:bg-gray-300 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                Annuler
              </motion.button>
              <motion.button 
                onClick={handleConfirmPurchase}
                className="flex-1 bg-yellow-400 text-white py-3 rounded-full font-medium text-sm hover:bg-yellow-500 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <BottomNavigation currentScreen="product" onNavigate={onNavigate} />
    </motion.div>
  );
};

export default ProductScreen;