
import { Market, Product, Price, ScanSubmission } from '../types';
import { supabase } from './supabase';

export const DB = {
  getMarkets: async (): Promise<Market[]> => {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    
    if (error) throw error;
    return data || [];
  },

  getProducts: async (searchTerm?: string, category?: string, onlyActive: boolean = false): Promise<Product[]> => {
    let query = supabase.from('products').select('*');
    
    if (onlyActive) {
      query = query.eq('ativo', true);
    }
    
    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }
    
    if (category && category !== 'Todas') {
      query = query.eq('categoria', category);
    }
    
    const { data, error } = await query.order('nome');
    if (error) throw error;
    return data || [];
  },

  getPrices: async (productId?: string, marketId?: string): Promise<Price[]> => {
    let query = supabase.from('prices').select('*').eq('ativo', true);
    
    if (productId) {
      query = query.eq('produto_id', productId);
    }

    if (marketId) {
      query = query.eq('mercado_id', marketId);
    }
    
    const { data, error } = await query.order('data_atualizacao', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getUsersCount: async (): Promise<number> => {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  // --- Estatísticas Reais para Dashboard ---
  getDashboardStats: async () => {
    try {
      // Conta produtos ativos
      const { count: products } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Conta mercados ativos
      const { count: markets } = await supabase
        .from('markets')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Conta preços monitorados (ativos)
      const { count: prices } = await supabase
        .from('prices')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Conta usuários totais
      const { count: users } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      return {
        products: products || 0,
        markets: markets || 0,
        prices: prices || 0,
        users: users || 0
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas reais:", error);
      return { products: 0, markets: 0, prices: 0, users: 0 };
    }
  },

  saveMarket: async (market: Market) => {
    const { error } = await supabase.from('markets').upsert(market);
    if (error) throw error;
  },

  deleteMarket: async (id: string) => {
    const { error } = await supabase.from('markets').delete().eq('id', id);
    if (error) throw error;
  },

  saveProduct: async (product: Product) => {
    const { error } = await supabase.from('products').upsert(product);
    if (error) throw error;
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('prices').delete().eq('produto_id', id);
    const { error: prodError } = await supabase.from('products').delete().eq('id', id);
    if (prodError) throw prodError;
  },
  
  deletePricesFromProduct: async (productId: string) => {
    const { error } = await supabase.from('prices').delete().eq('produto_id', productId);
    if (error) throw error;
  },

  savePrice: async (price: Price) => {
    const { data: existingPrices, error: fetchError } = await supabase
      .from('prices')
      .select('id')
      .eq('produto_id', price.produto_id)
      .eq('mercado_id', price.mercado_id);

    if (fetchError) throw fetchError;

    if (existingPrices && existingPrices.length > 0) {
      const idToUpdate = existingPrices[0].id;
      const { error: updateError } = await supabase
        .from('prices')
        .update({
          valor: price.valor,
          data_atualizacao: price.data_atualizacao,
          ativo: price.ativo
        })
        .eq('id', idToUpdate);
      if (updateError) throw updateError;

      if (existingPrices.length > 1) {
        const idsToDelete = existingPrices.slice(1).map(p => p.id);
        await supabase.from('prices').delete().in('id', idsToDelete);
      }
    } else {
      const { error } = await supabase.from('prices').insert(price);
      if (error) throw error;
    }
  },

  getLowestPriceForProduct: async (productId: string): Promise<number | null> => {
    const { data, error } = await supabase
      .from('prices')
      .select('valor')
      .eq('produto_id', productId)
      .eq('ativo', true)
      .order('valor', { ascending: true })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? data.valor : null;
  },

  // --- Scan Methods Seguro ---

  saveScan: async (content: string, userId?: string) => {
    if (!userId) {
      throw new Error("Usuário não autenticado. Faça login para escanear.");
    }

    try {
      const { data, error } = await supabase
        .from('scans')
        .insert([{
          content: content,
          user_id: userId, 
          status: 'pending'
        }])
        .select();
      
      if (error) {
        console.error("Erro RLS/Supabase ao salvar scan:", error);
        throw error;
      }
      
      return true;
    } catch (err) {
      console.error("Erro saveScan:", err);
      throw err;
    }
  },

  getPendingScans: async (): Promise<ScanSubmission[]> => {
    try {
      // Busca scans pendentes.
      // Graças ao RLS, se for ADMIN, retorna todos. Se for USER, retorna só os dele.
      const { data: scans, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (scanError) throw scanError;
      if (!scans || scans.length === 0) return [];

      // Recupera nomes dos usuários manualmente para garantir performance e evitar complexidade de Joins com RLS
      const userIds = [...new Set(scans.map((s: any) => s.user_id).filter(Boolean))];
      let userMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nome')
            .in('id', userIds);
            
        if (profiles) {
            profiles.forEach((p: any) => {
                userMap[p.id] = p.nome;
            });
        }
      }

      return scans.map((item: any) => ({
        ...item,
        user_nome: userMap[item.user_id] || 'Usuário'
      }));

    } catch (err) {
      console.error("Erro ao buscar scans:", err);
      return [];
    }
  },

  markScanAsProcessed: async (id: string) => {
    const { error } = await supabase
      .from('scans')
      .update({ status: 'processed' })
      .eq('id', id);
    
    if (error) throw error;
  }
};
