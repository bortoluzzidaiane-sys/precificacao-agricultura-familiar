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

import {
  CATEGORIAS_COMUNS,
  CATEGORIAS_DIRETAS,
  ITENS_AJUDA_TRABALHO,
  type CategoriaComum,
  type CategoriaDireta,
  type ItemAjudaTrabalho,
} from '../../dados/categorias';

export { CATEGORIAS_COMUNS, CATEGORIAS_DIRETAS, ITENS_AJUDA_TRABALHO };
export type { CategoriaComum, CategoriaDireta, ItemAjudaTrabalho };
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
  // A descrição livre vai na última categoria da lista ("outros" / "outras").
  const ultima = categorias[categorias.length - 1];
  return categorias
    .filter((c) => (valores[c] ?? 0) > 0)
    .map((c) => ({
      categoria: c,
      valor: valores[c]!,
      ...(c === ultima && descricaoOutros?.trim() ? { descricao: descricaoOutros.trim() } : {}),
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
    tempo: r.tempo,
    quantidadeProduzida: r.quantidadeProduzida ?? 0,
    percentualVendido: (r.decimosVendidos ?? 10) * 10,
    margemMinima: r.margemMinima ?? 0,
    precoAtual: r.precoAtual ?? 0,
  };
}

/**
 * Gastos gerais da roça respondidos no Modo Simples. Recebe a propriedade já guardada
 * para manter o que só o Modo Completo preenche (forma de divisão, horas, calculadora).
 */
export function paraPropriedade(r: Rascunho, anterior?: Propriedade): Propriedade {
  return {
    ...anterior,
    gastosComuns: paraItens(r.comuns, CATEGORIAS_COMUNS, r.comunsOutrosDescricao),
    equipamentos: r.temEquipamento
      ? r.equipamentos
          .filter((e) => (e.valorPago ?? 0) > 0 && (e.anosDeUso ?? 0) > 0)
          .map((e) => ({ valorPago: e.valorPago!, anosDeUso: e.anosDeUso! }))
      : [],
    meuTrabalho: r.meuTrabalho ?? 0,
    ajudaTrabalho:
      r.sabeMeuTrabalho === false
        ? paraItens(r.ajudaTrabalho, ITENS_AJUDA_TRABALHO, r.ajudaTrabalhoOutrasDescricao)
        : anterior?.ajudaTrabalho,
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
