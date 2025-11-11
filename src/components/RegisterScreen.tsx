import React, { useState } from 'react';
import { Phone, Lock, Code, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface RegisterScreenProps {
  onRegister: (phone: string, password: string, confirmPassword: string, referralCode?: string) => Promise<boolean>;
  onGoToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onGoToLogin }) => {
  const [countryCode, setCountryCode] = useState('+225');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

  setIsLoading(true);

    // Simulation d'un délai d'inscription
    await new Promise(resolve => setTimeout(resolve, 1000));

  const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${countryCode}${phoneNumber}`;

  // Passer le code d'invitation (verificationCode) à la fonction onRegister
  const success = await onRegister(fullPhone, password, confirmPassword, verificationCode || undefined);

  if (!success) {
    setError('Erreur lors de l\'inscription. Veuillez réessayer.');
    toast.error('Échec de l\'inscription');
  } else {
    toast.success('Inscription réussie');
  }
    
    setIsLoading(false);
  };

  return (
    <div className=" font-serif  flex items-center justify-center min-h-screen p-4" 
    style={{backgroundImage: 'url(https://i.postimg.cc/2y0fmtGm/photo-5807811900899789799-y.jpg)', 
    backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-sm">
        {/* Logo */}
       <div className="text-center mb-8">
          <div className="w-20 h-20 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
            
              <img src="https://i.postimg.cc/YS4QxJ5x/photo-5764898979974941903-y.jpg" 
              alt="REDMY Logo" className='w-20 h-20 rounded-full' />
            
          </div>
          <h1 className="text-white text-2xl font-light">REDMY</h1>
        </div>
        {/* Register Form */}
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
                  <option>+228</option>
                  <option>+226</option>
                  <option>+237</option>
                  <option>+229</option>
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
            <div className="mb-4">
              <div className="relative">
                <Lock className="w-5 h-5 text-yellow-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-b border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-yellow-500 bg-transparent"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-4">
              <div className="relative">
                <Lock className="w-5 h-5 text-yellow-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-b border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-yellow-500 bg-transparent"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Verification Code (editable) */}
            <div className="mb-6">
              <label htmlFor="verification" className="sr-only">Code d'invitation (Falcultatif)</label>
              <div className="relative">
                <Code className="w-5 h-5 text-yellow-500 mr-3" aria-hidden />
                <input
                  id="verification"
                  name="verification"
                  type="text"
                  placeholder="Code d'invitation (Falcultatif)"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-b border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-yellow-500 bg-transparent"
                  aria-label="Code de vérification"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            {/* Register Button */}
            <motion.button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-full font-medium text-sm hover:bg-yellow-600 transition-colors mb-4"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </motion.button>

            {/* Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-yellow-500 text-sm hover:underline"
              >
                Aller à la connexion &gt;
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterScreen;
