import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import api, { Product } from '../../services/api';
import { ScreenType } from '../../App';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProductManagementProps {
  onNavigate: (screen: ScreenType) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    duration_days: '',
    daily_revenue: '',
    total_revenue: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        duration: product.duration,
        duration_days: product.duration_days?.toString() || '',
        daily_revenue: product.daily_revenue.toString(),
        total_revenue: product.total_revenue.toString(),
        image: product.image,
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        duration: '',
        duration_days: '',
        daily_revenue: '',
        total_revenue: '',
        image: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.duration_days) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration: formData.duration,
        duration_days: parseInt(formData.duration_days),
        daily_revenue: parseFloat(formData.daily_revenue),
        total_revenue: parseFloat(formData.total_revenue),
        image: formData.image,
        description: formData.description
      };

      let response;
      if (editingProduct) {
        response = await api.updateProduct(editingProduct.id, data);
      } else {
        response = await api.createProduct(data);
      }

      if (response.success) {
        toast.success(editingProduct ? 'Produit mis à jour' : 'Produit créé');
        setShowModal(false);
        loadProducts();
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde produit:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Confirmer la suppression de ce produit ?')) return;

    try {
      const response = await api.deleteProduct(productId);
      if (response.success) {
        toast.success('Produit supprimé');
        loadProducts();
      }
    } catch (error: any) {
      console.error('Erreur suppression produit:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-serif pb-20">
      {/* Header */}
      <div className="bg-yellow-500 text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <button onClick={() => onNavigate('admin-dashboard' as ScreenType)} className="mr-3">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Gestion des produits</h1>
              <p className="text-yellow-100 text-sm">{products.length} produit(s)</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className="bg-white text-yellow-500 p-2 rounded-full shadow-lg hover:bg-yellow-50"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Products List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun produit
          </div>
        ) : (
          products.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-4 shadow"
            >
              <div className="flex items-start gap-3">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-yellow-600 font-bold text-lg">{product.price.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {product.is_active ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Durée :</span>
                      <span>{product.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenus quotidiens :</span>
                      <span>{product.daily_revenue.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenus totaux :</span>
                      <span>{product.total_revenue.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 bg-blue-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center justify-center"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full my-8"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours) *</label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (texte)</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="ex: 120 jours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenus quotidiens</label>
                  <input
                    type="number"
                    value={formData.daily_revenue}
                    onChange={(e) => setFormData({ ...formData, daily_revenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenus totaux</label>
                  <input
                    type="number"
                    value={formData.total_revenue}
                    onChange={(e) => setFormData({ ...formData, total_revenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600"
              >
                {editingProduct ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

