// Mapas da Estação Ômega, montados por código (salas escavadas num bloco de parede).
// Paredes: 1 metal · 2 tecnologia · 3 orgânica · 4 container · 5 eclusa · 6 tanque · 7/8/10 porta cartão vermelho/azul/amarelo
// 9 saída · 11 porta secreta · 12 terminal · 13 estação médica · 14 porta lacrada (terminal abre)
export const MW = 40;
export const MH = 32;
const TRANCA = { 5: null, 7: 'vermelha', 8: 'azul', 10: 'amarela', 9: 'saida', 11: 'secreta', 14: 'lacre' };

// O labirinto é dividido em 5 zonas de mapa: 4 quadrantes + centro (cada fragmento revela uma)
export const zonaDe = (x, y) => (x >= 13 && x <= 26 && y >= 9 && y <= 22 ? 4 : (y < 16 ? 0 : 2) + (x < 20 ? 0 : 1));
export const NOMES_FASE = ['', 'Hangar 7', 'Laboratório Colmeia', 'Os Dutos', 'Núcleo Ômega'];

function construtor() {
  const g = Array.from({ length: MH }, () => Array(MW).fill(1));
  const perigo = new Uint8Array(MW * MH);
  const fill = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; };
  const sala = (x0, y0, x1, y1, parede) => { fill(x0 - 1, y0 - 1, x1 + 1, y1 + 1, parede); fill(x0, y0, x1, y1, 0); };
  const acido = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) perigo[y * MW + x] = 1; };
  const octo = (x0, y0, x1, y1, c) => { [[x0, y0, 1, 1], [x1 - 1, y0, 1, 1], [x0, y1 - 1, 1, 1], [x1 - 1, y1 - 1, 1, 1]].forEach(([x, y]) => fill(x, y, x + 1, y + 1, c)); };
  return { g, perigo, fill, sala, acido, octo };
}

function finalizar(b, extra) {
  // realoca para a célula livre mais próxima tudo que caiu dentro de uma parede (cantos cortados, pilares)
  const livreEm = (x, y) => b.g[y] && b.g[y][x] === 0;
  const perto = (x, y) => {
    if (livreEm(x, y)) return [x, y];
    for (let r = 1; r < 5; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && livreEm(x + dx, y + dy)) return [x + dx, y + dy];
    return [x, y];
  };
  if (!extra.ruido && extra.nome !== 'Arena Ômega') { // suprimentos mais escassos: some 1 de cada 3 caixas de munição/kits
    let c = 0;
    extra.itens = extra.itens.filter(([t]) => !/^(balas|cartuchos|celulas|plasma|trilhos|kit)$/.test(t) || (c++ % 3 !== 2));
  }
  extra.itens = extra.itens.map(([t, x, y]) => [t, ...perto(x, y)]);
  extra.inimigos = extra.inimigos.map(([t, x, y]) => [t, ...perto(x, y)]);
  extra.gatilhos = extra.gatilhos.map((g) => ({ ...g, spawns: g.spawns.map(([t, x, y]) => [t, ...perto(x, y)]) }));
  extra.teleportes = extra.teleportes.map((t) => { const [a, c] = perto(t.x, t.y); const [d, e] = perto(t.dx, t.dy); return { x: a, y: c, dx: d, dy: e }; });

  const grade = new Uint8Array(MW * MH);
  const portas = {};
  const terminais = {};
  const estacoes = {};
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const v = b.g[y][x];
      grade[y * MW + x] = v;
      if (TRANCA[v] !== undefined) portas[y * MW + x] = { x, y, tipo: v, aberta: 0, alvo: 0, tranca: TRANCA[v], aviso: 0, liberada: false, fixa: false };
      if (v === 12) terminais[y * MW + x] = { x, y, usado: false };
      if (v === 13) estacoes[y * MW + x] = { x, y, cargas: 3 };
    }
  }
  return { grade, portas, terminais, estacoes, perigo: b.perigo, ...extra };
}

