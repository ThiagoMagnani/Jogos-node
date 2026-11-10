// ===== Áudio: música sintetizada + efeitos (Web Audio) =====
// Nenhum arquivo de som é necessário: a música é "tocada" por um sequenciador que cria
// baixo, bateria, arpejo, pad e melodia na hora. Há dois canais independentes:
//   • música  (busMusica)  • sons dos carros e efeitos (busSfx)
// Cada um pode ser ligado/desligado e a escolha fica salva no navegador.

const CHAVE = 'asfalto-neon-audio';
const NIVEL_MUSICA = 0.38; // volume geral da música
const NIVEL_SONS = 0.6;    // volume geral de motor + efeitos (mais baixo que antes)

let ctx = null, busMusica = null, busSfx = null, duck = null, atrasoIn = null, atrasoTempo = null, ruido = null;
let motor = null, derr = null, nit = null;
let desejada = null, faixa = null, timer = null, intensidade = 0, esperando = false;
const ouvintes = new Set();

// ---------- preferências (ligar/desligar) ----------
function lerPrefs() {
  try {
    const j = JSON.parse(localStorage.getItem(CHAVE));
    return { musica: !j || j.musica !== false, sons: !j || j.sons !== false };
  } catch (e) { return { musica: true, sons: true }; }
}
const prefs = lerPrefs();
const salvarPrefs = () => { try { localStorage.setItem(CHAVE, JSON.stringify(prefs)); } catch (e) { /* ignora */ } };

export const estadoAudio = () => ({ musica: prefs.musica, sons: prefs.sons, pronto: !!ctx && ctx.state === 'running' });
const notificar = () => ouvintes.forEach((f) => f(estadoAudio()));
/** Para a interface em React acompanhar o estado. Devolve a função de cancelar. */
export function aoMudarAudio(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); }

export function definirMusica(ligada) {
  prefs.musica = ligada; salvarPrefs();
  if (ctx && busMusica) busMusica.gain.setTargetAtTime(ligada ? NIVEL_MUSICA : 0, ctx.currentTime, 0.05);
  notificar();
}
export function definirSons(ligados) {
  prefs.sons = ligados; salvarPrefs();
  if (ctx && busSfx) busSfx.gain.setTargetAtTime(ligados ? NIVEL_SONS : 0, ctx.currentTime, 0.05);
  notificar();
}
export const alternarMusica = () => definirMusica(!prefs.musica);
export const alternarSons = () => definirSons(!prefs.sons);

// ---------- contexto de áudio ----------
function montarGrafo(c) {
  const comp = c.createDynamicsCompressor(); // "cola" a mistura e evita estourar
  comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
  const mestre = c.createGain(); mestre.gain.value = 0.85; mestre.connect(comp); comp.connect(c.destination);

  busMusica = c.createGain(); busMusica.gain.value = prefs.musica ? NIVEL_MUSICA : 0; busMusica.connect(mestre);
  duck = c.createGain(); duck.gain.value = 1; duck.connect(busMusica);
  busSfx = c.createGain(); busSfx.gain.value = prefs.sons ? NIVEL_SONS : 0; busSfx.connect(mestre);

  // eco (delay com realimentação) usado no arpejo e na melodia
  atrasoIn = c.createDelay(1.5); atrasoIn.delayTime.value = 0.35; atrasoTempo = atrasoIn.delayTime;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
  const fb = c.createGain(); fb.gain.value = 0.36;
  atrasoIn.connect(lp); lp.connect(fb); fb.connect(atrasoIn); lp.connect(duck);

  ruido = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = ruido.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

function ac() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      montarGrafo(ctx);
      ctx.onstatechange = () => { if (ctx && ctx.state === 'running') aplicarDesejada(); notificar(); };
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch (e) { return null; }
}

/** Navegadores só liberam áudio depois de um clique/tecla: espera o primeiro gesto do jogador. */
export function prepararAudio() {
  if (esperando) return;
  esperando = true;
  const liberar = () => {
    ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, liberar));
    const c = ac();
    if (c) c.resume().then(() => { aplicarDesejada(); notificar(); }).catch(() => {});
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, liberar));
}

