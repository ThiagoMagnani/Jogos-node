// Texturas sombrias da Estação Ômega, desenhadas por código (pixel art procedural 64x64).
export const TEX = 64;

const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const txt = (g, t, x, y, c, tam = 8) => { g.font = `bold ${tam}px monospace`; g.textBaseline = 'top'; g.fillStyle = c; g.fillText(t, x, y); };
const ruido = (g, r, n, cor, x0 = 0, y0 = 0, w = TEX, h = TEX) => { for (let i = 0; i < n; i++) R(g, cor, x0 + Math.floor(r() * w), y0 + Math.floor(r() * h), 1, 1); };
const rebites = (g, cor, pts) => pts.forEach(([x, y]) => { R(g, cor, x, y, 2, 2); R(g, 'rgba(255,255,255,.35)', x, y, 1, 1); });

function pintar(fn) {
  const c = document.createElement('canvas');
  c.width = c.height = TEX;
  const g = c.getContext('2d');
  fn(g);
  return g.getImageData(0, 0, TEX, TEX).data;
}

// 1 · painel metálico do casco, com rebites, sulcos e manchas de ferrugem
const metal = (segredo) => () => pintar((g) => {
  const r = rng(segredo ? 19 : 17);
  R(g, '#4a525c', 0, 0, TEX, TEX);
  for (let y = 0; y < TEX; y += 32) for (let x = 0; x < TEX; x += 32) {
    R(g, '#59626e', x + 1, y + 1, 30, 30); R(g, '#3a414a', x, y, 32, 1); R(g, '#3a414a', x, y, 1, 32);
    R(g, 'rgba(255,255,255,.12)', x + 1, y + 1, 30, 1); R(g, 'rgba(0,0,0,.25)', x + 1, y + 30, 30, 1);
    rebites(g, '#2e343b', [[x + 3, y + 3], [x + 27, y + 3], [x + 3, y + 27], [x + 27, y + 27]]);
  }
  ruido(g, r, 80, 'rgba(0,0,0,.18)'); ruido(g, r, 30, 'rgba(160,90,40,.35)', 0, 30, TEX, 34);
  R(g, '#e0a800', 0, 56, TEX, 3); for (let x = 0; x < TEX; x += 8) R(g, '#15151a', x, 56, 4, 3);
  if (segredo) { R(g, 'rgba(0,0,0,.45)', 31, 4, 1, 50); R(g, 'rgba(255,255,255,.1)', 32, 4, 1, 50); } // fresta quase invisível
});

// 2 · parede tecnológica com telas e luzes de status
const tech = () => pintar((g) => {
  const r = rng(23);
  R(g, '#262d38', 0, 0, TEX, TEX); R(g, '#1a2029', 0, 0, TEX, 3); R(g, '#1a2029', 0, 61, TEX, 3);
  [[4, 8], [36, 8], [4, 34], [36, 34]].forEach(([x, y]) => {
    R(g, '#0f141b', x, y, 24, 20); R(g, '#0b3b2a', x + 2, y + 2, 20, 16);
    for (let i = 0; i < 5; i++) { const h = 3 + Math.floor(r() * 10); R(g, '#35ff9a', x + 3 + i * 4, y + 17 - h, 3, h); }
    R(g, 'rgba(255,255,255,.12)', x + 2, y + 2, 20, 4);
  });
  for (let i = 0; i < 8; i++) R(g, ['#ff3b3b', '#35ff9a', '#ffd23b'][i % 3], 4 + i * 7, 56, 3, 3);
  ruido(g, r, 40, 'rgba(255,255,255,.06)');
});

// 3 · parede orgânica da colmeia: carne, veias e umidade
const organica = () => pintar((g) => {
  const r = rng(31);
  R(g, '#4a1420', 0, 0, TEX, TEX);
  for (let i = 0; i < 90; i++) R(g, ['#6a1d2c', '#37101a', '#7c2a38', '#2b0c14'][Math.floor(r() * 4)], Math.floor(r() * 60), Math.floor(r() * 60), 3 + Math.floor(r() * 7), 3 + Math.floor(r() * 7));
  for (let v = 0; v < 3; v++) { let x = 6 + v * 22 + Math.floor(r() * 8); for (let y = 0; y < TEX; y++) { x += Math.floor(r() * 3) - 1; R(g, '#a02a40', x, y, 2, 1); R(g, '#d6455c', x, y, 1, 1); } }
  for (let i = 0; i < 6; i++) { const x = Math.floor(r() * 56), y = Math.floor(r() * 56); R(g, '#d99a6c', x, y, 5, 5); R(g, '#f3d7b0', x + 1, y + 1, 2, 2); R(g, '#1a0509', x + 2, y + 2, 1, 1); }
  ruido(g, r, 60, 'rgba(255,120,140,.25)');
});

