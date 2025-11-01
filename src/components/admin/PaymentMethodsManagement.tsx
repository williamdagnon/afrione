import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { ScreenType } from '../../App';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface PaymentMethodsManagementProps {
  onNavigate: (screen: ScreenType) => void;
}

const PaymentMethodsManagement: React.FC<PaymentMethodsManagementProps> = ({ onNavigate }) => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bank_name:'', account_holder:'', account_number:'', country:'', min_deposit:'' as any });

  const load = async () => {
    try {
      setLoading(true);
      const r = await api.getPaymentMethods();
      if (r.success && r.data) setBanks(r.data);
    } catch (e:any) {
      toast.error(e?.message || 'Erreur chargement banques');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const add = async () => {
    if (!form.bank_name || !form.account_holder || !form.account_number) { toast.error('Champs requis'); return; }
    try {
      setSaving(true);
      const r = await api.createPaymentMethod({ bank_name:form.bank_name, account_holder:form.account_holder, account_number:form.account_number, is_active:true, country:form.country, min_deposit: Number(form.min_deposit)||0 } as any);
      if (r.success) { toast.success('Banque ajoutée'); setForm({ bank_name:'', account_holder:'', account_number:'' }); load(); }
    } catch (e:any) { toast.error(e?.message || 'Erreur ajout'); } finally { setSaving(false); }
  };

  const toggle = async (b:any) => {
    try { const r = await api.updatePaymentMethod(b.id, { is_active: !b.is_active }); if (r.success) load(); }
    catch(e:any){ toast.error(e?.message||'Erreur maj'); }
  };

  const remove = async (id:number) => {
    if (!confirm('Supprimer cette banque ?')) return;
    try { const r = await api.deletePaymentMethod(id); if (r.success) { toast.success('Supprimée'); load(); } }
    catch(e:any){ toast.error(e?.message||'Erreur suppression'); }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-serif">
      <div className="bg-yellow-500 text-white p-4 flex items-center">
        <button onClick={()=>onNavigate('admin-dashboard' as ScreenType)} className="mr-3"><ArrowLeft className="w-6 h-6"/></button>
        <div>
          <h1 className="text-xl font-bold">Méthodes de paiement (banques)</h1>
          <p className="text-yellow-100 text-sm">Ajouter / activer / supprimer</p>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-lg p-4 shadow mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">Ajouter une banque</h2>
          <div className="grid md:grid-cols-5 gap-2">
            <input placeholder="Nom de la banque" value={form.bank_name} onChange={e=>setForm({...form, bank_name:e.target.value})} className="px-3 py-2 border rounded"/>
            <input placeholder="Titulaire" value={form.account_holder} onChange={e=>setForm({...form, account_holder:e.target.value})} className="px-3 py-2 border rounded"/>
            <input placeholder="N° compte / Référence" value={form.account_number} onChange={e=>setForm({...form, account_number:e.target.value})} className="px-3 py-2 border rounded"/>
            <input placeholder="Pays (ex: CI, TG)" value={form.country} onChange={e=>setForm({...form, country:e.target.value})} className="px-3 py-2 border rounded"/>
            <input placeholder="Dépôt minimum" type="number" value={form.min_deposit} onChange={e=>setForm({...form, min_deposit:e.target.value})} className="px-3 py-2 border rounded"/>
          </div>
          <motion.button whileTap={{scale:.98}} disabled={saving} onClick={add} className="mt-3 inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"><Plus className="w-4 h-4 mr-2"/>{saving?'Ajout...':'Ajouter'}</motion.button>
        </div>

        {/* Liste */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Chargement...</div>
          ) : banks.length===0 ? (
            <div className="bg-white rounded p-4 text-gray-400 text-sm">Aucune banque.</div>
          ) : banks.map(b => (
            <div key={b.id} className="bg-white rounded p-4 shadow flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">{b.bank_name}</div>
                <div className="text-xs text-gray-600">{b.account_holder} — {b.account_number}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>toggle(b)} className={`px-3 py-1 rounded text-white ${b.is_active?'bg-green-500':'bg-gray-400'}`}>{b.is_active?'Actif':'Inactif'}</button>
                <button onClick={()=>remove(b.id)} className="px-3 py-1 rounded bg-red-500 text-white flex items-center"><Trash2 className="w-4 h-4 mr-1"/>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsManagement;
