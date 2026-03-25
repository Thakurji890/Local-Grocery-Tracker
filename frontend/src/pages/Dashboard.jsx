import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/stats`);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  const cardData = [
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toFixed(2)}`, icon: <IndianRupee size={24} />, color: 'bg-emerald-500', trend: '+12.5%', isUp: true },
    { title: 'Bills Generated', value: stats?.totalBills || 0, icon: <TrendingUp size={24} />, color: 'bg-blue-500', trend: '+5.2%', isUp: true },
    { title: 'Items Sold', value: stats?.itemsSold || 0, icon: <ShoppingBag size={24} />, color: 'bg-purple-500', trend: '+8.1%', isUp: true },
    { title: 'GST Collected', value: `₹${(stats?.gstCollected || 0).toFixed(2)}`, icon: <Users size={24} />, color: 'bg-orange-500', trend: '-2.4%', isUp: false },
  ];

  // Placeholder data for charts
  const chartData = [
    { name: 'Mon', revenue: 4000, bills: 24 },
    { name: 'Tue', revenue: 3000, bills: 18 },
    { name: 'Wed', revenue: 2000, bills: 15 },
    { name: 'Thu', revenue: 2780, bills: 21 },
    { name: 'Fri', revenue: 1890, bills: 12 },
    { name: 'Sat', revenue: 2390, bills: 19 },
    { name: 'Sun', revenue: 3490, bills: 23 },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Business Overview</h2>
          <p className="text-slate-400 font-bold mt-1 text-[10px] uppercase tracking-[0.2em]">Real-time Store Performance Metrics</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Live System Status</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => (
          <div key={index} className="glass-card p-6 rounded-[2rem] hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors"></div>
            <div className={`p-4 ${card.color} text-white rounded-2xl shadow-lg mb-6 inline-block`}>
              {card.icon}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{card.value}</h3>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <div className={`flex items-center space-x-0.5 px-2 py-1 rounded-full text-[10px] font-bold ${card.isUp ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {card.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                <span>{card.trend}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Revenue Trends</h3>
            <select className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Stock Alerts</h3>
            <div className="bg-red-500 p-2 rounded-xl text-white shadow-lg animate-pulse">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              stats.lowStockItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl group hover:bg-red-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      <Package size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Only {item.stockQuantity} Left</p>
                    </div>
                  </div>
                  <button className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Restock</button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                <div className="p-4 bg-slate-100 rounded-full">
                  <Package size={32} className="text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory is healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
