// Produtos pré-cadastrados (CLAUDE.md, seção 7).
import type { Periodo } from '../calculos';

export interface ProdutoPadrao {
  chave: string;
  nome: string;
  icone: string;
  periodo: Periodo;
}

export const PRODUTOS_PADRAO: ProdutoPadrao[] = [
  { chave: 'alface', nome: 'Alface', icone: '🥬', periodo: 'mes' },
  { chave: 'couve', nome: 'Couve', icone: '🌿', periodo: 'mes' },
  { chave: 'tomate', nome: 'Tomate', icone: '🍅', periodo: 'mes' },
  { chave: 'banana', nome: 'Banana', icone: '🍌', periodo: 'mes' },
  { chave: 'ovos', nome: 'Ovos', icone: '🥚', periodo: 'mes' },
  { chave: 'frango', nome: 'Frango', icone: '🐔', periodo: 'mes' },
  { chave: 'mel', nome: 'Mel', icone: '🍯', periodo: 'mes' },
  // Mandioca e feijão: o nº de meses do ciclo é informado pelo agricultor.
  { chave: 'mandioca', nome: 'Mandioca', icone: '🥔', periodo: 'ciclo' },
  { chave: 'feijao', nome: 'Feijão', icone: '🫘', periodo: 'ciclo' },
];