// ---------- vozes básicas ----------
const F = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/** Uma nota de sintetizador: oscilador → filtro → envelope → destino (+ eco opcional). */
function nota(t, midi, dur, o) {
  const c = ctx;
  const osc = c.createOscillator(); osc.type = o.tipo || 'sawtooth'; osc.frequency.value = F(midi);
  if (o.det) osc.detune.value = o.det;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = o.q || 0.7;
  lp.frequency.setValueAtTime(o.lp || 2000, t);
  if (o.lpFim) lp.frequency.exponentialRampToValueAtTime(o.lpFim, t + dur);
  const at = o.ataque === undefined ? 0.006 : o.ataque, rel = o.rel === undefined ? 0.08 : o.rel;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(o.vol, t + at);
  g.gain.setValueAtTime(o.vol, t + Math.max(at + 0.001, dur - rel));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
  osc.connect(lp); lp.connect(g); g.connect(o.dest);
  if (o.eco) { const e = c.createGain(); e.gain.value = o.eco; g.connect(e); e.connect(atrasoIn); }
  osc.start(t); osc.stop(t + dur + 0.06);
}

function bumbo(t, v, dest) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.12);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.32);
}

function ruidoCurto(t, dur, tipo, freq, v, dest, q = 0.8) {
  const s = ctx.createBufferSource(); s.buffer = ruido;
  const f = ctx.createBiquadFilter(); f.type = tipo; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}

function caixa(t, v, dest) {
  ruidoCurto(t, 0.17, 'bandpass', 1900, v, dest);
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.08);
  g.gain.setValueAtTime(v * 0.7, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.12);
}
const chimbal = (t, v, aberto, dest) => ruidoCurto(t, aberto ? 0.2 : 0.045, 'highpass', 7200, v, dest, 0.5);

/** Pad: acorde longo e suave com dois osciladores levemente desafinados. */
function pad(x, vol, lp) {
  for (const m of x.ac.iv) for (const det of [-9, 9]) nota(x.t, x.ac.r + 24 + m, 16 * x.d, { tipo: 'sawtooth', vol, lp, ataque: 0.5, rel: 0.6, det, dest: x.g });
}
const arpejoNotas = (ac) => (ac.iv.length === 3 ? [...ac.iv, 12] : ac.iv);
const melodia = (mel, x, o) => {
  const lista = mel[x.compasso % mel.length];
  for (const [passo, midi, len] of lista) if (passo === x.s) nota(x.t, midi, len * x.d, { dest: x.g, ...o });
};

