import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  Search, 
  X, 
  AlertCircle,
  Hash,
  Tag,
  Percent
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    gstRate: '12',
    stockQuantity: '',
    barcode: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5500/api/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, price: Number(formData.price), stockQuantity: Number(formData.stockQuantity) };
      if (editingProduct) {
        await axios.put(`http://localhost:5500/api/products/${editingProduct._id}`, payload);
        toast.success('Product updated');
      } else {
        await axios.post('http://localhost:5500/api/products', payload);
        toast.success('Product added');
      }
      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product permanently?')) {
      try {
        await axios.delete(`http://localhost:5500/api/products/${id}`);
        toast.success('Product removed');
        fetchProducts();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      gstRate: product.gstRate,
      stockQuantity: product.stockQuantity,
      barcode: product.barcode || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      gstRate: '12',
      stockQuantity: '',
      barcode: ''
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Vault</h2>
          <p className="text-slate-400 font-bold mt-1 text-[10px] uppercase tracking-[0.2em]">Manage catalog items and stock levels</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Filter products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input pl-12 !py-3 !w-64"
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="premium-btn bg-primary text-white p-3.5 rounded-2xl shadow-glow flex items-center gap-2 font-bold text-sm tracking-tight"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="glass-card p-6 rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500 border-white/50 border-2 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-glow">
                  <Package size={24} />
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(product)} className="p-2.5 text-slate-400 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="p-2.5 text-slate-400 border border-slate-100 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category:</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full">{product.category}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Unit Price</p>
                  <p className="text-xl font-black text-slate-800">₹{product.price}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${product.stockQuantity < 10 ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${product.stockQuantity < 10 ? 'text-red-400' : 'text-emerald-500'}`}>Current Stock</p>
                  <p className={`text-xl font-black ${product.stockQuantity < 10 ? 'text-red-600' : 'text-emerald-700'}`}>{product.stockQuantity}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                <span className="flex items-center gap-1"><Hash size={10} /> {product.barcode || 'NO-BARCODE'}</span>
                <span className="flex items-center gap-1"><Percent size={10} /> GST: {product.gstRate}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 border-white/60">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-2xl"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8">
              {editingProduct ? 'Update Product Node' : 'Initialize New Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Product Identity</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="premium-input !rounded-[1.5rem] !py-4" placeholder="Parle-G 800g" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Category Type</label>
                  <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="premium-input !rounded-[1.5rem] !py-4" placeholder="Biscuits" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Price (₹)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="premium-input !rounded-[1.5rem] !py-4" placeholder="25" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Quantity</label>
                  <input type="number" required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="premium-input !rounded-[1.5rem] !py-4" placeholder="100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">GST Rate (%)</label>
                  <select value={formData.gstRate} onChange={e => setFormData({...formData, gstRate: e.target.value})} className="premium-input !rounded-[1.5rem] !py-4 cursor-pointer !bg-white">
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Barcode / SKU</label>
                <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="premium-input !rounded-[1.5rem] !py-4" placeholder="8901234567890" />
              </div>

              <button type="submit" className="w-full premium-btn bg-primary text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-emerald-600 transition-all text-sm mt-4">
                {editingProduct ? 'Commit Changes' : 'Finalize Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
