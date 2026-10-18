// Leitura em voz alta (Modo Simples). Usa a voz do próprio celular, funciona sem internet na maioria dos Android.
export const podeFalar = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function falar(texto: string) {
  if (!podeFalar) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 0.9;
  window.speechSynthesis.speak(fala);
}

export function pararDeFalar() {
  if (podeFalar) window.speechSynthesis.cancel();
}