// ---------- as três faixas ----------
// Melodias: [passo (0-15), nota MIDI, duração em passos], uma lista por compasso.
const LEAD_TITULO = [
  [[0, 81, 4], [4, 84, 4], [8, 88, 6]], [[0, 81, 4], [4, 84, 2], [6, 81, 2], [8, 77, 8]],
  [[0, 79, 4], [4, 84, 4], [8, 88, 4], [12, 86, 4]], [[0, 83, 4], [4, 86, 4], [8, 83, 4], [12, 79, 4]],
  [[0, 81, 2], [2, 84, 2], [4, 88, 4], [8, 91, 4], [12, 88, 4]], [[0, 89, 4], [4, 88, 2], [6, 84, 2], [8, 81, 8]],
  [[0, 86, 4], [4, 83, 4], [8, 79, 4], [12, 83, 4]], [[0, 80, 4], [4, 83, 4], [8, 88, 8]],
];
const LEAD_CORRIDA = [
  [[0, 76, 2], [3, 79, 1], [4, 83, 3], [8, 81, 2], [10, 79, 2], [12, 76, 4]], [[0, 76, 2], [3, 79, 1], [4, 84, 3], [8, 83, 2], [10, 79, 2], [12, 72, 4]],
  [[0, 74, 2], [3, 79, 1], [4, 83, 3], [8, 86, 2], [10, 83, 2], [12, 79, 4]], [[0, 78, 2], [3, 81, 1], [4, 86, 3], [8, 85, 2], [10, 81, 2], [12, 78, 4]],
  [[0, 76, 2], [3, 79, 1], [4, 83, 3], [8, 81, 2], [10, 79, 2], [12, 76, 4]], [[0, 76, 2], [3, 79, 1], [4, 84, 3], [8, 83, 2], [10, 79, 2], [12, 72, 4]],
  [[0, 81, 2], [2, 78, 2], [4, 74, 4], [8, 78, 2], [10, 81, 2], [12, 86, 4]], [[0, 83, 2], [2, 80, 2], [4, 78, 4], [8, 75, 4], [12, 78, 2], [14, 80, 2]],
];
const MEL_GARAGEM = [
  [[2, 74, 3], [8, 77, 2], [12, 76, 4]], [[0, 74, 2], [4, 71, 3], [10, 67, 2]], [[2, 72, 3], [8, 76, 3], [12, 79, 4]], [[0, 77, 4], [6, 72, 2], [10, 69, 4]],
  [[2, 74, 3], [8, 77, 3], [12, 70, 4]], [[0, 76, 2], [4, 74, 2], [8, 67, 4], [12, 70, 2]], [[0, 73, 2], [4, 76, 4], [8, 69, 4], [12, 67, 2]], [[0, 74, 6], [8, 69, 8]],
];

