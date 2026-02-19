
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Store, Tag, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Activity, QrCode, ExternalLink, Check, RefreshCw } from 'lucide-react';
import { DB } from '../../services/db';
import { supabase } from '../../services/supabase';
import { ScanSubmission } from '../../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ products: 0, markets: 0, prices: 0, users: 0 });
  const [onlineUsers, setOnlineUsers] = useState<number>(1);
  const [pendingScans, setPendingScans] = useState<ScanSubmission[]>([]);
  const [loadingScans, setLoadingScans] = useState(false);

  // 1. Carrega dados do Banco (Produtos, Mercados, Preços)
  const loadStats = async () => {
    try {
      const realStats = await DB.getDashboardStats();
      setStats(realStats);
    } catch (err) {
      console.error("Erro ao carregar estatísticas reais:", err);
    }
  };

  // 2. Configura listener para Usuários Online (Presence)
  useEffect(() => {
    const channel = supabase.channel('system-global');

    channel
        .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const count = Object.keys(state).length;
            // Garante que mostra pelo menos 1 (eu mesmo)
            setOnlineUsers(count > 0 ? count : 1);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, []);

  const loadScans = async () => {
    if (pendingScans.length === 0) setLoadingScans(true);
    
    try {
       const scans = await DB.getPendingScans();
       if (scans.length !== pendingScans.length || scans.length > 0) {
           setPendingScans(scans);
       }
    } catch (err) {
       console.warn("Falha ao carregar scans:", err);
    } finally {
       setLoadingScans(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadScans();

    const interval = setInterval(() => {
        loadScans();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleProcessScan = async (id: string) => {
    try {
        await DB.markScanAsProcessed(id);
        setPendingScans(prev => prev.filter(scan => scan.id !== id));
    } catch (err) {
        console.error("Erro ao processar scan:", err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subLabel }: any) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {subLabel || (trend === 'up' ? 'Novo' : 'Estável')}
        </span>
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Geral</h1>
          <p className="text-gray-500 mt-1">Painel atualizado automaticamente.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => { loadStats(); loadScans(); }} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
              <RefreshCw size={14} className={loadingScans ? 'animate-spin' : ''} />
              Sincronizar
           </button>
           <Link to="/admin/products" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2">
              + Novo Produto
           </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Produtos Ativos" 
          value={stats.products} 
          icon={Tag} 
          color="bg-emerald-500" 
          trend="up" 
        />
        <StatCard 
          title="Mercados Parceiros" 
          value={stats.markets} 
          icon={Store} 
          color="bg-blue-500" 
          trend="up" 
        />
        <StatCard 
          title="Preços Monitorados" 
          value={stats.prices} 
          icon={ShoppingBag} 
          color="bg-purple-500" 
          trend="up" 
        />
        <StatCard 
          title="Usuários Online" 
          value={onlineUsers} 
          icon={Users} 
          color="bg-green-500" 
          trend="up"
          subLabel="Tempo Real" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                Flutuação de Preços (Média)
                </h3>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                <div key={i} className="w-full bg-emerald-50 rounded-t-lg relative group transition-all hover:bg-emerald-100">
                    <div 
                    style={{ height: `${h}%` }} 
                    className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 rounded-t-lg transition-all group-hover:bg-emerald-600"
                    ></div>
                </div>
                ))}
            </div>
            </div>

            {/* Pending Scans Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <QrCode size={18} className="text-purple-500" />
                        Solicitações de Leitura (QR Code)
                    </h3>
                    <div className="flex items-center gap-2">
                        {loadingScans && pendingScans.length === 0 && <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />}
                        <span className="bg-purple-50 text-purple-600 text-xs font-bold px-2 py-1 rounded-full animate-in fade-in">{pendingScans.length} pendentes</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {pendingScans.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <QrCode className="mx-auto text-gray-200 mb-2" size={32} />
                            <p className="text-gray-400 text-sm font-medium">Nenhuma solicitação pendente.</p>
                            <p className="text-gray-300 text-xs mt-1">As leituras aparecem aqui automaticamente.</p>
                        </div>
                    ) : (
                        pendingScans.map(scan => (
                            <div key={scan.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-md transition-all animate-in slide-in-from-left-2">
                                <div className="overflow-hidden mr-4">
                                    <p className="text-[10px] text-emerald-600 font-black uppercase mb-1 tracking-widest">{scan.user_nome}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-gray-800 truncate" title={scan.content}>{scan.content}</p>
                                        {scan.content.startsWith('http') && (
                                            <a href={scan.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(scan.created_at).toLocaleString('pt-BR')}</p>
                                </div>
                                <button 
                                    onClick={() => handleProcessScan(scan.id)}
                                    className="p-2.5 bg-white text-emerald-600 border border-gray-100 rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm active:scale-90"
                                    title="Marcar como processado"
                                >
                                    <Check size={20} strokeWidth={3} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col h-fit">
          <h3 className="font-bold text-gray-800 mb-4 uppercase text-[10px] tracking-widest text-gray-400">Ações Rápidas</h3>
          <div className="space-y-3">
             <Link to="/admin/products" className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:border-emerald-200 shadow-sm">
                  <Tag size={18} />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">Novo Produto</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Catálogo</p>
                </div>
             </Link>
             <Link to="/admin/prices" className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:border-emerald-200 shadow-sm">
                  <TrendingUp size={18} />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">Lançar Preços</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Pesquisa</p>
                </div>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

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
