import { describe, expect, it } from 'vitest';
import { calcularPropriedade, type Produto, type Propriedade } from '../calculos';
import { lerCopia, montarCopia, montarCsv } from './exportacao';

const mandioca: Produto = {
  id: 'm1',
  nome: 'Mandioca; mansa',
  unidade: 'kg',
  periodo: 'ciclo',
  mesesDoCiclo: 1,
  gastosDiretos: [{ categoria: 'sementes', valor: 300 }],
  pesoTempo: 3,
  tempo: 'muito',
  quantidadeProduzida: 200,
  percentualVendido: 80,
  margemMinima: 20,
  precoAtual: 2.5,
};
const propriedade: Propriedade = { gastosComuns: [], equipamentos: [], meuTrabalho: 0 };

describe('Cópia de segurança', () => {
  it('ida e volta sem perder dados', () => {
    const copia = montarCopia([mandioca], propriedade, new Date('2026-10-18T12:00:00Z'));
    expect(lerCopia(JSON.stringify(copia))).toEqual(copia);
  });

  it('recusa arquivos que não são deste app', () => {
    expect(lerCopia('não é json')).toBeNull();
    expect(lerCopia(JSON.stringify({ app: 'outro', versao: 1, produtos: [], propriedade }))).toBeNull();
  });
});

describe('Planilha CSV', () => {
  it('Caso 1 em formato brasileiro', () => {
    const csv = montarCsv([mandioca], calcularPropriedade([mandioca], propriedade));
    const [cabecalho, linha] = csv.replace('﻿', '').trim().split('\r\n');
    // O nome com ";" fica entre aspas, para não quebrar as colunas.
    expect(linha.startsWith('"Mandioca; mansa";')).toBe(true);
    const valores = linha.replace('"Mandioca; mansa"', 'Mandioca').split(';');
    const porNome = Object.fromEntries(cabecalho.split(';').map((c, i) => [c, valores[i]]));
    expect(porNome['Custo por unidade']).toBe('1,875');
    expect(porNome['Preço mínimo exato']).toBe('2,25');
    expect(porNome['Preço mínimo exibido']).toBe('2,3');
    expect(porNome['Receita com preço atual (período)']).toBe('400');
  });
});
