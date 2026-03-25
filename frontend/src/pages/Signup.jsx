import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, UserPlus, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Authority' });
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5500/api/auth/register', formData);
      toast.success('Profile created successfully!');
      await login(formData.email, formData.password);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl shadow-glow mb-6 -rotate-3 transition-transform hover:rotate-0 duration-500">
            <UserPlus size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
            Create Profile
          </h1>
          <p className="text-slate-400 font-bold mt-2 text-[10px] uppercase tracking-widest">Authority Registration</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-10 border-white/60 shadow-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <UserIcon size={18} />
                </div>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="premium-input pl-12" placeholder="E.g. Rajesh Kumar" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Identity</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="premium-input pl-12" placeholder="owner@store.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Encryption Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="premium-input pl-12" placeholder="••••••••" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold bg-white cursor-pointer">
                <option value="Authority">Authority (Full Control)</option>
                <option value="Admin">System Admin</option>
                <option value="Staff">POS Staff</option>
              </select>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full premium-btn bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2">
                <span>Provision Account</span>
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight size={12} />
                </div>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors inline-block pb-1 border-b-2 border-transparent hover:border-primary">
              Already initialized? Connect here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
