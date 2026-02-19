import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  History, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  TrendingDown,
  User,
  Check,
  X,
  PlusCircle,
  ShieldCheck,
  FileText,
  Scan,
  Phone,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [editData, setEditData] = useState({ 
    nome: user?.nome || '', 
    email: user?.email || '', 
    telefone: user?.telefone || '' 
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = () => {
    // Aqui seria a chamada ao Supabase para atualizar
    setIsEditing(false);
  };

  const faqs = [
    { q: "Como o Economiza Pay calcula o menor preço?", a: "Analisamos diariamente as ofertas de mercados e farmácias parceiras da sua região." },
    { q: "Posso adicionar preços manualmente?", a: "Sim! Na aba do produto, você pode enviar uma foto da etiqueta." },
  ];

  const MenuButton = ({ icon: Icon, label, sublabel, color = "text-gray-600", onClick, isExternal }: any) => {
    const Component = isExternal ? 'div' : 'button';
    return (
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-white active:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-2xl bg-gray-50 ${color}`}>
            <Icon size={20} />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-800 text-sm leading-none mb-1">{label}</p>
            {sublabel && <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{sublabel}</p>}
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-300" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header com gradiente */}
      <div className="bg-emerald-600 pt-16 pb-28 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="relative flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-[2.5rem] bg-white p-1.5 shadow-2xl shadow-emerald-900/40">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nome}`} 
                alt="Avatar" 
                className="w-full h-full rounded-[2rem] object-cover bg-emerald-50"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-emerald-500 text-white rounded-2xl border-4 border-emerald-600 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
               <PlusCircle size={18} />
            </button>
          </div>
          
          <h1 className="text-2xl font-black text-white capitalize tracking-tight">{user.nome}</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-50 text-[10px] font-bold rounded-full border border-emerald-400/30">
               {isAdmin ? 'Administrador' : 'Membro Premium'}
             </span>
             <span className="text-emerald-100 text-[11px] font-medium opacity-80">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-16 relative z-10 space-y-6">
        {/* Card de Stats */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-emerald-900/5 grid grid-cols-3 gap-2 border border-emerald-50">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-2">
              <TrendingDown size={22} />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Economia</span>
            <span className="text-sm font-black text-gray-800">R$ 142,50</span>
          </div>
          <div className="flex flex-col items-center text-center border-x border-gray-100 px-2">
            <div className="w-11 h-11 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-2">
              <Phone size={22} />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Contato</span>
            <span className="text-[10px] font-black text-gray-800 truncate w-full">{user.telefone || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-2">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Status</span>
            <span className="text-sm font-black text-gray-800">Verificado</span>
          </div>
        </div>

        {/* Seção Exclusiva Admin */}
        {isAdmin && (
          <section className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-4">Painel de Controle</h3>
            <div className="bg-slate-900 rounded-[2rem] p-1 shadow-xl shadow-slate-200 border border-slate-800 overflow-hidden">
                <button 
                  onClick={() => navigate('/admin/dashboard')}
                  className="w-full flex items-center justify-between p-5 bg-slate-900 active:bg-slate-800 transition-colors rounded-[1.8rem]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                      <LayoutDashboard size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-white text-sm uppercase tracking-wider">Sistema Admin</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gerenciar Produtos e Preços</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase">Acessar</span>
                    <ChevronRight size={20} className="text-slate-600" />
                  </div>
                </button>
            </div>
          </section>
        )}

        {isEditing ? (
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-emerald-100 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Editar Perfil</h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-400"><X size={20}/></button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nome</label>
                    <input 
                        className="w-full mt-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20" 
                        value={editData.nome}
                        onChange={e => setEditData({...editData, nome: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Telefone</label>
                    <input 
                        className="w-full mt-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20" 
                        value={editData.telefone}
                        onChange={e => setEditData({...editData, telefone: e.target.value})}
                    />
                </div>
                <button 
                    onClick={handleSaveProfile}
                    className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all mt-4"
                >
                    <Check size={20} /> Atualizar Dados
                </button>
            </div>
          </div>
        ) : (
          <section>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-4">Preferências</h3>
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
              <MenuButton 
                icon={User} 
                label="Dados Pessoais" 
                sublabel="Nome e Telefone" 
                color="text-indigo-500"
                onClick={() => setIsEditing(true)} 
              />
              <MenuButton 
                icon={History} 
                label="Histórico de Preços" 
                sublabel="Sua jornada de economia" 
                color="text-emerald-500"
              />
              <MenuButton 
                icon={Scan} 
                label="Histórico de Scans" 
                sublabel="Produtos capturados" 
                color="text-orange-500"
              />
              <MenuButton 
                icon={Settings} 
                label="Configurações" 
                sublabel="Notificações e App" 
                color="text-slate-400"
              />
            </div>
          </section>
        )}

        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-4">Mais Opções</h3>
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
            <MenuButton 
                icon={HelpCircle} 
                label="Central de Ajuda" 
                sublabel="Dúvidas e suporte" 
                color="text-blue-500"
                onClick={() => setShowHelp(!showHelp)}
            />
            {showHelp && (
                <div className="bg-gray-50/50 p-4 space-y-2 animate-in fade-in zoom-in-95">
                    {faqs.map((faq, i) => (
                        <button key={i} className="w-full text-left bg-white p-3 rounded-xl border border-gray-100 text-xs font-medium text-gray-600">
                            {faq.q}
                        </button>
                    ))}
                </div>
            )}
            
            <MenuButton 
                icon={FileText} 
                label="Termos de Uso" 
                sublabel="Privacidade e Regras" 
                color="text-slate-500"
                onClick={() => setShowTerms(!showTerms)}
            />
            {showTerms && (
                <div className="p-5 bg-gray-50 text-[10px] text-gray-400 leading-relaxed max-h-40 overflow-y-auto border-t border-gray-100">
                    Ao utilizar o Economiza Pay, você concorda com a coleta de dados de localização para fornecer preços regionais precisos.
                </div>
            )}
          </div>
        </section>

        <div className="pt-4 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-5 bg-white text-red-500 rounded-[2rem] font-black text-sm uppercase tracking-widest border border-red-50 shadow-sm active:scale-95 active:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};