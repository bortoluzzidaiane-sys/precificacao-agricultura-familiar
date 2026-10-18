import { textos } from '../../textos';
import { falar, podeFalar } from './falar';

export function BotaoOuvir({ texto }: { texto: string }) {
  if (!podeFalar) return null;
  return (
    <button type="button" className="botao-ouvir" onClick={() => falar(texto)}>
      <span aria-hidden="true">🔊</span> {textos.comum.ouvir}
    </button>
  );
}
