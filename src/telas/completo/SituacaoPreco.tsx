import type { Comparacao } from '../../calculos';
import { textos } from '../../textos';

/** 5.10 — acima / abaixo do preço mínimo, com ícone + texto + cor. */
export function SituacaoPreco({ comparacao }: { comparacao: Comparacao }) {
  const abaixo = comparacao === 'abaixo';
  return (
    <span className={`situacao ${abaixo ? 'situacao-alerta' : 'situacao-bom'}`}>
      <span aria-hidden="true">{abaixo ? '⚠' : '✔'} </span>
      {textos.resultado[comparacao]}
    </span>
  );
}
