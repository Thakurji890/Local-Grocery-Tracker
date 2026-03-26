import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { billAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/gst';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  completed: 'badge-success',
  cancelled: 'badge-danger',
  refunded: 'badge-warning',
};

export default function BillsPage() {
  const { hasRole } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billAPI.getAll({ page, limit: LIMIT, startDate, endDate, paymentMode, status, search });
      setBills(res.data.bills);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [page, startDate, endDate, paymentMode, status, search]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    try {
      await billAPI.cancel(cancelModal, cancelReason);
      toast.success('Bill cancelled');
      setCancelModal(null);
      setCancelReason('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
  };

  const openBill = async (id) => {
    try {
      const res = await billAPI.getById(id);
      setSelected(res.data.bill);
    } catch { toast.error('Failed to load bill'); }
  };

  return (
    <div className="page-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>📋 Bills History</h1>
          <p className="text-muted text-sm">{total} total bills</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, alignItems: 'end' }}>
          <div className="input-group">
            <label className="input-label">Search Bill No.</label>
            <input className="input" placeholder="BILL-..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="input-group">
            <label className="input-label">From Date</label>
            <input className="input" type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
          </div>
          <div className="input-group">
            <label className="input-label">To Date</label>
            <input className="input" type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Payment</label>
            <select className="select" value={paymentMode} onChange={e => { setPaymentMode(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Status</label>
            <select className="select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="btn btn-outline" onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setPaymentMode(''); setStatus(''); setPage(1); }}>Clear</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : bills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No bills found</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>GST</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 600, fontSize: 12 }}>{b.billNumber}</span>
                      {b.staffName && <div style={{ fontSize: 11, color: 'var(--muted)' }}>by {b.staffName}</div>}
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDateTime(b.createdAt)}</td>
                    <td style={{ fontSize: 12 }}>{b.customerName || <span style={{ color: 'var(--muted)' }}>Walk-in</span>}
                      {b.customerPhone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.customerPhone}</div>}
                    </td>
                    <td className="font-mono">{b.items?.length || 0} items</td>
                    <td className="font-mono" style={{ fontSize: 12, color: 'var(--forest)' }}>{formatCurrency(b.totalGst)}</td>
                    <td className="font-mono" style={{ fontWeight: 700 }}>{formatCurrency(b.grandTotal)}</td>
                    <td>
                      <span className={`badge ${b.paymentMode === 'upi' ? 'badge-info' : 'badge-success'}`}>
                        {b.paymentMode === 'upi' ? '📱' : '💵'} {b.paymentMode?.toUpperCase()}
                      </span>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-muted'}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openBill(b._id)}>👁️ View</button>
                        {hasRole('admin', 'authority') && b.status === 'completed' && (
                          <button className="btn btn-danger btn-sm" onClick={() => setCancelModal(b._id)}>✕</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 0', borderTop: '1px solid var(--border)', marginTop: 12 }}>
            <span className="text-sm text-muted">Showing {Math.min((page-1)*LIMIT+1, total)}–{Math.min(page*LIMIT, total)} of {total}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button className="btn btn-outline btn-sm" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">🧾 {selected.billNumber}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDateTime(selected.createdAt)}</div>
              </div>
              <span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
            </div>
            <div className="modal-body">
              {/* Customer Info */}
              {(selected.customerName || selected.customerPhone) && (
                <div className="alert alert-info" style={{ marginBottom: 12, fontSize: 12 }}>
                  👤 {selected.customerName || 'Walk-in'} {selected.customerPhone && `| 📞 ${selected.customerPhone}`}
                </div>
              )}

              {/* Items Table */}
              <table style={{ width: '100%', marginBottom: 12 }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>GST</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{item.productName}</td>
                      <td className="font-mono">{item.quantity} {item.unit}</td>
                      <td className="font-mono">{formatCurrency(item.sellingPrice)}</td>
                      <td>
                        {item.gstRate > 0 ? (
                          <div>
                            <span className="gst-tag">{item.gstRate}%</span>
                            <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                              CGST: ₹{item.cgstAmount?.toFixed(2)} | SGST: ₹{item.sgstAmount?.toFixed(2)}
                            </div>
                          </div>
                        ) : <span style={{ color: 'var(--muted)', fontSize: 12 }}>Nil</span>}
                      </td>
                      <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 'var(--radius)', fontSize: 13 }}>
                <div className="bill-row"><span className="label">Subtotal (excl. GST)</span><span className="amount">{formatCurrency(selected.subtotal)}</span></div>
                {selected.totalCgst > 0 && <>
                  <div className="bill-row gst"><span className="label">CGST</span><span className="amount">+ {formatCurrency(selected.totalCgst)}</span></div>
                  <div className="bill-row gst"><span className="label">SGST</span><span className="amount">+ {formatCurrency(selected.totalSgst)}</span></div>
                </>}
                {selected.billDiscountAmount > 0 && (
                  <div className="bill-row" style={{ color: 'var(--success)' }}><span>Bill Discount ({selected.billDiscountPercent}%)</span><span>− {formatCurrency(selected.billDiscountAmount)}</span></div>
                )}
                {selected.roundOff !== 0 && <div className="bill-row"><span className="label">Round Off</span><span className="amount">{formatCurrency(selected.roundOff)}</span></div>}
                <div className="bill-row total"><span>GRAND TOTAL</span><span>{formatCurrency(selected.grandTotal)}</span></div>
                <div className="bill-row"><span className="label">Payment</span><span>{selected.paymentMode?.toUpperCase()}</span></div>
                {selected.upiTransactionId && <div className="bill-row"><span className="label">UPI Txn ID</span><span className="font-mono" style={{ fontSize: 11 }}>{selected.upiTransactionId}</span></div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-forest" onClick={() => { generateReceiptPDF(selected); toast.success('PDF downloaded!'); }}>
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">❌ Cancel Bill</div></div>
            <div className="modal-body">
              <p style={{ fontSize: 13, marginBottom: 12 }}>This will cancel the bill and restore inventory stock. This cannot be undone.</p>
              <div className="input-group">
                <label className="input-label">Reason for Cancellation</label>
                <textarea className="input" rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Enter reason..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCancelModal(null)}>Back</button>
              <button className="btn btn-danger" onClick={handleCancel}>Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
