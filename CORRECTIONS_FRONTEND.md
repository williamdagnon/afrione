# ✅ CORRECTIONS FRONTEND - INTÉGRATION BACKEND

## 🎯 Fichiers modifiés

### 1. **src/services/api.ts** ✅ (Réécrit complet)

**Changements majeurs :**

#### Interfaces mises à jour
- ✅ `User`: Ajout de `id: number`, `email`, `total_earnings`, `referral_code`, `is_active`
- ✅ `Product`: Ajout de `duration_days`, `description`, `is_active`
- ✅ `Purchase`: Ajout de `total_amount`, `status`
- ✅ Nouvelles interfaces : `Transaction`, `BankAccount`, `WithdrawalRequest`, `ReferralInfo`

#### Endpoints corrigés
- ✅ `getProfile()` : `/auth/profile` → `/profile`
- ✅ `getPurchases()` : `/purchases` → `/purchases/my`
- ✅ `register()` : Ajout du paramètre `referred_by_code`
- ✅ `recharge()` : Ajout de `payment_method` et `reference`
- ✅ `withdraw()` : Nécessite maintenant `bank_account_id`

#### Nouveaux endpoints ajoutés
```typescript
// Transactions
getTransactions(limit?, offset?)

// Comptes bancaires
getBankAccounts()
addBankAccount(data)
deleteBankAccount(id)

// Demandes de retrait
getWithdrawalRequests()

// Parrainage
getReferralInfo()
getReferrals(level?)
getCommissions()

// Check-in
dailyCheckIn()
getCheckInStatus()

// Produits utilisateur
getUserProducts()

// Récompenses
getRewards()
claimReward(reward_id)
```

---

### 2. **src/App.tsx** ✅ (Partiellement modifié)

**Changements apportés :**

#### `handleRegister()`
```typescript
// Avant
async (phone, password, confirmPassword)

// Après
async (phone, password, confirmPassword, referralCode?)
```
- ✅ Supporte maintenant le code de parrainage
- ✅ Message de bienvenue avec mention du bonus

#### `handleWithdraw()`
```typescript
// Avant
async (amount) // Retrait direct

// Après
async (amount, bankAccountId) // Demande de retrait
```
- ✅ Crée une demande de retrait (approbation admin requise)
- ✅ Ne déduit pas immédiatement le solde
- ✅ Rafraîchit le profil après la demande

#### Nouvelle fonction : `handleCheckIn()`
```typescript
const handleCheckIn = async () => {
  const response = await api.dailyCheckIn();
  // Met à jour le solde
  // Affiche un toast avec la récompense et le streak
}
```

---

## 📝 ADAPTATIONS NÉCESSAIRES (À FAIRE)

### 1. **RegisterScreen.tsx**
Doit accepter le code de parrainage en option :
```typescript
interface RegisterScreenProps {
  onRegister: (phone: string, password: string, confirmPassword: string, referralCode?: string) => Promise<boolean>;
  onGoToLogin: () => void;
}

// Dans le formulaire
const [referralCode, setReferralCode] = useState('');

// Lors de la soumission
await onRegister(phone, password, confirmPassword, referralCode);
```

### 2. **CheckInScreen.tsx**
Doit utiliser la fonction `onCheckIn` reçue en props :
```typescript
interface CheckInScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onCheckIn: () => Promise<boolean>;
  userBalance: number;
}

// Lors du clic sur le bouton
const handleCheckIn = async () => {
  const success = await onCheckIn();
  if (success) {
    // Mettre à jour l'UI
  }
};
```

### 3. **WithdrawScreen.tsx**
Doit sélectionner un compte bancaire :
```typescript
interface WithdrawScreenProps {
  onNavigate: (screen: ScreenType) => void;
  userBalance: number;
  onWithdraw: (amount: number, bankAccountId: number) => Promise<boolean>;
}

// Avant la soumission, récupérer les comptes bancaires
const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);

useEffect(() => {
  loadBankAccounts();
}, []);

const loadBankAccounts = async () => {
  const response = await api.getBankAccounts();
  if (response.success && response.data) {
    setBankAccounts(response.data);
    if (response.data.length > 0) {
      setSelectedBankAccountId(response.data[0].id);
    }
  }
};

// Lors de la soumission
if (!selectedBankAccountId) {
  toast.error('Veuillez d\'abord ajouter un compte bancaire');
  return;
}
await onWithdraw(amount, selectedBankAccountId);
```