// 4 · contêiner de carga com listras
const container = () => pintar((g) => {
  R(g, '#2f5f8f', 0, 0, TEX, TEX);
  for (let x = 3; x < TEX; x += 6) { R(g, '#3d77ae', x, 4, 3, 56); R(g, '#244a70', x + 3, 4, 1, 56); }
  R(g, '#1c3a5a', 0, 0, TEX, 4); R(g, '#1c3a5a', 0, 60, TEX, 4); R(g, '#1c3a5a', 0, 0, 4, TEX); R(g, '#1c3a5a', 60, 0, 4, TEX);
  R(g, '#e8e8e8', 12, 22, 40, 14); txt(g, 'ÔMEGA-07', 14, 25, '#222', 8); R(g, '#d32f2f', 12, 38, 40, 3);
  rebites(g, '#0f2236', [[6, 6], [56, 6], [6, 56], [56, 56]]);
});

// 5 · porta de eclusa
const eclusa = () => pintar((g) => {
  R(g, '#6e7885', 0, 0, TEX, TEX); R(g, '#3b434d', 0, 0, TEX, 3); R(g, '#3b434d', 0, 61, TEX, 3); R(g, '#3b434d', 0, 0, 3, TEX); R(g, '#3b434d', 61, 0, 3, TEX);
  R(g, '#2c333b', 30, 3, 4, 58);
  [[6, 8], [37, 8]].forEach(([x, y]) => { R(g, '#0d1f2b', x, y, 21, 16); R(g, '#1ea7d6', x + 1, y + 1, 19, 14); R(g, 'rgba(255,255,255,.35)', x + 3, y + 2, 3, 12); });
  for (let x = 3; x < 61; x += 10) { R(g, '#e0a800', x, 46, 5, 12); R(g, '#15151a', x + 5, 46, 5, 12); }
  R(g, '#35ff9a', 27, 28, 2, 4); R(g, '#35ff9a', 35, 28, 2, 4);
});

// 6 · tanque de contenção com criatura
const tanque = () => pintar((g) => {
  const r = rng(41);
  R(g, '#2a323d', 0, 0, TEX, TEX); R(g, '#0b2a1c', 6, 5, 52, 54);
  for (let y = 5; y < 59; y++) R(g, `rgba(${20 + y},${160 - y},${90},0.55)`, 6, y, 52, 1);
  for (let i = 0; i < 16; i++) { const x = 8 + Math.floor(r() * 46), y = 8 + Math.floor(r() * 46); R(g, 'rgba(200,255,220,.6)', x, y, 2, 2); }
  R(g, '#10150f', 24, 22, 16, 22); R(g, '#1a2a18', 26, 24, 12, 18); R(g, '#ff3b3b', 28, 28, 3, 3); R(g, '#ff3b3b', 34, 28, 3, 3);
  for (let t = 0; t < 4; t++) R(g, '#10150f', 22 + t * 6, 44, 3, 12);
  R(g, 'rgba(255,255,255,.22)', 10, 6, 5, 50); R(g, '#12161c', 0, 0, TEX, 5); R(g, '#12161c', 0, 59, TEX, 5);
});

const portaCartao = (c1, c2, rotulo, cor) => () => pintar((g) => {
  R(g, c1, 0, 0, TEX, TEX); R(g, c2, 4, 4, 56, 56); R(g, c1, 8, 8, 48, 48);
  R(g, 'rgba(0,0,0,.3)', 0, 0, 3, TEX); R(g, 'rgba(255,255,255,.2)', 61, 0, 3, TEX);
  for (let x = 8; x < 56; x += 8) { R(g, '#15151a', x, 8, 4, 6); R(g, '#15151a', x + 4, 50, 4, 6); }
  R(g, '#0b0b10', 8, 20, 48, 14); txt(g, rotulo, 32 - rotulo.length * 2.5, 23, cor, 8);
  R(g, '#0b0b10', 24, 38, 16, 8); R(g, cor, 26, 40, 12, 2); R(g, cor, 26, 43, 6, 1); // leitor de cartão
});

