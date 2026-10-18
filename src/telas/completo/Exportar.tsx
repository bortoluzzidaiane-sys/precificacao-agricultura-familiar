import { useRef, useState } from 'react';
import type { CalculoPropriedade, Produto, Propriedade } from '../../calculos';
import { substituirTudo } from '../../dados';
import { baixarArquivo, lerCopia, montarCopia, montarCsv } from '../../dados/exportacao';
import { textos } from '../../textos';

interface Props {
  produtos: Produto[];
  propriedade: Propriedade;
  calculo: CalculoPropriedade;
  restaurar: (produtos: Produto[], propriedade: Propriedade) => void;
}

const hoje = () => new Date().toISOString().slice(0, 10);

export function Exportar({ produtos, propriedade, calculo, restaurar }: Props) {
  const t = textos.completo.exportar;
  const arquivo = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null);

  async function aoEscolherArquivo(lista: FileList | null) {
    const f = lista?.[0];
    if (arquivo.current) arquivo.current.value = '';
    if (!f) return;
    const copia = lerCopia(await f.text());
    if (!copia) {
      setMensagem({ ok: false, texto: t.arquivoInvalido });
      return;
    }
    if (!window.confirm(t.confirmarRestaurar(copia.produtos.length))) return;
    await substituirTudo(copia.produtos, copia.propriedade);
    restaurar(copia.produtos, copia.propriedade);
    setMensagem({ ok: true, texto: t.restaurado });
  }

  return (
    <section>
      <h1 className="completo-titulo">{t.titulo}</h1>

      <div className="painel">
        <button
          type="button"
          className="botao-acao"
          disabled={produtos.length === 0}
          onClick={() =>
            baixarArquivo(`precos-${hoje()}.csv`, montarCsv(produtos, calculo), 'text/csv;charset=utf-8')
          }
        >
          📄 {t.planilha}
        </button>
        <p className="campo-ajuda">{t.planilhaAjuda}</p>
      </div>

      <div className="painel">
        <button
          type="button"
          className="botao-acao"
          onClick={() =>
            baixarArquivo(
              `copia-precificacao-${hoje()}.json`,
              JSON.stringify(montarCopia(produtos, propriedade), null, 2),
              'application/json',
            )
          }
        >
          💾 {t.copia}
        </button>
        <p className="campo-ajuda">{t.copiaAjuda}</p>
      </div>

      <div className="painel">
        <label className="botao-acao botao-arquivo">
          📂 {t.restaurar}
          <input
            ref={arquivo}
            type="file"
            accept="application/json,.json"
            className="oculto"
            onChange={(e) => aoEscolherArquivo(e.target.files)}
          />
        </label>
        <p className="campo-ajuda">{t.restaurarAjuda}</p>
        {mensagem && (
          <p className={`situacao ${mensagem.ok ? 'situacao-bom' : 'situacao-alerta'}`} role="status">
            {mensagem.ok ? '✔ ' : '⚠ '}
            {mensagem.texto}
          </p>
        )}
      </div>
    </section>
  );
}
