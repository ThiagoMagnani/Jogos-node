// Sprites em pixel art (32x32) desenhados por código: aliens (3 quadros), itens, projéteis e efeitos.
export const SPR = 32;
const K = '#08060c';
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const disco = (g, c, cx, cy, r) => { for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy + 0.5)); R(g, c, cx - w, cy + dy, w * 2 + 1, 1); } };
const olhos = (g, c, pts) => pts.forEach(([x, y, w = 2, h = 2]) => { R(g, c, x, y, w, h); R(g, '#fff', x, y, 1, 1); });

function pintar(fn) {
  const c = document.createElement('canvas');
  c.width = c.height = SPR;
  const g = c.getContext('2d');
  fn(g);
  return g.getImageData(0, 0, SPR, SPR).data;
}

// ---------------- inimigos (f: 0 parado · 1 andando · 2 atacando)
const rastejador = (f) => pintar((g) => {
  const l = f === 1 ? 1 : 0, y = f === 2 ? -3 : 0;
  for (let i = 0; i < 3; i++) { R(g, K, 5 + i * 6 - l, 22 + y, 2, 8 - y); R(g, K, 3 + i * 6 + l, 28, 4, 2); }
  disco(g, K, 15, 19 + y, 10); disco(g, '#23402c', 15, 19 + y, 9); disco(g, '#3a6a46', 13, 16 + y, 5);
  R(g, '#0f1f16', 8, 22 + y, 16, 2);
  for (let i = 0; i < 4; i++) R(g, '#7bd88f', 8 + i * 4, 12 + y - (i % 2), 1, 3);
  R(g, K, 22, 15 + y, 9, 9); R(g, '#2f5a3b', 23, 16 + y, 7, 7);
  olhos(g, '#ff2b2b', [[25, 17 + y], [28, 17 + y]]);
  if (f === 2) { R(g, '#e8e8d0', 24, 23 + y, 2, 4); R(g, '#e8e8d0', 28, 23 + y, 2, 4); R(g, '#5a0a14', 25, 22 + y, 4, 2); } else { R(g, '#e8e8d0', 25, 23, 1, 2); R(g, '#e8e8d0', 29, 23, 1, 2); }
});

const infectado = (f) => pintar((g) => {
  const b = f === 1 ? 1 : 0;
  R(g, K, 9, 28, 5, 4); R(g, K, 18, 28 - b, 5, 4 + b);
  R(g, K, 8, 13, 16, 17); R(g, '#243a5a', 9, 14, 14, 15); R(g, '#1a2a44', 9, 22, 14, 7); R(g, '#a8b0b8', 13, 17, 6, 2);
  R(g, '#5a0a14', 11, 20, 4, 6); R(g, '#7a1020', 18, 17, 3, 8); // sangue
  if (f === 2) { R(g, K, 3, 6, 6, 12); R(g, '#7a9a78', 4, 7, 4, 10); R(g, K, 23, 6, 6, 12); R(g, '#7a9a78', 24, 7, 4, 10); }
  else { R(g, K, 3, 15, 6, 12 - b); R(g, '#7a9a78', 4, 16, 4, 10 - b); R(g, K, 23, 15, 6, 12 + b); R(g, '#7a9a78', 24, 16, 4, 10 + b); }
  disco(g, K, 16, 9, 7); disco(g, '#7a9a78', 16, 9, 6); R(g, '#4d6a4b', 11, 6, 3, 3);
  olhos(g, '#ffe14d', [[12, 8], [18, 8]]);
  if (f === 2) { R(g, K, 13, 12, 7, 4); R(g, '#c8c8b0', 13, 12, 7, 1); } else R(g, K, 13, 13, 6, 2);
});

