// Sons sintetizados na hora (Web Audio). Nenhum arquivo de áudio é necessário.
let ctx = null;
let mudo = false;
let ruido = null;

export const ouvintesMudo = new Set();
export const definirMudo = (v) => { mudo = v; ouvintesMudo.forEach((f) => f(v)); };
export const estaMudo = () => mudo;

export function ac(forcar = false) {
  if (mudo && !forcar) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) { return null; }
}

function tom(f, dur, { tipo = 'square', vol = 0.06, ate = null, ini = 0 } = {}) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime + ini;
  const o = a.createOscillator(); const g = a.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t0);
  if (ate) o.frequency.exponentialRampToValueAtTime(ate, t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}

function estouro(dur, { vol = 0.15, filtro = 1200, ini = 0 } = {}) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime + ini;
  const s = a.createBufferSource(); s.buffer = ruido;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(filtro, t0);
  f.frequency.exponentialRampToValueAtTime(100, t0 + dur);
  const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f).connect(g).connect(a.destination); s.start(t0); s.stop(t0 + dur + 0.02);
}

export const bufferRuido = () => ruido;

export const som = {
  escopeta: () => { estouro(0.3, { vol: 0.28, filtro: 2200 }); tom(180, 0.25, { tipo: 'sawtooth', vol: 0.08, ate: 50 }); },
  pulso: () => { estouro(0.07, { vol: 0.1, filtro: 4500 }); tom(900, 0.06, { tipo: 'square', vol: 0.04, ate: 400 }); },
  plasma: () => { tom(300, 0.35, { tipo: 'sawtooth', vol: 0.09, ate: 900 }); estouro(0.25, { vol: 0.12, filtro: 2500 }); },
  trilho: () => { tom(1400, 0.5, { tipo: 'sawtooth', vol: 0.08, ate: 60 }); estouro(0.4, { vol: 0.25, filtro: 5000 }); },
  dash: () => { estouro(0.18, { vol: 0.1, filtro: 3500 }); },
  pistola: () => { estouro(0.12, { vol: 0.12, filtro: 3000 }); tom(500, 0.1, { tipo: 'sawtooth', vol: 0.05, ate: 90 }); },
  vazio: () => tom(150, 0.06, { vol: 0.04 }),
  acerto: () => tom(300, 0.07, { tipo: 'triangle', vol: 0.07, ate: 150 }),
  morte: () => { tom(260, 0.3, { tipo: 'sawtooth', vol: 0.07, ate: 55 }); estouro(0.2, { vol: 0.08, filtro: 800 }); },
  explosao: () => { estouro(0.7, { vol: 0.35, filtro: 1400 }); tom(90, 0.5, { tipo: 'sawtooth', vol: 0.12, ate: 30 }); },
  dano: () => { tom(140, 0.18, { tipo: 'sawtooth', vol: 0.09, ate: 70 }); },
  item: () => { tom(660, 0.08, { vol: 0.05 }); tom(990, 0.12, { vol: 0.05, ini: 0.07 }); },
  arma: () => { [392, 523, 659, 784].forEach((f, i) => tom(f, 0.12, { vol: 0.06, ini: i * 0.08 })); },
  porta: () => { estouro(0.35, { vol: 0.07, filtro: 600 }); },
  negado: () => { tom(120, 0.15, { vol: 0.07 }); tom(95, 0.2, { vol: 0.07, ini: 0.15 }); },
  cuspe: () => { estouro(0.18, { vol: 0.08, filtro: 1500 }); tom(240, 0.2, { tipo: 'sine', vol: 0.07, ate: 520 }); },
  zap: () => { tom(1100, 0.22, { tipo: 'sawtooth', vol: 0.05, ate: 260 }); tom(1500, 0.12, { tipo: 'square', vol: 0.025, ate: 400 }); },
  metralha: () => { tom(750, 0.04, { tipo: 'square', vol: 0.035, ate: 300 }); },
  tele: () => { tom(200, 0.35, { tipo: 'sine', vol: 0.08, ate: 1400 }); tom(1400, 0.3, { tipo: 'sine', vol: 0.05, ate: 200, ini: 0.15 }); },
  onda: () => { tom(120, 0.5, { tipo: 'sawtooth', vol: 0.12, ate: 40 }); estouro(0.5, { vol: 0.2, filtro: 3000 }); tom(900, 0.3, { tipo: 'sine', vol: 0.05, ate: 200 }); },
  batida: () => { tom(60, 0.12, { tipo: 'sine', vol: 0.18 }); tom(55, 0.14, { tipo: 'sine', vol: 0.14, ini: 0.18 }); },
  fragmento: () => { [880, 1175, 1568].forEach((f, i) => tom(f, 0.1, { tipo: 'triangle', vol: 0.05, ini: i * 0.06 })); },
  lancar: () => tom(420, 0.14, { tipo: 'triangle', vol: 0.05, ate: 220 }),
  fala: () => { tom(180, 0.1, { vol: 0.05 }); tom(150, 0.12, { vol: 0.05, ini: 0.1 }); },
  vitoria: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tom(f, 0.2, { vol: 0.07, ini: i * 0.12 })); },
  derrota: () => { [330, 262, 196, 131].forEach((f, i) => tom(f, 0.3, { tipo: 'sawtooth', vol: 0.07, ini: i * 0.2 })); },
};
