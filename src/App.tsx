import React, { useState, useEffect } from 'react';
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
import TaskCenterScreen from './components/TaskCenterScreen';
// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import WithdrawalManagement from './components/admin/WithdrawalManagement';
import UserManagement from './components/admin/UserManagement';
import ProductManagement from './components/admin/ProductManagement';
import AdminSettings from './components/admin/AdminSettings';
import ManualDepositManagement from './components/admin/ManualDepositManagement';
import BankAccountsManagement from './components/admin/BankAccountsManagement';
import PaymentMethodsManagement from './components/admin/PaymentMethodsManagement';
import api, { User } from './services/api';

export type ScreenType = 'login' | 'register' | 'home' | 'product' | 'team' | 'profile' | 'about' | 'rules' | 'balance-details' | 'customer-service' | 'bank-accounts' | 'link-bank-card' | 'recharge' | 'withdraw' | 'check-in' | 'admin-dashboard' | 'admin-withdrawals' | 'admin-users' | 'admin-products' | 'admin-settings' | 'admin-manual-deposits' | 'admin-bank-accounts' | 'admin-payment-methods' | 'task-center';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('register');
  const [showNotification, setShowNotification] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  
  useEffect(() => {
    // Récupérer le code d'invitation depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setInviteCode(refCode);
      setCurrentScreen('register');
    }
  }, []);
  // PATCH AI: Ajout état
  const [referralInfos, setReferralInfos] = useState<any>(null);
  const [loadingReferral, setLoadingReferral] = useState(false);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const response = await api.getProfile();
          if (response.success && response.data) {
            setCurrentUser(response.data);
            setIsAuthenticated(true);
            setCurrentScreen('home');
          } else {
            api.clearToken();
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'authentification:', error);
          api.clearToken();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if(currentScreen === 'team') loadReferralInfos();
  }, [currentScreen]);

  const loadReferralInfos = async () => {
    setLoadingReferral(true);
    try {
      // Récupérer d'abord les statistiques (code de parrainage)
      const stats = await api.getReferralStats(); // /referrals/stats
      // Puis récupérer la structure de l'équipe (niveaux / membres)
      const team = await api.getReferralTeam();   // /referrals/my-team
      if (stats.success && team.success) {
        const code = stats.data?.referral_code || '';
        // Construire le lien d'invitation : priorité au domaine forcé en localStorage,
        // sinon utiliser le lien fourni par l'API, sinon fallback sur window.location.origin
        const forcedDomain = typeof window !== 'undefined' ? localStorage.getItem('referral_domain') : null;
        const apiLink = team.data?.referralLink || '';
        const baseDomain = forcedDomain || apiLink || (typeof window !== 'undefined' ? window.location.origin : '');
        const link = apiLink
          ? (forcedDomain ? `${forcedDomain.replace(/\/$/, '')}/register?ref=${code}` : apiLink)
          : (code && baseDomain ? `${baseDomain.replace(/\/$/, '')}/register?ref=${code}` : '');

        setReferralInfos({
          code,
          link,
          levels: team.data?.levels || [],
          totalUsers: team.data?.totalUsers || 0,
          totalRewards: team.data?.totalRewards || 0,
        });
      } else {
        toast.error('Impossible de charger les données de parrainage');
      }
    } catch (e:any) {
      console.error('Erreur chargement parrainage:', e);
      toast.error(e?.message || 'Erreur parrainage');
    } finally {
      setLoadingReferral(false);
    }
  };

  // Fonction pour rafraîchir le profil utilisateur
  const refreshUserProfile = async () => {
    try {
      const response = await api.getProfile();
      if (response.success && response.data) {
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
    }
  };

  const handleLogin = async (phone: string, password: string) => {
    try {
      const response = await api.login(phone, password);
      
      if (response.success && response.data) {
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        setCurrentScreen('home');
        setTimeout(() => {
          setShowNotification(true);
          toast.success('Connexion réussie');
        }, 600);
        return true;
      } else {
        toast.error(response.message || 'Échec de la connexion');
        return false;
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      toast.error(error.message || 'Erreur lors de la connexion');
      return false;
    }
  };

  const handleRegister = async (phone: string, password: string, confirmPassword: string, referralCode?: string) => {
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }

    try {
      // Utiliser le code d'invitation de l'URL s'il existe
      const codeToUse = referralCode || inviteCode || undefined;
      const response = await api.register(phone, password, phone, codeToUse);
      
      if (response.success && response.data) {
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        setCurrentScreen('home');
        setTimeout(() => {
          setShowNotification(true);
          toast.success('Inscription réussie ! Bonus de bienvenue accordé.');
        }, 600);
        return true;
      } else {
        toast.error(response.message || 'Échec de l\'inscription');
        return false;
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
      return false;
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('login');
    setShowNotification(false);
    toast.success('Déconnexion réussie');
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

  const handlePurchaseProduct = async (productId: number) => {
    try {
      const response = await api.createPurchase(productId);
      
      if (response.success && response.data) {
        // Mettre à jour le solde de l'utilisateur
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            balance: response.data.new_balance
          });
        }
        toast.success('Achat effectué avec succès');
        return true;
      } else {
        toast.error(response.message || 'Échec de l\'achat');
        return false;
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'achat:', error);
      toast.error(error.message || 'Erreur lors de l\'achat');
      return false;
    }
  };

  const handleRecharge = async (amount: number) => {
    try {
      const response = await api.recharge(amount);
      
      if (response.success && response.data) {
        // Mettre à jour le solde de l'utilisateur
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            balance: response.data.new_balance
          });
        }
        toast.success('Rechargement effectué avec succès');
        return true;
      } else {
        toast.error(response.message || 'Échec du rechargement');
        return false;
      }
    } catch (error: any) {
      console.error('Erreur lors du rechargement:', error);
      toast.error(error.message || 'Erreur lors du rechargement');
      return false;
    }
  };

  const handleWithdraw = async (amount: number, bankAccountId: number) => {
    try {
      const response = await api.withdraw(amount, bankAccountId);
      
      if (response.success && response.data) {
        // Le solde n'est pas immédiatement déduit, il faut attendre l'approbation admin
        toast.success('Demande de retrait créée avec succès. En attente d\'approbation.');
        // Rafraîchir le profil pour récupérer les éventuels changements
        await refreshUserProfile();
        return true;
      } else {
        toast.error(response.message || 'Échec de la demande de retrait');
        return false;
      }
    } catch (error: any) {
      console.error('Erreur lors de la demande de retrait:', error);
      toast.error(error.message || 'Erreur lors de la demande de retrait');
      return false;
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await api.dailyCheckIn();
      
      if (response.success && response.data) {
        // Mettre à jour le solde de l'utilisateur
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            balance: response.data.new_balance
          });
        }
        toast.success(`Check-in effectué ! +${response.data.reward_amount} FCFA (Série: ${response.data.streak} jours)`);
        return true;
      } else {
        toast.error(response.message || 'Vous avez déjà effectué votre check-in aujourd\'hui');
        return false;
      }
    } catch (error: any) {
      console.error('Erreur lors du check-in:', error);
      toast.error(error.message || 'Erreur lors du check-in');
      return false;
    }
  };

  // Identifiants par défaut (pour information)
  const defaultCredentials = {
    phone: '+22513739186',
    password: 'virtuix123'
  };

  // Afficher un loader pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-yellow-900 to-yellow-600 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

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
          userBalance={currentUser?.balance || 0}
        />
      )}

      {currentScreen === 'product' && (
        <ProductScreen 
          onNavigate={handleNavigate}
          userBalance={currentUser?.balance || 0}
          onPurchase={handlePurchaseProduct}
        />
      )}

      {currentScreen === 'team' && (
        <TeamScreen 
          onNavigate={handleNavigate}
          loadingReferral={loadingReferral}
          referralInfos={referralInfos}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen 
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          userBalance={currentUser?.balance || 0}
          currentUser={currentUser}
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
        <RechargeScreen 
          onNavigate={handleNavigate}
          onRecharge={handleRecharge}
        />
      )}

      {currentScreen === 'withdraw' && (
        <WithdrawScreen 
          onNavigate={handleNavigate} 
          userBalance={currentUser?.balance || 0}
          onWithdraw={handleWithdraw}
        />
      )}

      {currentScreen === 'check-in' && (
        <CheckInScreen 
          onNavigate={handleNavigate} 
          onCheckIn={handleCheckIn}
          userBalance={currentUser?.balance || 0}
        />
      )}

      {currentScreen === 'task-center' && (
        <TaskCenterScreen onNavigate={handleNavigate} />
      )}

      {/* Admin Screens */}
      {currentScreen === 'admin-dashboard' && (
        <AdminDashboard onNavigate={handleNavigate} />
      )}

      {currentScreen === 'admin-withdrawals' && (
        <WithdrawalManagement onNavigate={handleNavigate} />
      )}

      {currentScreen === 'admin-users' && (
        <UserManagement onNavigate={handleNavigate} />
      )}

      {currentScreen === 'admin-products' && (
        <ProductManagement onNavigate={handleNavigate} />
      )}

      {currentScreen === 'admin-settings' && (
        <AdminSettings onNavigate={handleNavigate} />
      )}

      {currentScreen === 'admin-manual-deposits' && (
        <ManualDepositManagement onNavigate={handleNavigate} />
      )}

      {currentScreen === 'admin-bank-accounts' && (
        <BankAccountsManagement onNavigate={handleNavigate} />
      )}

      {currentScreen === 'admin-payment-methods' && (
        <PaymentMethodsManagement onNavigate={handleNavigate} />
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
