// Todos os textos da interface ficam aqui (CLAUDE.md, seções 4 e 6).
// Modo Simples: frases curtas, sem "rateio", "depreciação", "markup", "custos diretos/indiretos".

/** "por mês" ou "na safra inteira", conforme o período do produto. */
export type TrechoPeriodo = 'por mês' | 'na safra inteira';

export const textos = {
  nomeApp: 'Preço Justo',
  quantidadeVendidaZero: 'Diga quanto você produz e quanto vende para ver o preço mínimo.',
  deixandoDeGanhar: (valor: string) => `Você está deixando de ganhar ${valor} por mês`,
  precoJaCobre: 'Seu preço já cobre seus gastos',

  comum: {
    voltar: 'Voltar',
    continuar: 'Continuar',
    ouvir: 'Ouvir',
    parar: 'Parar',
    naoTive: 'Não tive esse gasto',
    sim: 'Sim',
    nao: 'Não',
    progresso: (atual: number, total: number) => `Pergunta ${atual} de ${total}`,
    descricaoOpcional: 'O que foi? (se quiser)',
    valorInvalido: 'Escreva só o número. Ex.: 150 ou 2,50',
    valorMaiorQueZero: 'Escreva um número maior que zero.',
  },

  inicio: {
    titulo: 'Vamos descobrir o preço mínimo do seu produto',
    texto:
      'Vou fazer algumas perguntas, uma de cada vez. Tenha perto de você as anotações de quanto gasta e quanto colhe.',
    comecar: 'Começar',
    continuar: 'Continuar de onde parei',
    recomecar: 'Começar de novo',
  },

  produto: {
    pergunta: 'Qual produto você quer calcular?',
    outro: 'Outro produto',
    nomePergunta: 'Qual é o nome do produto?',
    periodoPergunta: (nome: string) => `Você colhe ${nome} todo mês ou por safra?`,
    todoMes: 'Todo mês',
    porSafra: 'Por safra',
    mesesPergunta: (nome: string) => `Quantos meses dura a safra de ${nome}?`,
    mesesSufixo: 'meses',
    unidadePergunta: (nome: string) => `Como você vende ${nome}?`,
    unidades: {
      kg: { rotulo: 'Por quilo (kg)', singular: 'kg', plural: 'kg' },
      maco: { rotulo: 'Por maço', singular: 'maço', plural: 'maços' },
      duzia: { rotulo: 'Por dúzia', singular: 'dúzia', plural: 'dúzias' },
      unidade: { rotulo: 'Por unidade', singular: 'unidade', plural: 'unidades' },
    },
    outraUnidade: 'Outra medida',
    outraUnidadePergunta: 'Qual é a medida?',
    outraUnidadeAjuda: 'Ex.: litro, caixa, bandeja.',
  },

  diretos: {
    secao: 'Gastos só deste produto',
    introPergunta: (nome: string) => `Agora, os gastos só de ${nome}`,
    introAjuda: (periodo: TrechoPeriodo) =>
      `São os gastos que você sabe que foram para este produto. Conte o que gasta ${periodo}.`,
    sementes: (p: TrechoPeriodo) => `Quanto você gasta com sementes ou mudas ${p}?`,
    adubo: (p: TrechoPeriodo) => `Quanto você gasta com adubo ou esterco ${p}?`,
    racao: (p: TrechoPeriodo) => `Quanto você gasta com ração ou comida dos animais ${p}?`,
    embalagem: (p: TrechoPeriodo) => `Quanto você gasta com embalagem deste produto ${p}?`,
    embalagemAjuda: 'Ex.: caixa de ovos, pote de mel, saquinho.',
    maoDeObra: (nome: string, p: TrechoPeriodo) =>
      `Quanto você paga a pessoas que trabalham só com ${nome} ${p}?`,
    outros: (p: TrechoPeriodo) => `Tem outro gasto só deste produto? Quanto você gasta ${p}?`,
  },

  tempo: {
    secao: 'Seu tempo',
    pergunta: (nome: string) => `Quanto do seu tempo de trabalho vai para ${nome}?`,
    muito: 'Muito',
    medio: 'Médio',
    pouco: 'Pouco',
  },

  comuns: {
    secao: 'Gastos gerais da roça',
    introPergunta: 'Agora, os gastos gerais da roça',
    introAjuda: 'São os gastos de toda a propriedade, de um mês. Ex.: luz, combustível, frete.',
    luzAgua: 'Quanto você gasta por mês com luz e água da roça?',
    combustivel: 'Quanto você gasta por mês com combustível?',
    transporte: 'Quanto você gasta por mês com transporte ou frete?',
    maoDeObraGeral: 'Quanto você paga por mês a pessoas que ajudam na roça toda?',
    protecao: 'Quanto você gasta por mês com bota, luva e roupa de trabalho?',
    outros: 'Tem outro gasto geral da roça? Quanto por mês?',
  },

  equipamentos: {
    secao: 'Reserva para conserto e troca',
    temPergunta: 'Você tem máquina ou equipamento?',
    temAjuda: 'Ex.: roçadeira, bomba de água, carroça, chocadeira.',
    outroPergunta: 'Você tem outra máquina ou equipamento?',
    valorPergunta: (ordem: number) =>
      ordem === 1 ? 'Quanto custou?' : `Quanto custou a ${ordem}ª máquina ou equipamento?`,
    anosPergunta: 'Quantos anos ela dura?',
    anosSufixo: 'anos',
  },

  trabalho: {
    secao: 'Meu trabalho',
    sabePergunta: 'Você sabe quanto precisa tirar por mês com o seu trabalho?',
    sabeAjuda: 'O seu trabalho também é um gasto. Ele entra no preço.',
    jaSei: 'Sim, já sei',
    meAjude: 'Não, me ajude a calcular',
    alimentacao: 'Quanto a família gasta por mês com comida?',
    saude: 'Quanto a família gasta por mês com saúde e remédios?',
    outras: 'Quanto a família gasta por mês com outras coisas?',
    outrasAjuda: 'Ex.: escola, roupa, gás, luz da casa.',
    valorPergunta: 'Quanto você precisa tirar por mês com o seu trabalho?',
    sugestao: (soma: string) => `A soma deu ${soma}. Você pode mudar esse valor.`,
  },

  producao: {
    secao: 'Produção e venda',
    quantidadePergunta: (nome: string, p: TrechoPeriodo) => `Quanto de ${nome} você produz ${p}?`,
    vendePergunta: (plural: string) => `De cada 10 ${plural} que você produz, quantos você vende?`,
    vendeAjuda: 'O resto fica para a família, estraga ou é trocado.',
    vendeTudo: '10 (vendo tudo)',
    margemPergunta: 'Margem mínima: quanto a mais você quer ganhar além dos gastos?',
    margemAjuda: 'Escreva em %. Ex.: 20 quer dizer ganhar 20 centavos a mais para cada R$ 1,00 gasto.',
    precoAtualPergunta: (singular: string, nome: string) =>
      `Quanto você cobra hoje por ${singular} de ${nome}?`,
  },

  resultado: {
    titulo: (nome: string) => `Preço mínimo de ${nome}`,
    por: (singular: string) => `por ${singular}`,
    seuPreco: (valor: string) => `Você cobra hoje: ${valor}`,
    acima: 'Seu preço está acima do preço mínimo.',
    igual: 'Seu preço é igual ao preço mínimo.',
    abaixo: 'Seu preço está abaixo do preço mínimo.',
    seusGastos: (valor: string, p: TrechoPeriodo) => `Meus gastos com este produto: ${valor} ${p}`,
    voceVende: (quantidade: string, plural: string, p: TrechoPeriodo) =>
      `Você vende: ${quantidade} ${plural} ${p}`,
    mudarRespostas: 'Mudar respostas',
    novoCalculo: 'Calcular outro produto',
  },
} as const;
