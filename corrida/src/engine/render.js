// ===== Renderizador (canvas 2D, vista de cima) =====
// A pista é dividida em "pedaços" (Path2D) que só são desenhados quando aparecem na tela.
// O cenário (árvores, prédios...) também é desenhado só dentro da câmera.

import { gerarCenario, aleatorio, posicaoGrade } from './pistas';

export const LARG = 960;
export const ALT = 600;

const TEMAS = {
  parque: { chao: '#2f7d3b', ponto: '#276a32', ponto2: '#38904a', acost: '#b7a678', asfalto: '#34343f', noite: false },
  cidade: { chao: '#4b4b58', ponto: '#41414d', ponto2: '#555564', acost: '#7a7a88', asfalto: '#26262e', noite: false },
  orla: { chao: '#e8d296', ponto: '#d9c07c', ponto2: '#f3e2ae', acost: '#f6e9bd', asfalto: '#3b3b46', noite: false },
  serra: { chao: '#1f4a39', ponto: '#18402f', ponto2: '#2a5c47', acost: '#5e5646', asfalto: '#2e2e38', noite: true },
};

const PREDIOS = ['#5f6075', '#7b5d63', '#5c7280', '#6d6a58'];

// ---------- utilidades de cor / formas ----------
const cacheCor = new Map();
function tom(hex, f) {
  const k = hex + f;
  if (cacheCor.has(k)) return cacheCor.get(k);
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = f < 0 ? 0 : 255, t = Math.abs(f);
  const v = `rgb(${Math.round(r + (m - r) * t)},${Math.round(g + (m - g) * t)},${Math.round(b + (m - b) * t)})`;
  cacheCor.set(k, v);
  return v;
}

