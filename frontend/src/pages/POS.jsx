import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Banknote,
  Minus,
  Maximize2
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import BarcodeScanner from '../components/BarcodeScanner';

const POS = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5500/api/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.includes(searchTerm)
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    setLoading(true);
    try {
      const payload = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.cartQuantity,
          price: item.price,
          gstRate: item.gstRate
        })),
        paymentMethod
      };

      const { data } = await axios.post('http://localhost:5500/api/bills', payload);
      toast.success('Transaction Completed');
      generateReceipt(data);
      clearCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = (bill) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('GrocerIQ Store', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Bill No: ${bill.billNumber} | Date: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    
    const tableData = bill.items.map(item => [
      item.name,
      item.quantity,
      `₹${item.price.toFixed(2)}`,
      `${item.gstRate}%`,
      `₹${item.total.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Item Name', 'Qty', 'Price', 'GST', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    const finalY = doc.previousAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Grand Total: ₹${bill.grandTotal.toFixed(2)}`, 190, finalY, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Payment: ${bill.paymentMethod} | CGST: ₹${bill.cgst.toFixed(2)} | SGST: ₹${bill.sgst.toFixed(2)}`, 190, finalY + 7, { align: 'right' });
    
    doc.save(`GrocerIQ_${bill.billNumber}.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)] gap-8 animate-slide-up">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search Items Or Scan Barcode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input pl-12"
            />
          </div>
          <button 
            onClick={() => setShowScanner(!showScanner)}
            className={`premium-btn p-4 rounded-3xl flex items-center justify-center ${showScanner ? 'bg-primary text-white shadow-glow' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-white transition-colors'}`}
          >
            <Maximize2 size={24} />
          </button>
        </div>

        {showScanner && (
          <div className="animate-in fade-in zoom-in duration-300">
            <BarcodeScanner onScan={(code) => { setSearchTerm(code); setShowScanner(false); }} />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
          {filteredProducts.map(product => (
            <button 
              key={product._id}
              onClick={() => addToCart(product)}
              disabled={product.stockQuantity <= 0}
              className="glass-card p-4 rounded-[2rem] flex flex-col items-center text-center space-y-3 group hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 disabled:scale-100"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors group-hover:bg-primary/10 group-hover:rotate-6">
                <Plus size={32} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 line-clamp-1">{product.name}</p>
                <p className="text-lg font-black text-primary">₹{product.price}</p>
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                Stock: {product.stockQuantity}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full lg:w-[450px] flex flex-col gap-6">
        <div className="glass-card flex-1 rounded-[2.5rem] flex flex-col overflow-hidden border-primary/10">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-primary/5">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2.5 rounded-2xl shadow-glow">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Active Bills</h3>
            </div>
            <button onClick={clearCart} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale space-y-4">
                <ShoppingCart size={64} />
                <p className="text-sm font-bold uppercase tracking-widest">Cart is awaiting items</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm group hover:border-primary/20 transition-all">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-black text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs font-bold text-primary">₹{item.price} × {item.cartQuantity}</p>
                  </div>
                  <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                    <button onClick={() => updateQuantity(item._id, -1, item.stockQuantity)} className="p-1.5 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-700">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1, item.stockQuantity)} className="p-1.5 hover:bg-white rounded-xl text-slate-400 hover:text-primary transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-surface-900 border-t border-white/5 rounded-b-[2.5rem]">
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span>Total Items</span>
                <span>{cart.reduce((acc, item) => acc + item.cartQuantity, 0)} Units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-lg font-bold tracking-tight">Invoice Total</span>
                <span className="text-primary text-3xl font-black tracking-tighter">₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${paymentMethod === 'Cash' ? 'bg-primary text-white shadow-glow' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
              >
                <Banknote size={16} />
                <span>Cash</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${paymentMethod === 'UPI' ? 'bg-primary text-white shadow-glow' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
              >
                <CreditCard size={16} />
                <span>Digital UPI</span>
              </button>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="w-full premium-btn bg-primary hover:bg-emerald-400 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center space-x-3 text-sm disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
            >
              {loading ? 'Processing...' : (
                <>
                  <CreditCard size={20} />
                  <span>Finalize & Print</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