const FAIXAS = {
  // TÍTULO: Lá menor, épica e cheia de neon (100 bpm)
  titulo: {
    bpm: 100, vol: 0.95,
    acordes: [{ r: 33, iv: [0, 3, 7] }, { r: 29, iv: [0, 4, 7] }, { r: 36, iv: [0, 4, 7] }, { r: 31, iv: [0, 4, 7] },
      { r: 33, iv: [0, 3, 7] }, { r: 29, iv: [0, 4, 7] }, { r: 31, iv: [0, 4, 7] }, { r: 28, iv: [0, 4, 7, 10] }],
    tocar(x) {
      const { s, t, d, g, ac } = x;
      if (s === 0) pad(x, 0.034, 950);
      if (s === 0 || s === 8) { nota(t, ac.r, 6 * d, { tipo: 'sawtooth', vol: 0.12, lp: 420, dest: g }); nota(t, ac.r, 6 * d, { tipo: 'sine', vol: 0.18, dest: g }); }
      if (s === 10) nota(t, ac.r + 7, 3 * d, { tipo: 'sawtooth', vol: 0.08, lp: 420, dest: g });
      if (s === 0 || s === 8 || s === 10) bumbo(t, 0.5, g);
      if (s === 4 || s === 12) caixa(t, 0.2, g);
      if (s % 2 === 0) chimbal(t, s % 4 === 2 ? 0.07 : 0.045, false, g);
      if (s % 2 === 0) {
        const ar = arpejoNotas(ac);
        nota(t, ac.r + 36 + ar[(s / 2) % ar.length], 1.6 * d, { tipo: 'square', vol: 0.03, lp: 2600, rel: 0.05, eco: 0.45, dest: g });
      }
      melodia(LEAD_TITULO, x, { tipo: 'sawtooth', vol: 0.06, lp: 3200, ataque: 0.012, rel: 0.12, eco: 0.5, det: 6 });
    },
  },

  // GARAGEM: lo-fi sintético, tranquilo e com swing (82 bpm)
  garagem: {
    bpm: 82, vol: 0.95, swing: 0.22,
    acordes: [{ r: 38, iv: [0, 3, 7, 10] }, { r: 31, iv: [0, 4, 7, 10] }, { r: 36, iv: [0, 4, 7, 11] }, { r: 29, iv: [0, 4, 7, 11] },
      { r: 34, iv: [0, 4, 7, 11] }, { r: 40, iv: [0, 3, 6, 10] }, { r: 33, iv: [0, 4, 7, 10] }, { r: 38, iv: [0, 3, 7, 10] }],
    tocar(x) {
      const { s, t, d, g, ac } = x;
      if (s === 0) pad(x, 0.028, 700);
      if (s === 0) { nota(t, ac.r + 12, 5 * d, { tipo: 'triangle', vol: 0.2, lp: 500, dest: g }); }
      if (s === 10) nota(t, ac.r + 12, 3 * d, { tipo: 'triangle', vol: 0.16, lp: 500, dest: g });
      if (s === 0) bumbo(t, 0.42, g);
      if (s === 7) bumbo(t, 0.2, g);
      if (s === 10) bumbo(t, 0.34, g);
      if (s === 4 || s === 12) caixa(t, 0.12, g);
      if (s % 2 === 0) chimbal(t, 0.045, false, g); else if (s % 4 === 3) chimbal(t, 0.025, false, g);
      // piano elétrico: acordes curtos "tocados" no tempo e na síncope
      if (s === 0 || s === 6 || s === 14) {
        for (const m of ac.iv) nota(t, ac.r + 36 + m, (s === 0 ? 3 : 2) * d, { tipo: 'triangle', vol: s === 0 ? 0.04 : 0.028, lp: 2200, rel: 0.25, eco: 0.3, dest: g });
      }
      melodia(MEL_GARAGEM, x, { tipo: 'triangle', vol: 0.075, lp: 2400, ataque: 0.01, rel: 0.2, eco: 0.55 });
    },
  },

  // CORRIDA: synthwave acelerado (140 bpm); a melodia entra na última volta
  corrida: {
    bpm: 140, vol: 0.9, leadMin: 0.5,
    acordes: [{ r: 40, iv: [0, 3, 7] }, { r: 36, iv: [0, 4, 7] }, { r: 43, iv: [0, 4, 7] }, { r: 38, iv: [0, 4, 7] },
      { r: 40, iv: [0, 3, 7] }, { r: 36, iv: [0, 4, 7] }, { r: 38, iv: [0, 4, 7] }, { r: 35, iv: [0, 4, 7, 10] }],
    tocar(x) {
      const { s, t, d, g, ac, compasso } = x;
      if (s === 0) pad(x, 0.026, 1100);
      if (s % 2 === 0) nota(t, ac.r + (s === 6 || s === 14 ? 12 : 0), 1.7 * d, { tipo: 'sawtooth', vol: 0.11, lp: 380, rel: 0.04, dest: g });
      if (s % 4 === 0) { bumbo(t, 0.52, g); nota(t, ac.r, 3 * d, { tipo: 'sine', vol: 0.15, dest: g }); }
      if (s === 4 || s === 12) caixa(t, 0.22, g);
      if (compasso % 4 === 3 && s >= 12 && s !== 12) caixa(t, 0.1 + (s - 12) * 0.03, g); // virada de bateria
      if (s % 4 === 2) chimbal(t, 0.07, true, g); else if (s % 2 === 0) chimbal(t, 0.045, false, g); else chimbal(t, 0.02, false, g);
      const ar = arpejoNotas(ac), padrao = [0, 2, 1, 3, 2, 1, 3, 2];
      nota(t, ac.r + 36 + ar[padrao[s % 8] % ar.length], 1.3 * d, { tipo: 'sawtooth', vol: 0.024, lp: 2200, rel: 0.03, eco: 0.5, dest: g });
      if (intensidade >= 0.5) melodia(LEAD_CORRIDA, x, { tipo: 'sawtooth', vol: 0.07, lp: 3400, ataque: 0.008, rel: 0.1, eco: 0.45, det: 7 });
    },
  },
};

function tocarPasso(f, n, t0) {
  const d = 60 / f.def.bpm / 4;
  const t = n % 2 && f.def.swing ? t0 + d * f.def.swing : t0;
  f.def.tocar({ n, s: n % 16, compasso: Math.floor(n / 16), ac: f.def.acordes[Math.floor(n / 16) % f.def.acordes.length], t, d, g: f.gain });
}

