
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, History, TrendingDown, ArrowRight } from 'lucide-react';
import { DB } from '../../services/db';
import { Market, Product, Price } from '../../types';

export const ManagePrices: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);

  const [selectedMarketId, setSelectedMarketId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [priceValue, setPriceValue] = useState<string>('');
  const [feedback, setFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Fix: Added async function inside useEffect to handle Promise return types from DB service
  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, p, pr] = await Promise.all([
          DB.getMarkets(),
          DB.getProducts(),
          DB.getPrices(),
        ]);
        setMarkets(m);
        setProducts(p);
        setPrices(pr);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedMarketId && selectedProductId) {
      const existingPrice = prices.find(p => p.mercado_id === selectedMarketId && p.produto_id === selectedProductId && p.ativo);
      if (existingPrice) {
        setPriceValue(existingPrice.valor.toString());
      } else {
        setPriceValue('');
      }
    }
  }, [selectedMarketId, selectedProductId, prices]);

  // Fix: handleSave must be async to await DB operations and state updates
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMarketId || !selectedProductId || !priceValue) {
      setFeedback({ msg: 'Preencha todos os campos.', type: 'error' });
      return;
    }

    const numValue = parseFloat(priceValue);
    if (numValue <= 0) {
      setFeedback({ msg: 'O preço deve ser maior que zero.', type: 'error' });
      return;
    }

    const newPrice: Price = {
      id: `pr${Date.now()}`,
      mercado_id: selectedMarketId,
      produto_id: selectedProductId,
      valor: numValue,
      ativo: true,
      data_atualizacao: new Date().toISOString()
    };

    try {
      await DB.savePrice(newPrice);
      const updatedPrices = await DB.getPrices();
      setPrices(updatedPrices);
      setFeedback({ msg: 'Preço atualizado!', type: 'success' });
    } catch (err) {
      console.error("Erro ao salvar preço:", err);
      setFeedback({ msg: 'Erro ao salvar preço.', type: 'error' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  // Fix: Added helper to refresh prices asynchronously
  const handleRefreshPrices = async () => {
    try {
      const data = await DB.getPrices();
      setPrices(data);
    } catch (err) {
      console.error("Erro ao atualizar preços:", err);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-right-4">
      
      {/* Left Column: Entry Form */}
      <div className="flex-1 max-w-2xl">
        <div className="mb-6">
           <h1 className="text-2xl font-bold text-gray-900">Atualizar Preços</h1>
           <p className="text-gray-500 text-sm">Insira os novos valores coletados.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
             <h2 className="font-bold text-gray-800 text-lg">Entrada Manual</h2>
          </div>
          
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">1. Escolha o Mercado</label>
                <select
                  required
                  value={selectedMarketId}
                  onChange={(e) => setSelectedMarketId(e.target.value)}
                  className="block w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50"
                  size={4} // Listbox style for better desktop UX (easier scanning)
                >
                  {markets.map(m => (
                    <option key={m.id} value={m.id} className="p-2 rounded hover:bg-emerald-50 cursor-pointer">{m.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">2. Escolha o Produto</label>
                 <div className="relative">
                    <select
                      required
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="block w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50"
                    >
                      <option value="">-- Selecione o Produto --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} - {p.categoria}</option>
                      ))}
                    </select>
                 </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex items-center justify-between">
               <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Preço Unitário</label>
                  <div className="flex items-center">
                      <span className="text-2xl font-medium text-emerald-600 mr-2">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        className="bg-transparent text-4xl font-bold text-emerald-800 w-48 focus:outline-none border-b-2 border-emerald-300 focus:border-emerald-600 transition-colors placeholder-emerald-200"
                        placeholder="0.00"
                        autoFocus
                      />
                  </div>
               </div>
               <button
                type="submit"
                className="h-14 w-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 hover:scale-110 active:scale-95 transition-all"
               >
                 <ArrowRight size={24} />
               </button>
            </div>

            {feedback && (
              <div className={`p-4 rounded-xl text-center font-bold text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} animate-in slide-in-from-top-2`}>
                {feedback.msg}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Column: Live Feed */}
      <div className="lg:w-96 flex flex-col h-full overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
           <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
             <History size={18} /> Últimas Atualizações
           </h3>
           <button onClick={handleRefreshPrices} className="text-gray-400 hover:text-emerald-600 transition-colors"><RefreshCw size={16}/></button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-y-auto pr-1">
           <div className="divide-y divide-gray-100">
             {prices.slice().reverse().slice(0, 20).map(price => {
               const pName = products.find(p => p.id === price.produto_id)?.nome || 'Produto desconhecido';
               const mName = markets.find(m => m.id === price.mercado_id)?.nome || 'Mercado desconhecido';
               return (
                 <div key={price.id} className="p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-800 text-sm line-clamp-1">{pName}</span>
                      <span className="font-mono font-bold text-emerald-600">R${price.valor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <span className="text-xs text-gray-500">{mName}</span>
                       <span className="text-[10px] text-gray-300 group-hover:text-gray-400">
                          {new Date(price.data_atualizacao).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                 </div>
               )
             })}
             {prices.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">Nenhum preço registrado ainda.</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
