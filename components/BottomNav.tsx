import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, QrCode, LayoutGrid, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-all active:scale-90 ${active ? 'text-emerald-600' : 'text-gray-400'}`}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      <span className={`text-[10px] font-semibold tracking-tight ${active ? 'opacity-100' : 'opacity-80'}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-safe z-50 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around h-16 px-2">
        <NavItem 
          to="/" 
          icon={Home} 
          label="Início" 
          active={isActive('/')} 
        />
        
        <NavItem 
          to="/explore" 
          icon={LayoutGrid} 
          label="Explorar" 
          active={isActive('/explore')} 
        />
        
        <NavItem 
          to="/scan" 
          icon={QrCode} 
          label="Escanear" 
          active={isActive('/scan')} 
        />

        <NavItem 
          to="/profile" 
          icon={User} 
          label="Perfil" 
          active={isActive('/profile')} 
        />
      </div>
    </div>
  );
};