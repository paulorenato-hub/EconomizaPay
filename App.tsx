
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { MarketDetails } from './pages/MarketDetails';
import { Explore } from './pages/Explore';
import { Scan } from './pages/Scan';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/admin/Dashboard';
import { ManageProducts } from './pages/admin/ManageProducts';
import { ManageMarkets } from './pages/admin/ManageMarkets';
import { ManagePrices } from './pages/admin/ManagePrices';

const PrivateRoute: React.FC<{ children: React.ReactElement, requireAdmin?: boolean }> = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return null; // Ou um loader global
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {user && <Navbar />}
      <main className={`flex-grow ${user ? 'pb-24 md:pb-8' : ''}`}>
        {children}
      </main>
      {user && <BottomNav />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      {/* Admin Routes - Use Admin Layout */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute requireAdmin>
          <AdminLayout><Dashboard /></AdminLayout>
        </PrivateRoute>
      } />
      <Route path="/admin/products" element={
        <PrivateRoute requireAdmin>
          <AdminLayout><ManageProducts /></AdminLayout>
        </PrivateRoute>
      } />
      <Route path="/admin/markets" element={
        <PrivateRoute requireAdmin>
          <AdminLayout><ManageMarkets /></AdminLayout>
        </PrivateRoute>
      } />
      <Route path="/admin/prices" element={
        <PrivateRoute requireAdmin>
          <AdminLayout><ManagePrices /></AdminLayout>
        </PrivateRoute>
      } />

      {/* User Routes - Use Public Layout */}
      <Route path="/" element={<PrivateRoute><PublicLayout><Home /></PublicLayout></PrivateRoute>} />
      <Route path="/explore" element={<PrivateRoute><PublicLayout><Explore /></PublicLayout></PrivateRoute>} />
      <Route path="/scan" element={<PrivateRoute><PublicLayout><Scan /></PublicLayout></PrivateRoute>} />
      <Route path="/product/:id" element={<PrivateRoute><PublicLayout><ProductDetails /></PublicLayout></PrivateRoute>} />
      <Route path="/market/:id" element={<PrivateRoute><PublicLayout><MarketDetails /></PublicLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><PublicLayout><Profile /></PublicLayout></PrivateRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

// Loader local para evitar erro de referência se não importado do lucide
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default App;
