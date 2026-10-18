// Campos de formulário do Modo Completo. Valores sempre guardados como número.
import { useEffect, useId, useState, type ReactNode } from 'react';
import { lerValor, type ItemDeGasto } from '../../calculos';
import { textos } from '../../textos';

function paraEntrada(valor: number | undefined): string {
  if (valor === undefined || valor === 0) return '';
  return String(Number(valor.toFixed(4))).replace('.', ',');
}

interface CampoNumeroProps {
  rotulo: ReactNode;
  valor: number | undefined;
  aoMudar: (valor: number) => void;
  prefixo?: string;
  sufixo?: string;
  ajuda?: ReactNode;
  /** Esconde o rótulo visualmente (tabelas), mantendo-o para leitores de tela. */
  rotuloOculto?: boolean;
}

/** Aceita vírgula ("2,50"). Campo vazio vale zero. Texto inválido não altera o valor guardado. */
export function CampoNumero({ rotulo, valor, aoMudar, prefixo, sufixo, ajuda, rotuloOculto }: CampoNumeroProps) {
  const id = useId();
  const [texto, setTexto] = useState(paraEntrada(valor));
  const [focado, setFocado] = useState(false);

  useEffect(() => {
    if (!focado) setTexto(paraEntrada(valor));
  }, [valor, focado]);

  const numero = texto.trim() === '' ? 0 : lerValor(texto);
  const invalido = numero === null || numero < 0;

  return (
    <div className="campo">
      <label htmlFor={id} className={rotuloOculto ? 'oculto' : 'campo-rotulo'}>
        {rotulo}
      </label>
      <div className="campo-linha">
        {prefixo && <span className="campo-extra">{prefixo}</span>}
        <input
          id={id}
          className="campo-entrada"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={texto}
          aria-invalid={invalido}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          onChange={(e) => {
            setTexto(e.target.value);
            const n = e.target.value.trim() === '' ? 0 : lerValor(e.target.value);
            if (n !== null && n >= 0) aoMudar(n);
          }}
        />
        {sufixo && <span className="campo-extra">{sufixo}</span>}
      </div>
      {invalido && (
        <p className="campo-erro" role="alert">
          ⚠ {textos.comum.valorInvalido}
        </p>
      )}
      {ajuda && <p className="campo-ajuda">{ajuda}</p>}
    </div>
  );
}

export function CampoTexto({
  rotulo,
  valor,
  aoMudar,
  ajuda,
  lista,
  rotuloOculto,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  ajuda?: string;
  lista?: string[];
  rotuloOculto?: boolean;
}) {
  const id = useId();
  return (
    <div className="campo">
      <label htmlFor={id} className={rotuloOculto ? 'oculto' : 'campo-rotulo'}>
        {rotulo}
      </label>
      <input
        id={id}
        className="campo-entrada"
        type="text"
        value={valor}
        list={lista ? `${id}-lista` : undefined}
        onChange={(e) => aoMudar(e.target.value)}
      />
      {lista && (
        <datalist id={`${id}-lista`}>
          {lista.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      )}
      {ajuda && <p className="campo-ajuda">{ajuda}</p>}
    </div>
  );
}

/** Botões de escolha única (rádio com cara de botão). */
export function Escolha<T extends string>({
  rotulo,
  valor,
  opcoes,
  aoMudar,
}: {
  rotulo: string;
  valor: T | undefined;
  opcoes: { valor: T; rotulo: string }[];
  aoMudar: (v: T) => void;
}) {
  return (
    <fieldset className="escolha">
      <legend className="campo-rotulo">{rotulo}</legend>
      <div className="escolha-opcoes">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            className={`escolha-botao${valor === o.valor ? ' ativo' : ''}`}
            aria-pressed={valor === o.valor}
            onClick={() => aoMudar(o.valor)}
          >
            {valor === o.valor && <span aria-hidden="true">✔ </span>}
            {o.rotulo}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// ---- Listas de gastos por categoria (uma linha por categoria + vários "outros") ----

export function valorDaCategoria(itens: ItemDeGasto[], categoria: string): number {
  return itens.find((i) => i.categoria === categoria)?.valor ?? 0;
}

export function definirCategoria(itens: ItemDeGasto[], categoria: string, valor: number): ItemDeGasto[] {
  const resto = itens.filter((i) => i.categoria !== categoria);
  return valor > 0 ? [...resto, { categoria, valor }] : resto;
}

/** Tabela de gastos: categorias fixas + linhas livres de "Outros" com descrição. */
export function TabelaGastos({
  itens,
  categorias,
  nomes,
  aoMudar,
}: {
  itens: ItemDeGasto[];
  categorias: readonly string[];
  nomes: Record<string, string>;
  aoMudar: (itens: ItemDeGasto[]) => void;
}) {
  const fixas = categorias.filter((c) => c !== 'outros');
  const outros = itens.filter((i) => i.categoria === 'outros');
  const naoOutros = itens.filter((i) => i.categoria !== 'outros');
  const mudarOutro = (k: number, mudanca: Partial<ItemDeGasto>) =>
    aoMudar([...naoOutros, ...outros.map((o, j) => (j === k ? { ...o, ...mudanca } : o))]);

  return (
    <div className="tabela-gastos">
      {fixas.map((c) => (
        <CampoNumero
          key={c}
          rotulo={nomes[c]}
          prefixo="R$"
          valor={valorDaCategoria(itens, c)}
          aoMudar={(v) => aoMudar(definirCategoria(itens, c, v))}
        />
      ))}
      {outros.map((o, k) => (
        <div className="linha-outro" key={k}>
          <CampoTexto
            rotulo={`${textos.completo.gastos.outros}: ${textos.completo.gastos.descricao}`}
            valor={o.descricao ?? ''}
            aoMudar={(v) => mudarOutro(k, { descricao: v })}
          />
          <CampoNumero
            rotulo={textos.completo.gastos.valor}
            prefixo="R$"
            valor={o.valor}
            aoMudar={(v) => mudarOutro(k, { valor: v })}
          />
          <button
            type="button"
            className="botao-pequeno"
            onClick={() => aoMudar([...naoOutros, ...outros.filter((_, j) => j !== k)])}
          >
            ✖ {textos.completo.gastos.remover}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="botao-pequeno"
        onClick={() => aoMudar([...itens, { categoria: 'outros', valor: 0, descricao: '' }])}
      >
        ➕ {textos.completo.gastos.adicionarOutro}
      </button>
    </div>
  );
}