function fase1() {
  const b = construtor();
  const { g, sala, fill, acido, octo } = b;
  sala(2, 24, 15, 29, 1);
  sala(17, 28, 18, 29, 1);
  sala(20, 22, 37, 29, 2);
  sala(26, 8, 37, 15, 3);
  sala(2, 14, 15, 21, 2);
  sala(18, 14, 24, 20, 4);
  sala(2, 2, 19, 8, 1);
  sala(23, 2, 37, 6, 3);
  octo(2, 24, 15, 29, 1);
  octo(20, 22, 37, 29, 2);
  octo(2, 14, 15, 21, 2);
  octo(2, 2, 19, 8, 1);
  octo(23, 2, 37, 6, 3);
  [[8, 26], [8, 27], [12, 25], [12, 28], [5, 28]].forEach(([x, y]) => { g[y][x] = 4; });
  fill(16, 26, 19, 26, 0);
  g[26][16] = 5;
  g[27][18] = 11;
  acido(27, 24, 32, 27);
  [[22, 24], [22, 27], [24, 25], [24, 28]].forEach(([x, y]) => { g[y][x] = 4; });
  fill(35, 16, 35, 21, 0);
  g[21][35] = 5;
  fill(8, 22, 8, 23, 0);
  g[23][8] = 5;
  g[13][5] = 12;
  g[13][13] = 13;
  g[22][12] = 13;
  fill(16, 17, 17, 17, 0);
  g[17][16] = 14;
  fill(8, 9, 8, 13, 0);
  g[13][8] = 7;
  [[6, 4], [6, 6], [12, 4], [12, 6], [16, 3]].forEach(([x, y]) => { g[y][x] = 2; });
  fill(20, 4, 22, 4, 0);
  g[4][20] = 8;
  acido(28, 4, 32, 4);
  g[4][38] = 9;

  const inimigos = [
    ['rastejador', 6, 26], ['rastejador', 11, 27], ['infectado', 13, 25],
    ['rastejador', 23, 23], ['infectado', 22, 26], ['cuspidor', 34, 24], ['rastejador', 25, 28], ['infectado', 35, 28], ['cuspidor', 31, 22],
    ['barril', 21, 23], ['barril', 36, 23], ['barril', 9, 18],
    ['rastejador', 5, 16], ['infectado', 10, 17], ['rastejador', 13, 19], ['cuspidor', 4, 20], ['inchado', 11, 15],
    ['inchado', 20, 16], ['infectado', 22, 19], ['cuspidor', 19, 18], ['rastejador', 23, 16],
    ['rastejador', 28, 10], ['rastejador', 33, 12], ['cuspidor', 31, 9], ['infectado', 35, 14], ['inchado', 29, 14],
    ['infectado', 4, 4], ['cuspidor', 9, 3], ['rastejador', 15, 7], ['inchado', 17, 5], ['bruto', 11, 6], ['drone', 14, 4],
    ['matriarca', 31, 3], ['rastejador', 25, 3], ['rastejador', 36, 5],
  ];
  const itens = [
    ['balas', 5, 25], ['kit', 3, 28], ['balas', 14, 28],
    ['arma_escopeta', 33, 29], ['cartuchos', 21, 28], ['kit', 36, 22], ['balas', 22, 22],
    ['escudo', 18, 29], ['kitG', 17, 29], ['plasma', 18, 28],
    ['cartao_vermelho', 36, 9], ['cartuchos', 27, 14], ['kit', 37, 14], ['balas', 32, 15],
    ['kit', 6, 20], ['cartuchos', 14, 20], ['balas', 3, 15],
    ['arma_pulso', 21, 17], ['celulas', 19, 15], ['celulas', 23, 19], ['cartao_azul', 23, 15], ['kitG', 19, 19],
    ['kit', 3, 7], ['cartuchos', 18, 7], ['celulas', 4, 3], ['balas', 8, 7], ['escudo', 2, 8],
    ['kit', 24, 5], ['celulas', 35, 3], ['kit', 24, 2],
  ];
  const gatilhos = [
    { x: 31, y: 12, r: 2.6, msg: 'ALERTA: o ninho acordou!', spawns: [['rastejador', 28, 9], ['rastejador', 34, 9], ['rastejador', 27, 13], ['cuspidor', 35, 10]] },
    { x: 5, y: 6, r: 2, msg: 'Eles saíram das paredes!', spawns: [['rastejador', 3, 3], ['rastejador', 3, 7], ['rastejador', 10, 3]] },
  ];
  return finalizar(b, {
    tema: 1, nome: NOMES_FASE[1], inicio: { x: 4.5, y: 26.5, ang: 0 }, chefe: 'matriarca', inimigos, itens, gatilhos, teleportes: [],
    terminalAbre: 'lacre', objetivo: 'Ache os cartões, abra o arsenal e elimine a Matriarca.',
  });
}

