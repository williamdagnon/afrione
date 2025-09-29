import React, { useState } from 'react';
import { Copy, Users, Gift } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import { ScreenType } from '../App';

interface TeamScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const TeamScreen: React.FC<TeamScreenProps> = ({ onNavigate }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const invitationCode = 'QAVYLD';
  const invitationLink = 'https://omni-vraa.com/reg?code=QA';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const teamLevels = [
    {
      level: 'LV1',
      commission: '25%',
      users: 0,
      rewards: 0
    },
    {
      level: 'LV2',
      commission: '3%',
      users: 0,
      rewards: 0
    },
    {
      level: 'LV3',
      commission: '2%',
      users: 0,
      rewards: 0
    }
  ];

  return (
    <div className="min-h-screen font-serif flex flex-col bg-gradient-to-br from-yellow-800 to-yellow-600">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
        <h1 className="text-lg font-semibold">Créer une équipe</h1>
        <span className="text-sm">Mon équipe &gt;</span>
      </div>

      {/* Invitation Section */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Invitation Code */}
          <div className="bg-yellow-700 rounded-lg p-4 text-center">
            <div className="mb-3">
              <img 
                src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
                alt="VR Setup"
                className="w-full h-20 object-cover rounded-lg"
              />
            </div>
            <p className="text-white font-bold text-lg mb-1">{invitationCode}</p>
            <p className="text-yellow-200 text-xs mb-3">Code d'invitation</p>
            <button 
              onClick={handleCopyCode}
              className="w-full bg-yellow-400 text-white py-2 rounded-full text-xs font-medium hover:bg-yellow-500 transition-colors"
            >
              {copiedCode ? 'Copié!' : 'Copier le code'}
            </button>
          </div>

          {/* Invitation Link */}
          <div className="bg-yellow-700 rounded-lg p-4 text-center">
            <div className="mb-3">
              <img 
                src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
                alt="VR Headset"
                className="w-full h-20 object-cover rounded-lg"
              />
            </div>
            <p className="text-white text-xs mb-1 break-all">{invitationLink}</p>
            <p className="text-yellow-200 text-xs mb-3">Lien d'invitation</p>
            <button 
              onClick={handleCopyLink}
              className="w-full bg-yellow-400 text-white py-2 rounded-full text-xs font-medium hover:bg-yellow-500 transition-colors"
            >
              {copiedLink ? 'Copié!' : 'Copier le lien'}
            </button>
          </div>
        </div>
      </div>

      {/* Team Level Section */}
      <div className="flex-1 bg-white rounded-t-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">NIVEAU D'ÉQUIPE</h2>
          <p className="text-sm text-gray-600">Développez votre équipe et gagnez plus de revenus</p>
        </div>

        <div className="space-y-4 mb-6">
          {teamLevels.map((level, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-medium mr-4">
                    {level.level}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{level.commission}</p>
                    <p className="text-xs text-gray-600">Commission</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">{level.users}</p>
                  <p className="text-xs text-gray-600">Utilisateurs</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">{level.rewards}</p>
                  <p className="text-xs text-gray-600">Récompenses</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <img 
              src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
              alt="Total Users"
              className="w-full h-20 object-cover rounded-lg mb-2"
            />
            <p className="font-bold text-2xl text-gray-800">0</p>
            <p className="text-sm text-gray-600">Total utilisateurs &gt;</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <img 
              src="https://i.postimg.cc/HxQrvdFn/Whats-App-Image-2025-09-25-15-07-14-d79937d2.jpg" 
              alt="Total Rewards"
              className="w-full h-20 object-cover rounded-lg mb-2"
            />
            <p className="font-bold text-2xl text-gray-800">0</p>
            <p className="text-sm text-gray-600">Total récompenses &gt;</p>
          </div>
        </div>

        {/* Bonus Information */}
        <div className="bg-yellow-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
          <p>En invitant un ami à s'inscrire et à investir, vous recevez instantanément un bonus de 30 % de son investissement.</p>
          <p>En investissant avec les membres de votre équipe de niveau 2, vous recevez un bonus de 3 %.</p>
          <p>En investissant avec les membres de votre équipe de niveau 3, vous recevez un bonus de 2 %.</p>
          <p>Une fois votre investissement effectué, le bonus sera immédiatement crédité sur votre compte et disponible pour un retrait immédiat.</p>
        </div>
      </div>

      <BottomNavigation currentScreen="team" onNavigate={onNavigate} />
    </div>
  );
};

export default TeamScreen;