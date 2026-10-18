// Cálculo completo de um produto, juntando as etapas 5.4–5.8 e 5.10.
import { gastoComumDoProduto, gastoTotalDoProduto, somarGastos } from './gastos';
import {
  compararPreco,
  custoPorUnidade,
  precoMinimo,
  quantidadeVendida,
  receitas,
  type Comparacao,
  type PrecoMinimo,
  type Receitas,
} from './preco';
import type { Produto } from './tipos';

export type ResultadoProduto =
  | {
      ok: true;
      produtoId: string;
      mesesDoCiclo: number;
      gastosDiretos: number;
      gastoComumMes: number;
      gastoTotal: number;
      quantidadeVendida: number;
      custoPorUnidade: number;
      precoMinimo: PrecoMinimo;
      receitas: Receitas;
      comparacao: Comparacao;
    }
  | {
      ok: false;
      produtoId: string;
      motivo: MotivoSemCalculo;
      gastoTotal: number;
    };

/** Por que um produto não tem preço calculado: a tela orienta o preenchimento. */
export type MotivoSemCalculo = 'quantidade-vendida-zero' | 'meses-do-ciclo';

export function mesesDoPeriodo(produto: Pick<Produto, 'periodo' | 'mesesDoCiclo'>): number {
  return produto.periodo === 'mes' ? 1 : produto.mesesDoCiclo;
}

export function calcularProduto(
  produto: Produto,
  totalGastosComunsMes: number,
  somaDosPesos: number,
): ResultadoProduto {
  const n = mesesDoPeriodo(produto);
  const diretos = somarGastos(produto.gastosDiretos);
  if (!(n > 0)) {
    return { ok: false, produtoId: produto.id, motivo: 'meses-do-ciclo', gastoTotal: diretos };
  }
  const comumMes = gastoComumDoProduto(totalGastosComunsMes, produto.pesoTempo, somaDosPesos);
  const total = gastoTotalDoProduto(diretos, comumMes, n);
  const vendida = quantidadeVendida(produto.quantidadeProduzida, produto.percentualVendido);
  const custo = custoPorUnidade(total, vendida);

  if (custo === null) {
    return { ok: false, produtoId: produto.id, motivo: 'quantidade-vendida-zero', gastoTotal: total };
  }

  const preco = precoMinimo(custo, produto.margemMinima);
  return {
    ok: true,
    produtoId: produto.id,
    mesesDoCiclo: n,
    gastosDiretos: diretos,
    gastoComumMes: comumMes,
    gastoTotal: total,
    quantidadeVendida: vendida,
    custoPorUnidade: custo,
    precoMinimo: preco,
    receitas: receitas(vendida, produto.precoAtual, preco.exibido),
    comparacao: compararPreco(produto.precoAtual, preco.exibido),
  };
}
