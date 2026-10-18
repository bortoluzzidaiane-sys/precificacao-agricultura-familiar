import {
  formatarNumero,
  formatarReal,
  formatarRealExato,
  type DivisaoTempo,
  type Produto,
  type ResultadoProduto,
  type TempoSimples,
} from '../../calculos';
import { CATEGORIAS_DIRETAS } from '../../dados/categorias';
import { textos } from '../../textos';
import { CampoNumero, CampoTexto, Escolha, TabelaGastos } from './campos';
import { SituacaoPreco } from './SituacaoPreco';

interface Props {
  produto: Produto;
  divisao: DivisaoTempo;
  participacao: number;
  resultado: ResultadoProduto;
  mudar: (p: Produto) => void;
  voltar: () => void;
  excluir: () => void;
}

const UNIDADES = ['kg', 'maço', 'dúzia', 'unidade', 'litro', 'caixa', 'bandeja'];

export function EditorProduto({ produto: p, divisao, participacao, resultado, mudar, voltar, excluir }: Props) {
  const t = textos.completo.editor;
  const c = textos.completo.calculo;
  const ciclo = p.periodo === 'ciclo';
  const mudarCampo = <K extends keyof Produto>(campo: K, valor: Produto[K]) => mudar({ ...p, [campo]: valor });

  return (
    <section>
      <button type="button" className="botao-pequeno" onClick={voltar}>
        ← {textos.completo.produtos.voltarLista}
      </button>
      <h1 className="completo-titulo">{p.nome || textos.completo.produtos.semNome}</h1>

      <div className="painel">
        <h2 className="completo-subtitulo">{t.identificacao}</h2>
        <CampoTexto rotulo={t.nome} valor={p.nome} aoMudar={(v) => mudarCampo('nome', v)} />
        <CampoTexto
          rotulo={t.unidade}
          valor={p.unidade}
          ajuda={t.unidadeAjuda}
          lista={UNIDADES}
          aoMudar={(v) => mudarCampo('unidade', v)}
        />
        <Escolha
          rotulo={t.periodo}
          valor={p.periodo}
          opcoes={[
            { valor: 'mes', rotulo: t.mes },
            { valor: 'ciclo', rotulo: t.ciclo },
          ]}
          aoMudar={(v) => mudar({ ...p, periodo: v, mesesDoCiclo: v === 'mes' ? 1 : p.periodo === 'ciclo' ? p.mesesDoCiclo : 0 })}
        />
        {ciclo && (
          <CampoNumero
            rotulo={t.meses}
            sufixo="meses"
            valor={p.mesesDoCiclo}
            aoMudar={(v) => mudarCampo('mesesDoCiclo', v)}
          />
        )}
      </div>

      <div className="painel">
        <h2 className="completo-subtitulo">{t.diretos}</h2>
        <p className="campo-ajuda">{ciclo ? t.diretosAjudaCiclo : t.diretosAjudaMes}</p>
        <TabelaGastos
          itens={p.gastosDiretos}
          categorias={CATEGORIAS_DIRETAS}
          nomes={textos.categorias.diretas}
          aoMudar={(itens) => mudarCampo('gastosDiretos', itens)}
        />
      </div>

      <div className="painel">
        <h2 className="completo-subtitulo">{t.tempo}</h2>
        {divisao === 'percentual' ? (
          <CampoNumero
            rotulo={t.tempoPercentual}
            sufixo="%"
            valor={p.percentualTempo}
            aoMudar={(v) => mudarCampo('percentualTempo', v)}
          />
        ) : (
          <>
            <Escolha<TempoSimples>
              rotulo={t.tempo}
              valor={p.tempo}
              opcoes={[
                { valor: 'muito', rotulo: textos.tempo.muito },
                { valor: 'medio', rotulo: textos.tempo.medio },
                { valor: 'pouco', rotulo: textos.tempo.pouco },
              ]}
              aoMudar={(v) => mudarCampo('tempo', v)}
            />
            <p className="campo-ajuda">{t.tempoAjudaPesos}</p>
          </>
        )}
      </div>

      <div className="painel">
        <h2 className="completo-subtitulo">{t.producao}</h2>
        <CampoNumero
          rotulo={t.quantidade}
          sufixo={p.unidade || undefined}
          valor={p.quantidadeProduzida}
          aoMudar={(v) => mudarCampo('quantidadeProduzida', v)}
        />
        <CampoNumero
          rotulo={t.percentualVendido}
          sufixo="%"
          ajuda={t.percentualVendidoAjuda}
          valor={p.percentualVendido}
          aoMudar={(v) => mudarCampo('percentualVendido', v)}
        />
        <CampoNumero rotulo={t.margem} sufixo="%" valor={p.margemMinima} aoMudar={(v) => mudarCampo('margemMinima', v)} />
        <CampoNumero rotulo={t.precoAtual} prefixo="R$" valor={p.precoAtual} aoMudar={(v) => mudarCampo('precoAtual', v)} />
      </div>

      <div className="painel painel-resultado" aria-live="polite">
        <h2 className="completo-subtitulo">{t.resultado}</h2>
        {!(participacao > 0) && <p className="aviso-linha">⚠ {c.faltaTempo}</p>}
        {resultado.ok ? (
          <TabelaResultado produto={p} r={resultado} participacao={participacao} />
        ) : (
          <p className="aviso-linha">
            ⚠ {resultado.motivo === 'meses-do-ciclo' ? c.faltaMeses : textos.quantidadeVendidaZero}
          </p>
        )}
      </div>

      <button type="button" className="botao-perigo" onClick={excluir}>
        🗑 {textos.completo.produtos.excluir}
      </button>
    </section>
  );
}

