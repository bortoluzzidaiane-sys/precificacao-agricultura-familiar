// Percorre as perguntas do Modo Simples e confere o resultado com o Caso 1 (CLAUDE.md, seção 8).
import { describe, expect, it } from 'vitest';
import { montarPassos, type Passo } from './passos';
import { calcularRascunho, paraPropriedade, rascunhoVazio, type Rascunho } from './rascunho';

type Resposta = number | string;

/** Responde pergunta por pergunta. Para opções, a resposta é o rótulo do botão. */
function responderTudo(respostas: Record<string, Resposta>): { rascunho: Rascunho; ids: string[] } {
  let r = rascunhoVazio();
  const ids: string[] = [];
  for (let i = 0; i < montarPassos(r).length; i++) {
    const passo: Passo = montarPassos(r)[i];
    ids.push(passo.id);
    const resposta = respostas[passo.id];
    switch (passo.tipo) {
      case 'aviso':
        break;
      case 'opcoes': {
        const op = passo.opcoes.find((o) => o.rotulo === resposta);
        if (!op) throw new Error(`Sem resposta para ${passo.id}`);
        r = op.escolher(r);
        break;
      }
      case 'texto':
        r = passo.gravar(r, String(resposta));
        break;
      case 'valor':
        r = passo.gravar(r, typeof resposta === 'number' ? resposta : 0);
        break;
    }
  }
  return { rascunho: r, ids };
}

describe('Fluxo do Modo Simples', () => {
  it('Mandioca: chega ao Caso 1 (gasto R$ 300,00 → preço mínimo R$ 2,30)', () => {
    // Gasto total = 100 (só deste produto) + 100 (meu trabalho, por mês) × 2 meses = 300
    const { rascunho, ids } = responderTudo({
      produto: 'Mandioca',
      meses: 2,
      unidade: 'Por quilo (kg)',
      'direto-sementes': 100,
      tempo: 'Muito',
      'equip-tem': 'Não',
      'trabalho-sabe': 'Sim, já sei',
      'trabalho-valor': 100,
      quantidade: 200,
      vende: '8',
      margem: 20,
      'preco-atual': 2.5,
    });
    expect(ids).toContain('meses');
    expect(ids).not.toContain('trabalho-alimentacao');

    const r = calcularRascunho(rascunho);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.gastoTotal).toBeCloseTo(300, 10);
    expect(r.quantidadeVendida).toBe(160);
    expect(r.custoPorUnidade).toBeCloseTo(1.875, 10);
    expect(r.precoMinimo.exibido).toBe(2.3);
    expect(r.receitas.comPrecoAtual).toBeCloseTo(400, 10);
  });

  it('dois equipamentos entram na reserva; a ajuda do "Meu trabalho" é só sugestão', () => {
    const { rascunho, ids } = responderTudo({
      produto: 'Ovos',
      unidade: 'Por dúzia',
      tempo: 'Médio',
      'equip-tem': 'Sim',
      'equip-0-valor': 2400,
      'equip-0-anos': 5,
      'equip-0-outro': 'Sim',
      'equip-1-valor': 1200,
      'equip-1-anos': 10,
      'equip-1-outro': 'Não',
      'trabalho-sabe': 'Não, me ajude a calcular',
      'trabalho-alimentacao': 800,
      'trabalho-saude': 200,
      'trabalho-outras': 500,
      'trabalho-valor': 1400,
      quantidade: 100,
      vende: '10 (vendo tudo)',
      margem: 10,
      'preco-atual': 12,
    });
    expect(ids).not.toContain('meses');
    expect(ids).toContain('equip-1-anos');

    const prop = paraPropriedade(rascunho);
    expect(prop.equipamentos).toHaveLength(2);
    expect(prop.meuTrabalho).toBe(1400); // vale o que o agricultor escreveu, não a soma de 1.500
  });

  it('quantidade zero não gera preço', () => {
    const { rascunho } = responderTudo({
      produto: 'Alface',
      unidade: 'Por maço',
      tempo: 'Pouco',
      'equip-tem': 'Não',
      'trabalho-sabe': 'Sim, já sei',
      'trabalho-valor': 500,
      quantidade: 0,
      vende: '5',
      margem: 20,
      'preco-atual': 3,
    });
    expect(calcularRascunho(rascunho).ok).toBe(false);
  });
});
