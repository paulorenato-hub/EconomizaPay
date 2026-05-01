import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getAddressFromCoords } from '../services/geo';
import { X, Navigation, MapPin } from 'lucide-react';
import { useAuth } from './AuthContext';
import { DB } from '../services/db';

interface LocationContextType {
  location: { lat: number; lng: number } | null;
  addressLabel: string;
  loading: boolean;
  openLocationModal: () => void;
  requestCurrentLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressLabel, setAddressLabel] = useState('Detectando...');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);

  const requestCurrentLocation = () => {
    setLoading(true);
    setAddressLabel('Detectando...');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          const label = await getAddressFromCoords(latitude, longitude);
          setAddressLabel(label);
          setLoading(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setAddressLabel("Desconhecido");
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLoading(false);
      setAddressLabel("Desconhecido");
    }
  };

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  useEffect(() => {
    if (isModalOpen && user?.id) {
        DB.getUserAddresses(user.id).then(addrs => setUserAddresses(addrs));
    }
  }, [isModalOpen, user?.id]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openLocationModal = () => {
    setIsModalOpen(true);
  };

  const handleSelectAddress = (lat: number, lng: number, label: string) => {
    setLocation({ lat, lng });
    setAddressLabel(label);
    closeModal();
  };

  return (
    <LocationContext.Provider value={{ location, addressLabel, loading, openLocationModal, requestCurrentLocation }}>
      {children}
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={closeModal}></div>

            <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    Escolher Localização
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <button 
                      onClick={() => {
                          closeModal();
                          requestCurrentLocation();
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all text-left"
                  >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                          <Navigation size={18} />
                      </div>
                      <div>
                          <p className="font-bold text-sm">Minha localização atual</p>
                          <p className="text-xs font-medium opacity-80">Usar GPS do dispositivo</p>
                      </div>
                  </button>

                  <div className="pt-4 pb-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Meus Endereços</p>
                  </div>
                  
                  {userAddresses.length > 0 ? (
                      userAddresses.map((addr) => (
                          <button 
                              key={addr.id}
                              onClick={() => handleSelectAddress(addr.latitude, addr.longitude, addr.titulo || addr.bairro)}
                              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:scale-95 transition-all text-left"
                          >
                              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
                                  <MapPin size={18} />
                              </div>
                              <div>
                                  <p className="font-bold text-sm text-gray-800">{addr.titulo}</p>
                                  <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">{addr.bairro}, {addr.cidade}</p>
                              </div>
                          </button>
                      ))
                  ) : (
                      <div className="text-center py-6">
                           <p className="text-xs font-bold text-gray-400">Nenhum endereço cadastrado</p>
                           <p className="text-[10px] text-gray-400 mt-1">Acesse seu Perfil para adicionar novos endereços.</p>
                      </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
      )}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
