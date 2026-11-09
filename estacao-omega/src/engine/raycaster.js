import { lancarRaio, RES } from './raio';
import { MW, MH, zonaDe } from './map';
import { TEX } from './textures';
import { SPR } from './sprites';
import { desenharArma } from './armas';

export const LARG = 320;
export const ALT = 200;

/** Cria o renderizador: desenha paredes, chão, teto, sprites, arma e minimapa num canvas 320x200. */
export function criarRenderizador(canvas, recursos) {
  canvas.width = LARG;
  canvas.height = ALT;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const img = ctx.createImageData(LARG, ALT);
  const buf = new Uint32Array(img.data.buffer);
  const zbuf = new Float32Array(LARG);
  const { texturas: T, sprites: S } = recursos;

  const cor = (r, g, b) => 0xff000000 | (b << 16) | (g << 8) | r;
  const fogDe = (d, luz) => Math.max(0.1, luz * (1 - d / 17));

  function desenhar(j, tempo) {
    const p = j.jogador;
    const dirX = Math.cos(p.ang);
    const dirY = Math.sin(p.ang);
    const planoX = -dirY * 0.66;
    const planoY = dirX * 0.66;
    const luz = 1 - 0.12 * Math.max(0, Math.sin(tempo * 13) * Math.sin(tempo * 2.3 + 1));
    const meio = ALT / 2 + Math.sin(p.bob * 2) * 1.6 * p.movendo;

    // ---- chão e teto
    const rx0 = dirX - planoX, ry0 = dirY - planoY, rx1 = dirX + planoX, ry1 = dirY + planoY;
    const tema = T.temas[j.tema] || T.temas[1];
    const FOG = tema.fog;
    const chao = tema.chao, teto = tema.teto, acido = T.acido;
    for (let y = Math.ceil(meio) + 1; y < ALT; y++) {
      const dy = y - meio;
      const rowDist = (0.5 * ALT) / dy;
      const f = fogDe(rowDist, luz);
      const sx = (rowDist * (rx1 - rx0)) / LARG;
      const sy = (rowDist * (ry1 - ry0)) / LARG;
      let fx = p.x + rowDist * rx0;
      let fy = p.y + rowDist * ry0;
      const yTeto = Math.floor(meio - dy);
      for (let x = 0; x < LARG; x++) {
        const ti = (((fy * TEX) & (TEX - 1)) * TEX + ((fx * TEX) & (TEX - 1))) * 4;
        const cc = j.perigo[(fy | 0) * MW + (fx | 0)] ? acido : chao;
        const ca = cc === acido ? 1 + 0.25 * Math.sin(tempo * 3 + fx * 4) : 1;
        buf[y * LARG + x] = cor(
          Math.min(255, (cc[ti] * f * ca + FOG[0] * (1 - f)) | 0), Math.min(255, (cc[ti + 1] * f * ca + FOG[1] * (1 - f)) | 0), (cc[ti + 2] * f + FOG[2] * (1 - f)) | 0);
        if (yTeto >= 0 && yTeto < ALT) {
          buf[yTeto * LARG + x] = cor(
            (teto[ti] * f + FOG[0] * (1 - f)) | 0, (teto[ti + 1] * f + FOG[1] * (1 - f)) | 0, (teto[ti + 2] * f + FOG[2] * (1 - f)) | 0);
        }
        fx += sx; fy += sy;
      }
    }
    // faixa central (horizonte) para não sobrar linhas sem pintar
    for (let y = Math.max(0, Math.floor(meio) - 1); y <= Math.min(ALT - 1, Math.ceil(meio)); y++) for (let x = 0; x < LARG; x++) buf[y * LARG + x] = cor(FOG[0], FOG[1], FOG[2]);

    // ---- paredes
    for (let x = 0; x < LARG; x++) {
      const camX = (2 * x) / LARG - 1;
      const rdx = dirX + planoX * camX;
      const rdy = dirY + planoY * camX;
      lancarRaio(j, p.x, p.y, rdx, rdy);
      const dist = RES.dist;
      zbuf[x] = dist;
      const altura = Math.floor(ALT / dist);
      const topo = meio - altura / 2;
      let u = RES.u;
      if (!((RES.lado === 0 && rdx > 0) || (RES.lado === 1 && rdy < 0))) u = 1 - u; // textos não ficam espelhados
      const tx = Math.min(TEX - 1, (u * TEX) | 0);
      const tex = T.paredes[RES.tipo];
      const f = fogDe(dist, luz) * (RES.lado ? 0.78 : 1);
      const passo = TEX / altura;
      const y0 = Math.max(0, Math.floor(topo));
      const y1 = Math.min(ALT - 1, Math.floor(topo + altura));
      let tp = (y0 - topo) * passo;
      for (let y = y0; y <= y1; y++) {
        const ti = (((tp | 0) & (TEX - 1)) * TEX + tx) * 4;
        tp += passo;
        buf[y * LARG + x] = cor(
          (tex[ti] * f + FOG[0] * (1 - f)) | 0, (tex[ti + 1] * f + FOG[1] * (1 - f)) | 0, (tex[ti + 2] * f + FOG[2] * (1 - f)) | 0);
      }
    }

    // ---- sprites (itens, inimigos, projéteis, efeitos)
    const lista = [];
    j.itens.forEach((it) => {
      if (it.pego) return;
      if (/^(cartao_|arma_|fragmento)/.test(it.tipo)) { // itens importantes piscam mais claros
        const pisca = Math.max(0, Math.sin(tempo * 6 + it.x));
        lista.push({ x: it.x, y: it.y, tex: S.item[it.tipo], esc: 0.5, lift: 0, sq: 1, fl: 15 + pisca * 110 });
      } else lista.push({ x: it.x, y: it.y, tex: S.item[it.tipo], esc: 0.5, lift: 0, sq: 1, fl: 0 });
    });
    j.inimigos.forEach((e) => {
      const frame = e.morto ? 0 : e.tipo === 'barril' ? 0 : e.atq > 0 ? 2 : Math.floor(e.t * 4) % 2;
      const sq = e.morto ? Math.max(0.28, 1 - e.tMorte * 3) : 1;
      lista.push({ x: e.x, y: e.y, tex: S.inim[e.tipo][frame], esc: e.esc, lift: e.morto ? 0 : e.lift + Math.sin(e.t * 3) * (e.lift ? 0.03 : 0), sq, fl: e.hurt > 0 ? 130 : 0, fa: e.azul > 0 ? 170 : 0, morto: e.morto });
    });
    j.teleportes.forEach((t) => lista.push({ x: t.x + 0.5, y: t.y + 0.5, tex: S.item.portal, esc: 0.9, lift: 0, sq: 1, fl: 30 + Math.sin(tempo * 6) * 20 }));
    j.projeteis.forEach((q) => lista.push({ x: q.x, y: q.y, tex: S.proj[q.tipo], esc: 0.4, lift: 0.3, sq: 1, fl: 0 }));
    j.efeitos.forEach((e) => {
      const fr = Math.min(2, Math.floor((e.t / e.dur) * 3));
      lista.push({ x: e.x, y: e.y, tex: S.fx[e.tipo === 'boom' ? `boom${fr}` : e.tipo], esc: e.esc * (0.6 + e.t / e.dur * 0.6), lift: e.lift || 0.15, sq: 1, fl: 0 });
    });
    const invDet = 1 / (planoX * dirY - dirX * planoY);
    lista.forEach((s) => {
      const sx = s.x - p.x, sy = s.y - p.y;
      s.prof = invDet * (-planoY * sx + planoX * sy) + (s.bias || 0);
      s.tx = invDet * (dirY * sx - dirX * sy);
    });
    lista.sort((a, b) => (a.morto === b.morto ? b.prof - a.prof : a.morto ? -1 : 1));
    lista.forEach((s) => {
      if (s.prof < 0.25) return;
      const h = ALT / s.prof;
      const larg = h * s.esc;
      const alt = larg * s.sq;
      const base = meio + h / 2 - (s.lift || 0) * h;
      const topo = base - alt;
      const cx = (LARG / 2) * (1 + s.tx / s.prof);
      const x0 = Math.floor(cx - larg / 2);
      const x1 = Math.floor(cx + larg / 2);
      const f = fogDe(s.prof, luz);
      for (let x = Math.max(0, x0); x <= Math.min(LARG - 1, x1); x++) {
        if (s.prof >= zbuf[x]) continue;
        const tx = Math.min(SPR - 1, (((x - x0) * SPR) / larg) | 0);
        for (let y = Math.max(0, Math.floor(topo)); y < Math.min(ALT, Math.ceil(base)); y++) {
          const ty = Math.min(SPR - 1, (((y - topo) * SPR) / alt) | 0);
          const ti = (ty * SPR + tx) * 4;
          const a = s.tex[ti + 3];
          if (a < 100) continue;
          let r = s.tex[ti] * f + FOG[0] * (1 - f) + s.fl;
          let g = s.tex[ti + 1] * f + FOG[1] * (1 - f) + s.fl + (s.fa || 0) * 0.45;
          let b = s.tex[ti + 2] * f + FOG[2] * (1 - f) + s.fl + (s.fa || 0);
          if (a < 230) { const o = buf[y * LARG + x]; r = (r + (o & 255)) / 2; g = (g + ((o >> 8) & 255)) / 2; b = (b + ((o >> 16) & 255)) / 2; }
          buf[y * LARG + x] = cor(Math.min(255, r) | 0, Math.min(255, g) | 0, Math.min(255, b) | 0);
        }
      }
    });

    ctx.putImageData(img, 0, 0);
    desenharArma(ctx, p, tempo);
    if (j.ondaFlash > 0) { ctx.fillStyle = `rgba(79,227,255,${j.ondaFlash * 0.7})`; ctx.fillRect(0, 0, LARG, ALT); }
    // mira (vira um X vermelho quando o tiro acerta)
    if (j.hit > 0) { ctx.fillStyle = '#ff5050'; [[-4, -4], [-2, -2], [2, 2], [4, 4], [4, -4], [2, -2], [-2, 2], [-4, 4]].forEach(([x, y]) => ctx.fillRect(LARG / 2 + x - 1, ALT / 2 + y - 1, 2, 2)); }
    else { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(LARG / 2 - 1, ALT / 2 - 1, 2, 2); }
    if (j.minimapa) desenharMinimapa(ctx, j);
  }

  return { desenhar };
}

