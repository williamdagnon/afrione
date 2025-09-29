import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface LoginScreenProps {
  onLogin: (phone: string, password: string) => boolean;
  onGoToRegister: () => void;
  defaultCredentials: {
    phone: string;
    password: string;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToRegister, defaultCredentials }) => {
  const [countryCode, setCountryCode] = useState('+225');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation d'un délai de connexion
    await new Promise(resolve => setTimeout(resolve, 1000));

    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${countryCode}${phoneNumber}`;

    const success = onLogin(fullPhone, password);

    if (!success) {
      setError('Numéro de téléphone ou mot de passe incorrect');
      toast.error('Échec de la connexion');
    } else {
      toast.success('Connexion en cours...');
    }

    setIsLoading(false);
  };
    
  const handleUseDefaults = () => {
    setPhoneNumber(defaultCredentials.phone);
    setPassword(defaultCredentials.password);
  };

  return (
    <div className="flex items-center justify-center font-serif min-h-screen p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            
              <img src="https://i.postimg.cc/ZRwNcf6M/IMG-20250925-WA0001-1.jpg" 
              alt="Futuristia Logo" className='w-20 h-20 rounded-full' />
            
          </div>
          <h1 className="text-white text-2xl font-light">Futuristia</h1>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit}>
            {/* Phone Number Input */}
            <div className="mb-4">
              <label htmlFor="phone" className="sr-only">Numéro de téléphone</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-yellow-500 absolute left-3 top-3 pointer-events-none" aria-hidden />
                <select
                  id="country"
                  name="country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="absolute left-10 top-3 text-sm text-gray-600 bg-transparent outline-none z-20"
                  aria-label="Code pays"
                >
                  <option>+225</option>
                  <option>+33</option>
                  <option>+1</option>
                </select>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Entrez le numéro de téléphone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-24 pr-4 py-3 border-b border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-yellow-500 bg-transparent"
                  required
                  autoComplete="tel"
                  aria-label="Numéro de téléphone sans code pays"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-yellow-500 absolute left-3 top-3 pointer-events-none" aria-hidden />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-b border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-yellow-500 bg-transparent"
                  required
                  autoComplete="current-password"
                  aria-label="Mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            {/* Default Credentials Helper */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-700 mb-2">Identifiants par défaut :</p>
              <p className="text-xs text-blue-600">Téléphone: {defaultCredentials.phone}</p>
              <p className="text-xs text-blue-600">Mot de passe: {defaultCredentials.password}</p>
              <button
                type="button"
                onClick={handleUseDefaults}
                className="mt-2 text-xs text-blue-500 hover:underline"
              >
                Utiliser ces identifiants
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              className="w-full bg-yellow-500 text-white py-3 rounded-full font-medium text-sm hover:bg-yellow-600 transition-colors mb-4"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </motion.button>

            {/* Register Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={onGoToRegister}
                className="text-yellow-500 text-sm hover:underline"
              >
                Aller à l'inscription &gt;
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;