function fase2() {
  const b = construtor();
  const { g, sala, fill, acido, octo } = b;
  sala(2, 25, 12, 29, 2);
  sala(2, 15, 22, 22, 2);
  sala(16, 29, 21, 30, 1);
  sala(26, 24, 37, 29, 6);
  sala(26, 15, 37, 22, 1);
  sala(26, 3, 37, 12, 3);
  sala(2, 3, 14, 11, 2);
  sala(16, 3, 24, 11, 6);
  octo(2, 25, 12, 29, 2);
  octo(2, 15, 22, 22, 2);
  octo(26, 24, 37, 29, 6);
  octo(26, 15, 37, 22, 1);
  octo(26, 3, 37, 12, 3);
  octo(2, 3, 14, 11, 2);
  [[6, 27], [8, 26], [8, 28]].forEach(([x, y]) => { g[y][x] = 6; });
  fill(7, 23, 7, 24, 0);
  g[24][7] = 5;
  [[6, 18], [10, 18], [14, 18], [18, 18], [10, 21], [18, 21]].forEach(([x, y]) => { g[y][x] = 6; });
  g[14][4] = 13;
  g[23][18] = 13;
  fill(13, 27, 25, 27, 0);
  g[27][13] = 5;
  g[28][18] = 11;
  acido(29, 25, 34, 28);
  fill(31, 23, 31, 23, 0);
  g[23][31] = 5;
  fill(31, 13, 31, 14, 0);
  g[14][31] = 10;
  acido(30, 6, 33, 9);
  fill(8, 12, 8, 14, 0);
  g[14][8] = 8;
  g[2][5] = 12;
  g[2][10] = 13;
  [[5, 6], [8, 6], [5, 9], [11, 9]].forEach(([x, y]) => { g[y][x] = 2; });
  fill(15, 7, 15, 7, 0);
  g[7][15] = 14;
  g[2][20] = 9;

  const inimigos = [
    ['infectado', 8, 27], ['rastejador', 5, 26], ['rastejador', 10, 28],
    ['cuspidor', 6, 17], ['inchado', 9, 20], ['infectado', 13, 16], ['sentinela', 17, 20], ['rastejador', 20, 17], ['drone', 21, 21], ['barril', 12, 19],
    ['cuspidor', 30, 24], ['cuspidor', 35, 26], ['sentinela', 28, 29], ['drone', 33, 24], ['inchado', 36, 29], ['rastejador', 27, 25],
    ['bruto', 29, 17], ['bruto', 34, 20], ['barril', 28, 16], ['barril', 29, 16], ['barril', 33, 19], ['barril', 35, 17], ['infectado', 36, 16], ['drone', 31, 21],
    ['sentinela', 28, 5], ['cuspidor', 35, 5], ['bruto', 28, 10], ['inchado', 34, 11], ['rastejador', 31, 4], ['drone', 36, 9], ['infectado', 33, 10],
    ['infectado', 4, 5], ['sentinela', 11, 4], ['cuspidor', 6, 9], ['drone', 12, 8], ['bruto', 9, 7], ['inchado', 3, 10],
    ['colosso', 20, 6], ['drone', 17, 4], ['drone', 23, 9],
  ];
  const itens = [
    ['balas', 4, 26], ['kit', 3, 29], ['cartuchos', 11, 29],
    ['celulas', 5, 16], ['kit', 20, 22], ['cartuchos', 16, 16], ['celulas', 12, 22], ['plasma', 21, 16], ['kitG', 3, 21],
    ['plasma', 17, 30], ['escudo', 19, 30], ['trilhos', 20, 29], ['celulas', 16, 30],
    ['cartao_amarelo', 36, 25], ['celulas', 27, 28], ['kit', 27, 24], ['cartuchos', 36, 24], ['balas', 36, 28],
    ['kit', 27, 19], ['celulas', 36, 22], ['plasma', 27, 21], ['kitG', 37, 15], ['cartuchos', 35, 16],
    ['arma_plasma', 27, 4], ['cartao_azul', 27, 11], ['kit', 36, 11], ['plasma', 37, 8], ['trilhos', 29, 3],
    ['kit', 3, 4], ['celulas', 13, 4], ['cartuchos', 3, 9], ['escudo', 13, 10],
    ['kitG', 17, 10], ['plasma', 22, 4], ['celulas', 17, 3], ['trilhos', 23, 10],
  ];
  const gatilhos = [
    { x: 31, y: 18, r: 2.5, msg: 'Armadilha! Os drones estavam escondidos.', spawns: [['drone', 27, 16], ['drone', 36, 16], ['sentinela', 31, 21]] },
    { x: 20, y: 9, r: 3, msg: 'O Colosso despertou!', spawns: [['rastejador', 17, 10], ['rastejador', 23, 10]] },
  ];
  const teleportes = [
    { x: 36, y: 28, dx: 21, dy: 16 }, { x: 21, y: 16, dx: 36, dy: 28 },
  ];
  return finalizar(b, {
    tema: 2, nome: NOMES_FASE[2], inicio: { x: 4.5, y: 27.5, ang: 0 }, chefe: 'colosso', inimigos, itens, gatilhos, teleportes,
    terminalAbre: 'lacre', objetivo: 'Cartões amarelo e azul, o terminal de controle e o Colosso.',
  });
}


