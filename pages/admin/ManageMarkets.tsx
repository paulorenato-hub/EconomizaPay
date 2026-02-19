
import React, { useState, useEffect, useRef } from 'react';
// Added Save to the imports below
import { Plus, Edit, Trash2, X, Store, MapPin, Navigation, Crosshair, Map as MapIcon, Save } from 'lucide-react';
import { DB } from '../../services/db';
import { Market } from '../../types';

// Declaração do Leaflet vinda do index.html
declare const L: any;

export const ManageMarkets: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    loadMarkets();
  }, []);

  // Inicializa ou atualiza o mapa quando o modal abre
  useEffect(() => {
    if (isModalOpen && mapContainerRef.current) {
      // Pequeno delay para garantir que o container esteja renderizado
      const timer = setTimeout(() => {
        // Coordenadas padrão de Cabo de Santo Agostinho - PE
        const initialLat = latitude ? parseFloat(latitude) : -8.2839;
        const initialLng = longitude ? parseFloat(longitude) : -35.0292;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current);

          // Evento de clique no mapa
          mapInstanceRef.current.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            updateCoordinates(lat, lng);
          });
        } else {
          mapInstanceRef.current.setView([initialLat, initialLng], 15);
        }

        // Atualiza ou cria o marcador
        if (markerRef.current) {
          markerRef.current.setLatLng([initialLat, initialLng]);
        } else {
          markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(mapInstanceRef.current);
          markerRef.current.on('dragend', (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            updateCoordinates(lat, lng);
          });
        }
        
        // Corrige problemas de renderização do Leaflet em modais
        mapInstanceRef.current.invalidateSize();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const updateCoordinates = (lat: number, lng: number) => {
    const fixedLat = lat.toFixed(6);
    const fixedLng = lng.toFixed(6);
    setLatitude(fixedLat);
    setLongitude(fixedLng);
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);
    }
  };

  const loadMarkets = async () => {
    try {
      const data = await DB.getMarkets();
      setMarkets(data);
    } catch (err) {
      console.error("Erro ao carregar mercados:", err);
    }
  };

  const handleOpenModal = (market?: Market) => {
    if (market) {
      setEditId(market.id);
      setName(market.nome);
      setLatitude(market.latitude?.toString() || '');
      setLongitude(market.longitude?.toString() || '');
    } else {
      setEditId(null);
      setName('');
      setLatitude('');
      setLongitude('');
    }
    setIsModalOpen(true);
  };

  const captureCurrentLocation = () => {
    setIsCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        updateCoordinates(lat, lng);
        setIsCapturing(false);
      },
      (err) => {
        console.error(err);
        setIsCapturing(false);
        alert("Não foi possível capturar a localização.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newMarket: Market = {
      id: editId || `m${Date.now()}`,
      nome: name,
      ativo: true,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      data_criacao: editId ? markets.find(m => m.id === editId)?.data_criacao || new Date().toISOString() : new Date().toISOString()
    };

    try {
      await DB.saveMarket(newMarket);
      await loadMarkets();
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar mercado:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este mercado?')) {
      try {
        await DB.deleteMarket(id);
        await loadMarkets();
      } catch (err) {
        console.error("Erro ao deletar mercado:", err);
      }
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in zoom-in-95">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gerenciar Mercados</h1>
           <p className="text-gray-500 text-sm font-medium">Estabelecimentos geolocalizados.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-100 transition-all font-bold text-sm"
        >
          <Plus size={18} /> Novo Mercado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {markets.map((market) => (
            <div key={market.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all group relative">
               <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                     <Store size={28} />
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleOpenModal(market)} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Edit size={18} /></button>
                     <button onClick={() => handleDelete(market.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                  </div>
               </div>
               
               <h3 className="font-black text-gray-800 text-lg mb-2">{market.nome}</h3>
               
               <div className="space-y-1.5 mb-6">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                     <MapPin size={14} className="text-emerald-500" />
                     <span>{market.latitude ? `${market.latitude}, ${market.longitude}` : 'Sem coordenadas'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                     <Navigation size={12} />
                     <span>Registrado em {new Date(market.data_criacao).toLocaleDateString()}</span>
                  </div>
               </div>
               
               <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                  <span className="text-[10px] font-mono text-gray-300 font-bold uppercase tracking-widest">{market.id}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Ativo</span>
                  </div>
               </div>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={closeModal}></div>

            <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {editId ? 'Editar Mercado' : 'Novo Mercado'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2">
                    <X size={24} />
                  </button>
                </div>
                
                <form id="marketForm" onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome do Estabelecimento</label>
                    <input 
                      type="text" 
                      required
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="block w-full border-none bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none" 
                      placeholder="Ex: Farmácia do Bairro"
                    />
                  </div>

                  {/* Seção de Mapa */}
                  <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Localização Geográfica</label>
                        <span className="text-[9px] text-emerald-500 font-black uppercase bg-emerald-50 px-2 py-0.5 rounded">Clique no mapa para marcar</span>
                    </div>
                    
                    <div className="relative">
                        <div 
                          ref={mapContainerRef} 
                          className="w-full h-64 bg-gray-100 rounded-[1.5rem] border-2 border-gray-50 shadow-inner overflow-hidden"
                          style={{ minHeight: '256px' }}
                        ></div>
                        
                        <button 
                            type="button"
                            onClick={captureCurrentLocation}
                            disabled={isCapturing}
                            className="absolute bottom-4 right-4 z-[1000] p-3 bg-white text-emerald-600 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all border border-gray-100"
                            title="Minha localização"
                        >
                            {isCapturing ? <Navigation size={20} className="animate-pulse" /> : <Crosshair size={20} />}
                        </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Latitude</label>
                        <input 
                            type="text" 
                            readOnly
                            value={latitude} 
                            className="block w-full border-none bg-gray-100 rounded-2xl px-5 py-4 text-sm font-mono font-bold text-gray-500 cursor-not-allowed" 
                            placeholder="-8.2839"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Longitude</label>
                        <input 
                            type="text" 
                            readOnly
                            value={longitude} 
                            className="block w-full border-none bg-gray-100 rounded-2xl px-5 py-4 text-sm font-mono font-bold text-gray-500 cursor-not-allowed" 
                            placeholder="-35.0292"
                        />
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 p-6 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="marketForm"
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Salvar Estabelecimento
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};
