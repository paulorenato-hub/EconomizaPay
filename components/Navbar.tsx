import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, DollarSign, UserCircle, LayoutGrid, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
    {/* Mobile Header (Minimalist) */}
    <div className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-gray-800 tracking-tight">Economiza Pay</span>
        </div>
        {user && (
            <Link to="/profile" className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 active:bg-emerald-100 transition-colors">
                <User size={18} />
            </Link>
        )}
    </div>

    {/* Desktop Navbar */}
    <nav className="hidden md:block bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 font-bold text-xl text-gray-900">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <DollarSign size={20} />
              </div>
              <span>Economiza Pay</span>
            </Link>
            
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                <Link to="/explore" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                  <LayoutGrid size={16} /> Explorar
                </Link>
              </div>
            </div>
          </div>
          
          <div>
            {user ? (
               <div className="flex items-center gap-6">
                   <Link to="/profile" className="flex items-center gap-2 group transition-all">
                       <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100">
                           <UserCircle size={20} />
                       </div>
                       <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors capitalize">{user.nome}</span>
                   </Link>
                   <button onClick={handleLogout} className="text-sm font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
                       <LogOut size={16} /> Sair
                   </button>
               </div>
            ) : (
                <Link to="/login" className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95">
                  Entrar
                </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};