### 4. **BankAccountsScreen.tsx**
Doit charger et gérer les comptes bancaires via l'API :
```typescript
const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

useEffect(() => {
  loadBankAccounts();
}, []);

const loadBankAccounts = async () => {
  const response = await api.getBankAccounts();
  if (response.success && response.data) {
    setBankAccounts(response.data);
  }
};

const handleAddBankAccount = async (data) => {
  const response = await api.addBankAccount(data);
  if (response.success) {
    toast.success('Compte bancaire ajouté');
    loadBankAccounts();
  }
};

const handleDeleteBankAccount = async (id) => {
  const response = await api.deleteBankAccount(id);
  if (response.success) {
    toast.success('Compte bancaire supprimé');
    loadBankAccounts();
  }
};
```

### 5. **TeamScreen.tsx**
Doit charger les données de parrainage via l'API :
```typescript
const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
const [referrals, setReferrals] = useState<any[]>([]);

useEffect(() => {
  loadReferralData();
}, []);

const loadReferralData = async () => {
  const [infoResponse, referralsResponse] = await Promise.all([
    api.getReferralInfo(),
    api.getReferrals()
  ]);
  
  if (infoResponse.success && infoResponse.data) {
    setReferralInfo(infoResponse.data);
  }
  
  if (referralsResponse.success && referralsResponse.data) {
    setReferrals(referralsResponse.data);
  }
};
```

### 6. **BalanceDetailsScreen.tsx**
Doit charger les transactions via l'API :
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);

useEffect(() => {
  loadTransactions();
}, []);

const loadTransactions = async () => {
  const response = await api.getTransactions(50, 0);
  if (response.success && response.data) {
    setTransactions(response.data);
  }
};
```

### 7. **HomeScreen.tsx**
Doit afficher le code de parrainage de l'utilisateur :
```typescript
// Dans App.tsx, passer currentUser à HomeScreen
<HomeScreen 
  onNavigate={handleNavigate} 
  userBalance={currentUser?.balance || 0}
  referralCode={currentUser?.referral_code}
/>

// Dans HomeScreen.tsx
interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  userBalance: number;
  referralCode?: string;
}

// Afficher le code et le lien de parrainage
const referralLink = referralCode 
  ? `https://afrione.com/register?ref=${referralCode}` 
  : '';

