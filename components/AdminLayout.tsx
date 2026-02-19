import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Store, DollarSign, LogOut, Settings, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => (
    <Link
      to={path}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive(path)
          ? 'bg-emerald-50 text-emerald-700 shadow-sm font-semibold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} className={`transition-colors ${isActive(path) ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className="text-sm">{label}</span>
      {isActive(path) && <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
    </Link>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar - Desktop Focused */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 text-emerald-600 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <DollarSign size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 tracking-tight leading-none">Economiza</h1>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Admin Pro</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Principal</p>
            <NavItem path="/admin/dashboard" icon={LayoutDashboard} label="Visão Geral" />
            <NavItem path="/admin/products" icon={ShoppingBag} label="Produtos" />
            <NavItem path="/admin/markets" icon={Store} label="Mercados" />
            <NavItem path="/admin/prices" icon={DollarSign} label="Preços" />
            
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-8">Sistema</p>
            <NavItem path="/profile" icon={Settings} label="Configurações" />
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-gray-50">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {user?.nome.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.nome}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header for Global Search/Notifications */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar em todo o sistema (Cmd+K)" 
              className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-emerald-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-8">
           {children}
        </main>
      </div>
    </div>
  );
};