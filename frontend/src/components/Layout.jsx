import React, { useContext, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Package, ShoppingCart, FileText, User, Bell } from 'lucide-react';

const Layout = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Analytics', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'POS Station', path: '/pos', icon: <ShoppingCart size={20} /> },
    { name: 'Inventory', path: '/products', icon: <Package size={20} /> },
    { name: 'Financials', path: '/reports', icon: <FileText size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden selection:bg-primary/20">
      {/* Sidebar with Glassmorphism */}
      <aside className="w-72 glass-sidebar flex flex-col z-20 shadow-[10px_0_40px_rgba(0,0,0,0.02)] relative">
        <div className="p-10 mb-2">
          <div className="flex items-center space-x-3 group cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
            <div className="bg-primary p-2.5 rounded-2xl shadow-glow rotate-3 group-hover:rotate-0 transition-all duration-500">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-white">
              Grocer<span className="text-primary italic">IQ</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-5 space-y-1.5 custom-scrollbar overflow-y-auto pt-2">
          <p className="px-5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4 opacity-50">System Hub</p>
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 w-full p-4 rounded-2xl transition-all duration-500 group relative border border-transparent ${
                  isActive 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 border-white/5' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
                }`}
              >
                <div className={`transition-all duration-500 ${isActive ? 'scale-110 text-white' : 'text-slate-500 group-hover:text-primary group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className="font-bold text-[14px] tracking-tight">{item.name}</span>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 mt-auto">
          <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-white/20 shadow-xl font-black text-white text-lg">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate tracking-tight">{user.name}</p>
                <div className="inline-flex px-2 py-0.5 bg-primary/20 rounded-lg border border-primary/20 mt-1">
                   <p className="text-[9px] text-primary font-black uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 text-slate-400 hover:text-white hover:bg-red-500/80 hover:shadow-lg hover:shadow-red-500/20 transition-all w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border border-white/5"
            >
              <LogOut size={14} />
              <span>Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-24 bg-white/40 backdrop-blur-2xl sticky top-0 z-10 flex items-center px-12 border-b border-slate-200/40 justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
              {navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Operations'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary h-px w-8 bg-slate-200"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Orchestration Module</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-black text-slate-700 tracking-tight">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <Bell size={20} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-surface-900 border border-slate-800 flex items-center justify-center text-white hover:text-primary transition-all cursor-pointer shadow-xl hover:-translate-y-0.5">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-12 custom-scrollbar relative">
          <div className="max-w-[1600px] mx-auto animate-slide-up">
            <Outlet />
          </div>
          
          {/* Subtle Background Pattern */}
          <div className="fixed bottom-0 right-0 p-10 opacity-[0.03] pointer-events-none grayscale hidden 2xl:block">
            <ShoppingCart size={400} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
