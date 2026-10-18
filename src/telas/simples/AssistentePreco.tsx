// Modo Simples: do produto ao preço mínimo, uma pergunta por tela.
import { useEffect, useState } from 'react';
import {
  apagarRascunho,
  carregarPropriedade,
  carregarRascunho,
  salvarProduto,
  salvarPropriedade,
  salvarRascunho,
} from '../../dados';
import { textos } from '../../textos';
import { BotaoOuvir } from './BotaoOuvir';
import { pararDeFalar } from './falar';
import { montarPassos } from './passos';
import { paraProduto, paraPropriedade, rascunhoVazio, type Rascunho } from './rascunho';
import { Resultado } from './Resultado';
import { TelaPasso } from './TelaPasso';

type Fase = 'inicio' | 'perguntas' | 'resultado';

interface Estado {
  fase: Fase;
  indice: number;
  rascunho: Rascunho;
}

const estadoInicial = (): Estado => ({ fase: 'inicio', indice: 0, rascunho: rascunhoVazio() });

export function AssistentePreco({ irParaCompleto }: { irParaCompleto: () => void }) {
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const [guardado, setGuardado] = useState<Estado | null>(null);
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    carregarRascunho<Estado>().then((salvo) => {
      if (salvo && salvo.fase !== 'inicio') setGuardado(salvo);
      setCarregou(true);
    });
  }, []);

  function mudar(novo: Estado) {
    pararDeFalar();
    setEstado(novo);
    window.scrollTo(0, 0);
    salvarRascunho(novo);
    if (novo.fase === 'resultado') {
      salvarProduto(paraProduto(novo.rascunho));
      carregarPropriedade().then((anterior) => salvarPropriedade(paraPropriedade(novo.rascunho, anterior)));
    }
  }

  const botaoModo = (
    <button type="button" className="botao-modo" onClick={irParaCompleto}>
      {textos.modo.irParaCompleto}
    </button>
  );

  if (!carregou) return null;

  if (estado.fase === 'inicio') {
    const fala = `${textos.inicio.titulo}. ${textos.inicio.texto}`;
    return (
      <section className="tela">
        <p className="icone-grande" aria-hidden="true">
          🌱
        </p>
        <h1 className="pergunta">{textos.inicio.titulo}</h1>
        <p className="ajuda">{textos.inicio.texto}</p>
        <BotaoOuvir texto={fala} />
        <div className="acoes">
          {guardado && (
            <button type="button" className="botao-principal" onClick={() => mudar(guardado)}>
              {textos.inicio.continuar} <span aria-hidden="true">→</span>
            </button>
          )}
          <button
            type="button"
            className={guardado ? 'botao-secundario' : 'botao-principal'}
            onClick={() => {
              setGuardado(null);
              apagarRascunho();
              mudar({ fase: 'perguntas', indice: 0, rascunho: rascunhoVazio() });
            }}
          >
            {guardado ? textos.inicio.recomecar : textos.inicio.comecar}
            {!guardado && <span aria-hidden="true"> →</span>}
          </button>
        </div>
        {botaoModo}
      </section>
    );
  }

  if (estado.fase === 'resultado') {
    return (
      <>
        <Resultado
          rascunho={estado.rascunho}
          mudarRespostas={() => mudar({ ...estado, fase: 'perguntas', indice: 0 })}
          novoCalculo={() => {
            apagarRascunho();
            setGuardado(null);
            setEstado(estadoInicial());
          }}
        />
        <div className="tela">{botaoModo}</div>
      </>
    );
  }

  const passos = montarPassos(estado.rascunho);
  const indice = Math.min(estado.indice, passos.length - 1);
  const passo = passos[indice];
  const fala = [passo.pergunta, passo.ajuda].filter(Boolean).join(' ');

  function responder(novo: Rascunho) {
    // A lista é remontada: uma resposta pode abrir perguntas novas logo depois desta.
    const total = montarPassos(novo).length;
    const proximo = indice + 1;
    mudar(
      proximo >= total
        ? { fase: 'resultado', indice, rascunho: novo }
        : { fase: 'perguntas', indice: proximo, rascunho: novo },
    );
  }

  function voltar() {
    mudar(indice === 0 ? { ...estado, fase: 'inicio' } : { ...estado, indice: indice - 1 });
  }

  return (
    <section className="tela" key={passo.id}>
      <div className="topo">
        <button type="button" className="botao-voltar" onClick={voltar}>
          <span aria-hidden="true">←</span> {textos.comum.voltar}
        </button>
        <BotaoOuvir texto={fala} />
      </div>
      <div
        className="progresso"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={passos.length}
        aria-valuenow={indice + 1}
        aria-label={textos.comum.progresso(indice + 1, passos.length)}
      >
        <div className="progresso-barra" style={{ width: `${((indice + 1) / passos.length) * 100}%` }} />
      </div>
      <p className="progresso-texto">{textos.comum.progresso(indice + 1, passos.length)}</p>
      {passo.secao && <p className="secao">{passo.secao}</p>}
      <h1 className="pergunta">{passo.pergunta}</h1>
      {passo.ajuda && <p className="ajuda">{passo.ajuda}</p>}
      <TelaPasso passo={passo} rascunho={estado.rascunho} responder={responder} />
    </section>
  );
}
