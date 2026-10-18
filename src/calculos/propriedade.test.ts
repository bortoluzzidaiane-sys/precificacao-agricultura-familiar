// Vários produtos juntos: Casos 2 e 3 (CLAUDE.md, seção 8) pela divisão completa.
import { describe, expect, it } from 'vitest';
import { calcularPropriedade, type Produto, type Propriedade } from './index';

function produto(dados: Partial<Produto> & Pick<Produto, 'id' | 'nome'>): Produto {
  return {
    unidade: 'kg',
    periodo: 'mes',
    mesesDoCiclo: 1,
    gastosDiretos: [],
    pesoTempo: 0,
    quantidadeProduzida: 100,
    percentualVendido: 100,
    margemMinima: 0,
    precoAtual: 0,
    ...dados,
  };
}

const alface = produto({ id: 'alface', nome: 'Alface', tempo: 'muito', percentualTempo: 50 });
const ovos = produto({ id: 'ovos', nome: 'Ovos', tempo: 'medio', percentualTempo: 100 / 3 });
const feijao = produto({
  id: 'feijao',
  nome: 'Feijão',
  periodo: 'ciclo',
  mesesDoCiclo: 4,
  gastosDiretos: [{ categoria: 'sementes', valor: 200 }],
  tempo: 'pouco',
  percentualTempo: 100 / 6,
  quantidadeProduzida: 300,
  margemMinima: 25,
  precoAtual: 2,
});
// R$ 600,00/mês de gastos comuns: 560 em itens + 40 da roçadeira (Caso 4).
const propriedade: Propriedade = {
  gastosComuns: [{ categoria: 'luzAgua', valor: 160 }],
  equipamentos: [{ valorPago: 2400, anosDeUso: 5 }],
  meuTrabalho: 400,
};

describe('Cálculo da propriedade', () => {
  it.each(['pesos', 'percentual'] as const)('divisão por %s: Casos 2 e 3', (divisao) => {
    const c = calcularPropriedade([alface, ovos, feijao], { ...propriedade, divisaoTempo: divisao });
    expect(c.totalGastosComuns).toBeCloseTo(600, 10);
    expect(c.reservaEquipamentos).toBeCloseTo(40, 10);
    expect(c.percentuaisOk).toBe(true);
    const [a, o, f] = c.resultados;
    if (!a.ok || !o.ok || !f.ok) throw new Error('todos deveriam calcular');
    expect(a.gastoComumMes).toBeCloseTo(300, 10);
    expect(o.gastoComumMes).toBeCloseTo(200, 10);
    expect(f.gastoComumMes).toBeCloseTo(100, 10);
    expect(f.gastoTotal).toBeCloseTo(600, 10);
    expect(f.precoMinimo.exibido).toBe(2.5);
  });

  it('avisa quando os percentuais não somam 100%', () => {
    const c = calcularPropriedade([{ ...alface, percentualTempo: 60 }, { ...ovos, percentualTempo: 30 }], {
      ...propriedade,
      divisaoTempo: 'percentual',
    });
    expect(c.percentuaisOk).toBe(false);
  });

  it('produto sem tempo informado é apontado', () => {
    const c = calcularPropriedade([alface, { ...ovos, tempo: undefined }], propriedade);
    expect(c.produtosSemTempo).toEqual(['ovos']);
  });

  it('safra sem nº de meses não gera preço (evita divisão por zero no resumo)', () => {
    const c = calcularPropriedade([{ ...feijao, mesesDoCiclo: 0 }], propriedade);
    expect(c.resultados[0]).toMatchObject({ ok: false, motivo: 'meses-do-ciclo' });
    expect(Number.isFinite(c.resumo.todosOsGastos)).toBe(true);
  });

  it('resumo do mês: safra entra pela média mensal e o trabalho próprio sai do segundo resultado', () => {
    // Feijão sozinho: recebe os R$ 600,00/mês. Gasto total = 200 + 600 × 4 = 2.600 no ciclo → 650/mês.
    const c = calcularPropriedade([feijao], propriedade);
    const f = c.resultados[0];
    if (!f.ok) throw new Error('deveria calcular');
    expect(f.gastoTotal).toBeCloseTo(2600, 10);
    // Receita com preço atual: 300 kg × R$ 2,00 = 600 no ciclo → 150/mês.
    expect(c.resumo.receitaComPrecoAtual).toBeCloseTo(150, 10);
    expect(c.resumo.todosOsGastos).toBeCloseTo(650, 10);
    expect(c.resumo.resultadoTodosOsCustos).toBeCloseTo(-500, 10);
    expect(c.resumo.resultadoSemTrabalhoProprio).toBeCloseTo(-100, 10);
  });
});
