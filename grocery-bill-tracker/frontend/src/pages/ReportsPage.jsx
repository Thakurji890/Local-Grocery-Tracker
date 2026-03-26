import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportAPI } from '../services/api';
import { formatCurrency } from '../utils/gst';
import { generateGSTR1PDF } from '../utils/pdfGenerator';

export default function ReportsPage() {
  // GSTR-1
  const [gstrMonth, setGstrMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [gstrData, setGstrData] = useState(null);
  const [gstrLoading, setGstrLoading] = useState(false);

  // Sales report
  const [salesStart, setSalesStart] = useState('');
  const [salesEnd, setSalesEnd] = useState('');
  const [salesData, setSalesData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);

  const loadGSTR1 = async () => {
    setGstrLoading(true);
    try {
      const res = await reportAPI.getGSTR1(gstrMonth);
      setGstrData(res.data);
    } catch { toast.error('Failed to load GSTR-1 data'); }
    finally { setGstrLoading(false); }
  };

  const downloadCSV = async () => {
    try {
      const res = await reportAPI.getGSTR1(gstrMonth, 'csv');
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `GSTR1_${gstrMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded!');
    } catch { toast.error('CSV download failed'); }
  };

  const loadSales = async () => {
    setSalesLoading(true);
    try {
      const res = await reportAPI.getSales({ startDate: salesStart || undefined, endDate: salesEnd || undefined });
      setSalesData(res.data);
    } catch { toast.error('Failed to load sales data'); }
    finally { setSalesLoading(false); }
  };

  return (
    <div className="page-body">
      <div className="mb-4">
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>📈 Reports & GST</h1>
        <p className="text-muted text-sm">GSTR-1 filing, sales reports, and tax summaries</p>
      </div>

      {/* ── GSTR-1 Section ── */}
      <div className="card mb-4">
        <div className="card-title">🏛️ GSTR-1 Monthly Report</div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16 }}>
          Generate your monthly GST return summary with CGST + SGST breakup as per Indian tax rules.
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20 }}>
          <div className="input-group" style={{ flex: '0 0 200px' }}>
            <label className="input-label">Select Month</label>
            <input className="input" type="month" value={gstrMonth} onChange={e => setGstrMonth(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={loadGSTR1} disabled={gstrLoading}>
            {gstrLoading ? <><div className="spinner" /> Loading...</> : '📊 Generate Report'}
          </button>
          {gstrData && (
            <>
              <button className="btn btn-forest" onClick={downloadCSV}>📥 Download CSV</button>
              <button className="btn btn-outline" onClick={() => generateGSTR1PDF(gstrData, gstrMonth)}>📄 Download PDF</button>
            </>
          )}
        </div>

        {gstrData && (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Bills', value: gstrData.totalBills, icon: '🧾' },
                { label: 'Total Revenue', value: formatCurrency(gstrData.totalRevenue), icon: '💰' },
                { label: 'Total GST Collected', value: formatCurrency(gstrData.totalGst), icon: '🏛️' },
                { label: 'Taxable Value', value: formatCurrency(gstrData.totalRevenue - gstrData.totalGst), icon: '📋' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 18 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* GST Rate Wise Summary */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>GST Rate-Wise Summary</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>GST Rate</th>
                      <th>Taxable Value</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>Total GST</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstrData.gstSummary.map(g => (
                      <tr key={g.gstRate}>
                        <td><span className="gst-tag">{g.gstRate}%</span></td>
                        <td className="font-mono">{formatCurrency(g.taxableValue)}</td>
                        <td className="font-mono" style={{ color: 'var(--forest)' }}>{formatCurrency(g.cgst)}</td>
                        <td className="font-mono" style={{ color: 'var(--forest)' }}>{formatCurrency(g.sgst)}</td>
                        <td className="font-mono" style={{ fontWeight: 700, color: 'var(--saffron)' }}>{formatCurrency(g.totalGst)}</td>
                        <td className="font-mono" style={{ fontWeight: 600 }}>{formatCurrency(g.totalValue)}</td>
                      </tr>
                    ))}
                    {gstrData.gstSummary.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>No GST data for this month</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bill-wise list */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Bill-Wise Details ({gstrData.bills?.length} bills)</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Bill No.</th><th>Date</th><th>Customer</th><th>Grand Total</th><th>GST</th><th>Payment</th></tr>
                  </thead>
                  <tbody>
                    {gstrData.bills?.slice(0, 50).map(b => (
                      <tr key={b.billNumber}>
                        <td className="font-mono" style={{ fontSize: 12 }}>{b.billNumber}</td>
                        <td style={{ fontSize: 12 }}>{new Date(b.date).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontSize: 12 }}>{b.customerName}</td>
                        <td className="font-mono" style={{ fontWeight: 600 }}>{formatCurrency(b.grandTotal)}</td>
                        <td className="font-mono" style={{ color: 'var(--forest)' }}>{formatCurrency(b.totalGst)}</td>
                        <td><span className="badge badge-muted">{b.paymentMode}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {gstrData.bills?.length > 50 && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 10 }}>
                    Showing first 50 bills. Download CSV for complete data.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Sales Report Section ── */}
      <div className="card">
        <div className="card-title">💰 Sales Report</div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20 }}>
          <div className="input-group">
            <label className="input-label">From Date</label>
            <input className="input" type="date" value={salesStart} onChange={e => setSalesStart(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">To Date</label>
            <input className="input" type="date" value={salesEnd} onChange={e => setSalesEnd(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={loadSales} disabled={salesLoading}>
            {salesLoading ? <><div className="spinner" /> Loading...</> : '📊 Generate'}
          </button>
          {(salesStart || salesEnd) && <button className="btn btn-outline" onClick={() => { setSalesStart(''); setSalesEnd(''); setSalesData(null); }}>Clear</button>}
        </div>

        {salesData && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Bills', value: salesData.totalBills, icon: '🧾' },
                { label: 'Total Revenue', value: formatCurrency(salesData.totalRevenue), icon: '💰' },
                { label: 'GST Collected', value: formatCurrency(salesData.totalGst), icon: '🏛️' },
                { label: 'Total Discount', value: formatCurrency(salesData.totalDiscount), icon: '🏷️' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 18 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Bill No.</th><th>Date</th><th>Customer</th><th>Total</th><th>GST</th><th>Payment</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {salesData.bills?.slice(0, 100).map(b => (
                    <tr key={b._id}>
                      <td className="font-mono" style={{ fontSize: 12 }}>{b.billNumber}</td>
                      <td style={{ fontSize: 12 }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize: 12 }}>{b.customerName || 'Walk-in'}</td>
                      <td className="font-mono" style={{ fontWeight: 600 }}>{formatCurrency(b.grandTotal)}</td>
                      <td className="font-mono">{formatCurrency(b.totalGst)}</td>
                      <td><span className="badge badge-muted">{b.paymentMode}</span></td>
                      <td><span className={`badge ${b.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!salesData && (
          <div className="empty-state" style={{ padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
            <div className="empty-state-title">Select a date range to generate sales report</div>
          </div>
        )}
      </div>
    </div>
  );
}
