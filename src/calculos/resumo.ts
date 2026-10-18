// Resumo do mês (5.9). Produtos de ciclo entram pela média mensal (valor do ciclo ÷ n).
import type { ResultadoProduto } from './produto';

export interface ResumoDoMes {
  receitaComPrecoAtual: number;
  receitaComPrecoMinimo: number;
  /** Receita com preço mínimo − Receita com preço atual. */
  diferenca: number;
  /** true → "Você está deixando de ganhar R$ X por mês". */
  deixandoDeGanhar: boolean;
  todosOsGastos: number;
  resultadoTodosOsCustos: number;
  resultadoSemTrabalhoProprio: number;
  /** Produtos que não puderam ser calculados (quantidade vendida zero). */
  produtosSemCalculo: string[];
}

export function resumoDoMes(resultados: ResultadoProduto[], meuTrabalhoMes: number): ResumoDoMes {
  let receitaAtual = 0;
  let receitaMinimo = 0;
  let gastos = 0;
  const semCalculo: string[] = [];

  for (const r of resultados) {
    if (!r.ok) {
      semCalculo.push(r.produtoId);
      continue;
    }
    const n = r.mesesDoCiclo;
    receitaAtual += r.receitas.comPrecoAtual / n;
    receitaMinimo += r.receitas.comPrecoMinimo / n;
    gastos += r.gastoTotal / n;
  }

  const diferenca = receitaMinimo - receitaAtual;
  return {
    receitaComPrecoAtual: receitaAtual,
    receitaComPrecoMinimo: receitaMinimo,
    diferenca,
    deixandoDeGanhar: diferenca > 0,
    todosOsGastos: gastos,
    resultadoTodosOsCustos: receitaAtual - gastos,
    resultadoSemTrabalhoProprio: receitaAtual - (gastos - meuTrabalhoMes),
    produtosSemCalculo: semCalculo,
  };
}
