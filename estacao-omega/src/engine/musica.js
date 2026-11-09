// Trilhas sintetizadas (Web Audio): uma para o título, uma por fase e uma para a Horda. Nenhum arquivo de áudio.
import { ac, bufferRuido, ouvintesMudo, estaMudo } from './audio';

const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// root: nota MIDI base · prog: deslocamento de cada compasso · bpm · baixo/arp/kick/hat: padrões de 16 passos (1 = toca)
const FAIXAS = {
  titulo: { bpm: 76, root: 45, prog: [0, -4, -2, -5], baixo: '1000000010000000', arp: '1010101010101010', arpNotas: [0, 7, 12, 15], kick: '1000000000000000', hat: '0000000000000000', pad: true, onda: 'triangle' },
  fase1: { bpm: 104, root: 40, prog: [0, 0, -2, -5], baixo: '1010101110101011', arp: '0010001000100010', arpNotas: [12, 15, 19, 15], kick: '1000100010001000', hat: '0010001000100010', pad: false, onda: 'square' },
  fase2: { bpm: 112, root: 38, prog: [0, -2, -4, -7], baixo: '1001001010010010', arp: '1111111111111111', arpNotas: [0, 7, 12, 10], kick: '1000001010000010', hat: '0101010101010101', pad: true, onda: 'sawtooth' },
  fase3: { bpm: 66, root: 36, prog: [0, 1, 0, -1], baixo: '1000000000000000', arp: '0000100000010000', arpNotas: [24, 27, 30, 22], kick: '0000000000000000', hat: '0000000000000000', pad: true, onda: 'sine', drone: true },
  fase4: { bpm: 122, root: 37, prog: [0, -2, 3, -4], baixo: '1011101110111011', arp: '1010101010101010', arpNotas: [12, 15, 19, 22], kick: '1000100010001000', hat: '0010001000101011', pad: true, onda: 'sawtooth' },
  horda: { bpm: 142, root: 45, prog: [0, 0, -2, -4], baixo: '1111111111111111', arp: '0010010100100101', arpNotas: [12, 15, 17, 19], kick: '1001001010010010', hat: '1011101110111011', pad: false, onda: 'square' },
};

let mestre = null;
let atual = null; // { nome, passo, proximo, timer }

function nota(a, f, t, dur, tipo, vol) {
  const o = a.createOscillator(); const g = a.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(mestre); o.start(t); o.stop(t + dur + 0.05);
}
function ruidoCurto(a, t, dur, vol, filtro, tipo = 'highpass') {
  const s = a.createBufferSource(); s.buffer = bufferRuido();
  const f = a.createBiquadFilter(); f.type = tipo; f.frequency.value = filtro;
  const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(mestre); s.start(t); s.stop(t + dur + 0.02);
}

function tocarPasso(a, f, passo, t, seg) {
  const compasso = Math.floor(passo / 16) % f.prog.length;
  const i = passo % 16;
  const raiz = f.root + f.prog[compasso];
  if (f.baixo[i] === '1') nota(a, hz(raiz), t, seg * 1.8, f.onda === 'sine' ? 'sine' : 'sawtooth', 0.09);
  if (f.arp[i] === '1') nota(a, hz(raiz + f.arpNotas[(i >> 1) % f.arpNotas.length]), t, seg * 1.4, f.onda, 0.035);
  if (f.kick[i] === '1') { const o = a.createOscillator(); const g = a.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.connect(g).connect(mestre); o.start(t); o.stop(t + 0.2); }
  if (f.hat[i] === '1') ruidoCurto(a, t, 0.05, 0.05, 7000);
  if (i === 0 && f.pad) [0, 3, 7].forEach((d) => nota(a, hz(raiz + 12 + d), t, seg * 15, 'triangle', 0.025));
  if (i === 0 && f.drone) nota(a, hz(raiz - 12), t, seg * 16, 'sine', 0.08);
  if (f.drone && Math.random() < 0.08) nota(a, hz(raiz + 24 + Math.floor(Math.random() * 7)), t, seg * 3, 'sine', 0.03); // blips fantasmas
}

function agendar() {
  const a = ac(true);
  if (!a || !atual || a.state !== 'running') return;
  const f = FAIXAS[atual.nome];
  const seg = 60 / f.bpm / 4;
  if (atual.proximo < a.currentTime) atual.proximo = a.currentTime + 0.05;
  while (atual.proximo < a.currentTime + 0.3) { tocarPasso(a, f, atual.passo, atual.proximo, seg); atual.proximo += seg; atual.passo += 1; }
}

function garantirMestre() {
  const a = ac(true);
  if (!a) return false;
  if (!mestre) { mestre = a.createGain(); mestre.gain.value = estaMudo() ? 0 : 0.55; mestre.connect(a.destination); ouvintesMudo.add((m) => { mestre.gain.value = m ? 0 : 0.55; }); }
  return true;
}

/** Troca a trilha (nome: titulo | fase1..fase4 | horda). Se o navegador ainda não liberou o áudio, começa no primeiro clique/tecla. */
export function tocarMusica(nome) {
  if (atual && atual.nome === nome) return;
  pararMusica();
  atual = { nome, passo: 0, proximo: 0, timer: setInterval(agendar, 100) };
  if (garantirMestre()) agendar();
}
export function pararMusica() { if (atual) { clearInterval(atual.timer); atual = null; } }
export function liberarAudio() { if (garantirMestre()) { const a = ac(true); if (a.state === 'suspended') a.resume(); } }