function fase3() {
  const b = construtor();
  const { g, perigo } = b;
  let sd = 20251108;
  const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
  const CW = 19; const CH = 15;
  const bloq = (cx, cy) => 1 + 2 * cx >= 32 && 1 + 2 * cy >= 24; // cofre da saída
  const vis = new Set();
  const key = (cx, cy) => cy * CW + cx;
  const abre = (cx, cy) => { g[1 + 2 * cy][1 + 2 * cx] = 0; };
  const pilha = [[0, 0]]; vis.add(0); abre(0, 0);
  while (pilha.length) {
    const [cx, cy] = pilha[pilha.length - 1];
    const viz = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, c]) => [cx + a, cy + c, a, c])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < CW && y < CH && !vis.has(key(x, y)) && !bloq(x, y));
    if (!viz.length) { pilha.pop(); continue; }
    const [nx, ny, a, c] = viz[Math.floor(rnd() * viz.length)];
    vis.add(key(nx, ny)); abre(nx, ny); g[1 + 2 * cy + c][1 + 2 * cx + a] = 0;
    pilha.push([nx, ny]);
  }
  // tira paredes extras para criar ciclos (mais confuso)
  for (let i = 0; i < 70; i++) {
    const cx = Math.floor(rnd() * (CW - 1)); const cy = Math.floor(rnd() * (CH - 1));
    if (bloq(cx, cy) || bloq(cx + 1, cy + 1)) continue;
    if (rnd() < 0.5 && !bloq(cx + 1, cy)) g[1 + 2 * cy][2 + 2 * cx] = 0; else if (!bloq(cx, cy + 1)) g[2 + 2 * cy][1 + 2 * cx] = 0;
  }
  // câmaras abertas
  [[4, 3], [14, 3], [9, 7], [3, 11], [13, 10], [9, 12]].forEach(([cx, cy]) => {
    for (let y = 2 * cy - 1; y <= 2 * cy + 3; y++) for (let x = 2 * cx - 1; x <= 2 * cx + 3; x++) if (x > 0 && y > 0 && x < 31 && y < 31) g[y][x] = 0;
  });
  // cofre da saída: três portas em série
  b.fill(32, 24, 37, 30, 1); b.fill(32, 27, 37, 27, 0);
  g[27][32] = 7; g[27][34] = 8; g[27][36] = 10; g[27][38] = 9;
  g[26][31] = 0; // garante ligação
  // paredes variadas por região
  const tipos = [1, 2, 4, 3, 6];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (g[y][x] === 1) g[y][x] = tipos[(((x >> 2) * 7 + (y >> 2) * 3) ^ (x >> 3)) % 5];
  // cofre usa metal
  // distâncias para posicionar cartões nos becos mais distantes
  const aberto = (x, y) => g[y][x] === 0;
  const dist = new Map(); const q = [[1, 1]]; dist.set(1 * MW + 1, 0);
  while (q.length) {
    const [x, y] = q.shift(); const d = dist.get(y * MW + x);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, c]) => {
      const nx = x + a; const ny = y + c;
      if (nx > 0 && ny > 0 && nx < 39 && ny < 31 && aberto(nx, ny) && !dist.has(ny * MW + nx)) { dist.set(ny * MW + nx, d + 1); q.push([nx, ny]); }
    });
  }
  const celulas = [...dist.entries()].map(([k, d]) => ({ x: k % MW, y: Math.floor(k / MW), d }));
  const becos = celulas.filter((c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, c2]) => aberto(c.x + a, c.y + c2)).length === 1 && c.d > 20);
  becos.sort((u, v) => v.d - u.d);
  const longe = (c, lista, m) => lista.every((o) => Math.hypot(o.x - c.x, o.y - c.y) > m);
  const esc = []; for (const c of becos) { if (esc.length < 3 && longe(c, esc, 12)) esc.push(c); }
  const itens = [['cartao_vermelho', esc[0].x, esc[0].y], ['cartao_azul', esc[1].x, esc[1].y], ['cartao_amarelo', esc[2].x, esc[2].y]];
  const usados = new Set(esc.map((c) => c.y * MW + c.x));
  const escolher = (n, minD, minSep) => { const r = []; const base = celulas.filter((c) => c.d >= minD && !usados.has(c.y * MW + c.x)); let t = 0; while (r.length < n && t++ < 4000) { const c = base[Math.floor(rnd() * base.length)]; if (c && longe(c, r, minSep)) { r.push(c); usados.add(c.y * MW + c.x); } } return r; };
  for (let z = 0; z < 5; z++) { // um fragmento de mapa por zona
    const cand = celulas.filter((c) => zonaDe(c.x, c.y) === z && c.d >= 4 && !usados.has(c.y * MW + c.x) && !(c.x >= 31 && c.y >= 24));
    const c = cand[Math.floor(rnd() * cand.length)];
    if (c) { itens.push(['fragmento', c.x, c.y]); usados.add(c.y * MW + c.x); }
  }
  const suprimentos = ['balas', 'kit', 'cartuchos', 'celulas', 'kit', 'plasma', 'kitG', 'escudo', 'cartuchos', 'balas', 'celulas', 'kit', 'trilhos', 'kit', 'kit', 'kitG', 'kit', 'escudo', 'kit', 'kitG'];
  escolher(suprimentos.length, 6, 5).forEach((c, i) => itens.push([suprimentos[i], c.x, c.y]));
  itens.push(['arma_pulso', 3, 3], ['kit', 1, 3]);
  const tp = escolher(4, 15, 16);
  const teleportes = [{ x: tp[0].x, y: tp[0].y, dx: tp[1].x, dy: tp[1].y }, { x: tp[1].x, y: tp[1].y, dx: tp[0].x, dy: tp[0].y }, { x: tp[2].x, y: tp[2].y, dx: tp[3].x, dy: tp[3].y }, { x: tp[3].x, y: tp[3].y, dx: tp[2].x, dy: tp[2].y }];
  // estações médicas nas paredes ao lado de corredores
  escolher(3, 12, 14).forEach((c) => { for (const [a, d] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const wx = c.x + a; const wy = c.y + d; if (wx > 0 && wy > 0 && wx < 38 && wy < 30 && g[wy][wx] !== 0 && g[wy][wx] < 7 && !(wx >= 32 && wy >= 24)) { g[wy][wx] = 13; break; } } });
  const tipoIni = ['rastejador', 'rastejador', 'infectado', 'cuspidor', 'drone', 'inchado', 'sentinela', 'bruto', 'rastejador', 'drone'];
  const inimigos = escolher(46, 9, 3.2).map((c, i) => [tipoIni[i % tipoIni.length], c.x, c.y]);
  inimigos.push(['barril', 7, 7], ['barril', 19, 11], ['barril', 27, 5], ['barril', 15, 21], ['bruto', 29, 27]);
  const ok = (x, y) => g[y][x] === 0;
  const filtrados = inimigos.filter(([, x, y]) => ok(x, y));
  const gatilhos = [];
  return finalizar(b, {
    tema: 4, nome: NOMES_FASE[3], inicio: { x: 1.5, y: 1.5, ang: Math.PI / 2 }, chefe: null, inimigos: filtrados, itens: itens.filter(([, x, y]) => ok(x, y)), gatilhos, teleportes,
    terminalAbre: null, ruido: true, objetivo: 'Labirinto! O mapa está cheio de interferência. Ache 3 cartões nos becos e fuja pelo cofre.',
  });
}

