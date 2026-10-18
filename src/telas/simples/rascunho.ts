// Respostas do Modo Simples e conversão para os dados usados nos cálculos.
import {
  calcularProduto,
  totalGastosComuns,
  PESO_POR_TEMPO,
  type ItemDeGasto,
  type Periodo,
  type Produto,
  type Propriedade,
  type ResultadoProduto,
  type TempoSimples,
} from '../../calculos';
import { textos, type TrechoPeriodo } from '../../textos';

export const CATEGORIAS_DIRETAS = ['sementes', 'adubo', 'racao', 'embalagem', 'maoDeObra', 'outros'] as const;
export const CATEGORIAS_COMUNS = [
  'luzAgua',
  'combustivel',
  'transporte',
  'maoDeObraGeral',
  'protecao',
  'outros',
] as const;
export const ITENS_AJUDA_TRABALHO = ['alimentacao', 'saude', 'outras'] as const;

export type CategoriaDireta = (typeof CATEGORIAS_DIRETAS)[number];
export type CategoriaComum = (typeof CATEGORIAS_COMUNS)[number];
export type ItemAjudaTrabalho = (typeof ITENS_AJUDA_TRABALHO)[number];
export type ChaveUnidade = keyof typeof textos.produto.unidades | 'outra';

export interface EquipamentoRascunho {
  valorPago?: number;
  anosDeUso?: number;
  temOutro?: boolean;
}

export interface Rascunho {
  produtoId: string;
  produtoChave?: string;
  produtoNome?: string;
  periodo?: Periodo;
  mesesDoCiclo?: number;
  unidade?: ChaveUnidade;
  unidadeOutra?: string;
  diretos: Partial<Record<CategoriaDireta, number>>;
  diretosOutrosDescricao?: string;
  tempo?: TempoSimples;
  comuns: Partial<Record<CategoriaComum, number>>;
  comunsOutrosDescricao?: string;
  temEquipamento?: boolean;
  equipamentos: EquipamentoRascunho[];
  sabeMeuTrabalho?: boolean;
  ajudaTrabalho: Partial<Record<ItemAjudaTrabalho, number>>;
  ajudaTrabalhoOutrasDescricao?: string;
  meuTrabalho?: number;
  quantidadeProduzida?: number;
  /** De cada 10 produzidos, quantos vende (1–10). */
  decimosVendidos?: number;
  margemMinima?: number;
  precoAtual?: number;
}

function novoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function rascunhoVazio(): Rascunho {
  return { produtoId: novoId(), diretos: {}, comuns: {}, equipamentos: [], ajudaTrabalho: {} };
}

export function nomeDoProduto(r: Rascunho): string {
  return r.produtoNome?.trim() || 'este produto';
}

export function mesesDoRascunho(r: Rascunho): number {
  return r.periodo === 'ciclo' ? (r.mesesDoCiclo ?? 1) : 1;
}

export function trechoPeriodo(r: Rascunho): TrechoPeriodo {
  return r.periodo === 'ciclo' ? 'na safra inteira' : 'por mês';
}

export function nomeDaUnidade(r: Rascunho, forma: 'singular' | 'plural'): string {
  if (r.unidade === 'outra') return r.unidadeOutra?.trim() || 'unidade';
  if (r.unidade) return textos.produto.unidades[r.unidade][forma];
  return forma === 'singular' ? 'unidade' : 'unidades';
}

/** Soma da calculadora de apoio do "Meu trabalho": só uma sugestão (5.3.1). */
export function somaAjudaTrabalho(r: Rascunho): number {
  return ITENS_AJUDA_TRABALHO.reduce((soma, item) => soma + (r.ajudaTrabalho[item] ?? 0), 0);
}

function paraItens<C extends string>(
  valores: Partial<Record<C, number>>,
  categorias: readonly C[],
  descricaoOutros?: string,
): ItemDeGasto[] {
  return categorias
    .filter((c) => (valores[c] ?? 0) > 0)
    .map((c) => ({
      categoria: c,
      valor: valores[c]!,
      ...(c === 'outros' && descricaoOutros?.trim() ? { descricao: descricaoOutros.trim() } : {}),
    }));
}

export function paraProduto(r: Rascunho): Produto {
  return {
    id: r.produtoId,
    nome: nomeDoProduto(r),
    unidade: nomeDaUnidade(r, 'singular'),
    periodo: r.periodo ?? 'mes',
    mesesDoCiclo: mesesDoRascunho(r),
    gastosDiretos: paraItens(r.diretos, CATEGORIAS_DIRETAS, r.diretosOutrosDescricao),
    pesoTempo: PESO_POR_TEMPO[r.tempo ?? 'medio'],
    quantidadeProduzida: r.quantidadeProduzida ?? 0,
    percentualVendido: (r.decimosVendidos ?? 10) * 10,
    margemMinima: r.margemMinima ?? 0,
    precoAtual: r.precoAtual ?? 0,
  };
}

export function paraPropriedade(r: Rascunho): Propriedade {
  return {
    gastosComuns: paraItens(r.comuns, CATEGORIAS_COMUNS, r.comunsOutrosDescricao),
    equipamentos: r.temEquipamento
      ? r.equipamentos
          .filter((e) => (e.valorPago ?? 0) > 0 && (e.anosDeUso ?? 0) > 0)
          .map((e) => ({ valorPago: e.valorPago!, anosDeUso: e.anosDeUso! }))
      : [],
    meuTrabalho: r.meuTrabalho ?? 0,
  };
}

/**
 * Por enquanto o Modo Simples calcula um produto por vez, então ele recebe
 * todos os gastos gerais da roça (participação = peso ÷ peso = 100%).
 */
export function calcularRascunho(r: Rascunho): ResultadoProduto {
  const produto = paraProduto(r);
  return calcularProduto(produto, totalGastosComuns(paraPropriedade(r)), produto.pesoTempo);
}
