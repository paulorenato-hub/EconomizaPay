
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, Loader2, Tag, Calendar, ShoppingBag } from 'lucide-react';
import { DB } from '../services/db';
import { Market, Product, Price } from '../types';

export const MarketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Record<string, Array<Product & { currentPrice: number, lastUpdate: string }>>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Busca mercados e seleciona o atual
        const markets = await DB.getMarkets();
        const foundMarket = markets.find(m => m.id === id);
        setMarket(foundMarket || null);

        if (foundMarket) {
          // Busca preços específicos deste mercado
          const prices = await DB.getPrices(undefined, id);
          
          // Busca produtos ativos para cruzar informações
          const products = await DB.getProducts(undefined, undefined, true);

          // Processamento dos dados
          const groupedData: Record<string, Array<Product & { currentPrice: number, lastUpdate: string }>> = {};

          prices.forEach(price => {
             const product = products.find(p => p.id === price.produto_id);
             if (product) {
                 if (!groupedData[product.categoria]) {
                     groupedData[product.categoria] = [];
                 }
                 groupedData[product.categoria].push({
                     ...product,
                     currentPrice: price.valor,
                     lastUpdate: price.data_atualizacao
                 });
             }
          });

          setCategories(groupedData);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes do mercado:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
         <Store size={48} className="text-gray-300 mb-4" />
         <p className="text-gray-500 font-bold">Mercado não encontrado.</p>
         <button onClick={() => navigate(-1)} className="mt-6 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-2xl">Voltar</button>
      </div>
    );
  }

  const categoryNames = Object.keys(categories).sort();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
       {/* Header */}
       <div className="bg-white pb-6 pt-4 px-4 sticky top-0 z-30 shadow-sm rounded-b-[2rem]">
          <div className="flex items-center gap-4 mb-4">
             <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                <ArrowLeft size={20} />
             </button>
             <h1 className="text-lg font-black text-gray-900 truncate flex-1">{market.nome}</h1>
          </div>
          
          <div className="flex items-start gap-3 px-2">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Store size={24} />
             </div>
             <div>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <MapPin size={12} />
                    <span>Localização</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                    {market.latitude && market.longitude 
                        ? `${market.latitude.toFixed(4)}, ${market.longitude.toFixed(4)}` 
                        : 'Endereço não cadastrado'}
                </p>
                <div className="mt-3 flex gap-2">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">
                        {Object.values(categories).flat().length} Ofertas
                    </span>
                    <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">
                        {categoryNames.length} Categorias
                    </span>
                </div>
             </div>
          </div>
       </div>

       {/* Conteúdo */}
       <div className="p-4 max-w-7xl mx-auto space-y-8 mt-4">
          {categoryNames.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                  <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-bold">Nenhum produto cadastrado neste mercado.</p>
              </div>
          ) : (
              categoryNames.map(category => (
                  <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="flex items-center gap-2 mb-4 ml-1">
                          <Tag size={16} className="text-emerald-500" />
                          <h2 className="font-black text-gray-700 uppercase tracking-widest text-xs">{category}</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categories[category].map(product => (
                              <Link 
                                key={product.id} 
                                to={`/product/${product.id}`}
                                className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:scale-[0.99] transition-all"
                              >
                                <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden">
                                    <img 
                                        src={product.imagem_url || "https://picsum.photos/100/100"} 
                                        alt={product.nome}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{product.nome}</h4>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                                        <Calendar size={10} />
                                        <span>Atualizado em {new Date(product.lastUpdate).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Por apenas</span>
                                    <span className="text-lg font-black text-emerald-600">R$ {product.currentPrice.toFixed(2).replace('.', ',')}</span>
                                </div>
                              </Link>
                          ))}
                      </div>
                  </div>
              ))
          )}
       </div>
    </div>
  );
};
