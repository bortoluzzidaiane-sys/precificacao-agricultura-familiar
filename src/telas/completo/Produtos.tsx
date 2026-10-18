import { useState } from 'react';
import { formatarReal, type CalculoPropriedade, type Produto } from '../../calculos';
import { PRODUTOS_PADRAO } from '../../dados/produtosPadrao';
import { textos } from '../../textos';
import { EditorProduto } from './EditorProduto';
import { SituacaoPreco } from './SituacaoPreco';

interface Props {
  produtos: Produto[];
  calculo: CalculoPropriedade;
  mudarProduto: (p: Produto) => void;
  removerProduto: (id: string) => void;
}

function novoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function novoProduto(nome: string, periodo: Produto['periodo']): Produto {
  return {
    id: novoId(),
    nome,
    unidade: '',
    periodo,
    // Safra: o nº de meses é informado pelo agricultor (seção 7). Zero = ainda não informado.
    mesesDoCiclo: periodo === 'mes' ? 1 : 0,
    gastosDiretos: [],
    pesoTempo: 0,
    quantidadeProduzida: 0,
    percentualVendido: 0,
    margemMinima: 0,
    precoAtual: 0,
  };
}

export function Produtos({ produtos, calculo, mudarProduto, removerProduto }: Props) {
  const [editando, setEditando] = useState<string | null>(null);
  const [escolhendo, setEscolhendo] = useState(false);
  const t = textos.completo.produtos;

  const indice = produtos.findIndex((p) => p.id === editando);
  if (editando && indice >= 0) {
    return (
      <EditorProduto
        produto={produtos[indice]}
        divisao={calculo.divisao}
        participacao={calculo.participacoes[indice]}
        resultado={calculo.resultados[indice]}
        mudar={mudarProduto}
        voltar={() => {
          setEditando(null);
          window.scrollTo(0, 0);
        }}
        excluir={() => {
          if (window.confirm(t.confirmarExclusao(produtos[indice].nome || t.semNome))) {
            removerProduto(editando);
            setEditando(null);
          }
        }}
      />
    );
  }

  function adicionar(p: Produto) {
    mudarProduto(p);
    setEscolhendo(false);
    setEditando(p.id);
    window.scrollTo(0, 0);
  }

  const nomesUsados = new Set(produtos.map((p) => p.nome.trim().toLowerCase()));
  const sugestoes = PRODUTOS_PADRAO.filter((p) => !nomesUsados.has(p.nome.toLowerCase()));

  return (
    <section>
      <h1 className="completo-titulo">{t.titulo}</h1>
      {produtos.length === 0 && <p>{t.vazio}</p>}
      <ul className="lista-produtos">
        {produtos.map((p, i) => {
          const r = calculo.resultados[i];
          return (
            <li key={p.id}>
              <button type="button" className="cartao-produto" onClick={() => setEditando(p.id)}>
                <span className="cartao-produto-nome">
                  {p.nome || t.semNome}
                  <span className="cartao-produto-periodo">
                    {p.periodo === 'mes' ? textos.completo.editor.mes : textos.completo.editor.ciclo}
                    {p.unidade && ` · ${p.unidade}`}
                  </span>
                </span>
                {r.ok ? (
                  <span className="cartao-produto-precos">
                    <span>
                      {t.precoMinimo}: <strong>{formatarReal(r.precoMinimo.exibido)}</strong>
                    </span>
                    <span>
                      {t.precoAtual}: {formatarReal(p.precoAtual)}
                    </span>
                    <SituacaoPreco comparacao={r.comparacao} />
                  </span>
                ) : (
                  <span className="situacao situacao-alerta">⚠ {t.semCalculo}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {escolhendo ? (
        <div className="painel">
          <h2 className="completo-subtitulo">{t.escolher}</h2>
          <div className="grade-produtos">
            {sugestoes.map((s) => (
              <button
                key={s.chave}
                type="button"
                className="botao-pequeno"
                onClick={() => adicionar(novoProduto(s.nome, s.periodo))}
              >
                <span aria-hidden="true">{s.icone}</span> {s.nome}
              </button>
            ))}
            <button type="button" className="botao-pequeno" onClick={() => adicionar(novoProduto('', 'mes'))}>
              ➕ {t.novo}
            </button>
          </div>
          <button type="button" className="botao-pequeno" onClick={() => setEscolhendo(false)}>
            {t.cancelar}
          </button>
        </div>
      ) : (
        <button type="button" className="botao-acao" onClick={() => setEscolhendo(true)}>
          ➕ {t.adicionar}
        </button>
      )}
    </section>
  );
}