const cuspidor = (f) => pintar((g) => {
  const b = f === 1 ? 1 : 0;
  disco(g, K, 16, 24, 9); disco(g, '#4a2a6a', 16, 24, 8); disco(g, '#6a3f92', 13, 21, 4);
  R(g, K, 12, 27 + b, 3, 4); R(g, K, 19, 27 - b, 3, 4);
  R(g, K, 13, 9, 7, 14); R(g, '#5a3680', 14, 10, 5, 12);
  disco(g, K, 16, 7, 6); disco(g, '#6a3f92', 16, 7, 5);
  olhos(g, '#9dff4d', [[12, 5], [17, 5]]); olhos(g, '#9dff4d', [[14, 8, 1, 1]]);
  if (f === 2) { R(g, K, 12, 9, 9, 6); R(g, '#5a0a14', 13, 10, 7, 4); disco(g, '#7cff3b', 16, 13, 3); R(g, '#d8ffb0', 15, 12, 1, 1); }
  else R(g, K, 13, 10, 7, 2);
  for (let i = 0; i < 4; i++) R(g, '#8a5fb8', 8 + i * 5, 20 - (i % 2) * 2, 2, 3);
});

const inchado = (f) => pintar((g) => {
  const p = f === 2 ? 2 : 0;
  R(g, K, 11, 27, 4, 4); R(g, K, 18, 27, 4, 4);
  disco(g, K, 16, 17, 13 + p / 2); disco(g, f === 2 ? '#d8a02a' : '#8a9a2a', 16, 17, 12 + p / 2); disco(g, f === 2 ? '#ffd45a' : '#b0c040', 12, 13, 5);
  for (let i = 0; i < 7; i++) { const x = 6 + ((i * 7) % 20), y = 8 + ((i * 5) % 16); disco(g, '#c0d850', x, y, 2); R(g, '#e8ff9a', x - 1, y - 1, 1, 1); }
  R(g, '#5a6a14', 14, 8, 1, 18); R(g, '#5a6a14', 20, 12, 1, 12);
  olhos(g, f === 2 ? '#ff2b2b' : '#2a1a05', [[11, 15, 3, 3], [18, 15, 3, 3]]);
  R(g, K, 12, 21, 9, f === 2 ? 4 : 2); if (f === 2) R(g, '#ff7a3b', 13, 22, 7, 2);
});

const sentinela = (f) => pintar((g) => {
  const o = f === 1 ? 1 : 0;
  for (let i = 0; i < 5; i++) { R(g, K, 7 + i * 4, 21, 2, 8 + ((i + o) % 2) * 2); R(g, '#7a2a4a', 8 + i * 4, 21, 1, 7 + ((i + o) % 2) * 2); }
  disco(g, K, 16, 13, 12); disco(g, '#d8d0c8', 16, 13, 11); disco(g, '#f0eae0', 13, 10, 5);
  for (let i = 0; i < 6; i++) { R(g, '#c4332f', 6 + i * 2, 9 + (i % 3) * 4, 1, 4); R(g, '#c4332f', 25 - i * 2, 11 + (i % 2) * 5, 1, 3); }
  disco(g, '#2a0a30', 16, 13, 6); disco(g, f === 2 ? '#ff2b2b' : '#e8b020', 16, 13, 5); R(g, K, 15, 8, 3, 10); R(g, '#fff', 13, 10, 2, 2);
  if (f === 2) disco(g, 'rgba(255,60,60,.5)', 16, 13, 8);
});

