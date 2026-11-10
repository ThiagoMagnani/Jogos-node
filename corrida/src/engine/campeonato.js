// ===== Campeonato: fases, dificuldades, prêmios e regras de desbloqueio =====

export const DIFICULDADES = {
  esperto: { id: 'esperto', nome: 'Esperto', skill: -0.03, nivel: -0.4, premio: 0.8, desc: 'Rivais bons, mas que erram mais.' },
  dificil: { id: 'dificil', nome: 'Difícil', skill: 0, nivel: 0, premio: 1, desc: 'O padrão: pilotos afiados e carros no talo.' },
  impiedoso: { id: 'impiedoso', nome: 'Impiedoso', skill: 0.03, nivel: 0.5, premio: 1.3, desc: 'Rivais quase perfeitos. Prêmios maiores.' },
};

/**
 * Fases do campeonato. nivelBots = nível médio dos upgrades dos rivais (0 a 5);
 * skill = talento base dos rivais. Quanto mais avançada a fase, mais forte o grid.
 * Segunda metade do jogo: Copa Neon (fases 5 a 8) e o modo Racha Aleatório.
 */
export const FASES = [
  { numero: 1, id: 'f1', pista: 'parque', copa: 'Copa Asfalto', nome: 'Parque Aurora', emoji: '🌳', voltas: 3, nivelBots: 0.3, skill: 0.97, premio: 1.0, dica: 'Curvas largas e retas longas. Ótima para aprender a derrapar.' },
  { numero: 2, id: 'f2', pista: 'centro', copa: 'Copa Asfalto', nome: 'Centro Velho', emoji: '🏙️', voltas: 2, nivelBots: 1.1, skill: 0.98, premio: 1.35, dica: 'Ruas estreitas e curvas fechadas. Freie cedo e use o freio de mão.' },
  { numero: 3, id: 'f3', pista: 'orla', copa: 'Copa Asfalto', nome: 'Orla Marítima', emoji: '🌴', voltas: 3, nivelBots: 2.0, skill: 0.99, premio: 1.75, dica: 'Pista rápida à beira-mar. O nitro decide as ultrapassagens.' },
  { numero: 4, id: 'f4', pista: 'serra', copa: 'Copa Asfalto', nome: 'Serra do Vento', emoji: '⛰️', voltas: 3, nivelBots: 3.0, skill: 1.0, premio: 2.3, dica: 'Final da copa: noite, curvas em S e rivais no limite.' },
];

export const PREMIOS_POSICAO = [1800, 1100, 700, 520, 360, 240];

export const faseDoId = (id) => FASES.find((f) => f.id === id);

/** Uma fase abre quando o jogador sobe ao pódio (top 3) na anterior. */
export function faseLiberada(save, fase) {
  if (fase.numero === 1) return true;
  const anterior = FASES[fase.numero - 2];
  const reg = save.corridas[anterior.id];
  return !!reg && reg.melhorPos <= 3;
}

export const estrelasDaPos = (pos) => (pos === 1 ? 3 : pos <= 3 ? 2 : pos <= 5 ? 1 : 0);

/** Calcula o dinheiro ganho numa corrida (primeira vez no pódio rende bônus). */
export function calcularPremio(fase, resultado, dificuldadeId, registroAnterior) {
  const dif = DIFICULDADES[dificuldadeId] || DIFICULDADES.dificil;
  const itens = [];
  const base = Math.round(PREMIOS_POSICAO[resultado.pos - 1] * fase.premio * dif.premio / 10) * 10;
  itens.push([`${resultado.pos}º lugar`, base]);
  const repetida = registroAnterior && registroAnterior.melhorPos <= resultado.pos && registroAnterior.vezes > 0;
  let total = base;
  if (repetida) { const corte = Math.round(base * 0.4); total -= corte; itens.push(['Corrida repetida (−40%)', -corte]); }
  if (resultado.melhorVoltaCorrida && resultado.melhorVoltaCorrida.nome === 'Você') { itens.push(['Melhor volta da corrida', 250]); total += 250; }
  if (resultado.ultrap > 0) { const v = resultado.ultrap * 30; itens.push([`${resultado.ultrap} ultrapassagens`, v]); total += v; }
  if (resultado.pos <= 3 && (!registroAnterior || registroAnterior.melhorPos > 3)) {
    const b = Math.round(base * 0.5); itens.push(['Primeiro pódio nesta pista', b]); total += b;
  }
  if (resultado.batidas > 12) { itens.push(['Reparos (muitas batidas)', -120]); total -= 120; }
  return { itens, total: Math.max(50, total) };
}

/** 83.456 → "1:23.46" */
export function formatarTempo(t) {
  if (t == null || !isFinite(t)) return '--:--.--';
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(2)}`;
}
export const ordinal = (n) => `${n}º`;
