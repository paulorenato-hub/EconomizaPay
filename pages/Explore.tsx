
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, ChevronRight, Search, Tag } from 'lucide-react';
import { DB } from '../services/db';
import { Market, Product } from '../types';

export const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mercados' | 'produtos'>('mercados');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, p] = await Promise.all([
          DB.getMarkets(),
          // Passa 'true' para filtrar apenas produtos ativos
          DB.getProducts(undefined, undefined, true)
        ]);
        setMarkets(m);
        setProducts(p);
      } catch (err) {
        console.error("Erro ao carregar dados de exploração:", err);
      }
    };
    loadData();
  }, []);

  const filteredMarkets = markets.filter(m => m.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProducts = products.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  // Agrupar produtos por categoria para a aba de produtos
  const categories = Array.from(new Set(products.map(p => p.categoria)));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Fixo da Página */}
      <div className="bg-white px-4 pt-6 pb-2 sticky top-0 z-30 shadow-sm md:static md:shadow-none">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Explorar</h1>
        
        {/* Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={activeTab === 'mercados' ? "Buscar mercados..." : "Buscar produtos..."}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Custom Tabs (Mobile-Friendly) */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('mercados')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'mercados' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Mercados
          </button>
          <button 
            onClick={() => setActiveTab('produtos')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'produtos' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Produtos
          </button>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {activeTab === 'mercados' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMarkets.length > 0 ? filteredMarkets.map(market => (
              <Link to={`/market/${market.id}`} key={market.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{market.nome}</h3>
                    <p className="text-xs text-gray-400">Clique para ver ofertas</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </Link>
            )) : (
              <div className="col-span-full py-10 text-center text-gray-400">Nenhum mercado encontrado.</div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => {
              const categoryProducts = filteredProducts.filter(p => p.categoria === category);
              if (categoryProducts.length === 0) return null;
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={16} className="text-emerald-500" />
                    <h2 className="font-bold text-gray-700 uppercase tracking-wider text-xs">{category}</h2>
                  </div>
                  <div className="grid gap-3">
                    {categoryProducts.map(product => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`}
                        className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:scale-[0.99] transition-all"
                      >
                        <img 
                          src={product.imagem_url || "https://picsum.photos/100/100"} 
                          alt={product.nome}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-sm">{product.nome}</h4>
                          <p className="text-xs text-emerald-600 font-medium">Ver comparativo</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