function retArred(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FORMAS = {
  besouro: { c: 44, l: 21, r: 9, asa: 1 },
  pantera: { c: 48, l: 23, r: 7, asa: 2 },
  cometa: { c: 52, l: 20, r: 10, asa: 0 },
  fantasma: { c: 50, l: 22, r: 4, asa: 2 },
};

/** Desenha um carro (frente = +x) na posição/ângulo dados. Usado na pista e na garagem. */
export function desenharCarro(ctx, x, y, a, cor, { modelo = 'besouro', freio = false, esterco = 0, nitro = false } = {}) {
  const f = FORMAS[modelo] || FORMAS.besouro;
  const hc = f.c / 2, hl = f.l / 2;
  // sombra
  ctx.save(); ctx.translate(x + 4, y + 5); ctx.rotate(a);
  ctx.fillStyle = 'rgba(0,0,0,0.32)'; retArred(ctx, -hc, -hl, f.c, f.l + 1, f.r); ctx.fill();
  ctx.restore();

  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  // brilho neon embaixo do carro
  ctx.globalAlpha = 0.22; ctx.fillStyle = cor; retArred(ctx, -hc - 4, -hl - 3, f.c + 8, f.l + 6, f.r + 3); ctx.fill(); ctx.globalAlpha = 1;
  // rodas (as da frente viram com o volante)
  ctx.fillStyle = '#0c0c10';
  for (const [wx, wy, gira] of [[-hc * 0.55, -hl - 1, 0], [-hc * 0.55, hl - 4, 0], [hc * 0.52, -hl - 1, 1], [hc * 0.52, hl - 4, 1]]) {
    ctx.save(); ctx.translate(wx + 5, wy + 2.5); if (gira) ctx.rotate(esterco * 0.45);
    ctx.fillRect(-5, -2.5, 10, 5); ctx.restore();
  }
  // carroceria
  const g = ctx.createLinearGradient(0, -hl, 0, hl);
  g.addColorStop(0, tom(cor, 0.25)); g.addColorStop(0.5, cor); g.addColorStop(1, tom(cor, -0.35));
  ctx.fillStyle = g; retArred(ctx, -hc, -hl, f.c, f.l, f.r); ctx.fill();
  ctx.strokeStyle = tom(cor, -0.55); ctx.lineWidth = 1; ctx.stroke();
  // faixas
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(-hc + 3, -3.2, f.c - 6, 2); ctx.fillRect(-hc + 3, 1.2, f.c - 6, 2);
  // cabine e vidros
  ctx.fillStyle = '#11121c'; retArred(ctx, -hc * 0.3, -hl + 2.5, f.c * 0.38, f.l - 5, 3); ctx.fill();
  ctx.fillStyle = 'rgba(140,200,255,0.55)';
  ctx.beginPath(); ctx.moveTo(hc * 0.12, -hl + 3.5); ctx.lineTo(hc * 0.42, -hl + 5.5); ctx.lineTo(hc * 0.42, hl - 5.5); ctx.lineTo(hc * 0.12, hl - 3.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-hc * 0.2, -hl + 4, f.c * 0.2, f.l - 8);
  // faróis e lanternas
  ctx.fillStyle = '#fff7b8'; ctx.fillRect(hc - 3, -hl + 1.5, 3, 4); ctx.fillRect(hc - 3, hl - 5.5, 3, 4);
  ctx.fillStyle = freio ? '#ff2a2a' : '#9a1010'; ctx.fillRect(-hc, -hl + 1.5, 3, 4); ctx.fillRect(-hc, hl - 5.5, 3, 4);
  if (freio) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#ff2a2a'; ctx.fillRect(-hc - 6, -hl, 8, f.l); ctx.globalAlpha = 1; }
  // aerofólio
  if (f.asa) { ctx.fillStyle = '#15151d'; ctx.fillRect(-hc - 2, -hl - 0.5, 3 + f.asa, f.l + 1); }
  // escapamento aceso no nitro
  if (nitro) { ctx.fillStyle = '#4fe3ff'; ctx.fillRect(-hc - 4, -4, 4, 2); ctx.fillRect(-hc - 4, 2, 4, 2); }
  ctx.restore();
}

/** Prévia do carro para a garagem (carro grande girando devagar). */
export function desenharPrevia(ctx, w, h, cor, modelo, t) {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(80,40,140,0.8)'); g.addColorStop(1, 'rgba(18,10,31,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.translate(w / 2, h / 2); ctx.scale(3.4, 3.4);
  desenharCarro(ctx, 0, 0, -0.45 + Math.sin(t * 0.8) * 0.35, cor, { modelo, esterco: Math.sin(t * 0.8) * 0.6 });
  ctx.restore();
}

// ---------- cenário ----------
function desenharItem(ctx, it, tema, t) {
  const { x, y } = it;
  switch (it.tipo) {
    case 'arvore': case 'pinheiro': {
      const r = it.tam, pino = it.tipo === 'pinheiro';
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(x + 7, y + 9, r, 0, 7); ctx.fill();
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
      g.addColorStop(0, pino ? '#2f8a58' : '#52bf62'); g.addColorStop(1, pino ? '#0f3d2a' : '#237a35');
      ctx.fillStyle = g;
      if (pino) {
        ctx.beginPath();
        for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, rr = k % 2 ? r * 0.62 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill();
      } else { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      break;
    }
    case 'lago':
      ctx.fillStyle = '#7cc7e8'; ctx.beginPath(); ctx.ellipse(x, y, it.tam * 2.2, it.tam * 1.4, it.r * 3, 0, 7); ctx.fill();
      ctx.fillStyle = '#3ea5d6'; ctx.beginPath(); ctx.ellipse(x, y, it.tam * 1.9, it.tam * 1.1, it.r * 3, 0, 7); ctx.fill();
      break;
    case 'predio': {
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 12, y + 16, it.w, it.h);
      ctx.fillStyle = PREDIOS[it.cor]; ctx.fillRect(x, y, it.w, it.h);
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 8, y + 8, it.w - 16, it.h - 16);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + it.w * 0.15, y + it.h * 0.2, it.w * 0.22, it.h * 0.2);
      ctx.fillRect(x + it.w * 0.55, y + it.h * 0.55, it.w * 0.25, it.h * 0.22);
      ctx.fillStyle = '#ff3b3b'; ctx.fillRect(x + it.w - 14, y + 6, 6, 6);
      break;
    }
    case 'palmeira': {
      const r = it.tam;
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 9, r, r * 0.55, 0.6, 0, 7); ctx.fill();
      ctx.fillStyle = '#2f9b4a';
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + it.r * 3 + Math.sin(t * 1.5 + it.r * 9) * 0.04;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(r * 0.55, 0, r * 0.6, r * 0.17, 0, 0, 7); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = '#7a5230'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
      break;
    }
    case 'guardasol': {
      const r = it.tam * 0.7, c1 = it.r < 0.5 ? '#ff5fd2' : '#4fe3ff';
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.arc(x + 6, y + 7, r, 0, 7); ctx.fill();
      for (let k = 0; k < 8; k++) {
        ctx.fillStyle = k % 2 ? '#ffffff' : c1;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, (k / 8) * 6.2832, ((k + 1) / 8) * 6.2832); ctx.closePath(); ctx.fill();
      }
      break;
    }
    case 'rocha': {
      const r = it.tam;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(x + 6, y + 8, r * 0.9, 0, 7); ctx.fill();
      ctx.fillStyle = '#6f7480'; ctx.beginPath();
      for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.2832, rr = r * (0.7 + ((k * 37 + Math.floor(it.r * 100)) % 10) / 22); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.4, 0, 7); ctx.fill();
      break;
    }
    default: break;
  }
}

