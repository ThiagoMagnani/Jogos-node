import { INGREDIENTES } from '../data/ingredients';
import { TECNICAS } from '../data/techniques';

export const VIDAS_BASE = 3;

/** Ingredientes que o jogador pode usar numa noite (normais liberados + presentes ganhos). */
export function ingredientesDisponiveis(noite, presentes) {
  return INGREDIENTES.filter((ing) => (ing.presente ? presentes.includes(ing.id) : ing.noite <= noite));
}

export const tecnicasDisponiveis = (noite) => TECNICAS.filter((t) => t.noite <= noite);

/** O que foi liberado exatamente nesta noite (para mostrar na tela de introdução). */
export const novidadesDaNoite = (noite) => ({
  ingredientes: INGREDIENTES.filter((i) => !i.presente && i.noite === noite),
  tecnicas: TECNICAS.filter((t) => t.noite === noite && noite > 1),
});

/** Moedas ganhas por drink. Perfeito paga mais e recompensa rapidez. */
export function calcularGorjeta({ veredito, tempoRestante, paciencia, jukebox }) {
  let moedas = 0;
  if (veredito === 'perfeito') {
    const bonusTempo = paciencia ? Math.round((tempoRestante / paciencia) * 10) : 5;
    moedas = 25 + bonusTempo;
  } else if (veredito === 'bom') {
    moedas = 10;
  }
  return jukebox ? Math.round(moedas * 1.25) : moedas;
}

/** Relógio do bar: a noite vai das 21h às 6h, avançando a cada cliente. */
export function horaDoBar(indice, total) {
  const minutosTotais = 9 * 60;
  const minutos = 21 * 60 + Math.round((indice / total) * minutosTotais * 0.9);
  const h = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function estrelasDaNoite(resultados) {
  if (!resultados.length) return 1;
  const perfeitos = resultados.filter((r) => r.veredito === 'perfeito').length;
  const razao = perfeitos / resultados.length;
  if (razao >= 1) return 3;
  if (razao >= 0.5) return 2;
  return 1;
}

/** perfeito -> final A · bom -> final B · ruim/tempo -> final C */
export function tipoDoFinal(veredito) {
  if (veredito === 'perfeito') return 'A';
  if (veredito === 'bom') return 'B';
  return 'C';
}

export const substituirNome = (texto, nome) => texto.replace(/\{nome\}/g, nome);
