
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, TrendingDown, Loader2, Navigation } from 'lucide-react';
import { DB } from '../services/db';
import { Product, Market } from '../types';
import { getAddressFromCoords, calculateDistance } from '../services/geo';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [lowestPrices, setLowestPrices] = useState<Record<string, number | null>>({});
  
  // Estados de Localização
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [addressLabel, setAddressLabel] = useState('Detectando...');

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          try {
            const label = await getAddressFromCoords(latitude, longitude);
            setAddressLabel(label);
          } catch (e) {
            // Em caso de erro na API de endereço, usa um termo genérico
            setAddressLabel("Localização Atual");
          }
        },
        (error) => {
          // Log descritivo em vez de objeto vazio
          const errorMsg = error.message || "Motivo desconhecido";
          console.warn(`Geolocalização indisponível: ${errorMsg} (Code: ${error.code})`);
          
          // Fallback para uma cidade padrão em caso de erro
          setAddressLabel("São Paulo");
        },
        { 
            enableHighAccuracy: false, // IMPORTANTE: false evita timeouts e erros de sinal GPS fraco
            timeout: 15000,            // Espera até 15 segundos
            maximumAge: 600000         // Aceita localização em cache de até 10 minutos
        }
      );
    } else {
        setAddressLabel("Brasil");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Passa 'true' para filtrar apenas produtos ativos
      const allProducts = await DB.getProducts(searchTerm, selectedCategory, true);
      setProducts(allProducts);
      
      const cats = Array.from(new Set(allProducts.map(p => p.categoria)));
      if (categories.length <= 1) setCategories(['Todas', ...cats]);

      const pricePromises = allProducts.map(async (p) => {
        const price = await DB.getLowestPriceForProduct(p.id);
        return { id: p.id, price };
      });
      
      const results = await Promise.all(pricePromises);
      const priceMap: Record<string, number | null> = {};
      results.forEach(r => priceMap[r.id] = r.price);
      setLowestPrices(priceMap);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm border-b border-gray-100 rounded-b-[2rem] md:rounded-none">
        <div className="flex items-center justify-between mb-4">
            <button 
                onClick={requestLocation}
                className="text-left active:scale-95 transition-transform"
            >
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Você está em</p>
                <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                    <MapPin size={16} fill="currentColor" fillOpacity={0.2} />
                    <span className="text-sm truncate max-w-[180px]">{addressLabel}</span>
                </div>
            </button>
            <div className="flex gap-2">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <Navigation size={18} />
                </div>
            </div>
        </div>

        <div className="mt-2">
            <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">
                Economize <span className="text-emerald-600">agora</span> <br/> 
                em {addressLabel}.
            </h1>
        </div>

        <div className="mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-300" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 shadow-inner transition-all text-sm font-medium"
            placeholder="O que você busca hoje?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 pl-4">
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 pr-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all transform active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Destaques em {addressLabel}</h2>
             <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Mais Baratos</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
             <div className="relative">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
                <MapPin className="absolute inset-0 m-auto text-emerald-200" size={16} />
             </div>
             <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-4">Localizando Preços...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="text-gray-200 mb-4" size={48} />
            <p className="text-gray-500 font-bold text-sm">Nada encontrado por aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => {
              const lowestPrice = lowestPrices[product.id];
              return (
                <Link key={product.id} to={`/product/${product.id}`} className="block group">
                  <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-50 h-full flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 group-active:scale-95">
                    <div className="relative mb-4">
                        <div className="aspect-square w-full bg-gray-50 rounded-[1.5rem] overflow-hidden relative">
                             <img
                                src={product.imagem_url || "https://picsum.photos/200/200"}
                                alt={product.nome}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        {lowestPrice && (
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-tighter">
                                Menor Preço
                            </div>
                        )}
                    </div>
                    
                    <div>
                      <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1">{product.categoria}</p>
                      <h3 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 min-h-[40px]">
                        {product.nome}
                      </h3>
                      
                      <div className="mt-4 flex items-end justify-between">
                        {lowestPrice ? (
                            <div>
                                <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-tighter">A partir de</span>
                                <span className="text-lg font-black text-gray-900">
                                R$ {lowestPrice.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        ) : (
                             <span className="text-[10px] text-gray-300 italic font-medium uppercase">Indisponível</span>
                        )}
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <TrendingDown size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