function fase4() {
  const b = construtor();
  const { g, sala, fill, acido, octo } = b;
  sala(2, 26, 10, 29, 1);
  sala(17, 24, 28, 29, 4);
  sala(31, 25, 35, 29, 1);
  sala(14, 12, 29, 19, 3);
  sala(2, 12, 10, 21, 2);
  sala(32, 12, 37, 22, 6);
  sala(32, 3, 37, 8, 4);
  sala(14, 3, 29, 8, 3);
  sala(2, 3, 10, 9, 3);
  octo(17, 24, 28, 29, 4);
  octo(14, 12, 29, 19, 3);
  octo(2, 12, 10, 21, 2);
  octo(14, 3, 29, 8, 3);
  octo(2, 3, 10, 9, 3);
  fill(11, 27, 16, 27, 0);
  g[27][11] = 5;
  fill(6, 22, 6, 25, 0);
  g[25][6] = 5;
  acido(20, 26, 25, 27);
  g[23][19] = 13;
  fill(29, 27, 30, 27, 0);
  g[27][29] = 11;
  fill(22, 20, 22, 23, 0);
  g[23][22] = 5;
  [[18, 14], [18, 17], [25, 14], [25, 17], [21, 15]].forEach(([x, y]) => { g[y][x] = 3; });
  g[11][4] = 12;
  g[11][8] = 13;
  fill(11, 15, 13, 15, 0);
  g[15][13] = 7;
  acido(33, 17, 36, 19);
  fill(30, 15, 31, 15, 0);
  g[15][30] = 8;
  fill(21, 9, 21, 11, 0);
  g[11][21] = 10;
  g[2][6] = 9;
  fill(11, 6, 13, 6, 0);
  g[6][13] = 14;
  [[5, 5], [7, 5], [5, 8], [7, 8]].forEach(([x, y]) => { g[y][x] = 6; });

  const inimigos = [
    ['rastejador', 5, 27], ['infectado', 9, 28], ['rastejador', 8, 27],
    ['sentinela', 19, 28], ['cuspidor', 27, 25], ['bruto', 24, 29], ['drone', 21, 25], ['barril', 18, 25], ['barril', 27, 28], ['inchado', 26, 29],
    ['infectado', 4, 14], ['cuspidor', 8, 18], ['sentinela', 5, 20], ['inchado', 9, 14], ['drone', 3, 17], ['bruto', 8, 20], ['barril', 6, 16],
    ['bruto', 16, 14], ['sentinela', 20, 13], ['drone', 27, 13], ['cuspidor', 15, 18], ['infectado', 28, 18], ['barril', 22, 16], ['barril', 23, 16], ['inchado', 20, 18], ['drone', 24, 18], ['rastejador', 27, 16],
    ['bruto', 34, 14], ['sentinela', 36, 13], ['cuspidor', 33, 21], ['drone', 36, 21], ['inchado', 34, 15], ['infectado', 32, 20],
    ['sentinela', 35, 5], ['drone', 33, 7],
    ['bruto', 16, 5], ['bruto', 26, 5], ['sentinela', 20, 4], ['drone', 22, 7], ['cuspidor', 15, 7], ['cuspidor', 28, 7], ['inchado', 24, 4],
    ['omega', 6, 6], ['drone', 3, 4], ['drone', 9, 4],
  ];
  const itens = [
    ['balas', 4, 28], ['kit', 3, 26], ['cartuchos', 9, 29],
    ['celulas', 18, 28], ['kit', 27, 26], ['cartuchos', 27, 29], ['cartao_vermelho', 22, 28], ['plasma', 28, 24], ['kitG', 17, 24],
    ['arma_plasma', 34, 27], ['escudo', 33, 29], ['plasma', 32, 26], ['trilhos', 35, 29], ['kitG', 34, 25],
    ['kit', 3, 20], ['celulas', 9, 21], ['cartuchos', 3, 13], ['cartao_azul', 9, 13], ['plasma', 6, 19],
    ['kit', 15, 19], ['celulas', 28, 19], ['cartuchos', 16, 16], ['plasma', 28, 13], ['kitG', 21, 19], ['balas', 15, 12],
    ['cartao_amarelo', 36, 21], ['kit', 33, 13], ['celulas', 37, 14], ['plasma', 36, 15], ['escudo', 37, 22],
    ['arma_trilho', 35, 4], ['trilhos', 33, 4], ['trilhos', 37, 7], ['kitG', 37, 3],
    ['kit', 15, 3], ['celulas', 28, 3], ['plasma', 28, 8], ['cartuchos', 15, 8], ['kitG', 21, 4], ['trilhos', 20, 8],
    ['kit', 3, 8], ['kitG', 9, 9], ['escudo', 9, 3], ['celulas', 3, 3],
  ];
  const gatilhos = [
    { x: 21, y: 5, r: 3.2, msg: 'ARMADILHA! Um enxame cerca você!', spawns: [['rastejador', 15, 4], ['rastejador', 28, 4], ['rastejador', 15, 8], ['rastejador', 28, 8], ['infectado', 21, 8]] },
    { x: 22, y: 27, r: 1.6, msg: 'Pegar o cartão acordou o arsenal!', spawns: [['rastejador', 18, 29], ['rastejador', 26, 29], ['sentinela', 20, 24]] },
    { x: 6, y: 7, r: 2.6, msg: 'ÔMEGA: "Vocês são a semente da colmeia."', spawns: [['rastejador', 3, 7], ['rastejador', 9, 7], ['infectado', 6, 4]] },
  ];
  const teleportes = [
    { x: 36, y: 13, dx: 35, dy: 5 }, { x: 36, y: 6, dx: 35, dy: 13 },
  ];
  return finalizar(b, {
    tema: 3, nome: NOMES_FASE[4], inicio: { x: 4.5, y: 27.5, ang: 0 }, chefe: 'omega', inimigos, itens, gatilhos, teleportes,
    terminalAbre: 'lacre', objetivo: 'Três cartões, o terminal e o coração da colmeia: Ômega.',
  });
}

