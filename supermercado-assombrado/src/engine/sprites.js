// Sprites em pixel art (32x32) desenhados por código: inimigos (3 quadros), itens, projéteis, efeitos.
export const SPR = 32;

const K = '#15101c';
const R = (g, cor, x, y, w, h) => { g.fillStyle = cor; g.fillRect(x, y, w, h); };
const disco = (g, cor, cx, cy, r) => {
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
    R(g, cor, cx - w, cy + dy, w * 2 + 1, 1);
  }
};

function pintar(fn) {
  const c = document.createElement('canvas');
  c.width = c.height = SPR;
  const g = c.getContext('2d');
  fn(g);
  return g.getImageData(0, 0, SPR, SPR).data;
}

// ---------------------------------------------------------------- inimigos (f: 0 parado · 1 andando · 2 atacando)
const carrinho = (f) => pintar((g) => {
  const s = f === 1 ? 1 : 0;
  R(g, K, 6, 26 + s, 5, 5); R(g, K, 22, 26 - s, 5, 5); R(g, '#9aa', 7, 27 + s, 2, 2); R(g, '#9aa', 23, 27 - s, 2, 2);
  R(g, K, 3, 8, 26, 18); R(g, '#b9c3c9', 4, 9, 24, 16);
  for (let x = 8; x < 28; x += 4) R(g, '#78858c', x, 9, 1, 16);
  for (let y = 13; y < 25; y += 4) R(g, '#78858c', 4, y, 24, 1);
  R(g, K, 0, 3, 10, 3); R(g, K, 0, 3, 3, 10);
  R(g, '#fff', 8, 12, 7, 6); R(g, '#fff', 18, 12, 7, 6);
  R(g, '#e01010', 11, 14, 3, 4); R(g, '#e01010', 20, 14, 3, 4);
  R(g, K, 7, 9, 5, 2); R(g, K, 12, 10, 3, 2); R(g, K, 21, 10, 3, 2); R(g, K, 24, 9, 4, 2);
  if (f === 2) { R(g, K, 9, 19, 16, 5); for (let x = 10; x < 24; x += 3) R(g, '#fff', x, 19, 2, 2); }
  else R(g, K, 11, 21, 12, 2);
});

const lata = (f) => pintar((g) => {
  R(g, K, 8, 5, 16, 24);
  R(g, '#cfd8dc', 9, 6, 14, 5); R(g, '#d32f2f', 9, 11, 14, 11); R(g, '#cfd8dc', 9, 22, 14, 6);
  R(g, 'rgba(255,255,255,.35)', 11, 6, 2, 22);
  R(g, '#fff', 11, 13, 4, 4); R(g, '#fff', 17, 13, 4, 4);
  R(g, K, 13, 15, 2, 2); R(g, K, 17, 15, 2, 2);
  R(g, K, 11, 11, 4, 1); R(g, K, 17, 11, 4, 1);
  if (f === 2) { R(g, K, 12, 18, 8, 4); R(g, '#fff', 13, 18, 6, 1); } else R(g, K, 12, 19, 8, 2);
  R(g, K, 15, 1, 2, 5);
  R(g, f % 2 ? '#fff176' : '#ffab00', 13, f === 2 ? -0 : 0, 6, 3);
  if (f === 1) R(g, K, 8, 28, 16, 2);
});

const tomate = (f) => pintar((g) => {
  const s = f === 1 ? 1 : 0;
  disco(g, K, 16, 19 + s, 12); disco(g, '#e53935', 16, 19 + s, 11); disco(g, '#ff6f60', 12, 14 + s, 3);
  R(g, '#2e7d32', 11, 6 + s, 10, 3); R(g, '#2e7d32', 14, 3 + s, 4, 4); R(g, '#43a047', 8, 8 + s, 4, 2); R(g, '#43a047', 20, 8 + s, 4, 2);
  R(g, '#fff', 10, 15 + s, 5, 5); R(g, '#fff', 18, 15 + s, 5, 5);
  R(g, K, 12, 17 + s, 3, 3); R(g, K, 18, 17 + s, 3, 3);
  R(g, K, 9, 13 + s, 6, 2); R(g, K, 18, 13 + s, 6, 2);
  R(g, K, 12, 24 + s, 9, 2);
  if (f === 2) { R(g, K, 27, 6, 5, 5); R(g, '#e53935', 28, 7, 3, 3); R(g, K, 25, 11, 3, 8); } else { R(g, K, 3, 21, 4, 3); R(g, K, 26, 21, 4, 3); }
  R(g, K, 11, 29, 4, 2); R(g, K, 18, 29, 4, 2);
});

