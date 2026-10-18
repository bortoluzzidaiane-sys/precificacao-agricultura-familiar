// Categorias de gastos (CLAUDE.md, 5.2 e 5.3). Lista ainda a confirmar pela coordenação (seção 9).
// As chaves são as mesmas nos dois modos; os nomes exibidos ficam em src/textos.

export const CATEGORIAS_DIRETAS = ['sementes', 'adubo', 'racao', 'embalagem', 'maoDeObra', 'outros'] as const;
export const CATEGORIAS_COMUNS = [
  'luzAgua',
  'combustivel',
  'transporte',
  'maoDeObraGeral',
  'protecao',
  'outros',
] as const;
export const ITENS_AJUDA_TRABALHO = ['alimentacao', 'saude', 'outras'] as const;

export type CategoriaDireta = (typeof CATEGORIAS_DIRETAS)[number];
export type CategoriaComum = (typeof CATEGORIAS_COMUNS)[number];
export type ItemAjudaTrabalho = (typeof ITENS_AJUDA_TRABALHO)[number];