function criarPadrao(ctx, tema, semente) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = tema.chao; g.fillRect(0, 0, 128, 128);
  const r = aleatorio(semente);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = r() < 0.5 ? tema.ponto : tema.ponto2;
    g.fillRect(Math.floor(r() * 128), Math.floor(r() * 128), 2 + Math.floor(r() * 5), 2 + Math.floor(r() * 5));
  }
  return ctx.createPattern(c, 'repeat');
}

/** Divide a pista em pedaços (Path2D) para desenhar só o que está visível. */
function construirChunks(p) {
  const T = 25, chunks = [];
  for (let a = 0; a < p.n; a += T) {
    const b = Math.min(p.n, a + T);
    const centro = new Path2D(), bordas = new Path2D(), zebras = new Path2D(), muros = new Path2D();
    const linha = (path, off) => {
      for (let i = a; i <= b; i++) {
        const k = i % p.n, x = p.x[k] + p.nx[k] * off, y = p.y[k] + p.ny[k] * off;
        if (i === a) path.moveTo(x, y); else path.lineTo(x, y);
      }
    };
    linha(centro, 0);
    for (const sg of [-1, 1]) { linha(bordas, sg * (p.larg / 2 - 7)); linha(zebras, sg * (p.larg / 2 + 6)); linha(muros, sg * p.borda); }
    const m = Math.floor((a + b) / 2) % p.n;
    chunks.push({ centro, bordas, zebras, muros, cx: p.x[m], cy: p.y[m], raio: (T * p.ds) / 2 + p.borda + 30 });
  }
  return chunks;
}

/**
 * Cria o renderizador para uma corrida. Devolve { desenhar(corr, dt), tremer(v) }.
 */
