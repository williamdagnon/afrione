import React, { useEffect, useState } from 'react';
import { Eye, StopCircle, Play } from 'lucide-react';
import api from '../../services/api';
import { ScreenType } from '../../App';
import toast from 'react-hot-toast';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

interface UserProductRow {
  id: number;
  user_id: number;
  product_id: number;
  product_name?: string;
  purchase_price?: number;
  earned_so_far?: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  purchase_id?: number | null;
  user_display_name?: string | null;
  user_phone?: string | null;
}

const AdminUserProducts: React.FC<Props> = ({ onNavigate }) => {
  const [rows, setRows] = useState<UserProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState<number | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const params: Record<string, number | string> = { limit, offset };
      
      if (statusFilter) params.status = statusFilter;
      if (userSearchTerm) params.user_id = userSearchTerm;
      if (productSearchTerm) params.product_id = productSearchTerm;

      console.log('📊 Appel API avec params:', params);

      const res = await api.getAdminUserProducts(params as Parameters<typeof api.getAdminUserProducts>[0]);
      console.log('📊 Réponse API:', res);
      
      if (res.success && res.data) {
        setRows(res.data || []);
        const resAny = res as unknown as Record<string, unknown>;
        if (typeof resAny.total === 'number') {
          setTotal(resAny.total);
        }
      } else {
        toast.error(res.message || 'Erreur chargement produits utilisateur');
      }
    } catch (err) {
      console.error('Erreur getAdminUserProducts', err);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, userSearchTerm, productSearchTerm]);

  const handleStop = async (id: number) => {
    if (!window.confirm('Confirmer l\'arrêt du produit pour cet utilisateur ? (Pas de remboursement par défaut)')) return;
    try {
      const res = await api.adminStopUserProduct(id);
      if (res.success) {
        toast.success('Produit arrêté');
        await load();
      } else {
        toast.error(res.message || 'Échec');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleReactivate = async (id: number) => {
    if (!window.confirm('Confirmer la réactivation du produit pour cet utilisateur ?')) return;
    try {
      const res = await api.adminReactivateUserProduct(id);
      if (res.success) {
        toast.success('Produit réactivé');
        await load();
      } else {
        toast.error(res.message || 'Échec');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setUserSearchTerm('');
    setProductSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters = statusFilter || userSearchTerm || productSearchTerm;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des produits utilisateurs</h1>
          <p className="text-sm text-gray-600">Liste complète des user_products avec actions administrateur</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('admin-dashboard')} className="px-3 py-2 bg-white rounded shadow">Retour</button>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 bg-white rounded shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Rechercher par utilisateur</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
            >
              Réinitialiser filtres
            </button>
          )}
        </div>

        {/* Champ principal: Recherche par téléphone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone utilisateur *</label>
          <input
            type="text"
            placeholder="Ex: 22513739186, +22513739186"
            value={userSearchTerm}
            onChange={(e) => {
              setUserSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border-2 border-yellow-400 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">Recherche principale : tapez le numéro de téléphone de l'utilisateur</p>
        </div>

        {/* Filtres secondaires */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-gray-600 hover:text-gray-800 mb-3"
        >
          {showFilters ? '▼' : '▶'} Filtres supplémentaires
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t">
            {/* Filtre Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut du produit</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring"
              >
                <option value="">-- Tous les statuts --</option>
                <option value="active">Active</option>
                <option value="completed">Complétée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            {/* Recherche Produit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produit (ID ou nom)</label>
              <input
                type="text"
                placeholder="Ex: 1, Gold"
                value={productSearchTerm}
                onChange={(e) => {
                  setProductSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded shadow overflow-auto">
        {/* Debug Info */}
        <div className="bg-gray-50 p-2 border-b text-xs text-gray-600">
          Page: {page} | Statut: {statusFilter || 'tous'} | User: {userSearchTerm || 'tous'} | Produit: {productSearchTerm || 'tous'} | Résultats: {rows.length}
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Produit</th>
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Gains</th>
              <th className="p-3">Début</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="p-4">Chargement...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={8} className="p-4">Aucun produit trouvé</td></tr>
            )}
            {!loading && rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.product_name || `#${r.product_id}`}</td>
                <td className="p-3">{r.user_display_name || r.user_phone || r.user_id}</td>
                <td className="p-3">{(r.purchase_price || 0).toLocaleString()}</td>
                <td className="p-3">{(r.earned_so_far || 0).toLocaleString()}</td>
                <td className="p-3">{r.start_date ? new Date(r.start_date).toLocaleString() : '-'}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button title="Détails utilisateur" className="px-2 py-1 bg-gray-50 rounded" onClick={() => {
                      if (r.user_id) onNavigate('admin-users');
                    }}><Eye className="w-4 h-4" /></button>
                    {r.status !== 'cancelled' && (
                      <button title="Arrêter" onClick={() => handleStop(r.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded flex items-center gap-1"><StopCircle className="w-4 h-4" />Arrêter</button>
                    )}
                    {r.status === 'cancelled' && (
                      <button title="Réactiver" onClick={() => handleReactivate(r.id)} className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1"><Play className="w-4 h-4" />Réactiver</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination simple */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {page}{total ? ` - total ${total}` : ''}</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-white rounded shadow">Préc</button>
          <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-white rounded shadow">Suiv</button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProducts;