function agendar() {
  if (!ctx || !faixa || ctx.state !== 'running') return;
  const agora = ctx.currentTime;
  if (faixa.proxT < agora - 0.25) faixa.proxT = agora + 0.05; // aba ficou em segundo plano: não acumula notas atrasadas
  const ate = agora + 0.3, passo = 60 / faixa.def.bpm / 4;
  while (faixa.proxT < ate) { tocarPasso(faixa, faixa.passo, faixa.proxT); faixa.proxT += passo; faixa.passo++; }
}

function iniciarFaixa(nome) {
  const def = FAIXAS[nome];
  if (!ctx || !def || (faixa && faixa.nome === nome)) return;
  const t = ctx.currentTime;
  if (faixa) { // a faixa antiga some suavemente enquanto a nova entra
    const velho = faixa;
    velho.gain.gain.cancelScheduledValues(t);
    velho.gain.gain.setValueAtTime(velho.gain.gain.value, t);
    velho.gain.gain.linearRampToValueAtTime(0, t + 0.8);
    setTimeout(() => { try { velho.gain.disconnect(); } catch (e) { /* já solto */ } }, 1600);
  }
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(def.vol, t + 1.2);
  g.connect(duck);
  atrasoTempo.setTargetAtTime((60 / def.bpm) * 0.75, t, 0.1); // eco "pontuado" no ritmo da faixa
  faixa = { nome, def, gain: g, passo: 0, proxT: t + 0.12 };
  if (!timer) timer = setInterval(agendar, 30);
}

function aplicarDesejada() { if (desejada && ctx && ctx.state === 'running') iniciarFaixa(desejada); }

/** Escolhe a música ('titulo' | 'garagem' | 'corrida'). Começa assim que o navegador liberar o áudio. */
export function tocarMusica(nome) { desejada = nome; aplicarDesejada(); }
/** Abafa a música (usado na pausa). */
export function duckMusica(ligado) { if (ctx && duck) duck.gain.setTargetAtTime(ligado ? 0.3 : 1, ctx.currentTime, 0.08); }
/** 0..1: acima de 0.5 a faixa da corrida ganha a melodia (última volta). */
export function definirIntensidade(v) { intensidade = v; }

// ---------- sons dos carros (motor, derrapagem, nitro) ----------
function laco(a, tipoFiltro, freq, q = 1) {
  const s = a.createBufferSource(); s.buffer = ruido; s.loop = true;
  const f = a.createBiquadFilter(); f.type = tipoFiltro; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain(); g.gain.value = 0;
  s.connect(f); f.connect(g); g.connect(busSfx); s.start();
  return { s, f, g };
}

/** Liga o motor (chamar após um clique/tecla do jogador). */
export function iniciarMotor() {
  const a = ac(); if (!a || motor) return;
  const o1 = a.createOscillator(); o1.type = 'sawtooth';
  const o2 = a.createOscillator(); o2.type = 'triangle';
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500; f.Q.value = 1;
  const g = a.createGain(); g.gain.value = 0;
  o1.connect(f); o2.connect(f); f.connect(g); g.connect(busSfx);
  o1.start(); o2.start();
  motor = { o1, o2, f, g };
  derr = laco(a, 'bandpass', 1900, 3);
  nit = laco(a, 'highpass', 2600, 0.7);
}

/** Desliga só o motor (a música continua). */
export function pararMotor() {
  for (const n of [motor && [motor.o1, motor.o2], derr && [derr.s], nit && [nit.s]]) {
    if (n) n.forEach((x) => { try { x.stop(); } catch (e) { /* já parado */ } });
  }
  motor = derr = nit = null;
}

