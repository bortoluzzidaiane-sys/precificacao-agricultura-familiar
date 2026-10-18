// Custo por unidade, preço mínimo e receitas (5.6–5.8, 5.10).
import { arredondarPrecoMinimo, paraCentavos } from './dinheiro';

/** 5.6 — Quantidade vendida = Quantidade produzida × (% que vende / 100). */
export function quantidadeVendida(quantidadeProduzida: number, percentualVendido: number): number {
  return quantidadeProduzida * (percentualVendido / 100);
}

/**
 * 5.6 — Custo por unidade = Gasto total ÷ Quantidade vendida.
 * Retorna `null` quando a quantidade vendida é zero: a tela deve orientar o preenchimento.
 */
export function custoPorUnidade(gastoTotal: number, qtdVendida: number): number | null {
  if (!(qtdVendida > 0)) return null;
  return gastoTotal / qtdVendida;
}

export interface PrecoMinimo {
  exato: number;
  exibido: number;
}

/**
 * 5.7 — Preço mínimo exato = Custo por unidade × (1 + Margem mínima / 100).
 * É multiplicação sobre o custo (não é divisor nem margem sobre o preço de venda).
 * Exibido = exato arredondado para cima ao múltiplo de R$ 0,10.
 */
export function precoMinimo(custoUnitario: number, margemMinima: number): PrecoMinimo {
  const exato = custoUnitario * (1 + margemMinima / 100);
  return { exato, exibido: arredondarPrecoMinimo(exato) };
}

export interface Receitas {
  comPrecoAtual: number;
  comPrecoMinimo: number;
  /** Receita com preço mínimo − Receita com preço atual. */
  diferenca: number;
}

/** 5.8 — Receitas com preço atual e com preço mínimo exibido. */
export function receitas(qtdVendida: number, precoAtual: number, precoMinimoExibido: number): Receitas {
  const comPrecoAtual = qtdVendida * precoAtual;
  const comPrecoMinimo = qtdVendida * precoMinimoExibido;
  return { comPrecoAtual, comPrecoMinimo, diferenca: comPrecoMinimo - comPrecoAtual };
}

export type Comparacao = 'acima' | 'igual' | 'abaixo';

/** 5.10 — Preço atual está acima ou abaixo do preço mínimo exibido? */
export function compararPreco(precoAtual: number, precoMinimoExibido: number): Comparacao {
  const atual = paraCentavos(precoAtual);
  const minimo = paraCentavos(precoMinimoExibido);
  if (atual > minimo) return 'acima';
  if (atual < minimo) return 'abaixo';
  return 'igual';
}
