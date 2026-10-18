import { useState } from 'react';
import { ModoCompleto } from './telas/completo/ModoCompleto';
import { AssistentePreco } from './telas/simples/AssistentePreco';

type Modo = 'simples' | 'completo';
const CHAVE_MODO = 'modo';

// Preferência só deste aparelho. Se o navegador bloquear o armazenamento, abre no Modo Simples (padrão).
function lerModo(): Modo {
  try {
    return localStorage.getItem(CHAVE_MODO) === 'completo' ? 'completo' : 'simples';
  } catch {
    return 'simples';
  }
}

export default function App() {
  const [modo, setModo] = useState<Modo>(lerModo);

  function trocar(novo: Modo) {
    setModo(novo);
    window.scrollTo(0, 0);
    try {
      localStorage.setItem(CHAVE_MODO, novo);
    } catch {
      // sem armazenamento: só não lembra a escolha
    }
  }

  return modo === 'completo' ? (
    <ModoCompleto irParaSimples={() => trocar('simples')} />
  ) : (
    <AssistentePreco irParaCompleto={() => trocar('completo')} />
  );
}
