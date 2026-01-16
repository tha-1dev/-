
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomePage, InventoryPage, PublicSourcesPage, MotoDetailPage } from './components/Public';
import { AdminFBSources, AdminDashboard, AdminLoginPage, AdminInventory } from './components/Admin';
import { CustomerManager, POSSystem, RepairDashboard } from './components/ServiceSuite';

// --- Auth Guard ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = !!(localStorage.getItem('add_service_token') || sessionStorage.getItem('add_service_token'));
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = ({ onLogin, handleLogout }: { onLogin: (rem: boolean) => void, handleLogout: () => void }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/sources" element={<PublicSourcesPage />} />
      <Route path="/motorcycles/:slug" element={<MotoDetailPage />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage onLogin={onLogin} />} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/fb" element={<ProtectedRoute><AdminFBSources /></ProtectedRoute>} />
      <Route path="/admin/stock" element={<ProtectedRoute><AdminInventory /></ProtectedRoute>} />
      
      {/* Service Suite Routes */}
      <Route path="/admin/crm" element={<ProtectedRoute><CustomerManager /></ProtectedRoute>} />
      <Route path="/admin/pos" element={<ProtectedRoute><POSSystem /></ProtectedRoute>} />
      <Route path="/admin/repairs" element={<ProtectedRoute><RepairDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
