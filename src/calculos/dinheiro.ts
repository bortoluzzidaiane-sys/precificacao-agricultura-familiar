// Arredondamento, leitura e formatação de valores em real.

/**
 * Converte reais para centavos inteiros com arredondamento comum a 2 casas.
 * O `toPrecision(12)` remove o ruído de ponto flutuante (ex.: 1,005 × 100 = 100,4999…)
 * antes de arredondar.
 */
export function paraCentavos(reais: number): number {
  return Math.round(Number((reais * 100).toPrecision(12)));
}

/**
 * Preço mínimo exibido (5.7): arredonda PARA CIMA ao próximo múltiplo de R$ 0,10.
 * Primeiro vai a centavos inteiros (2 casas), depois sobe ao múltiplo de 10 centavos.
 * Um valor que já é múltiplo de R$ 0,10 não muda (R$ 1,80 continua R$ 1,80).
 */
export function arredondarPrecoMinimo(precoExato: number): number {
  const centavos = paraCentavos(precoExato);
  return (Math.ceil(centavos / 10) * 10) / 100;
}

/**
 * Lê um valor digitado pelo agricultor, aceitando vírgula como separador decimal
 * e ponto como separador de milhar ("1.234,56", "2,5", "R$ 10").
 * Retorna `null` se não for um número válido.
 */
export function lerValor(texto: string): number | null {
  let limpo = texto.replace(/R\$/gi, '').replace(/\s/g, '');
  if (limpo === '') return null;
  if (limpo.includes(',')) {
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    limpo = limpo.replace(/\./g, '');
  }
  if (!/^-?\d+(\.\d+)?$/.test(limpo)) return null;
  return Number(limpo);
}

const formatoReal = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Formata para exibição: `R$ 1.234,56`. Usar só na tela, nunca para guardar.
 * O espaço depois de "R$" é inquebrável, para o valor não se partir em duas linhas.
 */
export function formatarReal(valor: number): string {
  return formatoReal.format(valor).replace(/\s/g, '\u00A0');
}

const formatoRealExato = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/** Valor exato, com até 4 casas (Modo Completo): `R$ 1,875`. */
export function formatarRealExato(valor: number): string {
  return formatoRealExato.format(valor).replace(/\s/g, '\u00A0');
}

const formatoNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** Quantidades e percentuais: `1.234,5`. */
export function formatarNumero(valor: number): string {
  return formatoNumero.format(valor);
}
