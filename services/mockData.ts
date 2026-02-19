import { Market, Product, Price } from '../types';

export const INITIAL_MARKETS: Market[] = [
  { id: 'm1', nome: 'Supermercado Preço Bom', ativo: true, data_criacao: new Date().toISOString() },
  { id: 'm2', nome: 'Hipermercado Extra', ativo: true, data_criacao: new Date().toISOString() },
  { id: 'm3', nome: 'Mercadinho do Bairro', ativo: true, data_criacao: new Date().toISOString() },
  { id: 'm4', nome: 'Farmácia Saúde', ativo: true, data_criacao: new Date().toISOString() },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', nome: 'Arroz Branco 5kg', categoria: 'Alimentos', ativo: true, imagem_url: 'https://picsum.photos/200/200?random=1', data_criacao: new Date().toISOString() },
  { id: 'p2', nome: 'Feijão Carioca 1kg', categoria: 'Alimentos', ativo: true, imagem_url: 'https://picsum.photos/200/200?random=2', data_criacao: new Date().toISOString() },
  { id: 'p3', nome: 'Leite Integral 1L', categoria: 'Laticínios', ativo: true, imagem_url: 'https://picsum.photos/200/200?random=3', data_criacao: new Date().toISOString() },
  { id: 'p4', nome: 'Detergente Líquido', categoria: 'Limpeza', ativo: true, imagem_url: 'https://picsum.photos/200/200?random=4', data_criacao: new Date().toISOString() },
  { id: 'p5', nome: 'Dipirona 500mg', categoria: 'Farmácia', ativo: true, imagem_url: 'https://picsum.photos/200/200?random=5', data_criacao: new Date().toISOString() },
];

export const INITIAL_PRICES: Price[] = [
  { id: 'pr1', produto_id: 'p1', mercado_id: 'm1', valor: 24.90, ativo: true, data_atualizacao: new Date().toISOString() },
  { id: 'pr2', produto_id: 'p1', mercado_id: 'm2', valor: 23.50, ativo: true, data_atualizacao: new Date().toISOString() },
  { id: 'pr3', produto_id: 'p1', mercado_id: 'm3', valor: 26.00, ativo: true, data_atualizacao: new Date().toISOString() },
  { id: 'pr4', produto_id: 'p2', mercado_id: 'm1', valor: 8.50, ativo: true, data_atualizacao: new Date().toISOString() },
  { id: 'pr5', produto_id: 'p2', mercado_id: 'm2', valor: 7.99, ativo: true, data_atualizacao: new Date().toISOString() },
  { id: 'pr6', produto_id: 'p3', mercado_id: 'm1', valor: 4.59, ativo: true, data_atualizacao: new Date().toISOString() },
  { id: 'pr7', produto_id: 'p3', mercado_id: 'm3', valor: 4.80, ativo: true, data_atualizacao: new Date().toISOString() },
];