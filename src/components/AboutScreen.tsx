import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../App';

interface AboutScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white font-serif"> 
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
            <span className="text-white font-bold text-sm">
              <img 
                src="https://i.postimg.cc/YS4QxJ5x/photo-5764898979974941903-y.jpg" 
                alt="REDMY"
                className='h-full w-full rounded-2xl' 
                />
            </span>
          </div>
          <span className="text-yellow-500 font-semibold">REDMY</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">À propos de nous</span>
      </div>

      {/* Content */}
      <div className="p-6 text-gray-700 leading-relaxed">
        <p className="mb-4">
          REDMY est une entreprise technologique africaine spécialisée dans la vente et 
          la distribution de téléphones portables de nouvelle génération. 
          Depuis sa création, notre ambition est claire : 
          rendre la technologie mobile accessible à tous, tout en offrant des produits fiables, 
          performants et élégants.
        </p>

        <p className="mb-4">
          Nous croyons profondément au potentiel du continent africain et à sa capacité à se hisser au rang 
          des leaders mondiaux du numérique.
           C’est pourquoi REDMY s’engage à proposer des smartphones adaptés aux besoins et réalités 
           locales : une autonomie prolongée, une grande robustesse, une connectivité stable et des 
           fonctionnalités modernes.
        </p>

        <p className="mb-4">
          Grâce à un réseau de partenaires solides et à une équipe passionnée, 
          nous veillons à offrir à nos clients une expérience d’achat fluide, 
          sécurisée et personnalisée. Notre service après-vente est au cœur de 
          notre démarche, car pour nous, un client satisfait est notre meilleure publicité.
        </p>

        <h3 className="font-semibold text-gray-800 mb-2">Pourquoi REDMY ?</h3>

        <p className="mb-4">
          Notre vision est de faire de REDMY la référence africaine en matière de technologie mobile, 
          en accompagnant la digitalisation de notre continent et en inspirant une 
          nouvelle génération d’utilisateurs connectés et ambitieux.
        </p>

      
      </div>
    </div>
  );
};

export default AboutScreen;
