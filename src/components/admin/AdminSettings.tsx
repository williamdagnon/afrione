import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';
import api from '../../services/api';
import { ScreenType } from '../../App';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface AdminSettingsProps {
  onNavigate: (screen: ScreenType) => void;
}

interface Settings {
  signup_bonus: number;
  daily_checkin_reward: number;
  withdrawal_fee_percentage: number;
  min_withdrawal_amount: number;
  max_withdrawal_amount: number;
  referral_level1_commission: number;
  referral_level2_commission: number;
  referral_level3_commission: number;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<Settings>({
    signup_bonus: 300,
    daily_checkin_reward: 50,
    withdrawal_fee_percentage: 15,
    min_withdrawal_amount: 1000,
    max_withdrawal_amount: 10000000,
    referral_level1_commission: 25,
    referral_level2_commission: 3,
    referral_level3_commission: 2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [bankForm, setBankForm] = useState({ bank_name:'', account_number:'', account_holder:''});

  useEffect(() => {
    loadSettings();
    loadBanks();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSystemSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadBanks = async()=>{
    try { const r = await api.getPaymentMethods(); if(r.success&&r.data) setBanks(r.data); } catch{}
  };
  const addBank = async()=>{
    if(!bankForm.bank_name || !bankForm.account_holder || !bankForm.account_number){ toast.error('Champs incomplets'); return; }
    const r = await api.createPaymentMethod({ ...bankForm, is_active:true });
    if(r.success){ toast.success('Banque ajoutée'); setBankForm({bank_name:'',account_number:'',account_holder:''}); loadBanks(); }
  };
  const toggleBank = async(b:any)=>{
    const r = await api.updatePaymentMethod(b.id, { is_active: !b.is_active });
    if(r.success){ loadBanks(); }
  };
  const removeBank = async(id:number)=>{ if(!confirm('Supprimer cette banque ?')) return; const r = await api.deletePaymentMethod(id); if(r.success){ loadBanks(); }}

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await api.updateSystemSettings(settings);
      if (response.success) {
        toast.success('Paramètres mis à jour');
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde paramètres:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings({
      ...settings,
      [key]: parseFloat(value) || 0
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-yellow-500 text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-serif pb-20">
      {/* Header */}
      <div className="bg-yellow-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => onNavigate('admin-dashboard' as ScreenType)} className="mr-3">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Paramètres système</h1>
              <p className="text-yellow-100 text-sm">Configuration générale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="p-4 space-y-4">
        {/* Signup & Rewards */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold text-gray-800 mb-3">Récompenses</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonus d'inscription (FCFA)
              </label>
              <input
                type="number"
                value={settings.signup_bonus}
                onChange={(e) => handleChange('signup_bonus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Montant offert aux nouveaux utilisateurs
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Récompense check-in quotidien (FCFA)
              </label>
              <input
                type="number"
                value={settings.daily_checkin_reward}
                onChange={(e) => handleChange('daily_checkin_reward', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Montant offert pour chaque check-in quotidien
              </p>
            </div>
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold text-gray-800 mb-3">Retraits</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frais de retrait (%)
              </label>
              <input
                type="number"
                value={settings.withdrawal_fee_percentage}
                onChange={(e) => handleChange('withdrawal_fee_percentage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pourcentage de frais appliqué aux retraits
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant minimum (FCFA)
              </label>
              <input
                type="number"
                value={settings.min_withdrawal_amount}
                onChange={(e) => handleChange('min_withdrawal_amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant maximum (FCFA)
              </label>
              <input
                type="number"
                value={settings.max_withdrawal_amount}
                onChange={(e) => handleChange('max_withdrawal_amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Referral Commissions */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold text-gray-800 mb-3">Commissions de parrainage</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau 1 (%)
              </label>
              <input
                type="number"
                value={settings.referral_level1_commission}
                onChange={(e) => handleChange('referral_level1_commission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Commission sur les achats directs des filleuls
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau 2 (%)
              </label>
              <input
                type="number"
                value={settings.referral_level2_commission}
                onChange={(e) => handleChange('referral_level2_commission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Commission sur les achats des filleuls de niveau 2
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau 3 (%)
              </label>
              <input
                type="number"
                value={settings.referral_level3_commission}
                onChange={(e) => handleChange('referral_level3_commission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Commission sur les achats des filleuls de niveau 3
              </p>
            </div>
          </div>
        </div>

        {/* Banks Management */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold text-gray-800 mb-3">Méthodes de paiement (banques)</h2>
          <div className="grid md:grid-cols-3 gap-2 mb-3">
            <input placeholder="Nom de la banque" value={bankForm.bank_name} onChange={(e)=>setBankForm({...bankForm, bank_name:e.target.value})} className="px-3 py-2 border rounded"/>
            <input placeholder="Titulaire" value={bankForm.account_holder} onChange={(e)=>setBankForm({...bankForm, account_holder:e.target.value})} className="px-3 py-2 border rounded"/>
            <input placeholder="N° Compte / Référence" value={bankForm.account_number} onChange={(e)=>setBankForm({...bankForm, account_number:e.target.value})} className="px-3 py-2 border rounded"/>
          </div>
          <button onClick={addBank} className="mb-4 inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"><Plus className="w-4 h-4 mr-2"/>Ajouter</button>
          <div className="space-y-2">
            {banks.length===0 ? (<div className="text-gray-400 text-sm">Aucune banque active.</div>) : banks.map(b=> (
              <div key={b.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-semibold text-gray-800">{b.bank_name}</div>
                  <div className="text-xs text-gray-600">{b.account_holder} — {b.account_number}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>toggleBank(b)} className={`px-3 py-1 rounded text-white ${b.is_active?'bg-green-500':'bg-gray-400'}`}>{b.is_active?'Actif':'Inactif'}</button>
                  <button onClick={()=>removeBank(b.id)} className="px-3 py-1 rounded bg-red-500 text-white flex items-center"><Trash2 className="w-4 h-4 mr-1"/>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </motion.button>
      </div>
    </div>
  );
};

export default AdminSettings;

