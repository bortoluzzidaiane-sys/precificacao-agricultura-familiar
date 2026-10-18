// Cálculo de todos os produtos da propriedade juntos: divisão dos gastos comuns (5.4) e resumo do mês (5.9).
import { PESO_POR_TEMPO, participacao, percentuaisSomam100, reservaMensalEquipamentos, totalGastosComuns } from './gastos';
import { calcularProduto, type ResultadoProduto } from './produto';
import { resumoDoMes, type ResumoDoMes } from './resumo';
import type { DivisaoTempo, Produto, Propriedade } from './tipos';

/** Peso de tempo do produto conforme a forma de divisão escolhida. Sem informação → 0. */
export function pesoEfetivo(produto: Produto, divisao: DivisaoTempo = 'pesos'): number {
  if (divisao === 'percentual') return produto.percentualTempo ?? 0;
  return produto.tempo ? PESO_POR_TEMPO[produto.tempo] : 0;
}

export interface CalculoPropriedade {
  divisao: DivisaoTempo;
  reservaEquipamentos: number;
  totalGastosComuns: number;
  somaDosPesos: number;
  /** Participação de cada produto (0–1), pela ordem de `produtos`. */
  participacoes: number[];
  /** No Modo Completo os percentuais devem somar 100% (5.4). */
  percentuaisOk: boolean;
  /** Produtos sem tempo informado não recebem parte dos gastos gerais. */
  produtosSemTempo: string[];
  resultados: ResultadoProduto[];
  resumo: ResumoDoMes;
}

export function calcularPropriedade(produtos: Produto[], propriedade: Propriedade): CalculoPropriedade {
  const divisao = propriedade.divisaoTempo ?? 'pesos';
  const pesos = produtos.map((p) => pesoEfetivo(p, divisao));
  const somaDosPesos = pesos.reduce((s, p) => s + p, 0);
  const total = totalGastosComuns(propriedade);

  const resultados = produtos.map((p, i) => calcularProduto({ ...p, pesoTempo: pesos[i] }, total, somaDosPesos));

  return {
    divisao,
    reservaEquipamentos: reservaMensalEquipamentos(propriedade.equipamentos),
    totalGastosComuns: total,
    somaDosPesos,
    participacoes: pesos.map((p) => participacao(p, somaDosPesos)),
    percentuaisOk: divisao !== 'percentual' || produtos.length === 0 || percentuaisSomam100(pesos),
    produtosSemTempo: produtos.filter((_, i) => !(pesos[i] > 0)).map((p) => p.id),
    resultados,
    resumo: resumoDoMes(resultados, propriedade.meuTrabalho),
  };
}
