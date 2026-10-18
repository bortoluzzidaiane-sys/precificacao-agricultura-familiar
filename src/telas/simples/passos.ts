// Sequência de perguntas do Modo Simples: uma pergunta por tela.
// A lista é montada a partir das respostas (ex.: safra pergunta os meses; "Sim" para equipamento abre mais perguntas).
import { formatarReal } from '../../calculos';
import { PRODUTOS_PADRAO } from '../../dados/produtosPadrao';
import { textos } from '../../textos';
import {
  CATEGORIAS_COMUNS,
  CATEGORIAS_DIRETAS,
  nomeDaUnidade,
  nomeDoProduto,
  somaAjudaTrabalho,
  trechoPeriodo,
  type ChaveUnidade,
  type EquipamentoRascunho,
  type Rascunho,
} from './rascunho';

interface PassoBase {
  id: string;
  secao?: string;
  pergunta: string;
  ajuda?: string;
}

export interface Opcao {
  rotulo: string;
  icone?: string;
  escolhida: boolean;
  escolher: (r: Rascunho) => Rascunho;
}

export type Passo =
  | (PassoBase & { tipo: 'aviso' })
  | (PassoBase & { tipo: 'opcoes'; opcoes: Opcao[]; colunas?: 1 | 2 | 5 })
  | (PassoBase & {
      tipo: 'valor';
      formato: 'dinheiro' | 'numero' | 'porcento';
      sufixo?: string;
      valor?: number;
      /** Exige número maior que zero (ex.: meses, anos de uso). */
      maiorQueZero?: boolean;
      /** Mostra o botão "Não tive esse gasto" (grava zero). */
      podePular?: boolean;
      descricao?: { valor?: string; gravar: (r: Rascunho, texto: string) => Rascunho };
      gravar: (r: Rascunho, valor: number) => Rascunho;
    })
  | (PassoBase & {
      tipo: 'texto';
      valor?: string;
      gravar: (r: Rascunho, texto: string) => Rascunho;
    });

function atualizarEquipamento(r: Rascunho, i: number, mudanca: Partial<EquipamentoRascunho>): Rascunho {
  const equipamentos = r.equipamentos.map((e, j) => (j === i ? { ...e, ...mudanca } : e));
  return { ...r, equipamentos };
}

