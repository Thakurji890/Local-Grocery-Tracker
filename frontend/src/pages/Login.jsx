import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] font-sans antialiased relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full animate-slide-up relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-[2rem] shadow-glow mb-6 rotate-3">
            <ShoppingCart size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">
            Welcome to Grocer<span className="text-primary italic">IQ</span>
          </h1>
          <p className="text-slate-500 font-medium">Elevating your kirana store experience</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-10 border-white/60 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-accent rounded-t-full"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Connection</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="premium-input pl-12"
                  placeholder="admin@groceriq.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full premium-btn bg-surface-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 group shadow-xl shadow-slate-900/10 hover:shadow-primary/20 hover:bg-primary transition-all active:scale-[0.98]"
            >
              <span>Authorize Entry</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100/50 text-center">
            <Link to="/signup" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center justify-center space-x-1 group">
              <span>New Authority Instance?</span>
              <span className="text-primary group-hover:underline underline-offset-4">Register here</span>
            </Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          GrocerIQ Production v1.0.4 • Secure Session
        </p>
      </div>
    </div>
  );
};

export default Login;
