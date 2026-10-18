import { formatarReal, type CalculoPropriedade, type Produto } from '../../calculos';
import { textos } from '../../textos';

interface Props {
  produtos: Produto[];
  calculo: CalculoPropriedade;
  meuTrabalho: number;
}

export function Resumo({ produtos, calculo, meuTrabalho }: Props) {
  const t = textos.completo.resumo;
  const { resumo } = calculo;

  if (produtos.length === 0) {
    return (
      <section>
        <h1 className="completo-titulo">{t.titulo}</h1>
        <p>{t.semProdutos}</p>
      </section>
    );
  }

  const nome = (id: string) => produtos.find((p) => p.id === id)?.nome || textos.completo.produtos.semNome;
  const deixando = resumo.deixandoDeGanhar;

  return (
    <section>
      <h1 className="completo-titulo">{t.titulo}</h1>
      <p className="campo-ajuda">{t.ajuda}</p>

      <div className={`cartao ${deixando ? 'cartao-alerta' : 'cartao-bom'}`} role="status">
        <p className="cartao-destaque">
          <span aria-hidden="true">{deixando ? '⚠ ' : '✔ '}</span>
          {deixando ? textos.deixandoDeGanhar(formatarReal(resumo.diferenca)) : textos.precoJaCobre}
        </p>
      </div>

      <div className="lado-a-lado">
        <div className="caixa-valor">
          <p className="caixa-rotulo">{t.receitaAtual}</p>
          <p className="caixa-numero">{formatarReal(resumo.receitaComPrecoAtual)}</p>
        </div>
        <div className="caixa-valor">
          <p className="caixa-rotulo">{t.receitaMinimo}</p>
          <p className="caixa-numero">{formatarReal(resumo.receitaComPrecoMinimo)}</p>
        </div>
      </div>

      <div className="rolagem-tabela">
        <table className="tabela-resumo">
          <thead>
            <tr>
              <th scope="col">{t.produto}</th>
              <th scope="col">{t.receitaAtual}</th>
              <th scope="col">{t.receitaMinimo}</th>
              <th scope="col">{t.diferenca}</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p, i) => {
              const r = calculo.resultados[i];
              if (!r.ok) return null;
              const n = r.mesesDoCiclo;
              return (
                <tr key={p.id}>
                  <th scope="row">{p.nome || textos.completo.produtos.semNome}</th>
                  <td>{formatarReal(r.receitas.comPrecoAtual / n)}</td>
                  <td>{formatarReal(r.receitas.comPrecoMinimo / n)}</td>
                  <td>{formatarReal(r.receitas.diferenca / n)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{t.total}</th>
              <td>{formatarReal(resumo.receitaComPrecoAtual)}</td>
              <td>{formatarReal(resumo.receitaComPrecoMinimo)}</td>
              <td>{formatarReal(resumo.diferenca)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {resumo.produtosSemCalculo.length > 0 && (
        <p className="aviso-linha">⚠ {t.foraDoResumo(resumo.produtosSemCalculo.map(nome).join(', '))}</p>
      )}
      {!calculo.percentuaisOk && <p className="aviso-linha">⚠ {textos.completo.gastos.percentuaisErrados}</p>}

      <div className="painel painel-resultado">
        <table className="tabela-calculo">
          <tbody>
            <tr>
              <th scope="row">{t.receitaAtual}</th>
              <td>{formatarReal(resumo.receitaComPrecoAtual)}</td>
            </tr>
            <tr>
              <th scope="row">{t.meusGastos}</th>
              <td>{formatarReal(resumo.todosOsGastos)}</td>
            </tr>
            <tr className="linha-destaque">
              <th scope="row">{t.resultadoTodos}</th>
              <td>{formatarReal(resumo.resultadoTodosOsCustos)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="painel painel-resultado">
        <table className="tabela-calculo">
          <tbody>
            <tr>
              <th scope="row">{t.meuTrabalho}</th>
              <td>{formatarReal(meuTrabalho)}</td>
            </tr>
            <tr className="linha-destaque">
              <th scope="row">{t.resultadoSemTrabalho}</th>
              <td>{formatarReal(resumo.resultadoSemTrabalhoProprio)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
