// ===== Sons sintetizados na hora (Web Audio) =====
// Motor: dois osciladores + filtro, com "marchas" simuladas. Derrapagem e nitro: ruído filtrado.
// Nenhum arquivo de áudio é necessário.

let ctx = null, mestre = null, ruido = null, mudo = false;
let motor = null, derr = null, nit = null;

export const definirMudo = (v) => { mudo = v; if (mestre) mestre.gain.value = v ? 0 : 0.55; };

function ac() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      mestre = ctx.createGain(); mestre.gain.value = mudo ? 0 : 0.55; mestre.connect(ctx.destination);
      ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) { return null; }
}

function laco(a, tipoFiltro, freq, q = 1) {
  const s = a.createBufferSource(); s.buffer = ruido; s.loop = true;
  const f = a.createBiquadFilter(); f.type = tipoFiltro; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain(); g.gain.value = 0;
  s.connect(f).connect(g).connect(mestre); s.start();
  return { s, f, g };
}

/** Liga o motor (chamar após um clique/tecla do jogador). */
export function iniciarMotor() {
  const a = ac(); if (!a || motor) return;
  const o1 = a.createOscillator(); o1.type = 'sawtooth';
  const o2 = a.createOscillator(); o2.type = 'square';
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800; f.Q.value = 2;
  const g = a.createGain(); g.gain.value = 0;
  o1.connect(f); o2.connect(f); f.connect(g).connect(mestre);
  o1.start(); o2.start();
  motor = { o1, o2, f, g };
  derr = laco(a, 'bandpass', 1900, 3);
  nit = laco(a, 'highpass', 2400, 0.7);
}

export function pararSons() {
  for (const n of [motor && [motor.o1, motor.o2], derr && [derr.s], nit && [nit.s]]) if (n) n.forEach((x) => { try { x.stop(); } catch (e) { /* já parado */ } });
  motor = derr = nit = null;
  if (ctx) { try { ctx.close(); } catch (e) { /* ignora */ } }
  ctx = null; mestre = null; ruido = null;
}

/** Atualiza os sons contínuos a cada quadro. vel01 = velocidade / máxima (0..1.2). */
export function atualizarSom({ vel01, acel, nitro, derrapa, pausado }) {
  if (!ctx || !motor) return;
  const t = ctx.currentTime;
  const marchas = 5, x = Math.min(0.999, Math.max(0, vel01)) * marchas;
  const g = Math.floor(x), frac = x - g;
  const rpm = 0.18 + 0.82 * frac;
  const f0 = 48 + rpm * (95 + g * 22) + (acel ? 14 : 0);
  motor.o1.frequency.setTargetAtTime(f0, t, 0.05);
  motor.o2.frequency.setTargetAtTime(f0 * 0.5, t, 0.05);
  motor.f.frequency.setTargetAtTime(500 + rpm * 1700 + (acel ? 500 : 0), t, 0.06);
  motor.g.gain.setTargetAtTime(pausado ? 0 : 0.05 + (acel ? 0.05 : 0) + rpm * 0.025, t, 0.08);
  derr.g.gain.setTargetAtTime(pausado ? 0 : derrapa * 0.12, t, 0.05);
  nit.g.gain.setTargetAtTime(pausado ? 0 : nitro ? 0.09 : 0, t, 0.05);
}

function tom(f, dur, { tipo = 'square', vol = 0.12, ate = null, ini = 0 } = {}) {
  const a = ac(); if (!a || mudo) return;
  const t0 = a.currentTime + ini;
  const o = a.createOscillator(), g = a.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t0);
  if (ate) o.frequency.exponentialRampToValueAtTime(ate, t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(mestre); o.start(t0); o.stop(t0 + dur + 0.02);
}

function estouro(dur, { vol = 0.25, filtro = 1500 } = {}) {
  const a = ac(); if (!a || mudo) return;
  const t0 = a.currentTime;
  const s = a.createBufferSource(); s.buffer = ruido;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(filtro, t0);
  f.frequency.exponentialRampToValueAtTime(100, t0 + dur);
  const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f).connect(g).connect(mestre); s.start(t0); s.stop(t0 + dur + 0.02);
}

export const somBip = (final = false) => tom(final ? 880 : 440, final ? 0.5 : 0.18, { vol: 0.14 });
export const somBatida = (forca) => estouro(0.25, { vol: Math.min(0.5, 0.12 + forca / 500), filtro: 900 });
export const somParede = (forca) => { estouro(0.3, { vol: Math.min(0.5, 0.15 + forca / 600), filtro: 700 }); tom(90, 0.2, { tipo: 'sine', vol: 0.18, ate: 40 }); };
export const somVolta = () => { tom(660, 0.1, { vol: 0.1 }); tom(990, 0.14, { vol: 0.1, ini: 0.1 }); };
export const somUltrap = () => { tom(520, 0.08, { vol: 0.09 }); tom(780, 0.1, { vol: 0.09, ini: 0.07 }); };
export const somChegada = () => [523, 659, 784, 1046].forEach((f, i) => tom(f, 0.2, { vol: 0.12, ini: i * 0.12 }));
