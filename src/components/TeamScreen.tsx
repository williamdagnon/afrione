import React, { useState } from 'react';
import { Copy, Users, Gift } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import { ScreenType } from '../App';

interface TeamScreenProps {
  onNavigate: (screen: ScreenType) => void;
  referralInfos: any;
  loadingReferral: boolean;
}

const TeamScreen: React.FC<TeamScreenProps> = ({ onNavigate, referralInfos, loadingReferral }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const invitationCode = referralInfos?.code || '--';
  // Construire le lien de parrainage en privilégiant :
  // 1) le domaine forcé stocké dans localStorage ('referral_domain')
  // 2) le lien renvoyé par l'API (referralInfos.link)
  // 3) la base courante (window.location.origin) + '/register?ref=' + code
  const forcedDomain = typeof window !== 'undefined' ? localStorage.getItem('referral_domain') : null;
  const apiLink = referralInfos?.link || '';
  const baseDomain = forcedDomain || apiLink || (typeof window !== 'undefined' ? window.location.origin : '');
  const invitationLink = apiLink
    ? (forcedDomain ? `${forcedDomain}/register?ref=${invitationCode}` : apiLink)
    : (invitationCode && baseDomain ? `${baseDomain.replace(/\/$/, '')}/register?ref=${invitationCode}` : '');
  const teamLevels = referralInfos?.levels || [];
  const totalUsers = referralInfos?.totalUsers || 0;
  const totalRewards = referralInfos?.totalRewards || 0;

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

  return (
    <div className="min-h-screen font-serif flex flex-col bg-gradient-to-br from-yellow-800 to-yellow-600">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
          <button
            onClick={() => onNavigate('home')}
            className="mr-2 p-2 rounded-full hover:bg-yellow-800/30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Retour à l'accueil"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center md:text-left">Mon équipe & Parrainage</h1>
          <span className="w-8" />
      </div>
      {/* Invitation Section */}
      <div className="px-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-yellow-700 rounded-lg p-4 text-center">
            <div className="mb-2">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs">Mon code</span>
            </div>
            <p className="text-white font-bold text-2xl mb-2">{invitationCode}</p>
            <button onClick={handleCopyCode} className="w-full bg-yellow-400 text-white py-2 rounded-full text-xs font-medium hover:bg-yellow-500 transition-colors mt-1 mb-4">{copiedCode ? 'Copié !' : 'Copier le code'}</button>
            <div className="bg-yellow-50 text-yellow-800 rounded px-2 py-1 text-xs mb-1">À partager aux amis pour être parrain !</div>
          </div>
          <div className="bg-yellow-700 rounded-lg p-4 text-center">
            <div className="mb-2">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs">Lien parrain</span>
            </div>
            <p className="text-white text-xs mb-2 break-all">{invitationLink}</p>
            <button onClick={handleCopyLink} className="w-full bg-yellow-400 text-white py-2 rounded-full text-xs font-medium hover:bg-yellow-500 transition-colors mt-1 mb-4">{copiedLink ? 'Copié !' : 'Copier le lien'}</button>
            <div className="bg-yellow-50 text-yellow-800 rounded px-2 py-1 text-xs">Transmets ce lien pour inviter directement !</div>
          </div>
        </div>
      </div>
      {/* Team Section */}
      <div className="flex-1 bg-white rounded-t-3xl px-2 py-6 md:px-8 md:py-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Mon équipe</h2>
        <div className="flex gap-6 mb-4 flex-wrap">
          <div className="bg-gray-100 rounded-xl px-6 py-3 text-center">
            <p className="text-lg font-bold text-yellow-700">{totalUsers}</p>
            <p className="text-xs text-gray-600">Total filleuls</p>
          </div>
          <div className="bg-gray-100 rounded-xl px-6 py-3 text-center">
            <p className="text-lg font-bold text-yellow-700">{totalRewards}</p>
            <p className="text-xs text-gray-600">Total commissions</p>
          </div>
        </div>
        {/* Niveaux */}
        {loadingReferral ? (
          <div className="text-center py-12 text-gray-500 animate-pulse">Chargement membres de l’équipe...</div>
        ) : (
          <div className="space-y-6">
            {[1,2,3].map(lvl => {
              const levelData = teamLevels.find((level:any)=>level.level===lvl||String(level.level)===String(lvl)) || {};
              // Correction : garantir que levelData.users est toujours un tableau
              const users = Array.isArray(levelData.users) ? levelData.users : [];
              return (
                <div key={lvl} className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h3 className="font-semibold text-yellow-700 mb-3">Niveau {lvl}</h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Commission {levelData?.commission||'-'}%</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">Membres {users.length}</span>
                  </div>
                  <div className="mt-4">
                  {users.length===0 ? (
                    <div className="text-gray-400 italic">Aucun filleul à ce niveau.</div>
                  ) : (
                    <ul className="space-y-1">
                      {users.map((user:any, i:number) => (
                        <li key={user.id || i} className="border-b py-1 flex items-center gap-2 text-gray-800">
                          <Users className="w-4 h-4 text-yellow-500"/>
                          <span className="font-semibold">{user.display_name||user.name||user.phone}</span>
                          <span className="text-gray-500 text-xs">{user.phone}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Info commission */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
          <p><strong>LV1 :</strong> 25% sur les achats directs.</p>
          <p><strong>LV2 :</strong> 3% sur les achats niveau 2.</p>
          <p><strong>LV3 :</strong> 2% sur les achats niveau 3.</p>
          <p>Bonus crédité automatiquement dès validation d’un achat par un filleul.</p>
        </div>
      </div>
      <BottomNavigation currentScreen="team" onNavigate={onNavigate} />
    </div>
  );
};

export default TeamScreen;