const saida = () => pintar((g) => {
  R(g, '#10381f', 0, 0, TEX, TEX); R(g, '#1f9a4a', 4, 4, 56, 56); R(g, '#10381f', 8, 8, 48, 48);
  R(g, '#0b0b10', 10, 12, 44, 14); txt(g, 'ELEVADOR', 12, 15, '#7dff9a', 8);
  R(g, '#7dff9a', 16, 36, 32, 4); R(g, '#7dff9a', 28, 30, 8, 16); R(g, '#10381f', 31, 33, 2, 10);
  for (let i = 0; i < 3; i++) R(g, '#7dff9a', 12 + i * 20, 50, 12, 3);
});

// 12 · terminal (cinza-esverdeado, para ser fácil de achar)
const terminal = () => pintar((g) => {
  const r = rng(53);
  R(g, '#5d7468', 0, 0, TEX, TEX); R(g, '#8fb0a0', 0, 0, TEX, 3); R(g, '#3f5248', 0, 61, TEX, 3);
  R(g, '#1b2a24', 6, 6, 52, 34); R(g, '#0b3a2a', 8, 8, 48, 30);
  for (let i = 0; i < 6; i++) R(g, '#9dffd0', 11, 11 + i * 4, 8 + Math.floor(r() * 30), 2);
  R(g, '#9dffd0', 40, 30, 3, 5); R(g, 'rgba(255,255,255,.14)', 8, 8, 48, 6);
  R(g, '#1b2a24', 6, 44, 52, 14);
  for (let i = 0; i < 9; i++) { R(g, '#7f9a8c', 9 + i * 5, 47, 4, 3); R(g, '#7f9a8c', 9 + i * 5, 52, 4, 3); }
  txt(g, 'USAR [E]', 14, 40, '#d8fff0', 6);
});

// 15 · máquina da loja (modo Horda)
const loja = () => pintar((g) => {
  R(g, '#3b2f12', 0, 0, TEX, TEX); R(g, '#e0a800', 0, 0, TEX, 3); R(g, '#e0a800', 0, 61, TEX, 3);
  R(g, '#15110a', 6, 6, 52, 34); R(g, '#2a1f05', 8, 8, 48, 30); txt(g, 'LOJA', 18, 12, '#ffd23b', 10);
  for (let i = 0; i < 4; i++) R(g, '#ffd23b', 12, 24 + i * 4, 10 + i * 8, 2);
  R(g, '#15110a', 6, 44, 52, 14); R(g, '#ffd23b', 10, 48, 10, 6); R(g, '#35ff9a', 24, 48, 10, 6); R(g, '#ff6a3b', 38, 48, 10, 6);
});

// 13 · estação médica
const medica = () => pintar((g) => {
  R(g, '#d8dde2', 0, 0, TEX, TEX); R(g, '#9aa3ab', 0, 0, TEX, 3); R(g, '#9aa3ab', 0, 61, TEX, 3);
  R(g, '#e53935', 24, 8, 16, 40); R(g, '#e53935', 12, 20, 40, 16); R(g, '#fff', 28, 12, 8, 32); R(g, '#fff', 16, 24, 32, 8);
  R(g, '#12171d', 8, 50, 48, 10); R(g, '#35ff9a', 10, 52, 22, 6); txt(g, '+HP', 36, 52, '#9ffbd0', 6);
  R(g, 'rgba(0,0,0,.12)', 0, 0, 3, TEX);
});

// 14 · portão blindado (abre por terminal)
const blindada = () => pintar((g) => {
  R(g, '#3a3f47', 0, 0, TEX, TEX); R(g, '#23272d', 0, 0, TEX, 4); R(g, '#23272d', 0, 60, TEX, 4); R(g, '#23272d', 30, 0, 4, TEX);
  for (let y = 8; y < 56; y += 12) { R(g, '#4f555e', 6, y, 20, 8); R(g, '#4f555e', 38, y, 20, 8); }
  for (let i = 0; i < 64; i += 16) { R(g, '#e0a800', i, 56, 8, 4); R(g, '#15151a', i + 8, 56, 8, 4); }
  R(g, '#ff2b2b', 29, 26, 6, 8); txt(g, 'LACRADO', 6, 2, '#ff6b6b', 6);
});

