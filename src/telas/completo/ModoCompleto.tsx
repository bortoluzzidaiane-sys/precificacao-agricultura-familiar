// Modo Completo: todos os produtos, gastos gerais, resumo do mês e exportação.
import { useEffect, useMemo, useState } from 'react';
import { calcularPropriedade, pesoEfetivo, type Produto, type Propriedade } from '../../calculos';
import { carregarPropriedade, excluirProduto, listarProdutos, salvarProduto, salvarPropriedade } from '../../dados';
import { textos } from '../../textos';
import { Exportar } from './Exportar';
import { GastosGerais } from './GastosGerais';
import { Produtos } from './Produtos';
import { Resumo } from './Resumo';

type Aba = keyof typeof textos.completo.abas;
const ABAS: Aba[] = ['produtos', 'gastos', 'resumo', 'exportar'];

export const propriedadeVazia = (): Propriedade => ({ gastosComuns: [], equipamentos: [], meuTrabalho: 0 });

/** Guarda o peso efetivo junto do produto, para os dados exportados ficarem coerentes. */
function normalizar(p: Produto, prop: Propriedade): Produto {
  return { ...p, pesoTempo: pesoEfetivo(p, prop.divisaoTempo) };
}

export function ModoCompleto({ irParaSimples }: { irParaSimples: () => void }) {
  const [aba, setAba] = useState<Aba>('produtos');
  // Tocar numa aba sempre abre o começo dela (ex.: "Produtos" volta à lista, mesmo editando um produto).
  const [visita, setVisita] = useState(0);
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [propriedade, setPropriedade] = useState<Propriedade>(propriedadeVazia);

  useEffect(() => {
    Promise.all([listarProdutos(), carregarPropriedade()]).then(([lista, prop]) => {
      setProdutos(lista ?? []);
      if (prop) setPropriedade(prop);
    });
  }, []);

  const calculo = useMemo(
    () => calcularPropriedade(produtos ?? [], propriedade),
    [produtos, propriedade],
  );

  if (produtos === null) return <p className="completo-carregando">{textos.completo.carregando}</p>;

  function mudarProduto(p: Produto) {
    const normal = normalizar(p, propriedade);
    setProdutos((lista) => {
      const atual = lista ?? [];
      return atual.some((x) => x.id === p.id) ? atual.map((x) => (x.id === p.id ? normal : x)) : [...atual, normal];
    });
    salvarProduto(normal);
  }

  function removerProduto(id: string) {
    setProdutos((lista) => (lista ?? []).filter((p) => p.id !== id));
    excluirProduto(id);
  }

  function mudarPropriedade(prop: Propriedade) {
    setPropriedade(prop);
    salvarPropriedade(prop);
    if (prop.divisaoTempo !== propriedade.divisaoTempo) {
      // Ao passar para percentual, quem ainda não tem % recebe a participação atual × 100:
      // a divisão não muda só por trocar a forma de informar.
      const paraPercentual = prop.divisaoTempo === 'percentual';
      const lista = (produtos ?? []).map((p, i) =>
        normalizar(
          paraPercentual && p.percentualTempo === undefined
            ? { ...p, percentualTempo: calculo.participacoes[i] * 100 }
            : p,
          prop,
        ),
      );
      setProdutos(lista);
      lista.forEach(salvarProduto);
    }
  }

  function restaurar(lista: Produto[], prop: Propriedade) {
    setProdutos(lista);
    setPropriedade(prop);
  }

  return (
    <div className="completo">
      <header className="completo-topo">
        <div>
          <p className="completo-app">{textos.nomeApp}</p>
          <p className="completo-modo">{textos.modo.completo}</p>
        </div>
        <button type="button" className="botao-pequeno" onClick={irParaSimples}>
          {textos.modo.irParaSimples}
        </button>
      </header>
      <nav className="completo-abas" aria-label={textos.modo.completo}>
        {ABAS.map((a) => (
          <button
            key={a}
            type="button"
            className={`completo-aba${aba === a ? ' ativa' : ''}`}
            aria-current={aba === a ? 'page' : undefined}
            onClick={() => {
              setAba(a);
              setVisita((v) => v + 1);
              window.scrollTo(0, 0);
            }}
          >
            {textos.completo.abas[a]}
          </button>
        ))}
      </nav>
      <main className="completo-conteudo">
        {aba === 'produtos' && (
          <Produtos
            key={visita}
            produtos={produtos}
            calculo={calculo}
            mudarProduto={mudarProduto}
            removerProduto={removerProduto}
          />
        )}
        {aba === 'gastos' && (
          <GastosGerais
            produtos={produtos}
            propriedade={propriedade}
            calculo={calculo}
            mudarPropriedade={mudarPropriedade}
            mudarProduto={mudarProduto}
          />
        )}
        {aba === 'resumo' && <Resumo produtos={produtos} calculo={calculo} meuTrabalho={propriedade.meuTrabalho} />}
        {aba === 'exportar' && (
          <Exportar produtos={produtos} propriedade={propriedade} calculo={calculo} restaurar={restaurar} />
        )}
        <p className="completo-rodape">{textos.completo.salvoNoCelular}</p>
      </main>
    </div>
  );
}