/** Atualiza os sons contínuos a cada quadro. vel01 = velocidade / máxima (0..1.2). */
export function atualizarSom({ vel01, acel, nitro, derrapa, pausado }) {
  if (!ctx || !motor) return;
  const t = ctx.currentTime;
  const marchas = 5, x = Math.min(0.999, Math.max(0, vel01)) * marchas;
  const g = Math.floor(x), frac = x - g;
  const rpm = 0.18 + 0.82 * frac;
  const f0 = 45 + rpm * (80 + g * 18) + (acel ? 10 : 0);
  motor.o1.frequency.setTargetAtTime(f0, t, 0.05);
  motor.o2.frequency.setTargetAtTime(f0 * 0.5, t, 0.05);
  motor.f.frequency.setTargetAtTime(380 + rpm * 1100 + (acel ? 250 : 0), t, 0.06);
  motor.g.gain.setTargetAtTime(pausado ? 0 : 0.022 + rpm * 0.016 + (acel ? 0.01 : 0), t, 0.08);
  derr.g.gain.setTargetAtTime(pausado ? 0 : derrapa * 0.05, t, 0.05);
  nit.g.gain.setTargetAtTime(pausado ? 0 : nitro ? 0.04 : 0, t, 0.05);
}

// ---------- efeitos pontuais ----------
function tom(f, dur, { tipo = 'square', vol = 0.12, ate = null, ini = 0 } = {}) {
  const a = ac(); if (!a || !prefs.sons) return;
  const t0 = a.currentTime + ini;
  const o = a.createOscillator(), g = a.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t0);
  if (ate) o.frequency.exponentialRampToValueAtTime(ate, t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(busSfx); o.start(t0); o.stop(t0 + dur + 0.02);
}

function estouro(dur, { vol = 0.25, filtro = 1500 } = {}) {
  const a = ac(); if (!a || !prefs.sons) return;
  const t0 = a.currentTime;
  const s = a.createBufferSource(); s.buffer = ruido;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(filtro, t0);
  f.frequency.exponentialRampToValueAtTime(100, t0 + dur);
  const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(busSfx); s.start(t0); s.stop(t0 + dur + 0.02);
}

export const somBip = (final = false) => tom(final ? 880 : 440, final ? 0.5 : 0.18, { vol: 0.1 });
export const somBatida = (forca) => estouro(0.25, { vol: Math.min(0.4, 0.1 + forca / 600), filtro: 900 });
export const somParede = (forca) => { estouro(0.3, { vol: Math.min(0.4, 0.12 + forca / 700), filtro: 700 }); tom(90, 0.2, { tipo: 'sine', vol: 0.15, ate: 40 }); };
export const somVolta = () => { tom(660, 0.1, { vol: 0.09 }); tom(990, 0.14, { vol: 0.09, ini: 0.1 }); };
export const somUltrap = () => { tom(520, 0.08, { vol: 0.08 }); tom(780, 0.1, { vol: 0.08, ini: 0.07 }); };
export const somChegada = () => [523, 659, 784, 1046].forEach((f, i) => tom(f, 0.2, { vol: 0.1, ini: i * 0.12 }));

/**
 * Usado só em testes: renderiza uma faixa inteira "offline" (sem tocar) e devolve as amostras.
 * Assim dá para medir volume e conferir a música sem precisar ouvir.
 */
export async function renderizarOffline(nome, segundos, intens = 1, taxa = 22050) {
  const guardado = { ctx, busMusica, busSfx, duck, atrasoIn, atrasoTempo, ruido, intensidade };
  const oc = new OfflineAudioContext(1, Math.floor(taxa * segundos), taxa);
  ctx = oc; montarGrafo(oc); intensidade = intens;
  const def = FAIXAS[nome], g = oc.createGain();
  g.gain.value = def.vol; g.connect(duck); atrasoTempo.value = (60 / def.bpm) * 0.75;
  const f = { nome, def, gain: g, passo: 0, proxT: 0.05 };
  while (f.proxT < segundos) { tocarPasso(f, f.passo, f.proxT); f.proxT += 60 / def.bpm / 4; f.passo++; }
  const buf = await oc.startRendering();
  ({ ctx, busMusica, busSfx, duck, atrasoIn, atrasoTempo, ruido, intensidade } = guardado);
  return Array.from(buf.getChannelData(0));
}
