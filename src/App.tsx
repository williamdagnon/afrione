import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import HomeScreen from './components/HomeScreen';
import ProductScreen from './components/ProductScreen';
import TeamScreen from './components/TeamScreen';
import ProfileScreen from './components/ProfileScreen';
import AboutScreen from './components/AboutScreen';
import RulesScreen from './components/RulesScreen';
import BalanceDetailsScreen from './components/BalanceDetailsScreen';
import NotificationModal from './components/NotificationModal';
import CustomerServiceScreen from './components/CustomerServiceScreen';
import BankAccountsScreen from './components/BankAccountsScreen';
import LinkBankCardScreen from './components/LinkBankCardScreen';
import RechargeScreen from './components/RechargeScreen';
import WithdrawScreen from './components/WithdrawScreen';
import CheckInScreen from './components/CheckInScreen';

export type ScreenType = 'login' | 'register' | 'home' | 'product' | 'team' | 'profile' | 'about' | 'rules' | 'balance-details' | 'customer-service' | 'bank-accounts' | 'link-bank-card' | 'recharge' | 'withdraw' | 'check-in';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [showNotification, setShowNotification] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userBalance, setUserBalance] = useState(200);

  // Identifiants par défaut
  const defaultCredentials = {
    phone: '+22513739186',
    password: 'virtuix123'
  };

  const handleLogin = (phone: string, password: string) => {
    // Vérification des identifiants
    if (phone === defaultCredentials.phone && password === defaultCredentials.password) {
      setIsAuthenticated(true);
      setCurrentScreen('home');
      setTimeout(() => {
        setShowNotification(true);
        toast.success('Connexion réussie');
      }, 600);
      return true;
    }
    return false;
  };

  const handleRegister = (phone: string, password: string, confirmPassword: string) => {
    // Validation simple pour l'inscription
    if (password === confirmPassword && phone && password) {
      setIsAuthenticated(true);
      setCurrentScreen('home');
      setTimeout(() => {
        setShowNotification(true);
        toast.success('Inscription réussie');
      }, 600);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    setShowNotification(false);
  };

  const handleGoToRegister = () => {
    setCurrentScreen('register');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const handlePurchaseProduct = (price: number) => {
    if (userBalance >= price) {
      setUserBalance(prev => prev - price);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-900 to-yellow-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform -skew-x-12 w-full h-full"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent transform -skew-x-12 w-full h-full translate-x-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500 to-transparent transform -skew-x-12 w-full h-full translate-x-40"></div>
      </div>

      {currentScreen === 'login' && (
        <LoginScreen 
          onLogin={handleLogin} 
          onGoToRegister={handleGoToRegister}
          defaultCredentials={defaultCredentials}
        />
      )}
      
      {currentScreen === 'register' && (
        <RegisterScreen 
          onRegister={handleRegister} 
          onGoToLogin={handleGoToLogin}
        />
      )}
      
      {currentScreen === 'home' && (
        <HomeScreen 
          onNavigate={handleNavigate} 
          userBalance={userBalance}
        />
      )}

      {currentScreen === 'product' && (
        <ProductScreen 
          onNavigate={handleNavigate}
          userBalance={userBalance}
          onPurchase={handlePurchaseProduct}
        />
      )}

      {currentScreen === 'team' && (
        <TeamScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen 
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          userBalance={userBalance}
        />
      )}

      {currentScreen === 'about' && (
        <AboutScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'rules' && (
        <RulesScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'balance-details' && (
        <BalanceDetailsScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'customer-service' && (
        <CustomerServiceScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'bank-accounts' && (
        <BankAccountsScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'link-bank-card' && (
        <LinkBankCardScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'recharge' && (
        <RechargeScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'withdraw' && (
        <WithdrawScreen onNavigate={handleNavigate} userBalance={userBalance} />
      )}

      {currentScreen === 'check-in' && (
        <CheckInScreen onNavigate={handleNavigate} />
      )}

      <Toaster position="top-right" />
      <AnimatePresence>
        {showNotification && (
          <NotificationModal onClose={() => setShowNotification(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;