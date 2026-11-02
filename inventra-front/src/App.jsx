import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Splash from './components/Splash';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SalesAnalytics from './pages/SalesAnalytics';
import DemandForecastPage from './pages/DemandForecast';
import InventoryPage from './pages/Inventory';
import ProductsPage from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ReorderRecommendationsPage from './pages/ReorderRecommendations';
import ProcurementPage from './pages/Procurement';
import SuppliersPage from './pages/Suppliers';
import PurchaseOrdersPage from './pages/PurchaseOrders';
import AlertsPage from './pages/Alerts';
import ReportsPage from './pages/Reports';
import AdminPage from './pages/Admin';
import CareersPage from './pages/Careers';
import AuditOperations from './pages/AuditOperations';
import RevenueAnalysis from './pages/RevenueAnalysis';
import DataAnalysis from './pages/DataAnalysis';

// Authenticated Layout wrapper
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // If on landing, careers, or auth pages, render children directly without app sidebar
  const isPublic = ['/', '/login', '/signup', '/forgot-password', '/careers'].includes(location.pathname);
  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
      {/* Floating Chatbot Assistant on all operational pages */}
      <Chatbot />
    </div>
  );
};

import PrivacyShieldGate from './components/PrivacyShieldGate';

// Role Gate Wrapper
const RoleRoute = ({ allowedRoles, moduleName, children }) => {
  const { user } = useAuth();
  const currentRole = user?.role || 'Staff';

  if (!allowedRoles.includes(currentRole)) {
    return <PrivacyShieldGate requiredRoles={allowedRoles} moduleName={moduleName} />;
  }

  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const shown = sessionStorage.getItem('inventra_splash_shown');
    return !shown;
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('inventra_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      {showSplash ? (
        <Splash onFinish={handleSplashFinish} />
      ) : (
        <Router>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Floor & Operational Routes (All Roles) */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/alerts" element={<AlertsPage />} />

              {/* Procurement Hub (All Roles - Staff Requisition + Manager PO) */}
              <Route
                path="/procurement"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager', 'Staff']} moduleName="Procurement Management Hub">
                    <ProcurementPage />
                  </RoleRoute>
                }
              />

              {/* Planning & Management Routes (Manager + Admin) */}
              <Route
                path="/revenue"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager', 'Staff']} moduleName="Revenue & Financial Analytics">
                    <RevenueAnalysis />
                  </RoleRoute>
                }
              />
              <Route
                path="/audit"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager', 'Staff']} moduleName="Audit Operations Center">
                    <AuditOperations />
                  </RoleRoute>
                }
              />
              <Route
                path="/data-analysis"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager']} moduleName="Data Science & EDA Workspace">
                    <DataAnalysis />
                  </RoleRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager']} moduleName="Sales & Financial Analytics">
                    <SalesAnalytics />
                  </RoleRoute>
                }
              />
              <Route
                path="/forecast"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager']} moduleName="Demand Forecasting & Model Retraining">
                    <DemandForecastPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/reorders"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager']} moduleName="Smart Reorder Intelligence">
                    <ReorderRecommendationsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager']} moduleName="Supplier Comparison Matrix">
                    <SuppliersPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <RoleRoute allowedRoles={['Admin', 'Manager']} moduleName="Executive Reports & CSV Exports">
                    <ReportsPage />
                  </RoleRoute>
                }
              />

              {/* System Governance & RBAC (Admin Only) */}
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={['Admin']} moduleName="System Administration & Audit Logs">
                    <AdminPage />
                  </RoleRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      )}
    </AuthProvider>
  );
}

export default App;
