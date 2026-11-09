// Armas em primeira pessoa, desenhadas com polígonos sombreados para dar volume (vistas de trás e de cima, afunilando para o fundo).
const K = '#07080c';

/** Faixa de um tubo/prisma que afunila: base (yb, largura wb) até o topo (yt, largura wt), entre as frações f0..f1 da largura. */
function faixa(ctx, cx, yb, wb, yt, wt, f0, f1, cor) {
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.moveTo(Math.round(cx + wb * (f0 - 0.5)), Math.round(yb));
  ctx.lineTo(Math.round(cx + wb * (f1 - 0.5)), Math.round(yb));
  ctx.lineTo(Math.round(cx + wt * (f1 - 0.5)), Math.round(yt));
  ctx.lineTo(Math.round(cx + wt * (f0 - 0.5)), Math.round(yt));
  ctx.closePath();
  ctx.fill();
}
/** Cilindro sombreado (5 faixas: sombra, meio-tom, brilho, meio-tom, sombra). */
function tubo(ctx, cx, yb, wb, yt, wt, [c0, c1, c2, c3, c4]) {
  faixa(ctx, cx, yb + 1, wb + 2, yt - 1, wt + 2, 0, 1, K);
  [[0, 0.16, c0], [0.16, 0.38, c1], [0.38, 0.56, c2], [0.56, 0.82, c3], [0.82, 1, c4]].forEach(([a, b, c]) => faixa(ctx, cx, yb, wb, yt, wt, a, b, c));
}
const poly = (ctx, cor, pts) => { ctx.fillStyle = cor; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(Math.round(x), Math.round(y)) : ctx.moveTo(Math.round(x), Math.round(y)))); ctx.closePath(); ctx.fill(); };
const ret = (ctx, c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
const ACO = ['#1d222a', '#2f3640', '#6d7a8a', '#465160', '#1a1f26'];
const ESCURO = ['#14171c', '#232830', '#46505c', '#2e353f', '#101318'];

/** Mão enluvada + antebraço saindo do canto inferior. */
function mao(ctx, bx, by, lado) {
  const s = lado;
  poly(ctx, K, [[bx + s * 6, by], [bx + s * 14, by - 40], [bx + s * 38, by - 46], [bx + s * 52, by]]);
  poly(ctx, '#2b3a30', [[bx + s * 8, by], [bx + s * 15, by - 36], [bx + s * 36, by - 42], [bx + s * 49, by]]);
  poly(ctx, '#3f5446', [[bx + s * 15, by - 36], [bx + s * 36, by - 42], [bx + s * 33, by - 30], [bx + s * 18, by - 26]]);
  ret(ctx, '#1d2820', bx + s * 10, by - 8, 8, 8);
}
function punho(ctx, bx, y) {
  poly(ctx, K, [[bx - 20, y + 30], [bx - 17, y - 2], [bx + 17, y - 2], [bx + 20, y + 30]]);
  poly(ctx, '#323d36', [[bx - 18, y + 30], [bx - 15, y], [bx + 15, y], [bx + 18, y + 30]]);
  [-10, -3, 4, 11].forEach((d) => ret(ctx, '#4c5f52', bx + d, y + 1, 5, 4)); // nós dos dedos
  ret(ctx, '#222c26', bx - 16, y + 12, 32, 2);
}

export function desenharArma(ctx, p, tempo) {
  const bx = 160 + Math.cos(p.bob) * 5 * p.movendo + (p.inclina || 0);
  const by = 202 + Math.abs(Math.sin(p.bob)) * 5 * p.movendo + p.recuo * 14;
  const fogo = p.recuo > 0.6;
  const brilho = (x, y, r, c1, c2) => { ret(ctx, c1, x - r, y - r, r * 2, r * 2); ret(ctx, c2, x - r / 2, y - r * 1.5, r, r * 3); };

  if (p.arma === 'pistola') {
    mao(ctx, bx, by, 1);
    tubo(ctx, bx, by - 8, 44, by - 62, 30, ESCURO); // armação
    tubo(ctx, bx, by - 30, 38, by - 104, 22, ACO); // ferrolho
    faixa(ctx, bx, by - 30, 38, by - 104, 22, 0.42, 0.5, '#9aa8ba'); // reflexo
    for (let i = 0; i < 4; i++) { // serrilha
      ret(ctx, '#171b21', bx - 15 + i * 2, by - 38 - i * 3, 3, 2);
      ret(ctx, '#171b21', bx + 11 - i * 2, by - 38 - i * 3, 3, 2);
    }
    ret(ctx, K, bx - 9, by - 36, 5, 6); ret(ctx, K, bx + 4, by - 36, 5, 6); // massa de mira
    ret(ctx, K, bx - 2, by - 111, 4, 8); ret(ctx, '#dfe6ee', bx - 1, by - 110, 2, 3); // ponto de mira
    ret(ctx, K, bx - 6, by - 105, 12, 4); ret(ctx, '#2ab0d8', bx - 1, by - 82, 2, 12);
    punho(ctx, bx, by - 46);
    if (fogo) { poly(ctx, '#ffb020', [[bx - 12, by - 106], [bx, by - 138], [bx + 12, by - 106]]); poly(ctx, '#fff7b0', [[bx - 6, by - 106], [bx, by - 126], [bx + 6, by - 106]]); }
  } else if (p.arma === 'escopeta') {
    mao(ctx, bx, by, 1);
    tubo(ctx, bx - 15, by - 40, 26, by - 112, 16, ACO); // cano esquerdo
    tubo(ctx, bx + 15, by - 40, 26, by - 112, 16, ACO); // cano direito
    ret(ctx, K, bx - 22, by - 116, 12, 6); ret(ctx, K, bx + 8, by - 116, 12, 6); ret(ctx, '#d83a2a', bx - 20, by - 116, 8, 2); ret(ctx, '#d83a2a', bx + 10, by - 116, 8, 2);
    faixa(ctx, bx, by - 40, 60, by - 110, 36, 0.46, 0.54, '#3a424c'); // trilho entre os canos
    poly(ctx, K, [[bx - 36, by - 22], [bx - 28, by - 60], [bx + 28, by - 60], [bx + 36, by - 22]]); // pump
    poly(ctx, '#8a5a30', [[bx - 33, by - 22], [bx - 26, by - 58], [bx + 26, by - 58], [bx + 33, by - 22]]);
    poly(ctx, '#b17a46', [[bx - 26, by - 58], [bx + 26, by - 58], [bx + 29, by - 50], [bx - 29, by - 50]]);
    for (let i = 0; i < 5; i++) ret(ctx, '#5a3818', bx - 24 + i * 10, by - 50, 2, 24); // ranhuras
    punho(ctx, bx, by - 30);
    if (fogo) { poly(ctx, '#ff7a1a', [[bx - 34, by - 116], [bx, by - 154], [bx + 34, by - 116]]); poly(ctx, '#fff7b0', [[bx - 16, by - 116], [bx, by - 140], [bx + 16, by - 116]]); }
  } else if (p.arma === 'pulso') {
    mao(ctx, bx, by, 1);
    tubo(ctx, bx, by - 20, 36, by - 70, 30, ESCURO); // coronha / corpo
    tubo(ctx, bx, by - 50, 46, by - 118, 30, ACO); // corpo principal
    faixa(ctx, bx, by - 50, 46, by - 118, 30, 0.47, 0.53, '#9ff3ff'); // trilho luminoso
    for (let i = 0; i < 5; i++) ret(ctx, '#0e3a48', bx - 14 + i * 1, by - 60 - i * 10, 28 - i * 2, 2);
    ret(ctx, '#d8a02a', bx + 12, by - 74, 8, 4); ret(ctx, K, bx - 6, by - 126, 12, 10); ret(ctx, '#3a4452', bx - 4, by - 124, 8, 6); // freio de boca
    ret(ctx, '#2ab0d8', bx - 14, by - 98, 3, 22); // luz lateral
    poly(ctx, K, [[bx - 12, by - 22], [bx - 8, by + 4], [bx + 8, by + 4], [bx + 12, by - 22]]); // carregador
    punho(ctx, bx, by - 34);
    if (fogo) { poly(ctx, '#7fe8ff', [[bx - 10, by - 126], [bx, by - 152], [bx + 10, by - 126]]); brilho(bx, by - 130, 3, '#fff', '#bdf6ff'); }
  } else if (p.arma === 'plasma') {
    const pulso = 0.55 + 0.45 * Math.sin(tempo * 9);
    mao(ctx, bx, by, 1);
    tubo(ctx, bx, by - 30, 70, by - 112, 42, ['#2a1248', '#4a228a', '#9a5ae0', '#6a34b8', '#241040']); // corpo bulboso
    for (let i = 0; i < 5; i++) { const y = by - 44 - i * 14; const w = 66 - i * 5.6; faixa(ctx, bx, y, w, y - 5, w - 2.4, 0, 1, '#1a0a30'); faixa(ctx, bx, y - 5, w - 2.4, y - 7, w - 3, 0.1, 0.9, '#c89aff'); } // bobinas
    faixa(ctx, bx, by - 30, 70, by - 112, 42, 0.42, 0.58, `rgba(255,120,255,${0.3 + pulso * 0.5})`); // núcleo
    ret(ctx, K, bx - 17, by - 124, 34, 14); ret(ctx, '#1a0a30', bx - 14, by - 122, 28, 10); ret(ctx, `rgba(255,77,255,${0.4 + pulso * 0.6})`, bx - 9, by - 120, 18, 6); ret(ctx, '#fff', bx - 3, by - 119, 6, 3);
    punho(ctx, bx, by - 30);
    if (fogo) { brilho(bx, by - 128, 12, 'rgba(255,77,255,.6)', 'rgba(255,255,255,.9)'); poly(ctx, '#ff4dff', [[bx - 16, by - 124], [bx, by - 170], [bx + 16, by - 124]]); }
  } else {
    const carga = 0.5 + 0.5 * Math.sin(tempo * 12);
    mao(ctx, bx, by, 1);
    tubo(ctx, bx - 20, by - 36, 14, by - 136, 8, ACO); // trilho esquerdo
    tubo(ctx, bx + 20, by - 36, 14, by - 136, 8, ACO); // trilho direito
    faixa(ctx, bx, by - 36, 54, by - 136, 30, 0.3, 0.7, `rgba(42,176,216,${0.35 + carga * 0.35})`); // energia entre os trilhos
    faixa(ctx, bx, by - 36, 54, by - 136, 30, 0.47, 0.53, '#d8fbff');
    for (let i = 0; i < 5; i++) { const y = by - 46 - i * 17; const w = 46 - i * 5; ret(ctx, K, bx - w / 2 - 4, y, w + 8, 6); ret(ctx, '#5a6672', bx - w / 2 - 2, y + 1, w + 4, 2); ret(ctx, '#2ab0d8', bx - w / 2, y + 3, w, 2); } // bobinas
    poly(ctx, K, [[bx - 30, by - 10], [bx - 22, by - 40], [bx + 22, by - 40], [bx + 30, by - 10]]);
    poly(ctx, '#3a424c', [[bx - 27, by - 10], [bx - 20, by - 38], [bx + 20, by - 38], [bx + 27, by - 10]]);
    punho(ctx, bx, by - 28);
    if (fogo) { ret(ctx, '#9ff3ff', bx - 6, by - 200, 12, 66); ret(ctx, '#fff', bx - 2, by - 200, 4, 66); brilho(bx, by - 138, 8, 'rgba(159,243,255,.7)', '#fff'); }
  }
}
