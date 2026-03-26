import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { formatDate } from '../utils/gst';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'staff', phone: '' };

const ROLE_BADGE = {
  admin: 'badge-danger',
  authority: 'badge-warning',
  staff: 'badge-success',
};

const ROLE_ICON = { admin: '👑', staff: '🧑‍💼', authority: '🔍' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.register(form);
      toast.success(`${form.role} account created!`);
      setModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user'); }
    finally { setSaving(false); }
  };

  const toggleUser = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? 'Deactivate' : 'Activate'} account for ${name}?`)) return;
    try {
      await authAPI.toggleUser(id);
      toast.success(`Account ${isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch { toast.error('Failed to update user'); }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="page-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>⚙️ User Management</h1>
          <p className="text-muted text-sm">Manage staff, cashiers, and auditors</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Create User</button>
      </div>

      {/* Role Explanation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { role: 'admin', icon: '👑', title: 'Admin', desc: 'Full access: billing, products, reports, users, cancel bills' },
          { role: 'staff', icon: '🧑‍💼', title: 'Staff / Cashier', desc: 'Can do billing, add products, view customers' },
          { role: 'authority', icon: '🔍', title: 'Authority / Auditor', desc: 'View-only: reports, bills, dashboard, can cancel bills' },
        ].map(r => (
          <div key={r.role} className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{r.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="page-loader"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: u.role === 'admin' ? 'var(--saffron-faint)' : u.role === 'authority' ? 'var(--warning-bg)' : 'var(--forest-faint)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0
                        }}>
                          {ROLE_ICON[u.role]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td style={{ fontSize: 12 }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${ROLE_BADGE[u.role]}`}>
                        {ROLE_ICON[u.role]} {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                    <td style={{ fontSize: 12 }}>{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-forest'}`}
                        onClick={() => toggleUser(u._id, u.name, u.isActive)}
                      >
                        {u.isActive ? '⊘ Deactivate' : '✓ Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">👤 Create New User</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="input-group">
                    <label className="input-label">Full Name *</label>
                    <input className="input" value={form.name} onChange={f('name')} required placeholder="e.g. Ravi Kumar" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email *</label>
                    <input className="input" type="email" value={form.email} onChange={f('email')} required placeholder="staff@store.com" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Password *</label>
                    <input className="input" type="password" value={form.password} onChange={f('password')} required placeholder="Min 6 characters" minLength={6} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Phone</label>
                    <input className="input" value={form.phone} onChange={f('phone')} placeholder="10-digit mobile number" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Role *</label>
                    <select className="select" value={form.role} onChange={f('role')}>
                      <option value="staff">🧑‍💼 Staff / Cashier</option>
                      <option value="authority">🔍 Authority / Auditor</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                  </div>

                  <div className="alert alert-info" style={{ fontSize: 12 }}>
                    {form.role === 'admin' && '⚠️ Admin users have full access including deleting products and cancelling bills.'}
                    {form.role === 'staff' && '✓ Staff can create bills, manage products and view customers.'}
                    {form.role === 'authority' && '✓ Authority users can view all reports and cancel bills but cannot create bills.'}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" /> Creating...</> : '✓ Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
