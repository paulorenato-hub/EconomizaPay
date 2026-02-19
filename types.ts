
export type UserProfile = 'ADMIN' | 'USUARIO';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  perfil: UserProfile;
}

export interface Market {
  id: string;
  nome: string;
  ativo: boolean;
  data_criacao: string;
  latitude?: number;
  longitude?: number;
  distancia?: number; // Campo calculado em tempo real
}

export interface Product {
  id: string;
  nome: string;
  categoria: string;
  ativo: boolean;
  imagem_url?: string;
  data_criacao: string;
}

export interface Price {
  id: string;
  produto_id: string;
  mercado_id: string;
  valor: number;
  data_atualizacao: string;
  ativo: boolean;
}

export interface PriceComparison {
  marketName: string;
  price: number;
  lastUpdate: string;
  isLowest: boolean;
  distancia?: number;
}

export interface ScanSubmission {
  id: string;
  user_id?: string;
  content: string;
  status: 'pending' | 'processed';
  created_at: string;
  user_nome?: string; // Optional for joining
}