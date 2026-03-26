import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { productAPI } from '../services/api';
import { GST_RATES, formatCurrency } from '../utils/gst';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Grains & Pulses','Dairy','Beverages','Snacks','Spices','Oils & Ghee','Personal Care','Cleaning','Vegetables','Fruits','Packaged Food','Other'];
const UNITS = ['pcs','kg','g','L','ml','pack','dozen','box'];

const EMPTY_FORM = { name:'', category:'', barcode:'', mrp:'', sellingPrice:'', gstRate:0, stock:'', lowStockThreshold:10, unit:'pcs', priceIncludesGst:true, description:'' };

export default function ProductsPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('admin','staff');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ search, category, lowStock: lowStock || undefined, page, limit: LIMIT });
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [search, category, lowStock, page]);

  useEffect(() => { load(); }, [load]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (p) => {
    setForm({ name:p.name, category:p.category, barcode:p.barcode||'', mrp:p.mrp, sellingPrice:p.sellingPrice, gstRate:p.gstRate, stock:p.stock, lowStockThreshold:p.lowStockThreshold, unit:p.unit, priceIncludesGst:p.priceIncludesGst, description:p.description||'' });
    setModal({ type:'edit', id:p._id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'add') {
        await productAPI.create(form);
        toast.success('Product added!');
      } else {
        await productAPI.update(modal.id, form);
        toast.success('Product updated!');
      }
      setModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await productAPI.delete(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ fontSize:18, fontWeight:700 }}>📦 Product Management</h1>
          <p className="text-muted text-sm">{total} products in inventory</p>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 180px 180px auto', gap:12, alignItems:'end' }}>
          <div className="input-group">
            <label className="input-label">Search</label>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input className="input" placeholder="Search by name or barcode..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Stock Filter</label>
            <select className="select" value={lowStock} onChange={e => { setLowStock(e.target.value === 'true'); setPage(1); }}>
              <option value="">All Products</option>
              <option value="true">⚠️ Low Stock Only</option>
            </select>
          </div>
          <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory(''); setLowStock(false); setPage(1); }}>Clear</button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No products found</div>
            <p>{canEdit ? 'Click "Add Product" to get started.' : 'No products match your filters.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>MRP</th>
                  <th>Sell Price</th>
                  <th>GST</th>
                  <th>Stock</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight:600 }}>{p.name}</div>
                      {p.barcode && <div style={{ fontSize:11, color:'var(--muted)', fontFamily:'var(--font-mono)' }}>#{p.barcode}</div>}
                    </td>
                    <td><span className="badge badge-muted">{p.category}</span></td>
                    <td className="font-mono">{formatCurrency(p.mrp)}</td>
                    <td className="font-mono" style={{ fontWeight:600 }}>{formatCurrency(p.sellingPrice)}</td>
                    <td>
                      {p.gstRate > 0
                        ? <span className="gst-tag">{p.gstRate}%</span>
                        : <span style={{ color:'var(--muted)', fontSize:12 }}>Nil</span>}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span className={`font-mono ${p.stock <= p.lowStockThreshold ? 'text-danger' : ''}`} style={{ fontWeight:600 }}>
                          {p.stock} {p.unit}
                        </span>
                        {p.stock <= p.lowStockThreshold && <span className="badge badge-warning">Low</span>}
                      </div>
                    </td>
                    {canEdit && (
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p._id)}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0 0', borderTop:'1px solid var(--border)', marginTop:12 }}>
            <span className="text-sm text-muted">Showing {Math.min((page-1)*LIMIT+1, total)}–{Math.min(page*LIMIT, total)} of {total}</span>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-outline btn-sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
              <button className="btn btn-outline btn-sm" disabled={page*LIMIT>=total} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? '➕ Add Product' : '✏️ Edit Product'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom:14 }}>
                  <div className="input-group" style={{ gridColumn:'span 2' }}>
                    <label className="input-label">Product Name *</label>
                    <input className="input" value={form.name} onChange={f('name')} required placeholder="e.g. Amul Butter 100g" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Category *</label>
                    <select className="select" value={form.category} onChange={f('category')} required>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Unit</label>
                    <select className="select" value={form.unit} onChange={f('unit')}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">MRP (₹) *</label>
                    <input className="input" type="number" step="0.01" min="0" value={form.mrp} onChange={f('mrp')} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Selling Price (₹) *</label>
                    <input className="input" type="number" step="0.01" min="0" value={form.sellingPrice} onChange={f('sellingPrice')} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">GST Rate *</label>
                    <select className="select" value={form.gstRate} onChange={f('gstRate')}>
                      {GST_RATES.map(r => <option key={r} value={r}>{r === 0 ? 'Nil (0%)' : `${r}%`}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Barcode (optional)</label>
                    <input className="input" value={form.barcode} onChange={f('barcode')} placeholder="EAN / UPC barcode" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Stock Quantity *</label>
                    <input className="input" type="number" min="0" value={form.stock} onChange={f('stock')} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Low Stock Alert At</label>
                    <input className="input" type="number" min="0" value={form.lowStockThreshold} onChange={f('lowStockThreshold')} />
                  </div>
                  <div className="input-group" style={{ gridColumn:'span 2' }}>
                    <label className="input-label">Description (optional)</label>
                    <textarea className="input" rows={2} value={form.description} onChange={f('description')} style={{ resize:'vertical' }} />
                  </div>
                  <div style={{ gridColumn:'span 2' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13 }}>
                      <input type="checkbox" checked={form.priceIncludesGst} onChange={f('priceIncludesGst')} />
                      Selling price is GST-inclusive (most common for kirana stores)
                    </label>
                  </div>
                </div>

                {form.gstRate > 0 && form.sellingPrice && (
                  <div className="alert alert-info" style={{ fontSize:12 }}>
                    ℹ️ At ₹{form.sellingPrice} {form.priceIncludesGst ? '(GST included)' : '(+ GST)'} with {form.gstRate}% GST:
                    CGST = {form.gstRate/2}%, SGST = {form.gstRate/2}%
                    {form.priceIncludesGst && ` | Base price ≈ ₹${(form.sellingPrice / (1 + form.gstRate/100)).toFixed(2)}`}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" /> Saving...</> : modal === 'add' ? '+ Add Product' : '✓ Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth:380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">🗑️ Delete Product?</div></div>
            <div className="modal-body">
              <p style={{ fontSize:13 }}>This will deactivate the product. It won't appear in billing or inventory. Existing bills won't be affected.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
