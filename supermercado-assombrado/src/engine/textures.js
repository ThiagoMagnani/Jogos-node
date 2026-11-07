// Texturas de parede, chão e teto desenhadas por código (pixel art procedural, 64x64).
export const TEX = 64;

const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const R = (g, cor, x, y, w, h) => { g.fillStyle = cor; g.fillRect(x, y, w, h); };
const txt = (g, t, x, y, cor, tam = 9) => { g.font = `bold ${tam}px monospace`; g.textBaseline = 'top'; g.fillStyle = cor; g.fillText(t, x, y); };

function pintar(fn) {
  const c = document.createElement('canvas');
  c.width = c.height = TEX;
  const g = c.getContext('2d');
  fn(g);
  return g.getImageData(0, 0, TEX, TEX).data;
}

const CORES = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#fb8c00', '#ec407a', '#26c6da'];

const prateleira = () => pintar((g) => {
  const r = rng(7);
  R(g, '#262636', 0, 0, TEX, TEX);
  for (let a = 0; a < 4; a++) {
    const y0 = 1 + a * 16;
    let x = 3;
    while (x < 59) {
      const w = 5 + Math.floor(r() * 5);
      const h = 8 + Math.floor(r() * 5);
      const c = CORES[Math.floor(r() * CORES.length)];
      R(g, c, x, y0 + 13 - h, w, h);
      R(g, 'rgba(255,255,255,.4)', x, y0 + 13 - h, w, 1);
      R(g, 'rgba(0,0,0,.3)', x + w - 1, y0 + 13 - h, 1, h);
      R(g, '#fff', x + 1, y0 + 13 - Math.floor(h / 2) - 1, w - 2, 2);
      x += w + 1;
    }
    R(g, '#8d93a8', 0, y0 + 13, TEX, 2);
    R(g, '#4a4f63', 0, y0 + 15, TEX, 1);
  }
  R(g, '#5a5f73', 0, 0, 2, TEX);
  R(g, '#5a5f73', 62, 0, 2, TEX);
});

const azulejo = () => pintar((g) => {
  const r = rng(11);
  for (let ty = 0; ty < 4; ty++) {
    for (let tx = 0; tx < 4; tx++) {
      const v = 215 + Math.floor(r() * 25);
      R(g, `rgb(${v - 20},${v},${v - 6})`, tx * 16, ty * 16, 16, 16);
      R(g, '#9bb5ae', tx * 16, ty * 16, 16, 1);
      R(g, '#9bb5ae', tx * 16, ty * 16, 1, 16);
    }
  }
  R(g, '#2a6f77', 0, 52, TEX, 12);
  R(g, '#3f9aa5', 0, 52, TEX, 2);
  R(g, '#e53935', 0, 20, TEX, 3);
  R(g, '#fff', 0, 23, TEX, 1);
});

const freezer = () => pintar((g) => {
  const r = rng(5);
  R(g, '#bfe6f5', 0, 0, TEX, TEX);
  R(g, '#7fb4cc', 0, 0, TEX, 4);
  [4, 35].forEach((x) => {
    R(g, '#4f6f80', x, 7, 26, 52);
    R(g, '#0d2a45', x + 2, 9, 22, 48);
    for (let i = 0; i < 26; i++) R(g, ['#ff7043', '#ffee58', '#66bb6a', '#fff'][Math.floor(r() * 4)], x + 3 + Math.floor(r() * 18), 12 + Math.floor(r() * 40), 3, 3);
    for (let i = 0; i < 40; i++) R(g, 'rgba(255,255,255,.7)', x + 2 + Math.floor(r() * 22), 9 + Math.floor(r() * 48), 1, 1);
    R(g, 'rgba(200,240,255,.25)', x + 2, 9, 22, 12);
    R(g, '#cfd8dc', x + 22, 26, 2, 14);
  });
  R(g, '#7fb4cc', 0, 60, TEX, 4);
});

const caixotes = () => pintar((g) => {
  R(g, '#a9723c', 0, 0, TEX, TEX);
  for (let y = 0; y < TEX; y += 8) R(g, '#8a5a2b', 0, y, TEX, 1);
  R(g, '#6d4420', 0, 0, TEX, 3); R(g, '#6d4420', 0, 61, TEX, 3);
  R(g, '#6d4420', 0, 0, 3, TEX); R(g, '#6d4420', 61, 0, 3, TEX);
  for (let i = 0; i < 56; i++) { R(g, '#6d4420', 4 + i, 4 + i, 3, 2); R(g, '#6d4420', 59 - i, 4 + i, 3, 2); }
  R(g, '#f5ecd0', 14, 24, 36, 14);
  txt(g, 'FRÁGIL', 16, 27, '#c62828', 9);
});

