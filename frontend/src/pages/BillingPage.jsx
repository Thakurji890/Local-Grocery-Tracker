import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { productAPI, billAPI, customerAPI } from '../services/api';
import { processBill, formatCurrency } from '../utils/gst';
import { generateReceiptPDF } from '../utils/pdfGenerator';

const PAYMENT_MODES = [
  { id: 'cash', label: '💵 Cash', icon: '💵' },
  { id: 'upi',  label: '📱 UPI',  icon: '📱' },
];

export default function BillingPage() {
  // ── Cart State ──
  const [cart, setCart] = useState([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');

  // ── Customer ──
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // ── Product Search ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // ── UI State ──
  const [submitting, setSubmitting] = useState(false);
  const [lastBill, setLastBill] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerSug, setShowCustomerSug] = useState(false);

  // ── Computed totals ──
  const totals = processBill(cart, billDiscount);
  const change = paymentMode === 'cash' && amountPaid ? Math.max(0, parseFloat(amountPaid) - totals.grandTotal) : 0;

  // ── Product search ──
  const searchProducts = useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); setShowResults(false); return; }
    try {
      const res = await productAPI.getAll({ search: q, limit: 8 });
      setSearchResults(res.data.products);
      setShowResults(true);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchProducts(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, searchProducts]);

  // ── Customer phone lookup ──
  useEffect(() => {
    if (customerPhone.length >= 3) {
      customerAPI.search({ search: customerPhone, limit: 4 }).then(res => {
        setCustomerSuggestions(res.data.customers);
        setShowCustomerSug(res.data.customers.length > 0);
      }).catch(() => {});
    } else {
      setShowCustomerSug(false);
    }
  }, [customerPhone]);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // ── Barcode scan (keyboard Enter on barcode input) ──
  const handleBarcodeSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      try {
        const res = await productAPI.getByBarcode(searchQuery.trim());
        addToCart(res.data.product);
        setSearchQuery('');
        setShowResults(false);
      } catch {
        // Not a barcode, treat as text search result
      }
    }
  };

  // ── Cart operations ──
  const addToCart = (product) => {
    if (product.stock === 0) { toast.error('Out of stock!'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error('Insufficient stock'); return prev; }
        return prev.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        productId: product._id,
        productName: product.name,
        barcode: product.barcode,
        category: product.category,
        sellingPrice: product.sellingPrice,
        mrp: product.mrp,
        gstRate: product.gstRate,
        priceIncludesGst: product.priceIncludesGst,
        unit: product.unit,
        maxStock: product.stock,
        quantity: 1,
        discountPercent: 0,
      }];
    });
    setSearchQuery('');
    setShowResults(false);
    toast.success(`${product.name} added ✓`, { duration: 1200 });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty < 1) return i;
      if (newQty > i.maxStock) { toast.error('Insufficient stock'); return i; }
      return { ...i, quantity: newQty };
    }));
  };

  const removeItem = (productId) => setCart(prev => prev.filter(i => i.productId !== productId));

  const updateItemDiscount = (productId, val) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, discountPercent: Math.min(100, Math.max(0, parseFloat(val) || 0)) } : i));
  };

  // ── Submit bill ──
  const handleSubmit = async () => {
    if (cart.length === 0) { toast.error('Add items to the cart first'); return; }
    if (paymentMode === 'upi' && !upiTxnId.trim()) {
      toast.error('Enter UPI transaction ID'); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, sellingPrice: i.sellingPrice, discountPercent: i.discountPercent })),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        paymentMode,
        billDiscountPercent: billDiscount,
        amountPaid: paymentMode === 'cash' ? parseFloat(amountPaid) || totals.grandTotal : totals.grandTotal,
        upiTransactionId: upiTxnId || undefined,
      };
      const res = await billAPI.create(payload);
      setLastBill(res.data.bill);
      setShowReceipt(true);
      // Reset cart
      setCart([]);
      setBillDiscount(0);
      setCustomerName('');
      setCustomerPhone('');
      setAmountPaid('');
      setUpiTxnId('');
      toast.success(`Bill ${res.data.bill.billNumber} created! ₹${res.data.bill.grandTotal}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setSubmitting(false);
    }
  };

  const UPI_LINK = `upi://pay?pa=${import.meta.env.VITE_UPI_ID || 'shopname@upi'}&pn=${encodeURIComponent(import.meta.env.VITE_STORE_NAME || 'Store')}&am=${totals.grandTotal}&cu=INR`;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>🧾 Billing — POS</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {cart.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={() => { if (window.confirm('Clear cart?')) setCart([]); }}>
              🗑️ Clear Cart
            </button>
          )}
        </div>
      </div>

      <div className="pos-layout">
        {/* ── LEFT: Product Search & Cart ── */}
        <div className="pos-left">
          {/* Product Search */}
          <div className="card mb-4" ref={searchRef} style={{ position: 'relative' }}>
            <div className="input-group">
              <label className="input-label">Search Product or Scan Barcode</label>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  className="input"
                  placeholder="Type product name or scan barcode (press Enter for barcode)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleBarcodeSearch}
                  autoFocus
                  style={{ paddingLeft: 34 }}
                />
              </div>
            </div>

            {showResults && searchResults.length > 0 && (
              <div className="product-search-result" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50 }}>
                {searchResults.map(p => (
                  <div key={p._id} className="product-search-item" onClick={() => addToCart(p)}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.category} {p.barcode ? `| #${p.barcode}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(p.sellingPrice)}</div>
                      <div style={{ fontSize: 11 }}>
                        {p.gstRate > 0 ? <span className="gst-tag">{p.gstRate}% GST</span> : <span style={{ color: 'var(--muted)' }}>Nil GST</span>}
                        {' '}
                        <span style={{ color: p.stock <= p.lowStockThreshold ? 'var(--danger)' : 'var(--success)', fontSize: 11 }}>
                          {p.stock} {p.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showResults && searchQuery && searchResults.length === 0 && (
              <div className="product-search-result" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50 }}>
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No products found for "{searchQuery}"</div>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="card">
            <div className="card-title">🛒 Cart {cart.length > 0 && `(${cart.length} items)`}</div>

            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
                <div className="empty-state-title">Cart is empty</div>
                <p className="text-sm text-muted">Search and add products above</p>
              </div>
            ) : (
              <>
                {cart.map(item => {
                  const itemTotal = item.sellingPrice * item.quantity * (1 - item.discountPercent / 100);
                  return (
                    <div key={item.productId} className="cart-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.productName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                          {formatCurrency(item.sellingPrice)} × {item.quantity}
                          {item.gstRate > 0 && <> | <span className="gst-tag">{item.gstRate}% GST</span></>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {/* Qty Control */}
                          <div className="qty-control">
                            <button className="qty-btn" onClick={() => item.quantity === 1 ? removeItem(item.productId) : updateQty(item.productId, -1)}>
                              {item.quantity === 1 ? '🗑️' : '−'}
                            </button>
                            <span className="qty-display">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQty(item.productId, 1)}>+</button>
                          </div>
                          {/* Per-item discount */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Disc%</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={e => updateItemDiscount(item.productId, e.target.value)}
                              style={{ width: 48, padding: '3px 6px', border: '1px solid var(--border-dark)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)', textAlign: 'center' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{formatCurrency(itemTotal)}</div>
                        {item.discountPercent > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--success)' }}>-{item.discountPercent}% off</div>
                        )}
                        <button
                          onClick={() => removeItem(item.productId)}
                          style={{ fontSize: 10, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
                        >Remove</button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Bill Summary & Checkout ── */}
        <div className="pos-right">
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Customer */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer (Optional)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                <input className="input" placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ fontSize: 13 }} />
                <input className="input" placeholder="Phone number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ fontSize: 13 }} />
                {showCustomerSug && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', zIndex: 20 }}>
                    {customerSuggestions.map(c => (
                      <div key={c._id}
                        onClick={() => { setCustomerName(c.name || ''); setCustomerPhone(c.phone || ''); setShowCustomerSug(false); }}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid var(--border)' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--saffron-faint)'}
                        onMouseOut={e => e.currentTarget.style.background = ''}
                      >
                        <strong>{c.name}</strong> — {c.phone}
                        <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{c.totalPurchases} purchases</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bill Discount */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bill Discount %</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[0, 5, 10].map(v => (
                    <button key={v} onClick={() => setBillDiscount(v)}
                      className={`btn btn-sm ${billDiscount === v ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '3px 8px', fontSize: 12 }}>
                      {v}%
                    </button>
                  ))}
                  <input
                    type="number" min="0" max="100" value={billDiscount}
                    onChange={e => setBillDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    style={{ width: 52, padding: '4px 6px', border: '1px solid var(--border-dark)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)', textAlign: 'center' }}
                  />
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="bill-summary" style={{ flex: 1, overflow: 'auto' }}>
              <div className="bill-row">
                <span className="label">Subtotal (excl. GST)</span>
                <span className="amount">{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.totalItemDiscount > 0 && (
                <div className="bill-row" style={{ color: 'var(--success)' }}>
                  <span>Item Discounts</span>
                  <span>− {formatCurrency(totals.totalItemDiscount)}</span>
                </div>
              )}
              {totals.billDiscountAmount > 0 && (
                <div className="bill-row" style={{ color: 'var(--success)' }}>
                  <span>Bill Discount ({billDiscount}%)</span>
                  <span>− {formatCurrency(totals.billDiscountAmount)}</span>
                </div>
              )}
              {totals.totalCgst > 0 && (
                <>
                  <div className="bill-row gst">
                    <span className="label">CGST ({cart[0]?.gstRate / 2 || ''}%)</span>
                    <span className="amount">+ {formatCurrency(totals.totalCgst)}</span>
                  </div>
                  <div className="bill-row gst">
                    <span className="label">SGST ({cart[0]?.gstRate / 2 || ''}%)</span>
                    <span className="amount">+ {formatCurrency(totals.totalSgst)}</span>
                  </div>
                </>
              )}
              {totals.totalGst === 0 && cart.length > 0 && (
                <div className="bill-row">
                  <span className="label">GST</span>
                  <span style={{ fontSize: 12, color: 'var(--success)' }}>Nil</span>
                </div>
              )}
              {totals.roundOff !== 0 && (
                <div className="bill-row">
                  <span className="label">Round Off</span>
                  <span className="amount">{totals.roundOff > 0 ? '+' : ''}{formatCurrency(totals.roundOff)}</span>
                </div>
              )}
              <div className="bill-row total">
                <span>GRAND TOTAL</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Mode */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {PAYMENT_MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMode(m.id)}
                    className={`btn ${paymentMode === m.id ? (m.id === 'upi' ? 'btn-primary' : 'btn-forest') : 'btn-outline'}`}
                    style={{ flex: 1 }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMode === 'cash' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    className="input"
                    type="number"
                    placeholder="Amount received (₹)"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}
                  />
                  {change > 0 && (
                    <div className="alert alert-success" style={{ fontSize: 13 }}>
                      💰 Return Change: <strong>{formatCurrency(change)}</strong>
                    </div>
                  )}
                </div>
              )}

              {paymentMode === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="alert alert-info" style={{ fontSize: 12 }}>
                    <div>📱 UPI ID: <strong>{import.meta.env.VITE_UPI_ID || 'shopname@upi'}</strong></div>
                    <a href={UPI_LINK} style={{ fontSize: 11, color: 'var(--info)' }} target="_blank" rel="noreferrer">▶ Open UPI App</a>
                  </div>
                  <input
                    className="input"
                    placeholder="UPI Transaction ID (required)"
                    value={upiTxnId}
                    onChange={e => setUpiTxnId(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div style={{ padding: '12px 16px' }}>
              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
              >
                {submitting
                  ? <><div className="spinner" /> Processing...</>
                  : `✓ Create Bill — ${formatCurrency(totals.grandTotal)}`
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastBill && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">✅ Bill Created — {lastBill.billNumber}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowReceipt(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ overflow: 'auto', maxHeight: '60vh' }}>
              <div className="receipt">
                <div className="receipt-header">
                  <div className="receipt-store-name">{import.meta.env.VITE_STORE_NAME || 'Kirana Store'}</div>
                  {lastBill.storeGstin && <div style={{ fontSize: 11, marginTop: 2 }}>GSTIN: {lastBill.storeGstin}</div>}
                  <div style={{ fontSize: 11, marginTop: 4 }}>Bill: {lastBill.billNumber}</div>
                  <div style={{ fontSize: 11 }}>{new Date(lastBill.createdAt).toLocaleString('en-IN')}</div>
                  {lastBill.customerName && <div style={{ fontSize: 11 }}>Customer: {lastBill.customerName}</div>}
                </div>
                <hr className="receipt-divider" />
                <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px dashed #ccc' }}>
                      <th style={{ textAlign: 'left', padding: '2px 0' }}>Item</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Rate</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastBill.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: '2px 0' }}>{item.productName.substring(0, 18)}</td>
                        <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.sellingPrice?.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.totalAmount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <hr className="receipt-divider" />
                <div className="receipt-row"><span>Subtotal</span><span>₹{lastBill.subtotal?.toFixed(2)}</span></div>
                {lastBill.totalCgst > 0 && <div className="receipt-row"><span>CGST</span><span>₹{lastBill.totalCgst?.toFixed(2)}</span></div>}
                {lastBill.totalSgst > 0 && <div className="receipt-row"><span>SGST</span><span>₹{lastBill.totalSgst?.toFixed(2)}</span></div>}
                {lastBill.billDiscountAmount > 0 && <div className="receipt-row"><span>Discount</span><span>-₹{lastBill.billDiscountAmount?.toFixed(2)}</span></div>}
                <hr className="receipt-divider" />
                <div className="receipt-row total"><span>GRAND TOTAL</span><span>₹{lastBill.grandTotal?.toFixed(2)}</span></div>
                <div className="receipt-row"><span>Payment</span><span style={{ textTransform: 'uppercase' }}>{lastBill.paymentMode}</span></div>
                <hr className="receipt-divider" />
                <div style={{ textAlign: 'center', fontSize: 11 }}>Thank you for shopping! 🙏</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowReceipt(false)}>Close</button>
              <button className="btn btn-forest" onClick={() => { generateReceiptPDF(lastBill); toast.success('PDF downloaded!'); }}>
                📥 Download PDF
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
