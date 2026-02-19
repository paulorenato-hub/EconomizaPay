import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Camera, X, Search, Filter, Save, Check, Loader2, Store, DollarSign, Upload, Image as ImageIcon, Power } from 'lucide-react';
import { DB } from '../../services/db';
import { Product, Market, Price } from '../../types';

export const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  
  // Drawer/Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Price Prompt State
  const [pricePromptProduct, setPricePromptProduct] = useState<Product | null>(null);
  const [marketPrices, setMarketPrices] = useState<Record<string, string>>({});

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', imageUrl: '' });
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodData, markData] = await Promise.all([
        DB.getProducts(), // Agora retorna todos (ativos e inativos)
        DB.getMarkets()
      ]);
      setProducts(prodData);
      setMarkets(markData);
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (product?: Product) => {
    if (product) {
      setEditId(product.id);
      setFormData({
        name: product.nome,
        category: product.categoria,
        imageUrl: product.imagem_url || ''
      });
    } else {
      setEditId(null);
      setFormData({ name: '', category: '', imageUrl: '' });
      setIsScanning(false);
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;

    const isNew = !editId;
    const existingProduct = editId ? products.find(p => p.id === editId) : undefined;
    
    // Mantém o status original se for edição, ou true se for novo
    const currentStatus = existingProduct ? existingProduct.ativo : true;
    const dataCriacao = existingProduct?.data_criacao || new Date().toISOString();

    const newProduct: Product = {
      id: editId || `p${Date.now()}`,
      nome: formData.name,
      categoria: formData.category,
      ativo: currentStatus,
      imagem_url: formData.imageUrl || 'https://picsum.photos/200/200',
      data_criacao: dataCriacao
    };

    try {
      setLoading(true);
      await DB.saveProduct(newProduct);
      await loadData();
      setIsDrawerOpen(false);

      if (isNew) {
        setPricePromptProduct(newProduct);
        const initialPrices: Record<string, string> = {};
        markets.forEach(m => initialPrices[m.id] = '');
        setMarketPrices(initialPrices);
      }
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManagePrices = async (product: Product) => {
    try {
      setLoading(true);
      // Busca preços existentes para pré-preencher
      const existingPrices = await DB.getPrices(product.id);
      
      const priceMap: Record<string, string> = {};
      
      // Inicializa mapa vazio para todos os mercados
      markets.forEach(m => priceMap[m.id] = '');

      // Preenche com o preço mais recente de cada mercado
      // Como DB.getPrices retorna ordenado por data desc, o primeiro que encontrar é o atual
      existingPrices.forEach(p => {
         if (!priceMap[p.mercado_id] && p.valor) {
             priceMap[p.mercado_id] = p.valor.toString();
         }
      });

      setMarketPrices(priceMap);
      setPricePromptProduct(product);
    } catch (err: any) {
      console.error("Erro ao carregar preços:", err);
      alert("Erro ao carregar preços do produto.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrices = async () => {
    if (!pricePromptProduct) return;
    
    setLoading(true);
    try {
      const pricePromises = Object.entries(marketPrices)
        .filter(([_, value]) => value !== '' && parseFloat(value as string) > 0)
        .map(([marketId, value]) => {
          const newPrice: Price = {
            id: `pr${Date.now()}_${marketId}`,
            mercado_id: marketId,
            produto_id: pricePromptProduct.id,
            valor: parseFloat(value as string),
            ativo: true,
            data_atualizacao: new Date().toISOString()
          };
          return DB.savePrice(newPrice);
        });

      await Promise.all(pricePromises);
      setPricePromptProduct(null);
    } catch (err: any) {
      console.error("Erro ao salvar preços:", err);
      alert("Erro ao salvar alguns preços. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const updatedProduct = { ...product, ativo: !product.ativo };
      // Atualização otimista na UI
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
      
      await DB.saveProduct(updatedProduct);
    } catch (err: any) {
      console.error("Erro ao alterar status:", err);
      alert("Não foi possível alterar o status do produto.");
      loadData(); // Reverte em caso de erro
    }
  };

  const handleDelete = async (product: Product) => {
    if (product.ativo) {
      alert("⚠️ Ação Bloqueada\n\nEste produto está ativo. Para excluí-lo, primeiro desative-o usando o botão de status (Power).");
      return;
    }

    if (confirm(`Tem certeza que deseja excluir "${product.nome}" permanentemente?\n\nIsso apagará o produto e todo o seu histórico de preços.`)) {
      try {
        setLoading(true);
        // Primeiro limpa os preços para evitar erro de Foreign Key
        await DB.deletePricesFromProduct(product.id);
        // Depois exclui o produto
        await DB.deleteProduct(product.id);
        await loadData();
      } catch (err: any) {
        console.error("Erro ao deletar produto:", err);
        alert("Erro ao excluir. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setFormData(prev => ({ ...prev, name: "Produto Escaneado (Simulação)", category: "Diversos", imageUrl: "https://picsum.photos/200/200?grayscale" }));
      setIsScanning(false);
    }, 1500);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, imageUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-full flex flex-col animate-in fade-in zoom-in-95">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gerenciar Produtos</h1>
           <p className="text-gray-500 text-sm font-medium">Controle total do catálogo de itens.</p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-100 transition-all font-bold text-sm"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-t-[2rem] border-t border-x border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
               type="text" 
               placeholder="Buscar por nome ou categoria..." 
               className="w-full pl-12 pr-4 py-3.5 text-sm bg-slate-50 border border-gray-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <button className="flex items-center gap-2 text-gray-400 hover:text-emerald-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all">
            <Filter size={16} /> Filtros avançados
        </button>
      </div>

      <div className="bg-white border-x border-b border-gray-100 rounded-b-[2rem] overflow-hidden shadow-sm flex-1 mb-8">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
                <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                <tr key={product.id} className={`hover:bg-emerald-50/30 transition-colors group ${!product.ativo ? 'bg-gray-50 opacity-75' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <img className={`h-12 w-12 rounded-2xl object-cover border border-gray-100 mr-4 group-hover:scale-110 transition-transform ${!product.ativo ? 'grayscale' : ''}`} src={product.imagem_url || "https://picsum.photos/50"} alt="" />
                        <div>
                        <div className={`text-sm font-bold ${product.ativo ? 'text-gray-900' : 'text-gray-500 line-through decoration-gray-400'}`}>{product.nome}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: {product.id}</div>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-lg bg-gray-100 text-gray-500">
                        {product.categoria}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                        onClick={() => handleToggleStatus(product)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border ${product.ativo ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
                        title={product.ativo ? "Clique para desativar" : "Clique para ativar"}
                    >
                        <div className={`w-2 h-2 rounded-full ${product.ativo ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${product.ativo ? 'text-emerald-700' : 'text-gray-500'}`}>
                            {product.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                        {/* Botão Gerenciar Preços */}
                        <button 
                            onClick={() => handleManagePrices(product)}
                            className="p-2 rounded-xl transition-all text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                            title="Gerenciar Preços"
                        >
                            <DollarSign size={16} />
                        </button>

                        <button onClick={() => handleOpenDrawer(product)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit size={16} /></button>
                        
                        {/* Botão Power (Ativar/Desativar) */}
                        <button 
                            onClick={() => handleToggleStatus(product)}
                            className={`p-2 rounded-xl transition-all ${product.ativo ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'}`}
                            title={product.ativo ? "Desativar" : "Ativar"}
                        >
                            <Power size={16} />
                        </button>

                        {/* Botão Excluir - Lógica Visual */}
                        <button 
                            onClick={() => handleDelete(product)} 
                            className={`p-2 rounded-xl transition-all ${
                                product.ativo 
                                ? 'text-gray-300 hover:text-gray-500 hover:bg-gray-100' 
                                : 'text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}
                            title={product.ativo ? "Desative o produto para excluir" : "Excluir permanentemente"}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* Side Drawer for Creating/Editing Product */}
      <div className={`fixed inset-0 z-50 overflow-hidden ${isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsDrawerOpen(false)}></div>
        
        <div className={`fixed inset-y-0 right-0 max-w-md w-full flex transition-transform duration-500 cubic-bezier transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="relative w-full h-full bg-white shadow-2xl flex flex-col">
             <div className="px-8 py-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">{editId ? 'Editar Produto' : 'Adicionar Produto'}</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Preencha as informações básicas</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2"><X size={24} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 bg-white">
                <form id="productForm" onSubmit={handleSave} className="space-y-8">
                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />

                    <div className="p-1 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all group relative overflow-hidden">
                        {formData.imageUrl && !formData.imageUrl.includes('picsum') ? (
                           <div className="relative h-64 w-full">
                               <img src={formData.imageUrl} className="h-full w-full object-cover rounded-[2.2rem]" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                                   <button 
                                      type="button"
                                      onClick={triggerFileInput} 
                                      className="bg-white text-gray-900 rounded-xl px-4 py-2 font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-emerald-50"
                                   >
                                      <Upload size={14} /> Trocar Foto
                                   </button>
                                   <button 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setFormData({...formData, imageUrl: ''}); }} 
                                      className="bg-red-500 text-white rounded-xl px-4 py-2 font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-red-600"
                                   >
                                      <Trash2 size={14} /> Remover
                                   </button>
                               </div>
                           </div>
                        ) : (
                           <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                              <div className="flex gap-4 mb-6">
                                  <button
                                    type="button"
                                    onClick={handleScan}
                                    className="flex flex-col items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-100 text-emerald-600 hover:scale-105 transition-transform"
                                  >
                                      {isScanning ? <Loader2 className="animate-spin mb-2" size={24} /> : <Camera size={24} className="mb-2" />}
                                      <span className="text-[10px] font-black uppercase tracking-widest">Escanear</span>
                                  </button>
                                  
                                  <div className="flex items-center text-slate-300 font-bold text-xs">OU</div>

                                  <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="flex flex-col items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-100 text-blue-500 hover:scale-105 transition-transform"
                                  >
                                      <ImageIcon size={24} className="mb-2" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                                  </button>
                              </div>
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Adicione uma imagem do produto</p>
                           </div>
                        )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nome do Produto</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="block w-full border border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none" 
                        placeholder="Ex: Arroz Integral 1kg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoria Principal</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Alimentos', 'Laticínios', 'Limpeza', 'Farmácia', 'Bebidas', 'Diversos'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setFormData({...formData, category: cat})}
                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    formData.category === cat 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                      </div>
                    </div>
                </form>
             </div>

             <div className="p-8 bg-slate-50 flex gap-4">
                 <button onClick={() => setIsDrawerOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-slate-600 transition-all">Cancelar</button>
                 <button type="submit" form="productForm" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Save size={16} /> Salvar Produto
                 </button>
             </div>
          </div>
        </div>
      </div>

      {/* Price Prompt Modal - Appears after registering a NEW product */}
      {pricePromptProduct && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500"></div>

            <div className="relative bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-500">
                <div className="p-10">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/5">
                            <Check size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                            Gerenciar Preços
                        </h2>
                        <p className="text-gray-500 font-medium mt-2">{pricePromptProduct.nome}</p>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {markets.map(market => (
                            <div key={market.id} className="bg-slate-50 rounded-[2rem] p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                                        <Store size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{market.nome}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Estabelecimento Ativo</p>
                                    </div>
                                </div>

                                <div className="relative w-full md:w-40">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-sm">R$</div>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={marketPrices[market.id] || ''}
                                        onChange={(e) => setMarketPrices({...marketPrices, [market.id]: e.target.value})}
                                        className="w-full bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-lg font-black text-slate-900 placeholder-slate-200 transition-all outline-none text-right"
                                    />
                                </div>
                            </div>
                        ))}

                        {markets.length === 0 && (
                            <div className="py-10 text-center">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum mercado cadastrado no sistema.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-8 flex gap-4">
                    <button 
                        onClick={() => setPricePromptProduct(null)} 
                        className="flex-1 py-5 px-6 bg-white border border-slate-200 rounded-3xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-white hover:text-slate-600 transition-all"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={handleSavePrices}
                        disabled={loading}
                        className="flex-1 py-5 px-6 bg-emerald-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><DollarSign size={20} /> Salvar Preços</>}
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .cubic-bezier { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};