const galinha = (f) => pintar((g) => {
  const s = f === 1 ? 1 : 0;
  disco(g, K, 15, 18 + s, 12); disco(g, '#dff3fb', 15, 18 + s, 11); disco(g, '#a6d9ef', 11, 22 + s, 5);
  R(g, '#e53935', 12, 3 + s, 3, 3); R(g, '#e53935', 15, 2 + s, 3, 4); R(g, '#e53935', 18, 4 + s, 3, 2);
  R(g, '#ff9800', 24, 14 + s, 6, 4); if (f === 2) { R(g, K, 24, 16 + s, 6, 3); R(g, '#4fe3ff', 28, 15 + s, 4, 4); } else R(g, '#e65100', 24, 18 + s, 5, 2);
  R(g, '#fff', 17, 11 + s, 5, 5); R(g, K, 19, 12 + s, 2, 3);
  R(g, K, 16, 9 + s, 7, 2);
  R(g, '#8fe3ff', 5, 6, 2, 2); R(g, '#8fe3ff', 26, 24, 2, 2); R(g, '#fff', 8, 4, 1, 4); R(g, '#fff', 6, 6, 5, 1);
  R(g, '#ff9800', 10, 28, 2, 3); R(g, '#ff9800', 18, 28, 2, 3);
});

const banana = (f) => pintar((g) => {
  const l = f === 1 ? 1 : 0;
  for (let i = 0; i < 24; i++) {
    const x = 10 + Math.round(Math.sin(i / 24 * Math.PI) * 9) - 5 + (f === 2 ? Math.round(i / 6) : 0) + l;
    const y = 4 + i;
    R(g, K, x - 1, y, 12, 1); R(g, '#ffe135', x, y, 10, 1); R(g, '#e5b800', x + 7, y, 3, 1); R(g, '#fff59d', x + 1, y, 2, 1);
  }
  R(g, K, 14, 2, 5, 3); R(g, '#6d4c41', 15, 2, 3, 2);
  R(g, '#d50000', 11 + l, 9, 14, 4); R(g, '#9b0000', 24 + l, 10, 5, 2);
  R(g, '#fff', 14 + l, 10, 4, 2); R(g, '#fff', 20 + l, 10, 4, 2); R(g, K, 16 + l, 10, 2, 2); R(g, K, 22 + l, 10, 2, 2);
  if (f === 2) { R(g, '#c0c0c0', 0, 12, 8, 2); R(g, '#c0c0c0', 4, 10, 2, 6); }
  R(g, K, 11, 28, 5, 3); R(g, K, 19 + l, 28, 5, 3);
});

const fantasma = (f) => pintar((g) => {
  const o = f === 1 ? 1 : 0;
  g.globalAlpha = 0.9;
  R(g, K, 6, 5, 20, 26);
  R(g, '#f4f4ff', 7, 6, 18, 24); R(g, '#f4f4ff', 8, 4, 16, 2);
  for (let x = 7; x < 25; x += 6) { R(g, '#f4f4ff', x, 30, 3, 2 - o); }
  R(g, 'rgba(120,120,180,.25)', 7, 20, 18, 10);
  g.globalAlpha = 1;
  R(g, '#2e9e5b', 6, 8, 20, 4); R(g, '#1a6b3b', 6, 12, 20, 1);
  R(g, K, 10, 14, 4, 5); R(g, K, 18, 14, 4, 5);
  R(g, '#ff3b3b', 11, 16, 2, 2); R(g, '#ff3b3b', 19, 16, 2, 2);
  if (f === 2) { R(g, K, 13, 22, 6, 4); } else R(g, K, 13, 23, 6, 2);
  R(g, '#ffd23b', 8, 25, 6, 3); R(g, K, 9, 26, 4, 1);
  if (f === 2) { R(g, '#fff', 26, 14, 5, 9); R(g, '#999', 27, 16, 3, 1); R(g, '#999', 27, 19, 3, 1); }
});

