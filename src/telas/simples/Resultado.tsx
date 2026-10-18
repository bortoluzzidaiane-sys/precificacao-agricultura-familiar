import { formatarReal } from '../../calculos';
import { textos } from '../../textos';
import { BotaoOuvir } from './BotaoOuvir';
import { calcularRascunho, nomeDaUnidade, nomeDoProduto, trechoPeriodo, type Rascunho } from './rascunho';

interface Props {
  rascunho: Rascunho;
  mudarRespostas: () => void;
  novoCalculo: () => void;
}

const formatoQuantidade = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function Resultado({ rascunho, mudarRespostas, novoCalculo }: Props) {
  const r = calcularRascunho(rascunho);
  const nome = nomeDoProduto(rascunho);
  const periodo = trechoPeriodo(rascunho);

  const botoes = (
    <div className="acoes">
      <button type="button" className="botao-secundario" onClick={mudarRespostas}>
        <span aria-hidden="true">✏️</span> {textos.resultado.mudarRespostas}
      </button>
      <button type="button" className="botao-secundario" onClick={novoCalculo}>
        <span aria-hidden="true">➕</span> {textos.resultado.novoCalculo}
      </button>
    </div>
  );

  if (!r.ok) {
    return (
      <section className="tela">
        <p className="aviso-alerta" role="alert">
          <span aria-hidden="true">⚠ </span>
          {textos.quantidadeVendidaZero}
        </p>
        <BotaoOuvir texto={textos.quantidadeVendidaZero} />
        {botoes}
      </section>
    );
  }

  const singular = nomeDaUnidade(rascunho, 'singular');
  const precoMinimo = formatarReal(r.precoMinimo.exibido);
  const precoAtual = formatarReal(rascunho.precoAtual ?? 0);
  // Produtos de safra entram pela média mensal (5.9).
  const diferencaMes = r.receitas.diferenca / r.mesesDoCiclo;
  const mensagem = diferencaMes > 0 ? textos.deixandoDeGanhar(formatarReal(diferencaMes)) : textos.precoJaCobre;
  const abaixo = r.comparacao === 'abaixo';
  const comparacao = textos.resultado[r.comparacao];

  const fala = [
    textos.resultado.titulo(nome),
    `${precoMinimo} ${textos.resultado.por(singular)}.`,
    textos.resultado.seuPreco(precoAtual) + '.',
    comparacao,
    mensagem + '.',
  ].join(' ');

  return (
    <section className="tela">
      <h1 className="pergunta">{textos.resultado.titulo(nome)}</h1>
      <p className="preco-grande">
        {precoMinimo}
        <span className="preco-unidade">{textos.resultado.por(singular)}</span>
      </p>

      <div className={`cartao ${abaixo ? 'cartao-alerta' : 'cartao-bom'}`}>
        <p className="cartao-linha">{textos.resultado.seuPreco(precoAtual)}</p>
        <p className="cartao-destaque">
          <span className="cartao-icone" aria-hidden="true">
            {abaixo ? '⚠' : '✔'}
          </span>
          {comparacao}
        </p>
        <p className="cartao-destaque">{mensagem}</p>
      </div>

      <ul className="detalhes">
        <li>{textos.resultado.seusGastos(formatarReal(r.gastoTotal), periodo)}</li>
        <li>
          {textos.resultado.voceVende(
            formatoQuantidade.format(r.quantidadeVendida),
            nomeDaUnidade(rascunho, 'plural'),
            periodo,
          )}
        </li>
      </ul>

      <BotaoOuvir texto={fala} />
      {botoes}
    </section>
  );
}
