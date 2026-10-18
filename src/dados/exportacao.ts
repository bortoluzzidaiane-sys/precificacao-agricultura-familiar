// Cópia de segurança (JSON) e planilha (CSV). Tudo é gerado no próprio celular, sem servidor.
// O formato já separa produtos e propriedade, para a futura exportação anônima (LGPD) da Meta 6.
import type { CalculoPropriedade, Produto, Propriedade } from '../calculos';

export const IDENTIFICADOR_APP = 'precificacao-agricultura-familiar';
export const VERSAO_COPIA = 1;

export interface CopiaDeSeguranca {
  app: typeof IDENTIFICADOR_APP;
  versao: number;
  exportadoEm: string;
  propriedade: Propriedade;
  produtos: Produto[];
}

export function montarCopia(produtos: Produto[], propriedade: Propriedade, agora = new Date()): CopiaDeSeguranca {
  return {
    app: IDENTIFICADOR_APP,
    versao: VERSAO_COPIA,
    exportadoEm: agora.toISOString(),
    propriedade,
    produtos,
  };
}

const ehNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function produtoValido(p: unknown): p is Produto {
  if (!p || typeof p !== 'object') return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.nome === 'string' &&
    (x.periodo === 'mes' || x.periodo === 'ciclo') &&
    Array.isArray(x.gastosDiretos) &&
    ['mesesDoCiclo', 'pesoTempo', 'quantidadeProduzida', 'percentualVendido', 'margemMinima', 'precoAtual'].every(
      (c) => ehNumero(x[c]),
    )
  );
}

/** Lê o arquivo de cópia. Retorna `null` se não for uma cópia deste app. */
export function lerCopia(texto: string): CopiaDeSeguranca | null {
  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!dados || typeof dados !== 'object') return null;
  const c = dados as Record<string, unknown>;
  const prop = c.propriedade as Record<string, unknown> | undefined;
  if (c.app !== IDENTIFICADOR_APP || !ehNumero(c.versao) || c.versao > VERSAO_COPIA) return null;
  if (!Array.isArray(c.produtos) || !c.produtos.every(produtoValido)) return null;
  if (!prop || !Array.isArray(prop.gastosComuns) || !Array.isArray(prop.equipamentos) || !ehNumero(prop.meuTrabalho)) {
    return null;
  }
  return dados as CopiaDeSeguranca;
}

/** Número no formato brasileiro, sem "R$" e sem separador de milhar, para abrir em planilha. */
function numeroCsv(v: number | undefined): string {
  return v === undefined ? '' : String(Number(v.toFixed(6))).replace('.', ',');
}

function textoCsv(v: string): string {
  return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const COLUNAS = [
  'Produto',
  'Unidade',
  'Período',
  'Meses do ciclo',
  'Gastos só deste produto (período)',
  'Gasto comum do produto (mês)',
  'Gasto total do produto (período)',
  'Quantidade produzida',
  '% que vende',
  'Quantidade vendida',
  'Custo por unidade',
  'Margem mínima (%)',
  'Preço mínimo exato',
  'Preço mínimo exibido',
  'Preço atual',
  'Comparação',
  'Receita com preço atual (período)',
  'Receita com preço mínimo (período)',
  'Diferença (período)',
];

/** Planilha CSV (separador ";", vírgula decimal), pronta para o Excel/LibreOffice em português. */
export function montarCsv(produtos: Produto[], calculo: CalculoPropriedade): string {
  const linhas = produtos.map((p, i) => {
    const r = calculo.resultados[i];
    const base = [
      textoCsv(p.nome),
      textoCsv(p.unidade),
      p.periodo === 'mes' ? 'mês' : 'safra',
      numeroCsv(p.periodo === 'mes' ? 1 : p.mesesDoCiclo),
    ];
    const dados = [
      p.quantidadeProduzida,
      p.percentualVendido,
    ];
    if (!r.ok) {
      return [
        ...base,
        '',
        '',
        numeroCsv(r.gastoTotal),
        ...dados.map(numeroCsv),
        '',
        '',
        numeroCsv(p.margemMinima),
        '',
        '',
        numeroCsv(p.precoAtual),
        'sem cálculo',
        '',
        '',
        '',
      ];
    }
    return [
      ...base,
      numeroCsv(r.gastosDiretos),
      numeroCsv(r.gastoComumMes),
      numeroCsv(r.gastoTotal),
      ...dados.map(numeroCsv),
      numeroCsv(r.quantidadeVendida),
      numeroCsv(r.custoPorUnidade),
      numeroCsv(p.margemMinima),
      numeroCsv(r.precoMinimo.exato),
      numeroCsv(r.precoMinimo.exibido),
      numeroCsv(p.precoAtual),
      r.comparacao,
      numeroCsv(r.receitas.comPrecoAtual),
      numeroCsv(r.receitas.comPrecoMinimo),
      numeroCsv(r.receitas.diferenca),
    ];
  });
  // BOM no início para o Excel reconhecer os acentos.
  return '﻿' + [COLUNAS, ...linhas].map((l) => l.join(';')).join('\r\n') + '\r\n';
}

/** Baixa um arquivo gerado no celular. */
export function baixarArquivo(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
