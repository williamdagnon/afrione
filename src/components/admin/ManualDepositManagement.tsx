import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import api from "../../services/api";
import { ScreenType } from "../../App";

interface ManualDepositManagementProps {
  onNavigate: (screen: ScreenType) => void;
}

const ManualDepositManagement: React.FC<ManualDepositManagementProps> = ({ onNavigate }) => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    const resp = await api.getManualDepositsAdmin();
    if (resp.success && resp.data) {
      setDeposits(resp.data);
    }
    setLoading(false);
  };

  const approveDeposit = async (id: number) => {
    if (!window.confirm("Appouver et créditer ce dépôt ?")) return;
    setProcessing(id);
    const resp = await api.approveManualDeposit(id);
    if (resp.success) toast.success("Dépôt validé et crédité");
    else toast.error(resp.message || "Erreur"), await loadDeposits();
    setProcessing(null);
    loadDeposits();
  };

  const rejectDeposit = async (id: number) => {
    const reason = prompt("Motif/refus admin :");
    if (!reason) return;
    setProcessing(id);
    const resp = await api.rejectManualDeposit(id, reason);
    if (resp.success) toast.success("Dépôt rejeté");
    else toast.error(resp.message || "Erreur");
    setProcessing(null);
    loadDeposits();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">Gestion dépôts manuels</h2>
        <button onClick={() => onNavigate("admin-dashboard" as ScreenType)} className="bg-yellow-400 text-white px-4 py-2 rounded-lg">Dashboard</button>
      </div>
      {loading ? (<div className="p-8 text-center">Chargement dépôts ...</div>) : (
        <div className="p-4 space-y-4">
          {deposits.length === 0 ? <div>Aucun dépôt.</div> : (
            deposits.map(dep => (
              <motion.div key={dep.id} className="bg-gray-50 rounded-xl shadow p-6 border-l-4 border-yellow-400">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-yellow-700">Statut : {dep.status}</h3>
                    {dep.status === 'completed' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    {dep.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                    {dep.status === 'pending' && <Clock className="w-5 h-5 text-orange-500" />}
                    {dep.status === 'approved' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div><b>Utilisateur:</b> {dep.user_name} <span className="text-gray-400 text-sm">({dep.phone})</span></div>
                  <div className="text-sm text-gray-500">Envoyé le {new Date(dep.created_at).toLocaleString('fr')}</div>
                </div>
                <div className="bg-blue-50 rounded p-3 mb-3 border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">💳 Méthode de paiement :</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><b>Banque :</b> {dep.bank_name}</div>
                    <div><b>Titulaire :</b> {dep.account_holder}</div>
                    <div><b>RIB :</b> {dep.account_number}</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded p-3 mb-3 border border-green-200">
                  <p className="font-semibold text-green-900 mb-2">💰 Dépôt effectué :</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><b>Montant :</b> <span className="text-green-700 font-bold">{dep.amount.toLocaleString()} FCFA</span></div>
                    <div><b>N° Dépôt:</b> {dep.deposit_number}</div>
                    <div><b>ID Transaction:</b> {dep.transaction_id}</div>
                  </div>
                </div>
                {dep.admin_note && <div className="mt-2 text-red-700">Note admin: {dep.admin_note}</div>}
                {dep.status === "pending" && (
                  <div className="flex gap-3 mt-3">
                    <button disabled={processing===dep.id} 
                      className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => approveDeposit(dep.id)}>
                      {processing===dep.id? 'Validation...' : 'Approuver & Créditer'}
                    </button>
                    <button disabled={processing===dep.id} 
                      className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => rejectDeposit(dep.id)}>
                      Refuser
                    </button>
                  </div>
                )}
                {dep.status!=="pending" && (
                  <div className="mt-2 text-sm text-gray-500">Traitée le {new Date(dep.processed_at).toLocaleString('fr')}</div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ManualDepositManagement;
