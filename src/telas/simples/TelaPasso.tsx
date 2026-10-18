import { useState, type FormEvent } from 'react';
import { lerValor } from '../../calculos';
import { textos } from '../../textos';
import type { Passo } from './passos';
import type { Rascunho } from './rascunho';

interface Props {
  passo: Passo;
  rascunho: Rascunho;
  responder: (novo: Rascunho) => void;
}

function paraEntrada(valor?: number): string {
  return valor === undefined ? '' : String(valor).replace('.', ',');
}

export function TelaPasso({ passo, rascunho, responder }: Props) {
  switch (passo.tipo) {
    case 'aviso':
      return (
        <div className="acoes">
          <button type="button" className="botao-principal" onClick={() => responder(rascunho)}>
            {textos.comum.continuar} <span aria-hidden="true">→</span>
          </button>
        </div>
      );

    case 'opcoes':
      return (
        <div className={`grade grade-${passo.colunas ?? 1}`}>
          {passo.opcoes.map((op) => (
            <button
              key={op.rotulo}
              type="button"
              className={`opcao${op.escolhida ? ' escolhida' : ''}`}
              aria-pressed={op.escolhida}
              onClick={() => responder(op.escolher(rascunho))}
            >
              {op.icone && (
                <span className="opcao-icone" aria-hidden="true">
                  {op.icone}
                </span>
              )}
              <span>{op.rotulo}</span>
              {op.escolhida && (
                <span className="opcao-marca" aria-hidden="true">
                  ✔
                </span>
              )}
            </button>
          ))}
        </div>
      );

    case 'texto':
      return <EntradaTexto key={passo.id} passo={passo} rascunho={rascunho} responder={responder} />;

    case 'valor':
      return <EntradaValor key={passo.id} passo={passo} rascunho={rascunho} responder={responder} />;
  }
}

function EntradaTexto({
  passo,
  rascunho,
  responder,
}: Props & { passo: Extract<Passo, { tipo: 'texto' }> }) {
  const [texto, setTexto] = useState(passo.valor ?? '');
  const valido = texto.trim() !== '';

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (valido) responder(passo.gravar(rascunho, texto.trim()));
  }

  return (
    <form onSubmit={enviar}>
      <input
        className="entrada"
        type="text"
        autoFocus
        aria-label={passo.pergunta}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <div className="acoes">
        <button type="submit" className="botao-principal" disabled={!valido}>
          {textos.comum.continuar} <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}

function EntradaValor({
  passo,
  rascunho,
  responder,
}: Props & { passo: Extract<Passo, { tipo: 'valor' }> }) {
  const [texto, setTexto] = useState(paraEntrada(passo.valor));
  const [descricao, setDescricao] = useState(passo.descricao?.valor ?? '');
  const [tentou, setTentou] = useState(false);

  const numero = lerValor(texto);
  const erro =
    numero === null || numero < 0
      ? textos.comum.valorInvalido
      : passo.maiorQueZero && numero === 0
        ? textos.comum.valorMaiorQueZero
        : null;

  function gravar(valor: number) {
    let novo = passo.gravar(rascunho, valor);
    if (passo.descricao) novo = passo.descricao.gravar(novo, valor > 0 ? descricao.trim() : '');
    responder(novo);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (erro === null && numero !== null) gravar(numero);
  }

  return (
    <form onSubmit={enviar} noValidate>
      <div className="campo-valor">
        {passo.formato === 'dinheiro' && <span className="prefixo">R$</span>}
        <input
          className="entrada entrada-numero"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus
          aria-label={passo.pergunta}
          aria-invalid={tentou && erro !== null}
          aria-describedby={tentou && erro ? `erro-${passo.id}` : undefined}
          placeholder="0"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        {passo.sufixo && <span className="sufixo">{passo.sufixo}</span>}
      </div>
      {tentou && erro && (
        <p className="erro" id={`erro-${passo.id}`} role="alert">
          <span aria-hidden="true">⚠ </span>
          {erro}
        </p>
      )}
      {passo.descricao && (
        <label className="rotulo-descricao">
          {textos.comum.descricaoOpcional}
          <input
            className="entrada entrada-pequena"
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </label>
      )}
      <div className="acoes">
        <button type="submit" className="botao-principal">
          {textos.comum.continuar} <span aria-hidden="true">→</span>
        </button>
        {passo.podePular && (
          <button type="button" className="botao-secundario" onClick={() => gravar(0)}>
            <span aria-hidden="true">✖</span> {textos.comum.naoTive}
          </button>
        )}
      </div>
    </form>
  );
}