const bruto = (f) => pintar((g) => {
  const b = f === 1 ? 1 : 0;
  R(g, K, 7, 27, 8, 5); R(g, K, 17, 27 - b, 8, 5 + b);
  R(g, K, 3, 10, 26, 19); R(g, '#7a3a2a', 4, 11, 24, 17); R(g, '#a04a36', 6, 12, 8, 6); R(g, '#5a281c', 4, 22, 24, 6);
  for (let i = 0; i < 3; i++) { R(g, '#e8e0c8', 4 + i * 3, 6 - i, 2, 6 + i); R(g, '#e8e0c8', 27 - i * 3, 6 - i, 2, 6 + i); }
  if (f === 2) { R(g, K, 0, 2, 7, 12); R(g, '#8c4a38', 1, 3, 5, 10); R(g, K, 25, 2, 7, 12); R(g, '#8c4a38', 26, 3, 5, 10); }
  else { R(g, K, 0, 14, 7, 14); R(g, '#8c4a38', 1, 15, 5, 12); R(g, K, 25, 14, 7, 14); R(g, '#8c4a38', 26, 15, 5, 12); }
  disco(g, K, 16, 10, 5); disco(g, '#6a3022', 16, 10, 4); olhos(g, '#ff9a1a', [[13, 9], [17, 9]]); R(g, K, 14, 12, 5, 2);
  R(g, '#d8d0b8', 14, 12, 1, 1); R(g, '#d8d0b8', 18, 12, 1, 1);
  R(g, '#3a1a12', 12, 17, 8, 1); R(g, '#3a1a12', 10, 21, 12, 1);
});

const drone = (f) => pintar((g) => {
  const o = f === 1 ? 1 : 0;
  R(g, K, 3, 6 + o, 10, 3); R(g, '#8a929c', 4, 7 + o, 8, 1); R(g, K, 19, 6 - o, 10, 3); R(g, '#8a929c', 20, 7 - o, 8, 1);
  R(g, K, 7, 9, 18, 16); R(g, '#7a828c', 8, 10, 16, 14); R(g, '#aab2bc', 9, 11, 14, 3); R(g, '#4a525c', 8, 20, 16, 4);
  disco(g, K, 16, 17, 5); disco(g, f === 2 ? '#ff4d4d' : '#3ab8ff', 16, 17, 4); R(g, '#fff', 14, 15, 2, 2);
  R(g, K, 4, 20, 5, 9); R(g, '#5a626c', 5, 21, 3, 7); R(g, '#e8c040', 5, 28, 3, 1);
  R(g, K, 24, 18, 8, 5); R(g, '#5a626c', 24, 19, 7, 3); if (f === 2) { R(g, '#fff59d', 31, 18, 1, 5); R(g, '#ffb020', 29, 19, 2, 3); }
  R(g, '#ff3b3b', 10, 12, 2, 2);
  R(g, K, 12, 25, 2, 4); R(g, K, 18, 25, 2, 4);
});

const matriarca = (f) => pintar((g) => {
  const a = f === 2 ? 3 : 0, b = f === 1 ? 1 : 0;
  for (let i = 0; i < 4; i++) { R(g, K, 2 + i * 7 - b, 20, 2, 11); R(g, K, 1 + i * 7 + b, 29, 4, 2); }
  disco(g, K, 16, 21, 12); disco(g, '#3a1a4a', 16, 21, 11); disco(g, '#5a2a70', 12, 18, 5);
  for (let i = 0; i < 5; i++) R(g, '#2a0f36', 8 + i * 4, 12 + (i % 2) * 2, 2, 12);
  disco(g, '#d8b0e8', 25, 24, 3); disco(g, '#f4d8ff', 24, 23, 1); // ovos
  R(g, K, 8, 3, 16, 10); R(g, '#4a2262', 9, 4, 14, 8);
  for (let i = 0; i < 4; i++) R(g, '#8a4fb0', 8 + i * 4, 0, 2, 5 - (i % 2));
  olhos(g, '#ff7a1a', [[11, 6], [14, 5], [18, 5], [21, 6]]);
  R(g, K, 8, 12 + a, 4, 6 + a); R(g, '#e8e0c8', 9, 12, 2, 5 + a); R(g, K, 20, 12 + a, 4, 6 + a); R(g, '#e8e0c8', 21, 12, 2, 5 + a);
  if (f === 2) { disco(g, '#7cff3b', 16, 14, 3); R(g, '#d8ffb0', 15, 13, 1, 1); }
});

