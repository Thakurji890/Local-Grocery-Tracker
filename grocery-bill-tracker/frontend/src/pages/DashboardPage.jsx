import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardAPI } from '../services/api';
import { formatCurrency } from '../utils/gst';

const PAYMENT_COLORS = { cash: '#1E6B45', upi: '#E8652A', card: '#2563EB', credit: '#D97706' };

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!stats) return null;

  const pieData = Object.entries(stats.paymentBreakdown || {}).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  return (
    <div className="page-body">
      <div className="topbar" style={{ position: 'static', marginBottom: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <div>
            <div className="topbar-title">Dashboard</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>↻ Refresh</button>
      </div>

      {/* Today Stats */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Today's Summary</h3>
      </div>
      <div className="stat-grid">
        <StatCard icon="🧾" iconClass="saffron" label="Bills Today" value={stats.today.bills} sub="transactions" />
        <StatCard icon="💰" iconClass="forest" label="Revenue Today" value={formatCurrency(stats.today.revenue)} sub={`GST: ${formatCurrency(stats.today.gstCollected)}`} />
        <StatCard icon="📦" iconClass="warning" label="Items Sold" value={stats.today.itemsSold} sub="units today" />
        <StatCard icon="👥" iconClass="info" label="Customers" value={stats.totalCustomers} sub="total registered" />
      </div>

      {/* Monthly Stats */}
      <div style={{ margin: '16px 0 8px' }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>This Month</h3>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard icon="🗓️" iconClass="info" label="Total Bills" value={stats.month.bills} />
        <StatCard icon="💵" iconClass="forest" label="Total Revenue" value={formatCurrency(stats.month.revenue)} />
        <StatCard icon="🏛️" iconClass="warning" label="GST Collected" value={formatCurrency(stats.month.gstCollected)} />
      </div>

      {/* Inventory Alerts */}
      {stats.inventory.lowStockProducts > 0 && (
        <div className="alert alert-warning mb-4" style={{ marginBottom: 24 }}>
          ⚠️ <strong>{stats.inventory.lowStockProducts} products</strong> are running low on stock. Go to Products → filter Low Stock to restock.
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Revenue — Last 7 Days</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.revenueData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v, n) => [formatCurrency(v), n === 'revenue' ? 'Revenue' : 'GST']} />
              <Bar dataKey="revenue" fill="var(--saffron)" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar dataKey="gst" fill="var(--forest-light)" radius={[4, 4, 0, 0]} name="gst" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Payment Modes (Today)</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PAYMENT_COLORS[entry.name.toLowerCase()] || '#94a3b8'} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <p>No bills yet today</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <div className="card-title">🏆 Top Selling Products This Month</div>
        {stats.topProducts.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={p._id}>
                    <td><span style={{ fontWeight: 700, color: i < 3 ? 'var(--saffron)' : 'var(--muted)' }}>{i + 1}</span></td>
                    <td style={{ fontWeight: 500 }}>{p._id}</td>
                    <td className="font-mono">{p.totalQty} units</td>
                    <td className="font-mono">{formatCurrency(p.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 32 }}><p>No sales data yet</p></div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, iconClass, label, value, sub }) => (
  <div className="stat-card">
    <div className={`stat-icon ${iconClass}`}>{icon}</div>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export default DashboardPage;