// ---------------- chão e teto de cada ambiente
const chaoGrade = (c1, c2) => () => pintar((g) => {
  const r = rng(3);
  R(g, c1, 0, 0, TEX, TEX);
  for (let i = 0; i < TEX; i += 8) { R(g, c2, i, 0, 1, TEX); R(g, c2, 0, i, TEX, 1); }
  for (let y = 4; y < TEX; y += 16) for (let x = 4; x < TEX; x += 16) { R(g, 'rgba(0,0,0,.3)', x, y, 6, 6); }
  ruido(g, r, 120, 'rgba(0,0,0,.15)'); ruido(g, r, 40, 'rgba(255,255,255,.07)');
  R(g, '#e0a800', 0, 30, TEX, 2); R(g, '#15151a', 0, 32, TEX, 1);
});
const chaoOrg = () => pintar((g) => {
  const r = rng(9);
  R(g, '#2b0c14', 0, 0, TEX, TEX);
  for (let i = 0; i < 70; i++) R(g, ['#4a1420', '#37101a', '#5c1d2b'][Math.floor(r() * 3)], Math.floor(r() * 58), Math.floor(r() * 58), 4 + Math.floor(r() * 8), 4 + Math.floor(r() * 8));
  for (let i = 0; i < 8; i++) { const x = Math.floor(r() * 56), y = Math.floor(r() * 56); R(g, '#7a2236', x, y, 6, 2); }
  ruido(g, r, 80, 'rgba(255,90,110,.25)');
});
const tetoLuz = (corLuz) => () => pintar((g) => {
  R(g, '#1b2028', 0, 0, TEX, TEX); R(g, '#12161c', 0, 0, TEX, 2); R(g, '#12161c', 0, 0, 2, TEX);
  R(g, '#2a303a', 8, 8, 48, 4); R(g, '#2a303a', 8, 52, 48, 4);
  R(g, '#0c0f13', 10, 22, 44, 20); R(g, corLuz, 12, 24, 40, 16); R(g, 'rgba(255,255,255,.55)', 14, 26, 36, 4);
});
const tetoOrg = () => pintar((g) => {
  const r = rng(13);
  R(g, '#1f080f', 0, 0, TEX, TEX);
  for (let i = 0; i < 40; i++) R(g, '#3a1019', Math.floor(r() * 58), Math.floor(r() * 58), 6, 6);
  R(g, '#ff9a3b', 28, 28, 6, 6); R(g, '#ffd27f', 30, 30, 2, 2); // bolsa luminosa
});
const acido = () => pintar((g) => {
  const r = rng(61);
  R(g, '#17702a', 0, 0, TEX, TEX);
  for (let i = 0; i < 60; i++) R(g, ['#2fd957', '#1f9c3d', '#9dff7a'][Math.floor(r() * 3)], Math.floor(r() * 60), Math.floor(r() * 60), 3 + Math.floor(r() * 6), 2 + Math.floor(r() * 3));
  ruido(g, r, 40, 'rgba(255,255,255,.4)');
});

export function gerarTexturas() {
  return {
    paredes: {
      1: metal(false)(), 2: tech(), 3: organica(), 4: container(), 5: eclusa(), 6: tanque(),
      7: portaCartao('#8c1414', '#d93a3a', 'CARTÃO', '#ff9a9a')(),
      8: portaCartao('#14307a', '#3f6fe0', 'CARTÃO', '#9cf')(),
      9: saida(),
      10: portaCartao('#8a6a00', '#e0b020', 'CARTÃO', '#ffe27a')(),
      11: metal(true)(), 12: terminal(), 13: medica(), 14: blindada(), 15: loja(),
    },
    acido: acido(),
    temas: {
      1: { chao: chaoGrade('#3a424d', '#272d36')(), teto: tetoLuz('#cfe6ff')(), fog: [8, 12, 20] },
      2: { chao: chaoGrade('#40504a', '#29352f')(), teto: tetoLuz('#b6ffd0')(), fog: [4, 20, 14] },
      3: { chao: chaoOrg(), teto: tetoOrg(), fog: [26, 4, 8] },
      4: { chao: chaoGrade('#343a46', '#232832')(), teto: tetoLuz('#ffd0b0')(), fog: [10, 8, 22] },
    },
  };
}
