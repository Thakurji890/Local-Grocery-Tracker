import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { DownloadCloud, FileText, Calendar, Filter, FileSpreadsheet } from 'lucide-react';

const Reports = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await axios.get('http://localhost:5500/api/bills');
      setBills(data);
    } catch (error) {
      toast.error('Failed to load transaction database');
    } finally {
      setLoading(false);
    }
  };

  const exportGSTR1 = () => {
    if (bills.length === 0) return toast.error('No database records found');

    const headers = [
      'Invoice Number', 'Invoice Date', 'Customer Name', 'Customer Phone', 
      'Total Value', 'Taxable Value', 'Rate', 'CGST Amount', 'SGST Amount'
    ];

    let csvContent = headers.join(',') + '\n';

    bills.forEach(bill => {
      const date = new Date(bill.createdAt).toLocaleDateString('en-IN');
      const cName = bill.customer?.name || 'Walk-in Customer';
      const cPhone = bill.customer?.phone || '';

      bill.items.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        const row = [
          bill.billNumber,
          date,
          `"${cName}"`,
          cPhone,
          (item.total || 0).toFixed(2),
          (itemSubtotal || 0).toFixed(2),
          item.gstRate,
          (item.cgst || 0).toFixed(2),
          (item.sgst || 0).toFixed(2)
        ];
        csvContent += row.join(',') + '\n';
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `GSTR1_Export_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('GSTR-1 Data Node Exported Successfully');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Premium Header Card */}
      <div className="glass-card p-10 rounded-[3rem] border-white/60 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
               <FileSpreadsheet size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Compliance Engine</span>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">GST Returns & Audit</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Export high-fidelity GSTR-1 compliant datasets designed specifically for direct ingestion into government filings or CA portals.
            </p>
          </div>
          <button 
            onClick={exportGSTR1}
            disabled={loading || bills.length === 0}
            className="premium-btn bg-surface-900 text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 text-xs disabled:opacity-50 disabled:grayscale transition-all hover:bg-emerald-600 hover:shadow-primary/30 active:scale-95"
          >
            <DownloadCloud size={20} className="animate-bounce" />
            <span>Export GSTR-1 (CSV)</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-glass border border-slate-100/60 overflow-hidden">
        <div className="p-8 border-b border-slate-100/60 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
               <FileText size={20} className="text-primary" />
             </div>
             <div>
               <h4 className="text-lg font-black text-slate-800 tracking-tight">Audit Ledger (B2C Large)</h4>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Sequence History</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-500 gap-2">
              <Calendar size={14} />
              <span>Mar 2026 - Current</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/20 text-slate-400 border-b border-slate-100/60">
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Bill Sequence</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Creation Time</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Store Entity</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Flow Size</th>
                <th className="px-8 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em]">Node Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 opacity-40 grayscale">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    <p className="text-xs font-black uppercase tracking-widest">Hydrating Ledger...</p>
                  </div>
                </td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 opacity-40 grayscale">
                    <FileText size={48} />
                    <p className="text-xs font-black uppercase tracking-widest">Zero transactions detected</p>
                  </div>
                </td></tr>
              ) : (
                bills.map(bill => (
                  <tr key={bill._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-primary font-mono bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                        {bill.billNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-bold text-slate-600">{new Date(bill.createdAt).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(bill.createdAt).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800">{bill.customer?.name || 'Walk-in Cash Customer'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Direct Store Point</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {bill.items.reduce((acc, item) => acc + item.quantity, 0)} Units
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-lg font-black text-slate-900 tracking-tighter">₹{(bill.grandTotal || 0).toFixed(2)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
