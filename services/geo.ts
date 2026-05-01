
/**
 * Calcula a distância entre dois pontos geográficos em KM usando a fórmula de Haversine
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Busca o nome da cidade usando a API do OpenStreetMap (Nominatim)
 * Inclui parâmetros recomendados para evitar bloqueios de rede.
 */
export const getCoordsFromAddress = async (bairro: string, cidade: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const query = `${bairro}, ${cidade}`;
    const email = 'contato@economizapay.com.br';
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&email=${email}&limit=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR'
        },
        mode: 'cors'
      }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const getAddressFromCoords = async (lat: number, lon: number): Promise<string> => {
  try {
    // Nominatim recomenda o uso de um email para identificação e evitar rate-limiting severo
    const email = 'contato@economizapay.com.br';
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&email=${email}`,
      {
        headers: {
          'Accept-Language': 'pt-BR'
        },
        mode: 'cors',
        cache: 'force-cache' // Tenta usar cache para evitar múltiplas requisições idênticas
      }
    );

    if (!response.ok) return "Sua Região";
    
    const data = await response.json();
    
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village || 
                 data.address?.municipality ||
                 data.address?.suburb ||
                 data.address?.city_district;
    
    return city || "Localização Identificada";
  } catch (err) {
    // Falha silenciosa: se o serviço estiver fora do ar ou bloqueado por CORS/Rede,
    // retornamos um fallback genérico sem poluir o console do usuário.
    return "Sua Localização"; 
  }
};