const gerente = (f) => pintar((g) => {
  const s = f === 1 ? 1 : 0;
  R(g, K, 7, 15, 18, 15); R(g, '#1d2b6b', 8, 16, 16, 13);
  R(g, '#f5f5f5', 13, 16, 6, 9); R(g, '#d50000', 15, 17, 2, 10);
  R(g, K, 10 + s, 29, 5, 3); R(g, K, 17 - s, 29, 5, 3);
  if (f === 2) { R(g, '#1d2b6b', 2, 6, 5, 11); R(g, '#1d2b6b', 25, 6, 5, 11); disco(g, '#f2c9a0', 4, 5, 2); disco(g, '#f2c9a0', 27, 5, 2); }
  else { R(g, '#1d2b6b', 3, 16, 5, 10); R(g, '#1d2b6b', 24, 16, 5, 10); disco(g, '#f2c9a0', 5, 27, 2); R(g, '#8d5a2b', 24, 22, 7, 9); R(g, '#fff', 25, 23, 5, 7); }
  disco(g, K, 16, 9, 8); disco(g, '#f2c9a0', 16, 9, 7);
  R(g, '#9e9e9e', 9, 2, 14, 4); R(g, '#9e9e9e', 8, 4, 3, 5);
  R(g, '#fff', 11, 8, 4, 3); R(g, '#fff', 17, 8, 4, 3); R(g, K, 13, 9, 2, 2); R(g, K, 17, 9, 2, 2);
  R(g, K, 10, 6, 6, 2); R(g, K, 17, 6, 6, 2);
  R(g, K, 11, 13, 10, 2);
  if (f === 2) { R(g, K, 13, 15, 6, 3); R(g, '#c62828', 14, 16, 4, 1); }
  R(g, '#ffd23b', 9, 21, 5, 2);
});

// ---------------------------------------------------------------- projéteis e itens (desenhados no centro)
const proj = {
  tomate: () => pintar((g) => { disco(g, K, 16, 20, 5); disco(g, '#e53935', 16, 20, 4); R(g, '#43a047', 14, 15, 4, 2); }),
  gelo: () => pintar((g) => { disco(g, '#0b5f7a', 16, 20, 5); disco(g, '#8fe9ff', 16, 20, 4); R(g, '#fff', 14, 18, 2, 2); }),
  recibo: () => pintar((g) => { R(g, K, 12, 14, 9, 13); R(g, '#fff', 13, 15, 7, 11); R(g, '#999', 14, 17, 5, 1); R(g, '#999', 14, 20, 5, 1); R(g, '#999', 14, 23, 3, 1); }),
  etiqueta: () => pintar((g) => { R(g, K, 11, 15, 11, 9); R(g, '#ffd23b', 12, 16, 9, 7); R(g, '#c62828', 14, 18, 5, 3); R(g, K, 11, 15, 2, 2); }),
};

