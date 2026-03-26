import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '📊', path: '/dashboard', roles: ['admin', 'staff', 'authority'] },
  { label: 'New Bill (POS)', icon: '🧾', path: '/billing', roles: ['admin', 'staff'] },
  { label: 'Products', icon: '📦', path: '/products', roles: ['admin', 'staff', 'authority'] },
  { label: 'Customers', icon: '👥', path: '/customers', roles: ['admin', 'staff', 'authority'] },
  { label: 'Bills History', icon: '📋', path: '/bills', roles: ['admin', 'staff', 'authority'] },
  { label: 'Reports & GST', icon: '📈', path: '/reports', roles: ['admin', 'authority'] },
  { label: 'User Management', icon: '⚙️', path: '/users', roles: ['admin'] },
];

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛒</div>
        <div>
          <div className="sidebar-logo-text">Kirana Tracker</div>
          <div className="sidebar-logo-sub">GST Billing System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name truncate">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost w-full" style={{ marginTop: 8, color: 'rgba(255,255,255,0.5)' }} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
