import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 🙏`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = { admin: ['admin@store.com', 'admin123'], staff: ['staff@store.com', 'staff123'], authority: ['authority@store.com', 'auth123'] };
    setForm({ email: creds[role][0], password: creds[role][1] });
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div>
          <div className="auth-logo">🛒</div>
          <div className="auth-tagline">Kirana Bill Tracker</div>
          <p className="auth-sub">GST-enabled billing & inventory management for Indian kirana stores</p>
          <ul className="auth-features">
            <li><span className="check">✓</span> Auto GST / CGST / SGST calculation</li>
            <li><span className="check">✓</span> Real-time inventory tracking</li>
            <li><span className="check">✓</span> Digital PDF receipts</li>
            <li><span className="check">✓</span> GSTR-1 monthly export</li>
            <li><span className="check">✓</span> Dashboard analytics</li>
            <li><span className="check">✓</span> UPI & Cash payments</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Sign in to your store account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="admin@store.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? <><div className="spinner" /> Signing in...</> : '🔐 Sign In'}
            </button>
          </form>

          {/* Demo account shortcuts */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10, textAlign: 'center' }}>Demo accounts (click to fill)</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['admin', 'staff', 'authority'].map(role => (
                <button key={role} className="btn btn-outline btn-sm" onClick={() => fillDemo(role)} style={{ flex: 1, textTransform: 'capitalize' }}>
                  {role === 'admin' ? '👑' : role === 'staff' ? '🧑‍💼' : '🔍'} {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
