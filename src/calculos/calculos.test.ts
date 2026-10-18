// Casos de teste obrigatórios (CLAUDE.md, seção 8) — conferíveis à mão.
import { describe, expect, it } from 'vitest';
import {
  arredondarPrecoMinimo,
  calcularProduto,
  custoPorUnidade,
  gastoComumDoProduto,
  gastoTotalDoProduto,
  lerValor,
  precoMinimo,
  quantidadeVendida,
  receitas,
  reservaMensalEquipamentos,
  type Produto,
} from './index';

describe('Caso 1 — base vendida e arredondamento (Mandioca)', () => {
  const vendida = quantidadeVendida(200, 80);
  const custo = custoPorUnidade(300, vendida);

  it('vende 80% de 200 kg → 160 kg', () => {
    expect(vendida).toBe(160);
  });

  it('custo por unidade R$ 1,875', () => {
    expect(custo).toBeCloseTo(1.875, 10);
  });

  it('margem 20% → exato R$ 2,25; exibido R$ 2,30', () => {
    const preco = precoMinimo(custo!, 20);
    expect(preco.exato).toBeCloseTo(2.25, 10);
    expect(preco.exibido).toBe(2.3);
  });

  it('preço atual R$ 2,50 → receita com preço atual R$ 400,00', () => {
    expect(receitas(vendida, 2.5, 2.3).comPrecoAtual).toBeCloseTo(400, 10);
  });
});

describe('Caso 2 — divisão dos gastos comuns', () => {
  const soma = 3 + 2 + 1;

  it('R$ 600,00/mês com pesos 3/2/1 → Alface 300, Ovos 200, Feijão 100', () => {
    expect(gastoComumDoProduto(600, 3, soma)).toBeCloseTo(300, 10);
    expect(gastoComumDoProduto(600, 2, soma)).toBeCloseTo(200, 10);
    expect(gastoComumDoProduto(600, 1, soma)).toBeCloseTo(100, 10);
  });
});

describe('Caso 3 — produto de ciclo (Feijão)', () => {
  it('gasto total = 200 + 100 × 4 = R$ 600,00', () => {
    expect(gastoTotalDoProduto(200, 100, 4)).toBeCloseTo(600, 10);
  });

  it('300 kg, vende 100% → custo R$ 2,00; margem 25% → exato e exibido R$ 2,50', () => {
    const custo = custoPorUnidade(600, quantidadeVendida(300, 100));
    expect(custo).toBeCloseTo(2, 10);
    const preco = precoMinimo(custo!, 25);
    expect(preco.exato).toBeCloseTo(2.5, 10);
    expect(preco.exibido).toBe(2.5); // não pode virar R$ 2,60
  });

  it('cálculo completo do produto, com a divisão do Caso 2', () => {
    const feijao: Produto = {
      id: 'feijao',
      nome: 'Feijão',
      unidade: 'kg',
      periodo: 'ciclo',
      mesesDoCiclo: 4,
      gastosDiretos: [{ categoria: 'sementes', valor: 200 }],
      pesoTempo: 1,
      quantidadeProduzida: 300,
      percentualVendido: 100,
      margemMinima: 25,
      precoAtual: 3,
    };
    const r = calcularProduto(feijao, 600, 6);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.gastoComumMes).toBeCloseTo(100, 10);
    expect(r.gastoTotal).toBeCloseTo(600, 10);
    expect(r.custoPorUnidade).toBeCloseTo(2, 10);
    expect(r.precoMinimo.exibido).toBe(2.5);
    expect(r.comparacao).toBe('acima');
  });
});

describe('Caso 4 — reserva de equipamentos', () => {
  it('roçadeira de R$ 2.400,00, 5 anos → R$ 40,00/mês', () => {
    expect(reservaMensalEquipamentos([{ valorPago: 2400, anosDeUso: 5 }])).toBeCloseTo(40, 10);
  });
});

describe('Caso 5 — arredondamento sem erro de ponto flutuante', () => {
  it('exato R$ 1,80 → exibido R$ 1,80', () => {
    expect(arredondarPrecoMinimo(1.8)).toBe(1.8);
  });
});

describe('Proteções adicionais', () => {
  it('quantidade vendida zero não gera preço', () => {
    expect(custoPorUnidade(300, 0)).toBeNull();
  });

  it('nunca arredonda para baixo', () => {
    expect(arredondarPrecoMinimo(1.81)).toBe(1.9);
    expect(arredondarPrecoMinimo(1.801)).toBe(1.8); // 1,801 → 1,80 em 2 casas
  });

  it('aceita digitação com vírgula', () => {
    expect(lerValor('2,50')).toBe(2.5);
    expect(lerValor('R$ 1.234,56')).toBe(1234.56);
    expect(lerValor('2.400')).toBe(2400);
    expect(lerValor('abc')).toBeNull();
  });
});