function TabelaResultado({
  produto: p,
  r,
  participacao,
}: {
  produto: Produto;
  r: Extract<ResultadoProduto, { ok: true }>;
  participacao: number;
}) {
  const c = textos.completo.calculo;
  const noPeriodo = c.noPeriodo(p.periodo === 'ciclo' ? 'na safra inteira' : 'por mês');
  const unidade = p.unidade || 'unidade';
  const linhas: [string, string][] = [
    [c.gastosDiretos, formatarReal(r.gastosDiretos)],
    [c.participacao, `${formatarNumero(participacao * 100)}%`],
    [
      c.gastoComumMes + (r.mesesDoCiclo > 1 ? ` ${c.vezesMeses(r.mesesDoCiclo)}` : ''),
      formatarReal(r.gastoComumMes * r.mesesDoCiclo),
    ],
    [`${c.gastoTotal} (${noPeriodo})`, formatarReal(r.gastoTotal)],
    [c.quantidadeVendida, `${formatarNumero(r.quantidadeVendida)} ${unidade}`],
    [c.custoPorUnidade, formatarRealExato(r.custoPorUnidade)],
    [c.precoMinimoExato, formatarRealExato(r.precoMinimo.exato)],
  ];
  return (
    <>
      <table className="tabela-calculo">
        <tbody>
          {linhas.map(([rotulo, valor]) => (
            <tr key={rotulo}>
              <th scope="row">{rotulo}</th>
              <td>{valor}</td>
            </tr>
          ))}
          <tr className="linha-destaque">
            <th scope="row">{c.precoMinimoExibido}</th>
            <td>
              {formatarReal(r.precoMinimo.exibido)} / {unidade}
            </td>
          </tr>
          <tr>
            <th scope="row">{`${c.receitaAtual} (${noPeriodo})`}</th>
            <td>{formatarReal(r.receitas.comPrecoAtual)}</td>
          </tr>
          <tr>
            <th scope="row">{`${c.receitaMinimo} (${noPeriodo})`}</th>
            <td>{formatarReal(r.receitas.comPrecoMinimo)}</td>
          </tr>
          <tr>
            <th scope="row">{`${c.diferenca} (${noPeriodo})`}</th>
            <td>{formatarReal(r.receitas.diferenca)}</td>
          </tr>
        </tbody>
      </table>
      <p>
        <SituacaoPreco comparacao={r.comparacao} />
      </p>
    </>
  );
}