// Fonction pour copier le lien
const handleCopyReferralLink = () => {
  if (referralLink) {
    navigator.clipboard.writeText(referralLink);
    toast.success('Lien de parrainage copié !');
  }
};
```

---

## 🔧 CONFIGURATION FRONTEND

### Créer le fichier `.env` à la racine du projet frontend
```env
VITE_API_URL=http://localhost:4000/api
```

**Note :** Le fichier `.env` est dans `.gitignore`. Chaque développeur doit le créer localement.

---

## 🧪 TESTS DE L'INTÉGRATION

### 1. Démarrer le backend
```bash
cd backend
npm run dev
```

### 2. Démarrer le frontend
```bash
# À la racine du projet
npm run dev
```

### 3. Tester le parcours complet

#### a) Inscription avec code de parrainage
1. Cliquer sur "S'inscrire"
2. Entrer le numéro de téléphone (ex: `+2250777XXXXX`)
3. Entrer un mot de passe
4. (Optionnel) Entrer un code de parrainage
5. Soumettre
6. ✅ Vérifier que l'utilisateur est créé avec un bonus de 300 FCFA
7. ✅ Vérifier que le `referral_code` est généré

#### b) Chargement des produits
1. Aller sur l'écran "Produits"
2. ✅ Vérifier que les 8 produits AFRIONE s'affichent
3. ✅ Vérifier les prix, durées, revenus

#### c) Achat d'un produit
1. Cliquer sur "ACHETER MAINTENANT"
2. Confirmer l'achat
3. ✅ Vérifier que le solde est déduit
4. ✅ Vérifier qu'une notification est créée
5. ✅ Vérifier dans la BDD que `user_products` est créé
6. ✅ Si parrainage : vérifier que les commissions sont distribuées

#### d) Recharge
1. Aller sur "Recharger"
2. Entrer un montant (ex: 5000 FCFA)
3. Soumettre
4. ✅ Vérifier que le solde est mis à jour
5. ✅ Vérifier qu'une transaction est créée
6. ✅ Vérifier qu'une notification est créée

#### e) Retrait
1. Aller sur "Comptes bancaires"
2. Ajouter un compte bancaire
3. Aller sur "Retrait"
4. Sélectionner le compte bancaire
5. Entrer un montant
6. Soumettre
7. ✅ Vérifier qu'une demande de retrait est créée (statut: pending)
8. ✅ Vérifier qu'une notification est créée
9. ✅ Le solde n'est PAS encore déduit (approbation admin requise)

#### f) Check-in quotidien
1. Aller sur "Pointage"
2. Cliquer sur "Effectuer le check-in"
3. ✅ Vérifier que +50 FCFA est ajouté
4. ✅ Vérifier que le streak est incrémenté
5. ✅ Vérifier qu'on ne peut pas faire de check-in deux fois le même jour

#### g) Parrainage
1. Aller sur "Équipe"
2. ✅ Vérifier que le code de parrainage est affiché
3. ✅ Vérifier que le lien de parrainage est généré
4. ✅ Copier le lien de parrainage
5. ✅ Inscrire un nouvel utilisateur avec ce lien
6. ✅ Vérifier que le filleul apparaît dans la liste
7. ✅ Vérifier que les commissions s'accumulent lors des achats du filleul

---

## ⚠️ POINTS D'ATTENTION

### 1. CORS
Le backend doit autoriser les requêtes du frontend :
```javascript
// backend/src/index.js
app.use(cors({
  origin: 'http://localhost:5173', // Port du frontend Vite
  credentials: true
}));
```

### 2. Variables d'environnement
- Backend : `backend/.env`
- Frontend : `.env` à la racine

### 3. Gestion des tokens
- Le token JWT est stocké dans `localStorage`
- Il est automatiquement ajouté aux headers des requêtes
- À la connexion, le token est sauvegardé
- À la déconnexion, le token est supprimé

### 4. Gestion des erreurs
- Toutes les erreurs API sont catchées et affichent un toast
- Les erreurs sont loggées dans la console

---

## 📊 RÉSUMÉ DES CORRECTIONS

**Fichiers modifiés :**
1. ✅ `src/services/api.ts` - Réécrit complet
2. ✅ `src/App.tsx` - Adaptations partielles

**Fichiers à adapter (prochaines étapes) :**
3. ⏳ `src/components/RegisterScreen.tsx` - Ajouter champ code parrainage
4. ⏳ `src/components/CheckInScreen.tsx` - Utiliser onCheckIn
5. ⏳ `src/components/WithdrawScreen.tsx` - Sélectionner compte bancaire
6. ⏳ `src/components/BankAccountsScreen.tsx` - Intégrer API
7. ⏳ `src/components/TeamScreen.tsx` - Charger données parrainage
8. ⏳ `src/components/BalanceDetailsScreen.tsx` - Charger transactions
9. ⏳ `src/components/HomeScreen.tsx` - Afficher code parrainage

**Nouveaux endpoints disponibles :**
- ✅ Check-in quotidien
- ✅ Transactions
- ✅ Comptes bancaires
- ✅ Demandes de retrait
- ✅ Parrainage et commissions
- ✅ Produits utilisateur
- ✅ Récompenses

**L'intégration frontend-backend est en cours ! 🚀**

