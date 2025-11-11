import React from 'react';
import { ArrowLeft, Bot, Send } from 'lucide-react';
import { ScreenType } from '../App';

interface CustomerServiceScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const CustomerServiceScreen: React.FC<CustomerServiceScreenProps> = ({ onNavigate }) => {
  return (
    <div className="font-serif min-h-screen bg-white">
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
            <img src="https://i.postimg.cc/YS4QxJ5x/photo-5764898979974941903-y.jpg" alt="afrione" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-yellow-500 font-semibold">REDMY</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">Service Client</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-yellow-400 text-white p-4 rounded-lg text-center mb-6">
          <h2 className="text-lg font-semibold mb-2">Service client</h2>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-gray-600 mb-2">Heures d'ouverture</p>
          <p className="text-2xl font-bold text-gray-800 mb-6">10:00 AM-7:00 PM - UTC</p>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center mr-3">
                {/* <span className="text-white font-bold text-sm">T</span> */}
                <Send className="w-8 h-8 text-blue-500 text-center" />
              </div>
            
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.open('https://t.me/Afrioneservice', '_blank')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">@Service  Client</span>
                <span className="text-gray-400">&gt;</span>
              </button>
              
              <button 
                onClick={() => window.open('https://t.me/+Px8RNkpxMmc3NzI0', '_blank')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">@Groupe officiel Telegram</span>
                <span className="text-gray-400">&gt;</span>
              </button>
              
              <button 
                onClick={() => alert('Redirection vers @Chaîne officielle Telegram')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">@Chaîne officielle Telegram</span>
                <span className="text-gray-400">&gt;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceScreen;
