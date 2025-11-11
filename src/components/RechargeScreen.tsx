import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { ScreenType } from '../App';

interface RechargeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onRecharge: (amount: number) => Promise<boolean>;
}

const RechargeScreen: React.FC<RechargeScreenProps> = ({ onNavigate }) => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [form, setForm] = useState({ amount: '', deposit_number: '', transaction_id: '' });
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'select'|'submit'>('select');
  const [showLoader, setShowLoader] = useState(false);
  const [preSubmitLoader, setPreSubmitLoader] = useState(false);

  useEffect(() => { loadBanks(); }, []);
  const loadBanks = async () => {
    setIsLoadingBanks(true);
    const response = await api.getPaymentMethods();
    if(response.success && response.data) setPaymentMethods(response.data);
    setIsLoadingBanks(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const quickAmounts = [3000, 6000, 8000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000, 100000, 150000, 200000];
  const handleBankSelect = (bank: any) => {
    if(!form.amount){
      toast.error('Veuillez d\'abord saisir ou choisir un montant.');
      return;
    }
    setPreSubmitLoader(true);
    setTimeout(() => {
      setSelectedBank(bank);
      setStep('submit');
      setPreSubmitLoader(false);
    }, 5000);
  };

  // Fonction pour copier le RIB
  const handleCopyRIB = (rib: string) => {
    navigator.clipboard.writeText(rib);
    toast.success('Numéro de dépôt copié !');
  };
  const goBack = ()=>{ setStep('select'); setSelectedBank(null); };

  const canSubmit = selectedBank && form.amount && form.deposit_number && form.transaction_id && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!canSubmit) return;
    setIsSubmitting(true);
    setShowLoader(true);
    // Loader de 5 secondes avant la soumission réelle
    setTimeout(async () => {
      try {
        const resp = await api.createManualDeposit({
          payment_method_id: selectedBank.id,
          amount: parseFloat(form.amount),
          deposit_number: form.deposit_number,
          transaction_id: form.transaction_id
        });
        if(resp.success) {
          toast.success('Dépôt soumis, en attente de validation admin.');
          onNavigate('home');
        } else {
          toast.error(resp.message || 'Erreur dépôt.');
        }
      } catch(e: any) {
        toast.error(e.message || 'Erreur dépôt');
      }
      setIsSubmitting(false);
      setTimeout(() => setShowLoader(false), 5000);
    }, 5000);
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="font-serif min-h-screen flex flex-col bg-white">
      <div className="p-4 max-w-lg mx-auto w-full flex items-center">
        <button
          onClick={() => onNavigate('home')}
          className="mr-2 p-2 rounded-full hover:bg-yellow-800/30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Retour à l'accueil"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center md:text-left text-gray-800">Recharger</h1>
        <span className="w-8" />
      </div>
        {/* Stepper */}
        <div className="flex justify-between items-center mb-6">
          <div className={`${step==='select' ? 'font-bold text-yellow-700' : 'text-gray-400'}`}>1. Choisir la banque</div>
          <div className={`h-0.5 flex-1 mx-2 ${step==='submit' ? 'bg-yellow-500':'bg-gray-200'}`}></div>
          <div className={`${step==='submit' ? 'font-bold text-yellow-700' : 'text-gray-400'}`}>2. Soumettre le dépôt</div>
        </div>
        {/* Encadré infos */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 px-4 py-3 rounded mb-6 text-sm">
          <p><b>Délais :</b> Les dépôts sont validés sous 24h max, après vérification par l’admin. Merci de saisir EXACTEMENT les références fournies par l’agence ou l’opérateur mobile !</p>
          <p className="mt-2"><b>Astuce :</b> Vous pouvez contacter le support en cas de problème ou de retard inhabituel. Vérifiez vos informations avant de soumettre !</p>
        </div>
        {/* Banques - Étape 1 */}
        {isLoadingBanks ? <div className="text-center p-8">Chargement banques ...</div> : step==='select' && (
          <>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Montant (FCFA)" className="w-full px-4 py-2 border border-blue-700 rounded" min={1}/>

            {/* Choix Montant d'abord */}
            <div className="mb-5">
              <p className="text-sm text-gray-700 mb-2">Montant à déposer (FCFA)</p>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {quickAmounts.map(v=> (
                  <button key={v} type="button" onClick={()=>setForm({...form, amount: String(v)})}
                    className={`py-2 rounded border ${form.amount==String(v)?'bg-yellow-500 text-white border-yellow-500':'bg-white text-gray-700 border-gray-200'} hover:border-yellow-400`}>{v.toLocaleString()}</button>
                ))}
          </div>
        </div>
            {/* Banques */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map(bank => (
                <motion.div
                  key={bank.id}
                  className={`w-full text-left rounded-lg border p-4 shadow ${selectedBank?.id===bank.id?'border-yellow-400 bg-yellow-50':'border-gray-200 bg-white'} transition`}
                  whileHover={{ scale:1.02 }}
                >
                  <span className="block text-lg font-semibold">{bank.bank_name}</span>
                  <span className="block text-yellow-800">Titulaire: <span className="font-medium">{bank.account_holder}</span></span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="block text-gray-500 text-sm">RIB: {bank.account_number}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyRIB(bank.account_number)}
                      className="ml-2 px-2 py-1 text-xs bg-yellow-400 text-white rounded hover:bg-yellow-500 focus:outline-none"
                    >
                      Copier
                    </button>
                  </div>
                  <button
                    type="button"
                    className="mt-2 w-full py-2 rounded bg-yellow-500 text-white font-medium hover:bg-yellow-600"
                    onClick={()=>handleBankSelect(bank)}
                  >
                    Choisir cette banque
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
        {/* Formulaire - Étape 2 */}
        {step==='submit' && selectedBank && (
          <motion.div initial={{x:100,opacity:0}} animate={{x:0,opacity:1}} className="bg-yellow-100 rounded-xl p-6 mb-4">
            <button type="button" onClick={goBack} className="mb-4 text-yellow-600 hover:underline">&lt; Changer de banque</button>
            <p className="text-yellow-900 font-medium mb-3">Banque sélectionnée : <b>{selectedBank.bank_name}</b></p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Montant (FCFA)" className="w-full px-4 py-2 border rounded mb-2" required min={1}/>
                <input name="deposit_number" value={form.deposit_number} onChange={handleChange} placeholder="N° de dépôt effectué" className="w-full px-4 py-2 border rounded mb-2" required/>
                <input name="transaction_id" value={form.transaction_id} onChange={handleChange} placeholder="ID Transaction reçu (Mobile Money/banque)" className="w-full px-4 py-2 border rounded mb-2" required/>
        </div>
              <motion.button type="submit" whileTap={{scale:.98}} disabled={!canSubmit}
                 className="w-full bg-yellow-500 text-white py-3 rounded font-medium text-sm hover:bg-yellow-600 disabled:opacity-50">
                {isSubmitting? 'Soumission...' : 'Soumettre le dépôt'}
              </motion.button>
            </form>
          </motion.div>
        )}
      
    {/* Loader avant le formulaire de soumission */}
    {preSubmitLoader && (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center">
          <div className="animate-spin mb-4">
            <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
          <p className="text-lg font-semibold text-yellow-700 mb-2">Chargement...</p>
          <p className="text-gray-600 text-sm">Merci de patienter!</p>
        </motion.div>
      </div>
    )}
    {/* Loader d'automatisation après soumission */}
    {showLoader && (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center">
          <div className="animate-spin mb-4">
            <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
          <p className="text-lg font-semibold text-yellow-700 mb-2">Chargement...</p>
          <p className="text-gray-600 text-sm">Votre dépôt est en cours de traitement.<br/>Merci de patienter!</p>
        </motion.div>
      </div>
    )}
    </motion.div>
  );
};

export default RechargeScreen;