const item = {
  maca: () => pintar((g) => { disco(g, K, 16, 22, 7); disco(g, '#e53935', 16, 22, 6); R(g, '#ff8a80', 13, 19, 2, 2); R(g, '#6d4c41', 16, 14, 2, 4); R(g, '#43a047', 18, 15, 4, 2); }),
  pizza: () => pintar((g) => { for (let i = 0; i < 12; i++) { R(g, K, 8 + i, 14 + i - 1, 17 - i * 1.4, 3); R(g, '#ffb74d', 9 + i, 15 + i - 1, 15 - i * 1.4, 1); R(g, '#ffd54f', 9 + i, 16 + i - 1, 15 - i * 1.4, 1); } R(g, '#d32f2f', 14, 18, 3, 3); R(g, '#d32f2f', 18, 16, 3, 3); R(g, '#d32f2f', 13, 23, 2, 2); }),
  municao: () => pintar((g) => { R(g, K, 8, 17, 16, 11); R(g, '#1976d2', 9, 18, 14, 9); R(g, '#fff', 11, 20, 10, 2); R(g, '#bbdefb', 11, 23, 6, 2); }),
  ervilhas: () => pintar((g) => { R(g, K, 10, 14, 12, 15); R(g, '#2e7d32', 11, 15, 10, 13); R(g, '#cfd8dc', 11, 15, 10, 2); R(g, '#cfd8dc', 11, 26, 10, 2); for (let i = 0; i < 4; i++) disco(g, '#9be564', 14 + (i % 2) * 4, 19 + Math.floor(i / 2) * 4, 1); }),
  pao: () => pintar((g) => { R(g, K, 5, 18, 22, 8); R(g, '#d9a441', 6, 19, 20, 6); for (let x = 8; x < 24; x += 5) R(g, '#a56c1c', x, 19, 2, 6); R(g, '#f1c87a', 7, 19, 18, 1); }),
  chaveVermelha: () => pintar((g) => { R(g, K, 8, 13, 16, 12); R(g, '#e53935', 9, 14, 14, 10); R(g, '#fff', 11, 16, 5, 2); R(g, '#222', 11, 19, 10, 2); R(g, '#ffd23b', 19, 16, 3, 2); }),
  chaveAzul: () => pintar((g) => { R(g, K, 8, 13, 16, 12); R(g, '#1e88e5', 9, 14, 14, 10); R(g, '#fff', 11, 16, 5, 2); R(g, '#222', 11, 19, 10, 2); R(g, '#ffd23b', 19, 16, 3, 2); }),
  espingarda: () => pintar((g) => { R(g, K, 3, 17, 26, 6); R(g, '#555', 4, 18, 24, 2); R(g, '#555', 4, 20, 24, 2); R(g, '#8d5a2b', 3, 22, 9, 5); R(g, '#9be564', 25, 17, 3, 2); }),
  canhao: () => pintar((g) => { R(g, K, 4, 14, 24, 12); R(g, '#d9a441', 5, 15, 22, 10); for (let x = 8; x < 26; x += 5) R(g, '#a56c1c', x, 15, 2, 10); R(g, K, 24, 16, 3, 8); }),
};

const fx = {
  boom0: () => pintar((g) => { disco(g, '#ffeb3b', 16, 17, 6); disco(g, '#fff', 16, 17, 3); }),
  boom1: () => pintar((g) => { disco(g, '#ff6d00', 16, 17, 12); disco(g, '#ffeb3b', 16, 17, 8); disco(g, '#fff', 16, 17, 4); }),
  boom2: () => pintar((g) => { disco(g, 'rgba(60,40,40,.9)', 16, 16, 14); disco(g, '#ff6d00', 14, 15, 8); disco(g, '#ffab00', 20, 19, 4); }),
  puff: () => pintar((g) => { disco(g, 'rgba(255,255,255,.85)', 16, 20, 4); R(g, '#fff', 8, 18, 2, 2); R(g, '#fff', 22, 22, 2, 2); }),
  splat: () => pintar((g) => { disco(g, '#e53935', 16, 20, 6); R(g, '#e53935', 6, 18, 3, 3); R(g, '#e53935', 24, 22, 3, 3); }),
};

export function gerarSprites() {
  const inim = {};
  const defs = { carrinho, lata, tomate, galinha, banana, fantasma, gerente };
  Object.keys(defs).forEach((k) => { inim[k] = [defs[k](0), defs[k](1), defs[k](2)]; });
  const obj = (o) => Object.keys(o).reduce((a, k) => { a[k] = o[k](); return a; }, {});
  return { inim, proj: obj(proj), item: obj(item), fx: obj(fx) };
}
