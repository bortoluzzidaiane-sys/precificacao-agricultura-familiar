// Tipos de dados usados nos cálculos (CLAUDE.md, seção 5).
// Valores monetários sempre como número, em reais — nunca como texto formatado.

export type Periodo = 'mes' | 'ciclo';

/** Modo Simples: muito / médio / pouco tempo de trabalho no produto. */
export type TempoSimples = 'muito' | 'medio' | 'pouco';

export interface ItemDeGasto {
  categoria: string;
  descricao?: string;
  valor: number;
}

export interface Equipamento {
  descricao?: string;
  valorPago: number;
  anosDeUso: number;
}

export interface Produto {
  id: string;
  nome: string;
  unidade: string;
  periodo: Periodo;
  /** Nº de meses do ciclo. Para `mes`, é sempre 1. */
  mesesDoCiclo: number;
  /** Gastos só deste produto, no período (ciclo inteiro, se for `ciclo`). */
  gastosDiretos: ItemDeGasto[];
  /** Peso de tempo efetivo usado na divisão (5.4): 3/2/1 ou o percentual. */
  pesoTempo: number;
  /** Tempo informado como muito / médio / pouco. */
  tempo?: TempoSimples;
  /** Tempo informado como percentual (Modo Completo). */
  percentualTempo?: number;
  quantidadeProduzida: number;
  /** % da produção que é vendida (0–100). */
  percentualVendido: number;
  /** Margem mínima em % (ex.: 20 para 20%). */
  margemMinima: number;
  precoAtual: number;
}

/** Dados de toda a propriedade, por mês (5.3). */
export interface Propriedade {
  gastosComuns: ItemDeGasto[];
  equipamentos: Equipamento[];
  /** Meu trabalho: quanto preciso tirar por mês (5.3.1). Entra uma única vez. */
  meuTrabalho: number;
  /** Como o tempo de trabalho é informado: muito/médio/pouco ou percentual. Padrão: pesos. */
  divisaoTempo?: DivisaoTempo;
  /** Horas trabalhadas no mês, só para o valor da hora equivalente (informativo). */
  horasNoMes?: number;
  /** Calculadora de apoio do "Meu trabalho": só sugestão, não entra nos gastos. */
  ajudaTrabalho?: ItemDeGasto[];
}

export type DivisaoTempo = 'pesos' | 'percentual';