const colosso = (f) => pintar((g) => {
  const b = f === 1 ? 1 : 0;
  R(g, K, 6, 26, 8, 6); R(g, K, 18, 26 - b, 8, 6 + b); R(g, '#4a525c', 7, 27, 6, 4); R(g, '#4a525c', 19, 27 - b, 6, 4);
  R(g, K, 5, 9, 22, 19); R(g, '#5a636e', 6, 10, 20, 17); R(g, '#7a848f', 7, 11, 18, 3); R(g, '#3a414a', 6, 22, 20, 5);
  disco(g, K, 16, 18, 4); disco(g, f === 2 ? '#fff59d' : '#ff7a1a', 16, 18, 3);
  R(g, K, 0, 7, 8, 8); R(g, '#3a414a', 1, 8, 6, 6); R(g, K, 24, 7, 8, 8); R(g, '#3a414a', 25, 8, 6, 6);
  if (f === 2) { R(g, '#fff59d', 0, 4, 2, 5); R(g, '#ffb020', 30, 4, 2, 5); R(g, '#fff', 1, 5, 1, 2); }
  else { R(g, K, 1, 14, 5, 12); R(g, '#4a525c', 2, 15, 3, 10); R(g, K, 26, 14, 5, 12); R(g, '#4a525c', 27, 15, 3, 10); }
  R(g, K, 11, 2, 10, 9); R(g, '#4a525c', 12, 3, 8, 7); R(g, '#1a0a0a', 12, 5, 8, 3); R(g, '#ff2b2b', 13, 6, 6, 1); olhos(g, '#ff2b2b', [[14, 5, 1, 1]]);
  R(g, '#e0a800', 6, 24, 20, 1);
});

const omega = (f) => pintar((g) => {
  const p = f === 2 ? 1 : 0, o = f === 1 ? 1 : 0;
  for (let i = 0; i < 6; i++) { R(g, K, 6 + i * 4, 21, 2, 9 + ((i + o) % 2) * 2); R(g, '#a02a6a', 7 + i * 4, 21, 1, 8 + ((i + o) % 2) * 2); }
  disco(g, K, 16, 12, 14 + p); disco(g, '#c44a8a', 16, 12, 13 + p); disco(g, '#e07ab0', 12, 8, 6);
  for (let i = 0; i < 8; i++) { R(g, '#8a1f5a', 5 + i * 3, 4 + (i % 3) * 6, 5, 1); R(g, '#8a1f5a', 7 + (i % 4) * 5, 3 + i * 2, 1, 5); }
  disco(g, K, 16, 14, 7); disco(g, '#fff0f8', 16, 14, 6); disco(g, f === 2 ? '#ff2bff' : '#7a1fd0', 16, 14, 4); R(g, K, 15, 11, 3, 6); R(g, '#fff', 13, 12, 2, 2);
  if (f === 2) disco(g, 'rgba(255,60,255,.4)', 16, 14, 10);
});

const barril = () => pintar((g) => {
  R(g, K, 8, 6, 16, 25); R(g, '#b02a1c', 9, 7, 14, 23); R(g, '#d8483a', 10, 8, 3, 21); R(g, '#7a1810', 20, 8, 2, 21);
  R(g, '#e8e8e8', 9, 11, 14, 1); R(g, '#e8e8e8', 9, 25, 14, 1); R(g, '#e0a800', 11, 15, 10, 8); R(g, K, 15, 16, 2, 3); R(g, K, 15, 20, 2, 2); R(g, K, 12, 18, 2, 2); R(g, K, 18, 18, 2, 2);
});

// ---------------- projéteis e itens
const proj = {
  acido: () => pintar((g) => { disco(g, '#0d4a14', 16, 20, 5); disco(g, '#5aff3b', 16, 20, 4); R(g, '#d8ffb0', 14, 18, 2, 2); }),
  plasma: () => pintar((g) => { disco(g, 'rgba(255,60,255,.4)', 16, 20, 7); disco(g, '#ff4dff', 16, 20, 4); disco(g, '#fff', 16, 20, 2); }),
  bala: () => pintar((g) => { R(g, '#ffb020', 12, 19, 8, 3); R(g, '#fff59d', 14, 19, 5, 2); }),
};

