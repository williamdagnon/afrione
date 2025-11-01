import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../App';
import api from '../services/api';

interface TaskCenterScreenProps { onNavigate: (screen: ScreenType)=>void; }

const TaskCenterScreen: React.FC<TaskCenterScreenProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); },[]);
  const load = async()=>{
    setLoading(true);
    try { const r = await api.getUserProducts(); if(r.success&&r.data) setItems(r.data); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white font-serif">
      <div className="flex items-center p-4 border-b">
        <button onClick={()=>onNavigate('home')} className="mr-3"><ArrowLeft className="w-6 h-6 text-gray-600"/></button>
        <h1 className="text-lg font-semibold text-yellow-600">Centre des tâches</h1>
      </div>
      <div className="p-4">
        {loading ? (<div className="text-center text-gray-500 py-10">Chargement...</div>) : items.length===0 ? (
          <div className="text-center text-gray-400 py-10">Aucun produit actif</div>
        ) : (
          <div className="space-y-3">
            {items.map((p:any)=> (
              <div key={p.id} className="border rounded-lg p-4 bg-yellow-50">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{p.product_name || p.name}</div>
                    <div className="text-xs text-gray-600">Durée: {p.duration_days} jours</div>
                    <div className="text-xs text-gray-600">Statut: {p.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold">+{p.daily_revenue} FCFA / jour</div>
                    <div className="text-gray-700 text-sm">Total: {p.total_revenue} FCFA</div>
                    <div className="text-xs text-gray-500">Prochain gain: {p.next_payout_date}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Du {p.start_date} au {p.end_date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCenterScreen;
