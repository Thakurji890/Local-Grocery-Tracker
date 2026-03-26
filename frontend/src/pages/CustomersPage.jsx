import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { customerAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/gst';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerAPI.search({ search, page, limit: LIMIT });
      setCustomers(res.data.customers);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(() => setPage(1), 400); return () => clearTimeout(t); }, [search]);

  const openCustomer = async (id) => {
    try {
      const res = await customerAPI.getById(id);
      setSelected(res.data.customer);
    } catch { toast.error('Failed to load customer'); }
  };

  return (
    <div className="page-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>👥 Customers</h1>
          <p className="text-muted text-sm">{total} registered customers</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="input" placeholder="Search by name or phone number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? <div className="page-loader"><div className="spinner" /></div>
        : customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No customers found</div>
            <p className="text-sm text-muted">Customers are created automatically when a phone number is entered during billing.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total Purchases</th>
                  <th>Total Spent</th>
                  <th>Last Visit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td className="font-mono">{c.phone}</td>
                    <td className="font-mono">{c.totalPurchases} bills</td>
                    <td className="font-mono" style={{ fontWeight: 600 }}>{formatCurrency(c.totalSpent)}</td>
                    <td style={{ fontSize: 12 }}>{c.lastVisit ? formatDate(c.lastVisit) : '—'}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openCustomer(c._id)}>👁️ History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > LIMIT && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 0', borderTop: '1px solid var(--border)', marginTop: 12 }}>
            <span className="text-sm text-muted">Showing {Math.min((page-1)*LIMIT+1, total)}–{Math.min(page*LIMIT, total)} of {total}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-outline btn-sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
              <button className="btn btn-outline btn-sm" disabled={page*LIMIT>=total} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">👤 {selected.name || 'Customer'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>📞 {selected.phone}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--saffron)' }}>{selected.totalPurchases}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total Bills</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--forest)' }}>{formatCurrency(selected.totalSpent)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total Spent</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--info)' }}>{selected.lastVisit ? formatDate(selected.lastVisit) : '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Last Visit</div>
                </div>
              </div>

              {/* Bill History */}
              <div className="card-title">Purchase History</div>
              {selected.bills?.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>No bills yet</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Bill No.</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {selected.bills?.map(b => (
                        <tr key={b._id}>
                          <td className="font-mono" style={{ fontSize: 12 }}>{b.billNumber}</td>
                          <td style={{ fontSize: 12 }}>{formatDate(b.createdAt)}</td>
                          <td className="font-mono" style={{ fontWeight: 600 }}>{formatCurrency(b.grandTotal)}</td>
                          <td><span className="badge badge-muted">{b.paymentMode}</span></td>
                          <td><span className={`badge ${b.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
