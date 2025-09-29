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
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="text-yellow-500 font-semibold">futuristia</span>
        </div>
        <span className="ml-4 text-yellow-500 font-medium">À propos de nous</span>
      </div>

      {/* Content */}
      <div className="p-6 text-gray-700 leading-relaxed">
        <p className="mb-4">
          Futuristia est bien plus qu’une entreprise : c’est un mouvement. 
          Notre mission est d’imaginer et de créer un futur où l’impossible devient réalité, 
          où l’humanité peut voyager à travers le temps et l’espace, guidée par la lumière du progrès.»
        </p>

        <p className="mb-4">
          Les produits Futuristia s'étendent au-delà du jeu et du divertissement en réalité 
          virtuelle, s'étendant à l'e-sport, à la formation en entreprise, à l'éducation, à la 
          simulation militaire et à d'autres domaines. Son produit phare, l'Omni One, est 
          conçu pour le marché grand public, offrant un format compact et pratique 
          compatible avec les principaux casques de réalité virtuelle.
        </p>

        <p className="mb-4">
          Grâce à son matériel innovant et à ses expériences immersives, Futuristia est 
          reconnu comme un pionnier de la réalité virtuelle, déterminé à rapprocher 
          l'exploration des mondes virtuels des sports réels.
        </p>

        <h3 className="font-semibold text-gray-800 mb-2">Pourquoi Futuristia ?</h3>

        <p className="mb-4">
          Chez Futuristia, nous formons une équipe performante, unie par une passion 
          commune : donner vie à la réalité virtuelle immersive et intégrale. Nous 
          sommes animés par une philosophie qui repousse les limites et une culture de 
          l'excellence, rejetant la médiocrité. Notre équipe est animée par l'innovation et 
          allie compétences et créativité pour développer des matériels et logiciels VR 
          révolutionnaires qui façonnent l'avenir du divertissement.
        </p>

        <p>
          Rejoindre Futuristia, c'est bien plus que rejoindre une entreprise ; c'est l'occasion 
          de laisser votre empreinte dans l'industrie du divertissement, d'inspirer et de 
          vous inspirer, et de devenir un acteur clé de notre aventure, soutenue par des 
          investisseurs, visant à transformer le monde du jeu vidéo et des expériences.
        </p>
      </div>
    </div>
  );
};

export default AboutScreen;