const caixa = (cor, rotulo) => () => pintar((g) => { R(g, K, 7, 16, 18, 12); R(g, cor, 8, 17, 16, 10); R(g, 'rgba(255,255,255,.3)', 8, 17, 16, 2); R(g, '#15151a', 11, 21, 10, 4); R(g, '#fff', 12, 22, rotulo, 2); });
const item = {
  kit: () => pintar((g) => { R(g, K, 7, 16, 18, 13); R(g, '#e8e8e8', 8, 17, 16, 11); R(g, '#e53935', 14, 18, 4, 9); R(g, '#e53935', 11, 21, 10, 3); R(g, '#9aa', 8, 26, 16, 2); }),
  kitG: () => pintar((g) => { R(g, K, 6, 20, 20, 6); R(g, '#6ae0ff', 7, 21, 14, 4); R(g, '#c8f6ff', 8, 21, 8, 1); R(g, K, 24, 21, 6, 2); R(g, '#d8d8d8', 4, 21, 3, 4); R(g, '#35ff9a', 12, 22, 5, 2); }),
  escudo: () => pintar((g) => { R(g, K, 8, 13, 16, 16); R(g, '#2a70e0', 9, 14, 14, 13); R(g, '#6aa8ff', 10, 15, 5, 8); R(g, K, 12, 27, 8, 3); R(g, '#2a70e0', 13, 27, 6, 2); R(g, '#fff', 15, 17, 2, 6); R(g, '#fff', 13, 19, 6, 2); }),
  balas: caixa('#c89a2a', 6), cartuchos: caixa('#c43a2a', 8), celulas: caixa('#2ab0d8', 4), plasma: caixa('#7a2ad8', 5), trilhos: caixa('#9aa4ae', 10),
  arma_escopeta: () => pintar((g) => { R(g, K, 3, 17, 26, 7); R(g, '#3a3f47', 4, 18, 24, 2); R(g, '#3a3f47', 4, 20, 24, 2); R(g, '#7a4a2a', 3, 23, 10, 5); R(g, '#d83a2a', 24, 18, 3, 1); }),
  arma_pulso: () => pintar((g) => { R(g, K, 3, 15, 26, 10); R(g, '#5a636e', 4, 16, 24, 6); R(g, '#2ab0d8', 16, 17, 8, 2); R(g, '#3a414a', 9, 22, 4, 6); R(g, '#8a929c', 4, 16, 24, 1); }),
  arma_plasma: () => pintar((g) => { R(g, K, 4, 14, 24, 13); R(g, '#6a2aa8', 5, 15, 22, 11); R(g, '#b84dff', 8, 17, 10, 3); disco(g, '#ff4dff', 24, 20, 3); R(g, '#3a1a5a', 5, 23, 22, 3); }),
  arma_trilho: () => pintar((g) => { R(g, K, 2, 16, 28, 8); R(g, '#9aa4ae', 3, 17, 26, 2); R(g, '#9aa4ae', 3, 21, 26, 2); R(g, '#2ab0d8', 10, 19, 14, 2); R(g, '#3a414a', 4, 24, 6, 5); }),
  cartao_vermelho: () => pintar((g) => { R(g, K, 8, 14, 16, 12); R(g, '#e53935', 9, 15, 14, 10); R(g, '#fff', 11, 17, 5, 2); R(g, '#15151a', 11, 21, 10, 2); R(g, '#ffd23b', 19, 17, 3, 2); }),
  cartao_azul: () => pintar((g) => { R(g, K, 8, 14, 16, 12); R(g, '#1e88e5', 9, 15, 14, 10); R(g, '#fff', 11, 17, 5, 2); R(g, '#15151a', 11, 21, 10, 2); R(g, '#ffd23b', 19, 17, 3, 2); }),
  cartao_amarelo: () => pintar((g) => { R(g, K, 8, 14, 16, 12); R(g, '#f2c21a', 9, 15, 14, 10); R(g, '#fff', 11, 17, 5, 2); R(g, '#15151a', 11, 21, 10, 2); R(g, '#e53935', 19, 17, 3, 2); }),
  fragmento: () => pintar((g) => { R(g, K, 7, 12, 18, 16); R(g, '#c8e8d8', 8, 13, 16, 14); R(g, '#7acfa0', 8, 13, 16, 2); [[10, 17, 8, 1], [10, 20, 12, 1], [10, 23, 6, 1]].forEach(([x, y, w, h]) => R(g, '#2a6a4a', x, y, w, h)); R(g, '#ff3b3b', 20, 21, 3, 3); R(g, '#fff', 9, 14, 2, 2); }),
  halo: () => pintar((g) => { disco(g, 'rgba(255,230,120,.3)', 16, 21, 9); disco(g, 'rgba(255,245,180,.4)', 16, 21, 5); }),
  portal: () => pintar((g) => { disco(g, 'rgba(60,200,255,.35)', 16, 26, 11); disco(g, 'rgba(120,230,255,.6)', 16, 26, 7); disco(g, '#fff', 16, 26, 3); R(g, 'rgba(120,230,255,.5)', 14, 6, 4, 18); }),
};

