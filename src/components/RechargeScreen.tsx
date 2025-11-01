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
    setSelectedBank(bank);
    setStep('submit');
  };
  const goBack = ()=>{ setStep('select'); setSelectedBank(null); };

  const canSubmit = selectedBank && form.amount && form.deposit_number && form.transaction_id && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!canSubmit) return;
    setIsSubmitting(true);
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
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="font-serif min-h-screen flex flex-col bg-white">
      <div className="p-4 max-w-lg mx-auto w-full">
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
            {/* Choix Montant d'abord */}
            <div className="mb-5">
              <p className="text-sm text-gray-700 mb-2">Montant à déposer (FCFA)</p>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {quickAmounts.map(v=> (
                  <button key={v} type="button" onClick={()=>setForm({...form, amount: String(v)})}
                    className={`py-2 rounded border ${form.amount==String(v)?'bg-yellow-500 text-white border-yellow-500':'bg-white text-gray-700 border-gray-200'} hover:border-yellow-400`}>{v.toLocaleString()}</button>
                ))}
          </div>
              <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Autre montant (FCFA)" className="w-full px-4 py-2 border rounded" min={1}/>
        </div>
            {/* Banques */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map(bank => (
                <motion.button
                  type="button"
                  whileHover={{ scale:1.02 }}
                key={bank.id}
                  className={`w-full text-left rounded-lg border p-4 shadow ${selectedBank?.id===bank.id?'border-yellow-400 bg-yellow-50':'border-gray-200 bg-white'} transition`}
                  onClick={()=>handleBankSelect(bank)}
                >
                  <span className="block text-lg font-semibold">{bank.bank_name}</span>
                  <span className="block text-yellow-800">Titulaire: <span className="font-medium">{bank.account_holder}</span></span>
                  <span className="block text-gray-500 text-sm">RIB: {bank.account_number}</span>
                </motion.button>
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
      </div>
    </motion.div>
  );
};

export default RechargeScreen;