const vidro = () => pintar((g) => {
  R(g, '#7f93a6', 0, 0, TEX, TEX);
  R(g, '#4b5b6b', 0, 0, TEX, 3); R(g, '#4b5b6b', 0, 61, TEX, 3);
  R(g, '#4b5b6b', 0, 0, 3, TEX); R(g, '#4b5b6b', 61, 0, 3, TEX); R(g, '#4b5b6b', 30, 0, 4, TEX);
  [5, 36].forEach((x) => { R(g, '#4fc3e8', x, 6, 23, 38); R(g, 'rgba(255,255,255,.35)', x + 3, 8, 3, 34); R(g, 'rgba(255,255,255,.2)', x + 9, 8, 2, 34); });
  for (let x = 0; x < TEX; x += 10) { R(g, '#ffd23b', x, 50, 5, 10); R(g, '#222', x + 5, 50, 5, 10); }
});

const portaCor = (fundo, claro, rotulo, cor) => () => pintar((g) => {
  R(g, fundo, 0, 0, TEX, TEX);
  R(g, claro, 4, 4, 56, 56);
  R(g, fundo, 8, 8, 48, 48);
  R(g, 'rgba(0,0,0,.25)', 0, 0, 3, TEX); R(g, 'rgba(255,255,255,.18)', 61, 0, 3, TEX);
  R(g, '#111', 8, 18, 48, 14);
  txt(g, rotulo, 32 - rotulo.length * 3, 21, cor, 9);
  R(g, '#ffd23b', 10, 40, 8, 8); R(g, '#111', 13, 43, 2, 5); // fechadura
  R(g, '#cfd8dc', 46, 34, 4, 14);
});

const saida = () => pintar((g) => {
  R(g, '#146b2c', 0, 0, TEX, TEX);
  R(g, '#1fa244', 4, 4, 56, 56);
  R(g, '#146b2c', 8, 8, 48, 48);
  R(g, '#e8ffe8', 10, 12, 44, 16);
  txt(g, 'SAÍDA', 14, 16, '#146b2c', 10);
  R(g, '#e8ffe8', 14, 38, 28, 6); R(g, '#e8ffe8', 38, 32, 4, 18); R(g, '#e8ffe8', 42, 36, 4, 10); R(g, '#e8ffe8', 46, 39, 4, 4);
});

const madeira = () => pintar((g) => {
  R(g, '#6b4423', 0, 0, TEX, TEX);
  for (let x = 0; x < TEX; x += 8) { R(g, '#573619', x, 0, 1, TEX); R(g, '#7d5430', x + 2, 0, 1, TEX); }
  R(g, '#3f2610', 0, 0, TEX, 3); R(g, '#3f2610', 0, 61, TEX, 3);
  R(g, '#f1f1e6', 12, 12, 40, 28);
  R(g, '#d32f2f', 14, 34, 4, 3); R(g, '#d32f2f', 18, 28, 4, 9); R(g, '#d32f2f', 22, 22, 4, 15); R(g, '#d32f2f', 26, 26, 4, 11); R(g, '#d32f2f', 30, 16, 4, 21); R(g, '#d32f2f', 34, 20, 4, 17);
  R(g, '#111', 14, 38, 34, 1);
  txt(g, 'LUCRO', 15, 14, '#222', 7);
});

const chao = () => pintar((g) => {
  const r = rng(3);
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 2; tx++) {
      const c = (tx + ty) % 2 ? [168, 214, 192] : [232, 226, 200];
      R(g, `rgb(${c[0]},${c[1]},${c[2]})`, tx * 32, ty * 32, 32, 32);
      for (let i = 0; i < 20; i++) R(g, 'rgba(0,0,0,.07)', tx * 32 + Math.floor(r() * 30), ty * 32 + Math.floor(r() * 30), 2, 1);
      R(g, 'rgba(255,255,255,.35)', tx * 32 + 1, ty * 32 + 1, 30, 1);
    }
  }
  R(g, '#6e6a58', 0, 0, TEX, 1); R(g, '#6e6a58', 0, 32, TEX, 1); R(g, '#6e6a58', 0, 0, 1, TEX); R(g, '#6e6a58', 32, 0, 1, TEX);
});

const teto = () => pintar((g) => {
  R(g, '#2b2438', 0, 0, TEX, TEX);
  R(g, '#1c1726', 0, 0, TEX, 2); R(g, '#1c1726', 0, 0, 2, TEX);
  R(g, '#d9deb0', 10, 22, 44, 20);
  R(g, '#fbffd8', 12, 24, 40, 16);
  R(g, '#b5bb8a', 31, 22, 2, 20);
});

export function gerarTexturas() {
  return {
    paredes: {
      1: prateleira(), 2: azulejo(), 3: freezer(), 4: caixotes(), 5: vidro(),
      6: madeira(),
      7: portaCor('#a31515', '#e04545', 'ESTOQUE', '#ffd23b')(),
      8: portaCor('#17358a', '#4a72d9', 'GERÊNCIA', '#9cf')(),
      9: saida(),
    },
    chao: chao(),
    teto: teto(),
  };
}