const fx = {
  boom0: () => pintar((g) => { disco(g, '#ffeb3b', 16, 17, 6); disco(g, '#fff', 16, 17, 3); }),
  boom1: () => pintar((g) => { disco(g, '#ff6d00', 16, 17, 12); disco(g, '#ffeb3b', 16, 17, 8); disco(g, '#fff', 16, 17, 4); }),
  boom2: () => pintar((g) => { disco(g, 'rgba(50,40,50,.9)', 16, 16, 14); disco(g, '#ff6d00', 14, 15, 8); disco(g, '#ffab00', 20, 19, 4); }),
  poca: () => pintar((g) => { disco(g, 'rgba(30,150,40,.75)', 16, 24, 9); disco(g, 'rgba(120,255,90,.7)', 13, 22, 4); disco(g, 'rgba(120,255,90,.6)', 20, 26, 3); }),
  marca: () => pintar((g) => { disco(g, 'rgba(255,40,40,.55)', 16, 24, 8); disco(g, 'rgba(255,200,120,.8)', 16, 24, 4); }),
  onda: () => pintar((g) => { disco(g, 'rgba(79,227,255,.55)', 16, 24, 7); disco(g, '#bff6ff', 16, 24, 3); }),
  acerto: () => pintar((g) => { disco(g, 'rgba(79,227,255,.5)', 16, 17, 10); R(g, '#fff', 15, 8, 2, 18); R(g, '#fff', 7, 16, 18, 2); }),
  puff: () => pintar((g) => { disco(g, 'rgba(255,255,255,.85)', 16, 20, 4); R(g, '#ffd27a', 8, 18, 2, 2); R(g, '#ffd27a', 22, 22, 2, 2); }),
  mancha: () => pintar((g) => { disco(g, 'rgba(90,255,59,.8)', 16, 22, 7); R(g, '#5aff3b', 6, 20, 3, 3); R(g, '#5aff3b', 24, 24, 3, 3); R(g, '#d8ffb0', 14, 20, 2, 2); }),
};

export function gerarSprites() {
  const inim = {};
  const defs = { rastejador, infectado, cuspidor, inchado, sentinela, bruto, drone, matriarca, colosso, omega };
  Object.keys(defs).forEach((k) => { inim[k] = [defs[k](0), defs[k](1), defs[k](2)]; });
  const b = barril();
  inim.barril = [b, b, b];
  const obj = (o) => Object.keys(o).reduce((a, k) => { a[k] = o[k](); return a; }, {});
  return { inim, proj: obj(proj), item: obj(item), fx: obj(fx) };
}
