import { useCallback, useEffect, useState } from 'react';

/**
 * Efeito de "máquina de escrever" para os textos da história.
 * Retorna o trecho já exibido, se terminou e uma função para pular direto ao fim.
 */
export default function useMaquinaDeEscrever(texto, velocidade = 22) {
  const [qtd, setQtd] = useState(0);

  // Reinicia sempre que o texto muda (nova página da história).
  useEffect(() => {
    setQtd(0);
    const reduzido =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzido) {
      setQtd(texto.length);
      return undefined;
    }
    const id = setInterval(() => {
      setQtd((q) => {
        if (q >= texto.length) {
          clearInterval(id);
          return q;
        }
        return q + 1;
      });
    }, velocidade);
    return () => clearInterval(id);
  }, [texto, velocidade]);

  const pular = useCallback(() => setQtd(texto.length), [texto]);

  return { exibido: texto.slice(0, qtd), completo: qtd >= texto.length, pular };
}