export function montarPassos(r: Rascunho): Passo[] {
  const nome = nomeDoProduto(r);
  const periodo = trechoPeriodo(r);
  const passos: Passo[] = [];

  // Produto
  passos.push({
    id: 'produto',
    tipo: 'opcoes',
    pergunta: textos.produto.pergunta,
    colunas: 2,
    opcoes: [
      ...PRODUTOS_PADRAO.map((p) => ({
        rotulo: p.nome,
        icone: p.icone,
        escolhida: r.produtoChave === p.chave,
        escolher: (atual: Rascunho): Rascunho => ({
          ...atual,
          produtoChave: p.chave,
          produtoNome: p.nome,
          periodo: p.periodo,
        }),
      })),
      {
        rotulo: textos.produto.outro,
        icone: '➕',
        escolhida: r.produtoChave === 'outro',
        escolher: (atual: Rascunho): Rascunho => ({
          ...atual,
          produtoChave: 'outro',
          produtoNome: atual.produtoChave === 'outro' ? atual.produtoNome : undefined,
          periodo: atual.produtoChave === 'outro' ? atual.periodo : undefined,
        }),
      },
    ],
  });

  if (r.produtoChave === 'outro') {
    passos.push({
      id: 'produto-nome',
      tipo: 'texto',
      pergunta: textos.produto.nomePergunta,
      valor: r.produtoNome,
      gravar: (atual, texto) => ({ ...atual, produtoNome: texto }),
    });
    passos.push({
      id: 'produto-periodo',
      tipo: 'opcoes',
      pergunta: textos.produto.periodoPergunta(nome),
      opcoes: [
        {
          rotulo: textos.produto.todoMes,
          icone: '📅',
          escolhida: r.periodo === 'mes',
          escolher: (atual) => ({ ...atual, periodo: 'mes' }),
        },
        {
          rotulo: textos.produto.porSafra,
          icone: '🌾',
          escolhida: r.periodo === 'ciclo',
          escolher: (atual) => ({ ...atual, periodo: 'ciclo' }),
        },
      ],
    });
  }

  if (r.periodo === 'ciclo') {
    passos.push({
      id: 'meses',
      tipo: 'valor',
      formato: 'numero',
      pergunta: textos.produto.mesesPergunta(nome),
      sufixo: textos.produto.mesesSufixo,
      maiorQueZero: true,
      valor: r.mesesDoCiclo,
      gravar: (atual, v) => ({ ...atual, mesesDoCiclo: v }),
    });
  }

  // Unidade de venda
  const unidades = Object.entries(textos.produto.unidades) as [ChaveUnidade, { rotulo: string }][];
  passos.push({
    id: 'unidade',
    tipo: 'opcoes',
    pergunta: textos.produto.unidadePergunta(nome),
    opcoes: [
      ...unidades.map(([chave, u]) => ({
        rotulo: u.rotulo,
        escolhida: r.unidade === chave,
        escolher: (atual: Rascunho): Rascunho => ({ ...atual, unidade: chave }),
      })),
      {
        rotulo: textos.produto.outraUnidade,
        escolhida: r.unidade === 'outra',
        escolher: (atual: Rascunho): Rascunho => ({ ...atual, unidade: 'outra' }),
      },
    ],
  });
  if (r.unidade === 'outra') {
    passos.push({
      id: 'unidade-outra',
      tipo: 'texto',
      pergunta: textos.produto.outraUnidadePergunta,
      ajuda: textos.produto.outraUnidadeAjuda,
      valor: r.unidadeOutra,
      gravar: (atual, texto) => ({ ...atual, unidadeOutra: texto }),
    });
  }

  // Gastos só deste produto (5.2)
  const secaoDiretos = textos.diretos.secao;
  passos.push({
    id: 'diretos-intro',
    tipo: 'aviso',
    secao: secaoDiretos,
    pergunta: textos.diretos.introPergunta(nome),
    ajuda: textos.diretos.introAjuda(periodo),
  });
  const perguntasDiretas = {
    sementes: { pergunta: textos.diretos.sementes(periodo) },
    adubo: { pergunta: textos.diretos.adubo(periodo) },
    racao: { pergunta: textos.diretos.racao(periodo) },
    embalagem: { pergunta: textos.diretos.embalagem(periodo), ajuda: textos.diretos.embalagemAjuda },
    maoDeObra: { pergunta: textos.diretos.maoDeObra(nome, periodo) },
    outros: { pergunta: textos.diretos.outros(periodo) },
  };
  for (const c of CATEGORIAS_DIRETAS) {
    passos.push({
      id: `direto-${c}`,
      tipo: 'valor',
      formato: 'dinheiro',
      secao: secaoDiretos,
      ...perguntasDiretas[c],
      podePular: true,
      valor: r.diretos[c],
      gravar: (atual, v) => ({ ...atual, diretos: { ...atual.diretos, [c]: v } }),
      ...(c === 'outros'
        ? {
            descricao: {
              valor: r.diretosOutrosDescricao,
              gravar: (atual: Rascunho, texto: string) => ({ ...atual, diretosOutrosDescricao: texto }),
            },
          }
        : {}),
    });
  }

  // Tempo de trabalho no produto (5.4)
  passos.push({
    id: 'tempo',
    tipo: 'opcoes',
    secao: textos.tempo.secao,
    pergunta: textos.tempo.pergunta(nome),
    opcoes: (['muito', 'medio', 'pouco'] as const).map((t) => ({
      rotulo: textos.tempo[t],
      icone: { muito: '●●●', medio: '●●○', pouco: '●○○' }[t],
      escolhida: r.tempo === t,
      escolher: (atual: Rascunho): Rascunho => ({ ...atual, tempo: t }),
    })),
  });

  // Gastos gerais da roça (5.3)
  const secaoComuns = textos.comuns.secao;
  passos.push({
    id: 'comuns-intro',
    tipo: 'aviso',
    secao: secaoComuns,
    pergunta: textos.comuns.introPergunta,
    ajuda: textos.comuns.introAjuda,
  });
  for (const c of CATEGORIAS_COMUNS) {
    passos.push({
      id: `comum-${c}`,
      tipo: 'valor',
      formato: 'dinheiro',
      secao: secaoComuns,
      pergunta: textos.comuns[c],
      podePular: true,
      valor: r.comuns[c],
      gravar: (atual, v) => ({ ...atual, comuns: { ...atual.comuns, [c]: v } }),
      ...(c === 'outros'
        ? {
            descricao: {
              valor: r.comunsOutrosDescricao,
              gravar: (atual: Rascunho, texto: string) => ({ ...atual, comunsOutrosDescricao: texto }),
            },
          }
        : {}),
    });
  }

  // Reserva para conserto e troca (5.3.2)
  const secaoEquip = textos.equipamentos.secao;
  passos.push({
    id: 'equip-tem',
    tipo: 'opcoes',
    secao: secaoEquip,
    pergunta: textos.equipamentos.temPergunta,
    ajuda: textos.equipamentos.temAjuda,
    opcoes: [
      {
        rotulo: textos.comum.sim,
        icone: '✔',
        escolhida: r.temEquipamento === true,
        escolher: (atual) => ({
          ...atual,
          temEquipamento: true,
          equipamentos: atual.equipamentos.length ? atual.equipamentos : [{}],
        }),
      },
      {
        rotulo: textos.comum.nao,
        icone: '✖',
        escolhida: r.temEquipamento === false,
        escolher: (atual) => ({ ...atual, temEquipamento: false, equipamentos: [] }),
      },
    ],
  });
  if (r.temEquipamento) {
    r.equipamentos.forEach((e, i) => {
      passos.push({
        id: `equip-${i}-valor`,
        tipo: 'valor',
        formato: 'dinheiro',
        secao: secaoEquip,
        pergunta: textos.equipamentos.valorPergunta(i + 1),
        maiorQueZero: true,
        valor: e.valorPago,
        gravar: (atual, v) => atualizarEquipamento(atual, i, { valorPago: v }),
      });
      passos.push({
        id: `equip-${i}-anos`,
        tipo: 'valor',
        formato: 'numero',
        secao: secaoEquip,
        pergunta: textos.equipamentos.anosPergunta,
        sufixo: textos.equipamentos.anosSufixo,
        maiorQueZero: true,
        valor: e.anosDeUso,
        gravar: (atual, v) => atualizarEquipamento(atual, i, { anosDeUso: v }),
      });
      passos.push({
        id: `equip-${i}-outro`,
        tipo: 'opcoes',
        secao: secaoEquip,
        pergunta: textos.equipamentos.outroPergunta,
        opcoes: [
          {
            rotulo: textos.comum.sim,
            icone: '✔',
            escolhida: e.temOutro === true,
            escolher: (atual) => {
              const novo = atualizarEquipamento(atual, i, { temOutro: true });
              if (novo.equipamentos.length === i + 1) novo.equipamentos = [...novo.equipamentos, {}];
              return novo;
            },
          },
          {
            rotulo: textos.comum.nao,
            icone: '✖',
            escolhida: e.temOutro === false,
            escolher: (atual) => {
              const novo = atualizarEquipamento(atual, i, { temOutro: false });
              return { ...novo, equipamentos: novo.equipamentos.slice(0, i + 1) };
            },
          },
        ],
      });
    });
  }

  // Meu trabalho (5.3.1)
  const secaoTrabalho = textos.trabalho.secao;
  passos.push({
    id: 'trabalho-sabe',
    tipo: 'opcoes',
    secao: secaoTrabalho,
    pergunta: textos.trabalho.sabePergunta,
    ajuda: textos.trabalho.sabeAjuda,
    colunas: 1,
    opcoes: [
      {
        rotulo: textos.trabalho.jaSei,
        icone: '✔',
        escolhida: r.sabeMeuTrabalho === true,
        escolher: (atual) => ({ ...atual, sabeMeuTrabalho: true }),
      },
      {
        rotulo: textos.trabalho.meAjude,
        icone: '🧮',
        escolhida: r.sabeMeuTrabalho === false,
        escolher: (atual) => ({ ...atual, sabeMeuTrabalho: false }),
      },
    ],
  });
  if (r.sabeMeuTrabalho === false) {
    const ajudas = {
      alimentacao: { pergunta: textos.trabalho.alimentacao },
      saude: { pergunta: textos.trabalho.saude },
      outras: { pergunta: textos.trabalho.outras, ajuda: textos.trabalho.outrasAjuda },
    };
    for (const item of ['alimentacao', 'saude', 'outras'] as const) {
      passos.push({
        id: `trabalho-${item}`,
        tipo: 'valor',
        formato: 'dinheiro',
        secao: secaoTrabalho,
        ...ajudas[item],
        valor: r.ajudaTrabalho[item],
        gravar: (atual, v) => ({ ...atual, ajudaTrabalho: { ...atual.ajudaTrabalho, [item]: v } }),
        ...(item === 'outras'
          ? {
              descricao: {
                valor: r.ajudaTrabalhoOutrasDescricao,
                gravar: (atual: Rascunho, texto: string) => ({
                  ...atual,
                  ajudaTrabalhoOutrasDescricao: texto,
                }),
              },
            }
          : {}),
      });
    }
  }
  const sugestao = r.sabeMeuTrabalho === false ? somaAjudaTrabalho(r) : undefined;
  passos.push({
    id: 'trabalho-valor',
    tipo: 'valor',
    formato: 'dinheiro',
    secao: secaoTrabalho,
    pergunta: textos.trabalho.valorPergunta,
    ...(sugestao !== undefined ? { ajuda: textos.trabalho.sugestao(formatarReal(sugestao)) } : {}),
    // A soma da calculadora é só uma sugestão editável.
    valor: r.meuTrabalho ?? sugestao,
    gravar: (atual, v) => ({ ...atual, meuTrabalho: v }),
  });

  // Produção, venda e preço
  const secaoProducao = textos.producao.secao;
  passos.push({
    id: 'quantidade',
    tipo: 'valor',
    formato: 'numero',
    secao: secaoProducao,
    pergunta: textos.producao.quantidadePergunta(nome, periodo),
    sufixo: nomeDaUnidade(r, 'plural'),
    valor: r.quantidadeProduzida,
    gravar: (atual, v) => ({ ...atual, quantidadeProduzida: v }),
  });
  passos.push({
    id: 'vende',
    tipo: 'opcoes',
    secao: secaoProducao,
    pergunta: textos.producao.vendePergunta(nomeDaUnidade(r, 'plural')),
    ajuda: textos.producao.vendeAjuda,
    colunas: 5,
    opcoes: Array.from({ length: 10 }, (_, k) => k + 1).map((n) => ({
      rotulo: n === 10 ? textos.producao.vendeTudo : String(n),
      escolhida: r.decimosVendidos === n,
      escolher: (atual: Rascunho): Rascunho => ({ ...atual, decimosVendidos: n }),
    })),
  });
  passos.push({
    id: 'margem',
    tipo: 'valor',
    formato: 'porcento',
    secao: secaoProducao,
    pergunta: textos.producao.margemPergunta,
    ajuda: textos.producao.margemAjuda,
    sufixo: '%',
    valor: r.margemMinima,
    gravar: (atual, v) => ({ ...atual, margemMinima: v }),
  });
  passos.push({
    id: 'preco-atual',
    tipo: 'valor',
    formato: 'dinheiro',
    secao: secaoProducao,
    pergunta: textos.producao.precoAtualPergunta(nomeDaUnidade(r, 'singular'), nome),
    valor: r.precoAtual,
    gravar: (atual, v) => ({ ...atual, precoAtual: v }),
  });

  return passos;
}