function desenharMinimapa(ctx, j) {
  const e = 2;
  const ox = LARG - MW * e - 4;
  const oy = 4;
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(ox - 2, oy - 2, MW * e + 4, MH * e + 4);
  if (j.ruido) { // interferência: zonas não recuperadas = chiado; fragmentos revelam o mapa, também chiado (sem sua posição)
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        const rev = j.fragmentos.has(zonaDe(x, y));
        if (!rev) { const v = (Math.random() * 230) | 0; ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(ox + x * e, oy + y * e, e, e); continue; }
        const v = j.grade[y * MW + x];
        const jx = Math.random() < 0.06 ? 1 : 0;
        if (v) { ctx.fillStyle = `rgba(150,235,255,${0.35 + Math.random() * 0.5})`; ctx.fillRect(ox + x * e + jx, oy + y * e, e, e); }
        else if (Math.random() < 0.07) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(ox + x * e, oy + y * e, e, e); }
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(ox, oy + (((j.tempo * 40) % (MH * e)) | 0), MW * e, 6);
    return;
  }
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const v = j.grade[y * MW + x];
      if (!v) continue;
      ctx.fillStyle = v === 7 ? '#ff4040' : v === 8 ? '#4a72d9' : v === 10 ? '#f2c21a' : v === 9 ? '#38ff7a' : v === 14 ? '#ff7a1a' : v === 12 ? '#8fb0a0' : v === 15 ? '#ffd23b' : v === 13 ? '#ff6a9a' : v === 5 ? '#6fd6ff' : v === 11 ? '#5a6370' : '#6b7480';
      ctx.fillRect(ox + x * e, oy + y * e, e, e);
    }
  }
  ctx.fillStyle = '#ff3b3b';
  j.inimigos.forEach((en) => { if (!en.morto && en.desperto && en.tipo !== 'barril') ctx.fillRect(ox + Math.floor(en.x * e) - 1, oy + Math.floor(en.y * e) - 1, 3, 3); });
  ctx.fillStyle = '#fff176';
  ctx.fillRect(ox + Math.floor(j.jogador.x * e) - 1, oy + Math.floor(j.jogador.y * e) - 1, 3, 3);
}
