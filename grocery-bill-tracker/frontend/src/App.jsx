import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';

// Lazy load pages for performance
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BillingPage from './pages/BillingPage';
import ProductsPage from './pages/ProductsPage';
import BillsPage from './pages/BillsPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

// Protected layout with sidebar
const AppLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 14, color: '#6B7280' }}>
        <div className="spinner" style={{ marginRight: 10 }} /> Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

// Role guard
const RoleGuard = ({ roles, children }) => {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-title">Access Denied</div>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }
  return children;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: 13, fontFamily: 'Sora, sans-serif' } }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/billing" element={
            <RoleGuard roles={['admin', 'staff']}><BillingPage /></RoleGuard>
          } />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/reports" element={
            <RoleGuard roles={['admin', 'authority']}><ReportsPage /></RoleGuard>
          } />
          <Route path="/users" element={
            <RoleGuard roles={['admin']}><UsersPage /></RoleGuard>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