export function criarRenderizador(canvas, corr) {
  canvas.width = LARG; canvas.height = ALT;
  const ctx = canvas.getContext('2d');
  const p = corr.pista, tema = TEMAS[p.tema] || TEMAS.parque;
  const chunks = construirChunks(p);
  const cenario = gerarCenario(p);
  const padrao = criarPadrao(ctx, tema, p.def.semente);
  const marEm = p.caixa.y1 + 340;

  // luminárias da pista noturna (a cada ~300 unidades, do lado esquerdo)
  const lampadas = [];
  if (tema.noite) for (let i = 0; i < p.n; i += 30) lampadas.push([p.x[i] - p.nx[i] * (p.larg / 2 + 30), p.y[i] - p.ny[i] * (p.larg / 2 + 30)]);

  // mini-mapa pré-calculado
  const MM = { w: 170, h: 124 };
  const bw = p.caixa.x1 - p.caixa.x0, bh = p.caixa.y1 - p.caixa.y0;
  const esc = Math.min((MM.w - 20) / bw, (MM.h - 20) / bh);
  const ox = (MM.w - bw * esc) / 2 - p.caixa.x0 * esc, oy = (MM.h - bh * esc) / 2 - p.caixa.y0 * esc;
  const mini = new Path2D();
  for (let i = 0; i <= p.n; i += 6) { const k = i % p.n; const x = p.x[k] * esc + ox, y = p.y[k] * esc + oy; if (i === 0) mini.moveTo(x, y); else mini.lineTo(x, y); }
  mini.closePath();

  const cam = { x: corr.jogador.x, y: corr.jogador.y, z: 0.85, tremor: 0 };
  const slots = [0, 1, 2, 3, 4, 5].map((k) => posicaoGrade(p, k));

  function linhaChegada() {
    const a = Math.atan2(p.ty[0], p.tx[0]);
    ctx.save(); ctx.translate(p.x[0], p.y[0]); ctx.rotate(a);
    const q = 14, cols = Math.floor(p.larg / q);
    for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 ? '#101014' : '#f4f4f8';
      ctx.fillRect(-q + r * q, -p.larg / 2 + c * q, q, q);
    }
    ctx.restore();
    // quadradinhos do grid
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
    for (const s of slots) {
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a); ctx.strokeRect(-26, -15, 52, 30); ctx.restore();
    }
  }

  function desenhar(c, dt) {
    const j = c.jogador;
    // ---- câmera: segue o jogador olhando um pouco à frente; afasta com a velocidade
    const kx = Math.min(1, dt * 6);
    cam.x += (j.x + j.vx * 0.3 - cam.x) * kx;
    cam.y += (j.y + j.vy * 0.3 - cam.y) * kx;
    const vel = Math.hypot(j.vx, j.vy);
    const zAlvo = 0.92 - 0.34 * Math.min(1, vel / 650) - (j.nitroOn ? 0.05 : 0);
    cam.z += (zAlvo - cam.z) * Math.min(1, dt * 2.5);
    cam.tremor *= Math.exp(-6 * dt);
    const sx = (Math.random() - 0.5) * cam.tremor, sy = (Math.random() - 0.5) * cam.tremor;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = tema.chao; ctx.fillRect(0, 0, LARG, ALT);
    ctx.translate(LARG / 2 + sx, ALT / 2 + sy); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
    const vx0 = cam.x - LARG / 2 / cam.z - 80, vx1 = cam.x + LARG / 2 / cam.z + 80;
    const vy0 = cam.y - ALT / 2 / cam.z - 80, vy1 = cam.y + ALT / 2 / cam.z + 80;
    const raioVis = Math.hypot(LARG, ALT) / 2 / cam.z;

    // ---- chão
    ctx.fillStyle = padrao; ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
    if (p.tema === 'orla' && vy1 > marEm) {
      const y0 = Math.max(vy0, marEm);
      ctx.fillStyle = '#2a8fc4'; ctx.fillRect(vx0, y0, vx1 - vx0, vy1 - y0);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(vx0, marEm, vx1 - vx0, 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 4;
      for (let k = 1; k < 9; k++) {
        const yy = marEm + 40 + k * 70; if (yy < vy0 || yy > vy1) continue;
        ctx.beginPath();
        for (let x = vx0; x <= vx1; x += 60) ctx.lineTo(x, yy + Math.sin(x * 0.02 + c.rel * 1.4 + k) * 8);
        ctx.stroke();
      }
    }

    // ---- pista
    const vis = chunks.filter((ch) => Math.hypot(ch.cx - cam.x, ch.cy - cam.y) < raioVis + ch.raio);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = tema.acost; ctx.lineWidth = p.larg + 64; for (const ch of vis) ctx.stroke(ch.centro);
    ctx.strokeStyle = tema.asfalto; ctx.lineWidth = p.larg; for (const ch of vis) ctx.stroke(ch.centro);
    ctx.lineCap = 'butt';
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = p.larg * 0.45; for (const ch of vis) ctx.stroke(ch.centro);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4; for (const ch of vis) ctx.stroke(ch.bordas);
    ctx.lineWidth = 11; ctx.setLineDash([26, 26]);
    ctx.strokeStyle = '#e53935'; for (const ch of vis) ctx.stroke(ch.zebras);
    ctx.strokeStyle = '#f4f4f8'; ctx.lineDashOffset = 26; for (const ch of vis) ctx.stroke(ch.zebras);
    ctx.lineDashOffset = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.setLineDash([36, 54]); for (const ch of vis) ctx.stroke(ch.centro);
    ctx.setLineDash([]);
    linhaChegada();

    // ---- marcas de pneu
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const m of c.marcas) {
      if (!m || m[0] < vx0 || m[0] > vx1 || m[1] < vy0 || m[1] > vy1) continue;
      ctx.strokeStyle = `rgba(8,8,12,${m[4]})`; ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(m[2], m[3]); ctx.stroke();
    }

    // ---- barreira de pneus
    ctx.lineCap = 'butt'; ctx.lineWidth = 15; ctx.strokeStyle = '#15151b'; for (const ch of vis) ctx.stroke(ch.muros);
    ctx.setLineDash([16, 18]); ctx.strokeStyle = '#d7d7e0'; ctx.lineWidth = 15; for (const ch of vis) ctx.stroke(ch.muros);
    ctx.setLineDash([]);

    // ---- cenário
    for (const it of cenario) {
      if (it.x < vx0 - 200 || it.x > vx1 + 40 || it.y < vy0 - 200 || it.y > vy1 + 40) continue;
      desenharItem(ctx, it, tema, c.rel);
    }

    // ---- noite: escurece tudo e acende farol e luminárias
    if (tema.noite) {
      ctx.fillStyle = 'rgba(4,8,28,0.58)'; ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
      ctx.globalCompositeOperation = 'lighter';
      for (const [lx, ly] of lampadas) {
        if (lx < vx0 - 200 || lx > vx1 + 200 || ly < vy0 - 200 || ly > vy1 + 200) continue;
        const g = ctx.createRadialGradient(lx, ly, 4, lx, ly, 190);
        g.addColorStop(0, 'rgba(255,214,120,0.40)'); g.addColorStop(1, 'rgba(255,214,120,0)');
        ctx.fillStyle = g; ctx.fillRect(lx - 190, ly - 190, 380, 380);
      }
      for (const k of c.carros) {
        const fx = k.x + Math.cos(k.a) * 150, fy = k.y + Math.sin(k.a) * 150;
        const g = ctx.createRadialGradient(fx, fy, 10, fx, fy, 210);
        g.addColorStop(0, 'rgba(255,250,210,0.34)'); g.addColorStop(1, 'rgba(255,250,210,0)');
        ctx.fillStyle = g; ctx.fillRect(fx - 210, fy - 210, 420, 420);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // ---- carros (o jogador por cima dos outros)
    const ordem = c.carros.slice().sort((a, b) => (a.jogador ? 1 : 0) - (b.jogador ? 1 : 0));
    for (const k of ordem) desenharCarro(ctx, k.x, k.y, k.a, k.cor, { modelo: k.modelo, freio: k.freando, esterco: k.dir, nitro: k.nitroOn });

    // ---- partículas
    for (const q of c.particulas) {
      const a = q.vida / q.max;
      ctx.globalAlpha = q.tipo === 'fumaca' ? a : Math.min(1, a * 1.5);
      ctx.fillStyle = q.cor;
      const r = q.tam * (q.tipo === 'fumaca' ? 1 + (1 - a) * 1.6 : a + 0.3);
      ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ---- elementos de tela (sem zoom): nomes, seta do jogador e mini-mapa
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = '8px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    for (const k of c.carros) {
      const px = (k.x - cam.x) * cam.z + LARG / 2 + sx, py = (k.y - cam.y) * cam.z + ALT / 2 + sy;
      if (px < -40 || px > LARG + 40 || py < -40 || py > ALT + 40) continue;
      if (k.jogador) {
        ctx.fillStyle = '#ffd23b'; ctx.beginPath(); ctx.moveTo(px, py - 30); ctx.lineTo(px - 6, py - 40); ctx.lineTo(px + 6, py - 40); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText(k.nome, px + 1, py - 25);
        ctx.fillStyle = k.cor; ctx.fillText(k.nome, px, py - 26);
      }
    }
    // mini-mapa
    const mx = LARG - MM.w - 10, my = 10;
    ctx.fillStyle = 'rgba(10,5,22,0.6)'; ctx.fillRect(mx, my, MM.w, MM.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(mx, my, MM.w, MM.h);
    ctx.save(); ctx.translate(mx, my);
    ctx.strokeStyle = '#8a7fb0'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke(mini);
    ctx.strokeStyle = '#2a2342'; ctx.lineWidth = 2.5; ctx.stroke(mini);
    ctx.fillStyle = '#fff'; ctx.fillRect(p.x[0] * esc + ox - 2, p.y[0] * esc + oy - 2, 4, 4);
    for (const k of c.carros) {
      ctx.fillStyle = k.cor; ctx.beginPath(); ctx.arc(k.x * esc + ox, k.y * esc + oy, k.jogador ? 4.5 : 3, 0, 7); ctx.fill();
      if (k.jogador) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    ctx.restore();
  }

  return { desenhar, tremer: (v) => { cam.tremor = Math.max(cam.tremor, Math.min(12, v)); } };
}
