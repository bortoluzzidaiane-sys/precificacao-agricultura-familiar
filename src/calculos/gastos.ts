// Gastos comuns, reserva de equipamentos e divisão entre produtos (5.3–5.5).
import type { Equipamento, ItemDeGasto, Propriedade, TempoSimples } from './tipos';

export function somarGastos(itens: ItemDeGasto[]): number {
  return itens.reduce((soma, item) => soma + item.valor, 0);
}

/** 5.3.2 — Reserva mensal = Σ (Valor pago ÷ Anos de uso ÷ 12). Valor residual zero. */
export function reservaMensalEquipamentos(equipamentos: Equipamento[]): number {
  return equipamentos.reduce((soma, eq) => {
    if (eq.anosDeUso <= 0) return soma;
    return soma + eq.valorPago / eq.anosDeUso / 12;
  }, 0);
}

/** 5.3 — Total de gastos comuns (mês) = itens + Reserva para conserto e troca + Meu trabalho. */
export function totalGastosComuns(propriedade: Propriedade): number {
  return (
    somarGastos(propriedade.gastosComuns) +
    reservaMensalEquipamentos(propriedade.equipamentos) +
    propriedade.meuTrabalho
  );
}

/** 5.3.1 — Valor da hora equivalente (só informativo, Modo Completo). */
export function valorDaHora(meuTrabalho: number, horasNoMes: number): number | null {
  if (horasNoMes <= 0) return null;
  return meuTrabalho / horasNoMes;
}

/** 5.4 — Modo Simples: muito / médio / pouco → pesos 3 / 2 / 1. */
export const PESO_POR_TEMPO: Record<TempoSimples, number> = {
  muito: 3,
  medio: 2,
  pouco: 1,
};

/** 5.4 — Participação do produto = Peso do produto ÷ Soma dos pesos de todos os produtos. */
export function participacao(pesoDoProduto: number, somaDosPesos: number): number {
  if (somaDosPesos <= 0) return 0;
  return pesoDoProduto / somaDosPesos;
}

/** 5.4 — Gasto comum do produto (mês) = Total de gastos comuns (mês) × Participação. */
export function gastoComumDoProduto(
  totalGastosComunsMes: number,
  pesoDoProduto: number,
  somaDosPesos: number,
): number {
  return totalGastosComunsMes * participacao(pesoDoProduto, somaDosPesos);
}

/** 5.4 — Modo Completo: os percentuais devem somar 100%. */
export function percentuaisSomam100(percentuais: number[]): boolean {
  const soma = percentuais.reduce((s, p) => s + p, 0);
  return Math.abs(soma - 100) < 1e-9;
}

/** 5.5 — Gasto total = Gastos diretos do período + Gasto comum do produto (mês) × n. */
export function gastoTotalDoProduto(
  gastosDiretosDoPeriodo: number,
  gastoComumMes: number,
  mesesDoCiclo: number,
): number {
  return gastosDiretosDoPeriodo + gastoComumMes * mesesDoCiclo;
}
