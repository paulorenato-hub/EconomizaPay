
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Share2, AlertCircle, Loader2 } from 'lucide-react';
import { DB } from '../services/db';
import { Product, PriceComparison } from '../types';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Busca apenas produtos ativos. Se estiver inativo, não retorna na lista filtrada.
        const products = await DB.getProducts(undefined, undefined, true);
        const foundProduct = products.find(p => p.id === id);
        setProduct(foundProduct || null);

        if (foundProduct) {
          const prices = await DB.getPrices(id);
          const markets = await DB.getMarkets();
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices.map(p => p.valor));
            const comps: PriceComparison[] = prices.map(price => {
              const market = markets.find(m => m.id === price.mercado_id);
              return {
                marketName: market ? market.nome : 'Mercado Desconhecido',
                price: price.valor,
                lastUpdate: price.data_atualizacao,
                isLowest: price.valor === minPrice && minPrice > 0
              };
            }).sort((a, b) => a.price - b.price);
            setComparisons(comps);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
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

  if (!product) return (
    <div className="p-10 text-center">
       <p className="text-gray-500">Produto não encontrado ou indisponível.</p>
       <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 font-bold">Voltar</button>
    </div>
  );

  const bestPrice = comparisons.find(c => c.isLowest)?.price;
  const worstPrice = comparisons.length > 1 ? comparisons[comparisons.length - 1].price : bestPrice;
  const savings = bestPrice && worstPrice ? worstPrice - bestPrice : 0;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="relative h-72 bg-gray-100">
        <img 
          src={product.imagem_url || "https://picsum.photos/400/400"} 
          alt={product.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/30 to-transparent">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                <ArrowLeft size={20} />
            </button>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                <Share2 size={20} />
            </button>
        </div>
      </div>

      <div className="-mt-8 relative bg-white rounded-t-[2rem] px-6 pt-8 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
         
         <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide mb-2">
                {product.categoria}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.nome}</h1>
            
            {savings > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">Economia</span>
                    <span>Poupe até <b>R$ {savings.toFixed(2).replace('.', ',')}</b> neste item</span>
                </div>
            )}
         </div>

         <div className="space-y-6">
            <h3 className="font-bold text-gray-800 text-lg">Comparativo</h3>
            
            {comparisons.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-200">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Sem preços cadastrados no momento.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {comparisons.map((comp, idx) => (
                        <div 
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                comp.isLowest 
                                ? 'bg-emerald-50/50 border-emerald-500/30 shadow-sm relative overflow-hidden' 
                                : 'bg-white border-gray-100'
                            }`}
                        >
                            {comp.isLowest && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comp.isLowest ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{comp.marketName}</p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(comp.lastUpdate).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                {comp.isLowest && <p className="text-[10px] font-bold text-emerald-600 uppercase mb-0.5">Melhor Preço</p>}
                                <p className={`font-bold text-lg ${comp.isLowest ? 'text-emerald-700' : 'text-gray-600'}`}>
                                    R$ {comp.price.toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
