import {
  formatarNumero,
  formatarReal,
  somarGastos,
  valorDaHora,
  type CalculoPropriedade,
  type DivisaoTempo,
  type Equipamento,
  type ItemDeGasto,
  type Produto,
  type Propriedade,
  type TempoSimples,
} from '../../calculos';
import { CATEGORIAS_COMUNS, ITENS_AJUDA_TRABALHO } from '../../dados/categorias';
import { textos } from '../../textos';
import { CampoNumero, CampoTexto, definirCategoria, Escolha, TabelaGastos, valorDaCategoria } from './campos';

interface Props {
  produtos: Produto[];
  propriedade: Propriedade;
  calculo: CalculoPropriedade;
  mudarPropriedade: (p: Propriedade) => void;
  mudarProduto: (p: Produto) => void;
}

export function GastosGerais({ produtos, propriedade: prop, calculo, mudarPropriedade, mudarProduto }: Props) {
  const t = textos.completo.gastos;
  const mudar = <K extends keyof Propriedade>(campo: K, valor: Propriedade[K]) =>
    mudarPropriedade({ ...prop, [campo]: valor });

  const ajuda = prop.ajudaTrabalho ?? [];
  const somaAjuda = somarGastos(ajuda);
  const hora = valorDaHora(prop.meuTrabalho, prop.horasNoMes ?? 0);
  const itensMes = somarGastos(prop.gastosComuns);

  return (
    <section>
      <h1 className="completo-titulo">{t.titulo}</h1>

      <div className="painel">
        <h2 className="completo-subtitulo">{t.itens}</h2>
        <TabelaGastos
          itens={prop.gastosComuns}
          categorias={CATEGORIAS_COMUNS}
          nomes={textos.categorias.comuns}
          aoMudar={(itens) => mudar('gastosComuns', itens)}
        />
      </div>

      <div className="painel">
        <h2 className="completo-subtitulo">{t.equipamentos}</h2>
        <p className="campo-ajuda">{t.equipamentosAjuda}</p>
        {prop.equipamentos.length === 0 && <p>{t.semEquipamento}</p>}
        {prop.equipamentos.map((e, i) => {
          const mudarEq = (m: Partial<Equipamento>) =>
            mudar('equipamentos', prop.equipamentos.map((x, j) => (j === i ? { ...x, ...m } : x)));
          const reserva = e.anosDeUso > 0 ? e.valorPago / e.anosDeUso / 12 : 0;
          return (
            <div className="linha-outro" key={i}>
              <CampoTexto rotulo={t.equipamento} valor={e.descricao ?? ''} aoMudar={(v) => mudarEq({ descricao: v })} />
              <div className="campos-lado">
                <CampoNumero rotulo={t.valorPago} prefixo="R$" valor={e.valorPago} aoMudar={(v) => mudarEq({ valorPago: v })} />
                <CampoNumero rotulo={t.anosDeUso} valor={e.anosDeUso} aoMudar={(v) => mudarEq({ anosDeUso: v })} />
              </div>
              <p className="valor-calculado">
                {t.reservaMes}: <strong>{formatarReal(reserva)}</strong>
              </p>
              <button
                type="button"
                className="botao-pequeno"
                onClick={() => mudar('equipamentos', prop.equipamentos.filter((_, j) => j !== i))}
              >
                ✖ {t.remover}
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="botao-pequeno"
          onClick={() => mudar('equipamentos', [...prop.equipamentos, { descricao: '', valorPago: 0, anosDeUso: 0 }])}
        >
          ➕ {t.adicionarEquipamento}
        </button>
        <p className="valor-calculado">
          {t.totalReserva}: <strong>{formatarReal(calculo.reservaEquipamentos)}</strong>
        </p>
      </div>

      <div className="painel">
        <h2 className="completo-subtitulo">{t.trabalho}</h2>
        <CampoNumero
          rotulo={t.trabalhoValor}
          prefixo="R$"
          ajuda={t.trabalhoAjuda}
          valor={prop.meuTrabalho}
          aoMudar={(v) => mudar('meuTrabalho', v)}
        />
        <details className="calculadora">
          <summary>{t.calculadora}</summary>
          <p className="campo-ajuda">{t.calculadoraAjuda}</p>
          {ITENS_AJUDA_TRABALHO.map((item) => (
            <CampoNumero
              key={item}
              rotulo={{ alimentacao: t.alimentacao, saude: t.saude, outras: t.outrasNecessidades }[item]}
              prefixo="R$"
              valor={valorDaCategoria(ajuda, item)}
              aoMudar={(v) => mudar('ajudaTrabalho', manterDescricao(ajuda, item, v))}
            />
          ))}
          <CampoTexto
            rotulo={`${t.outrasNecessidades}: ${t.descricao}`}
            valor={ajuda.find((i) => i.categoria === 'outras')?.descricao ?? ''}
            aoMudar={(v) => mudar('ajudaTrabalho', descreverOutras(ajuda, v))}
          />
          <p className="valor-calculado">{t.somaSugerida(formatarReal(somaAjuda))}</p>
          <button
            type="button"
            className="botao-pequeno"
            disabled={somaAjuda === 0}
            onClick={() => mudar('meuTrabalho', somaAjuda)}
          >
            {t.usarSoma}
          </button>
        </details>
        <CampoNumero
          rotulo={t.horas}
          sufixo="h"
          valor={prop.horasNoMes}
          aoMudar={(v) => mudar('horasNoMes', v)}
        />
        {hora !== null && <p className="valor-calculado">{t.valorHora(formatarReal(hora))}</p>}
      </div>

      <div className="painel painel-resultado">
        <table className="tabela-calculo">
          <tbody>
            <tr>
              <th scope="row">{t.itens}</th>
              <td>{formatarReal(itensMes)}</td>
            </tr>
            <tr>
              <th scope="row">{t.totalReserva}</th>
              <td>{formatarReal(calculo.reservaEquipamentos)}</td>
            </tr>
            <tr>
              <th scope="row">{t.trabalho}</th>
              <td>{formatarReal(prop.meuTrabalho)}</td>
            </tr>
            <tr className="linha-destaque">
              <th scope="row">{t.total}</th>
              <td>{formatarReal(calculo.totalGastosComuns)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Divisao
        produtos={produtos}
        calculo={calculo}
        mudarDivisao={(d) => mudar('divisaoTempo', d)}
        mudarProduto={mudarProduto}
      />
    </section>
  );
}

function manterDescricao(itens: ItemDeGasto[], categoria: string, valor: number) {
  const descricao = itens.find((i) => i.categoria === categoria)?.descricao;
  return definirCategoria(itens, categoria, valor).map((i) =>
    i.categoria === categoria && descricao ? { ...i, descricao } : i,
  );
}

function descreverOutras(itens: ItemDeGasto[], descricao: string) {
  const existe = itens.some((i) => i.categoria === 'outras');
  return existe
    ? itens.map((i) => (i.categoria === 'outras' ? { ...i, descricao } : i))
    : [...itens, { categoria: 'outras', valor: 0, descricao }];
}

function Divisao({
  produtos,
  calculo,
  mudarDivisao,
  mudarProduto,
}: {
  produtos: Produto[];
  calculo: CalculoPropriedade;
  mudarDivisao: (d: DivisaoTempo) => void;
  mudarProduto: (p: Produto) => void;
}) {
  const t = textos.completo.gastos;
  const percentual = calculo.divisao === 'percentual';
  const soma = produtos.reduce((s, p) => s + (p.percentualTempo ?? 0), 0);

  return (
    <div className="painel">
      <h2 className="completo-subtitulo">{t.divisao}</h2>
      <p className="campo-ajuda">{t.divisaoAjuda}</p>
      <Escolha
        rotulo={t.tempo}
        valor={calculo.divisao}
        opcoes={[
          { valor: 'pesos', rotulo: t.formaPesos },
          { valor: 'percentual', rotulo: t.formaPercentual },
        ]}
        aoMudar={mudarDivisao}
      />
      {produtos.length === 0 ? (
        <p>{t.semProdutos}</p>
      ) : (
        <>
          <ul className="lista-divisao">
            {produtos.map((p, i) => (
              <li key={p.id}>
                <p className="lista-divisao-nome">{p.nome || textos.completo.produtos.semNome}</p>
                {percentual ? (
                  <CampoNumero
                    rotulo={`${t.tempo} — ${p.nome}`}
                    rotuloOculto
                    sufixo="%"
                    valor={p.percentualTempo}
                    aoMudar={(v) => mudarProduto({ ...p, percentualTempo: v })}
                  />
                ) : (
                  <Escolha<TempoSimples>
                    rotulo={`${t.tempo} — ${p.nome}`}
                    valor={p.tempo}
                    opcoes={[
                      { valor: 'muito', rotulo: textos.tempo.muito },
                      { valor: 'medio', rotulo: textos.tempo.medio },
                      { valor: 'pouco', rotulo: textos.tempo.pouco },
                    ]}
                    aoMudar={(v) => mudarProduto({ ...p, tempo: v })}
                  />
                )}
                <p className="valor-calculado">
                  {t.participacao}: <strong>{formatarNumero(calculo.participacoes[i] * 100)}%</strong> ·{' '}
                  {t.gastoMes}: <strong>{formatarReal(calculo.totalGastosComuns * calculo.participacoes[i])}</strong>
                </p>
                {!(calculo.participacoes[i] > 0) && (
                  <p className="aviso-linha">⚠ {textos.completo.calculo.faltaTempo}</p>
                )}
              </li>
            ))}
          </ul>
          {percentual && (
            <p className={calculo.percentuaisOk ? 'situacao situacao-bom' : 'situacao situacao-alerta'} role="status">
              {calculo.percentuaisOk ? '✔ ' : '⚠ '}
              {t.somaPercentuais(formatarNumero(soma))}
              {!calculo.percentuaisOk && ` — ${t.percentuaisErrados}`}
            </p>
          )}
        </>
      )}
    </div>
  );
}
