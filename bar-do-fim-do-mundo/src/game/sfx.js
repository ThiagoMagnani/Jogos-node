// Efeitos sonoros gerados na hora com a Web Audio API (nenhum arquivo de áudio necessário).
let ctx = null;
let mudo = false;

export function definirMudo(valor) {
  mudo = valor;
}

function audio() {
  if (mudo) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) {
    return null;
  }
}

function tom(freq, duracao, { tipo = 'sine', vol = 0.07, inicio = 0, ate = null } = {}) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + inicio;
  const osc = a.createOscillator();
  const ganho = a.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t0);
  if (ate) osc.frequency.exponentialRampToValueAtTime(ate, t0 + duracao);
  ganho.gain.setValueAtTime(0.0001, t0);
  ganho.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);
  osc.connect(ganho).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + duracao + 0.05);
}

export const sfx = {
  clique: () => tom(520, 0.07, { tipo: 'triangle', vol: 0.05 }),
  colocar: (i = 0) => tom(260 + i * 70, 0.16, { tipo: 'sine', vol: 0.09, ate: 150 + i * 40 }),
  remover: () => tom(220, 0.12, { tipo: 'triangle', vol: 0.05, ate: 330 }),
  pagina: () => tom(660, 0.05, { tipo: 'square', vol: 0.025 }),
  sino: () => {
    tom(880, 0.9, { vol: 0.06 });
    tom(1320, 0.7, { vol: 0.035, inicio: 0.02 });
    tom(1760, 0.5, { vol: 0.02, inicio: 0.04 });
  },
  perfeito: () => [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.3, { vol: 0.07, inicio: i * 0.1 })),
  bom: () => [440, 554].forEach((f, i) => tom(f, 0.25, { vol: 0.06, inicio: i * 0.12 })),
  ruim: () => [300, 220, 160].forEach((f, i) => tom(f, 0.3, { tipo: 'sawtooth', vol: 0.04, inicio: i * 0.13 })),
  tempo: () => tom(180, 0.6, { tipo: 'sawtooth', vol: 0.05, ate: 90 }),
  moeda: () => {
    tom(988, 0.08, { tipo: 'square', vol: 0.03 });
    tom(1319, 0.2, { tipo: 'square', vol: 0.03, inicio: 0.07 });
  },
  presente: () => [784, 988, 1175, 1568].forEach((f, i) => tom(f, 0.4, { vol: 0.05, inicio: i * 0.09 })),
  comprar: () => {
    tom(660, 0.1, { tipo: 'triangle', vol: 0.06 });
    tom(990, 0.18, { tipo: 'triangle', vol: 0.06, inicio: 0.08 });
  },
  erro: () => tom(140, 0.18, { tipo: 'square', vol: 0.04 }),
};