export function criarFase(n) { return [null, fase1, fase2, fase3, fase4][n](); }

export function criarArena() {
  const b = construtor();
  const { g, sala, fill, acido, octo } = b;
  sala(2, 2, 37, 29, 2);
  [[10, 8], [10, 9], [29, 8], [29, 9], [10, 22], [10, 23], [29, 22], [29, 23], [19, 14], [20, 14], [19, 17], [20, 17]].forEach(([x, y]) => { g[y][x] = 4; });
  fill(14, 5, 25, 5, 3);
  fill(14, 26, 25, 26, 3);
  acido(3, 3, 6, 6);
  acido(33, 3, 36, 6);
  acido(3, 25, 6, 28);
  acido(33, 25, 36, 28);
  g[1][8] = 13;
  g[1][31] = 13;
  g[30][8] = 13;
  g[30][31] = 13;
  g[14][1] = 12;

  const spawns = [[4, 15], [4, 16], [35, 15], [35, 16], [20, 3], [19, 3], [20, 28], [19, 28], [8, 4], [31, 27]];
  const itens = [['kit', 12, 15], ['balas', 27, 15]];
  const teleportes = [{ x: 3, y: 14, dx: 36, dy: 17 }, { x: 36, y: 14, dx: 3, dy: 17 }];
  return finalizar(b, {
    tema: 4, nome: 'Arena Ômega', inicio: { x: 19.5, y: 15.5, ang: 0 }, chefe: null, inimigos: [['barril', 14, 12], ['barril', 25, 12], ['barril', 14, 19], ['barril', 25, 19]],
    itens, gatilhos: [], teleportes, spawns, terminalAbre: null, objetivo: 'Sobreviva.',
  });
}
