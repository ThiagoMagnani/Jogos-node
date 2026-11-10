// ===== Pistas: definição (pontos de controle) + construção geométrica =====
// Cada pista é um circuito fechado descrito por pontos de controle. Uma spline
// (Catmull-Rom) liga os pontos e depois a curva é reamostrada em amostras a
// cada ESPACO unidades. Toda a física, IA e renderização usam essas amostras.

export const ESPACO = 10; // distância entre amostras (unidades do mundo)
export const MARGEM = 90; // faixa de grama até a barreira de pneus

// Gerador pseudoaleatório com semente (cenário sempre igual para a mesma pista)
export const aleatorio = (semente) => {
  let s = semente | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const angDif = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/** Todas as pistas do campeonato (a 2ª metade do jogo adiciona mais aqui). */
export const PISTAS = {
  parque: {
    id: 'parque', nome: 'Parque Aurora', largura: 175, tema: 'parque', semente: 11,
    pontos: [[0, 0], [1400, -150], [2700, -100], [3600, 500], [3700, 1400], [3100, 2100], [2200, 2250], [1500, 1750], [800, 1650], [300, 2200], [-600, 2300], [-1300, 1700], [-1400, 800], [-800, 250]],
  },
  centro: {
    id: 'centro', nome: 'Centro Velho', largura: 155, escala: 0.86, tema: 'cidade', semente: 23,
    pontos: [[0, 0], [1300, 0], [2200, 50], [2900, 600], [2900, 1400], [2200, 1900], [1500, 1600], [1300, 1150], [950, 880], [500, 950], [-100, 1400], [-100, 2200], [600, 2800], [1800, 2900], [3000, 2900], [3800, 2400], [4000, 1400], [3900, 300], [3300, -700], [2200, -1000], [1000, -950], [-100, -850], [-850, -820], [-1119, -709], [-1230, -440], [-1119, -171], [-850, -60]],
  },
  orla: {
    id: 'orla', nome: 'Orla Marítima', largura: 185, tema: 'orla', semente: 37,
    pontos: [[0, 0], [1800, -50], [3600, -50], [4900, 300], [5400, 1100], [4900, 1900], [3900, 2000], [3200, 1500], [2500, 1300], [1900, 1700], [1950, 2300], [2100, 2800], [1750, 3220], [1000, 3380], [150, 3250], [-800, 2600], [-1100, 1600], [-700, 700]],
  },
  serra: {
    id: 'serra', nome: 'Serra do Vento', largura: 150, tema: 'serra', semente: 51,
    pontos: [[0, 0], [1100, -300], [2100, -100], [2700, 500], [3500, 700], [4100, 1300], [3700, 2000], [2800, 2100], [2300, 2700], [1500, 3000], [800, 2600], [200, 2900], [-600, 2700], [-950, 1950], [-720, 1380], [-1000, 800], [-1150, 150], [-700, -250]],
  },
};

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

/** Média móvel circular (suaviza curvatura e deslocamentos). */
function suavizar(arr, janela) {
  const n = arr.length, out = new Array(n);
  for (let i = 0; i < n; i++) {
    let soma = 0;
    for (let k = -janela; k <= janela; k++) soma += arr[(i + k + n) % n];
    out[i] = soma / (2 * janela + 1);
  }
  return out;
}

/** Curvatura com sinal (1/raio): positiva = curva para a direita (sentido horário na tela). */
function curvaturaDe(xs, ys) {
  const n = xs.length, k = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = (i - 1 + n) % n, b = (i + 1) % n;
    const a0 = Math.atan2(ys[i] - ys[a], xs[i] - xs[a]);
    const a1 = Math.atan2(ys[b] - ys[i], xs[b] - xs[i]);
    const ds = (Math.hypot(xs[i] - xs[a], ys[i] - ys[a]) + Math.hypot(xs[b] - xs[i], ys[b] - ys[i])) / 2;
    k[i] = angDif(a1 - a0) / ds;
  }
  return k;
}

/** Transforma a definição de uma pista em arrays prontos para o jogo. */
export function construirPista(def) {
  const esc = def.escala || 1;
  const P = def.pontos.map(([a, b]) => [a * esc, b * esc]), m = P.length;
  // 1) amostragem densa da spline
  const dens = [];
  for (let i = 0; i < m; i++) {
    for (let k = 0; k < 40; k++) dens.push(catmull(P[(i - 1 + m) % m], P[i], P[(i + 1) % m], P[(i + 2) % m], k / 40));
  }
  const cum = [0];
  for (let i = 1; i <= dens.length; i++) {
    const a = dens[i - 1], b = dens[i % dens.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[cum.length - 1];
  const n = Math.round(total / ESPACO);
  const ds = total / n;

  // 2) reamostragem uniforme
  const x = new Float64Array(n), y = new Float64Array(n);
  let j = 0;
  for (let i = 0; i < n; i++) {
    const alvo = i * ds;
    while (cum[j + 1] < alvo) j++;
    const f = (alvo - cum[j]) / (cum[j + 1] - cum[j] || 1);
    const a = dens[j], b = dens[(j + 1) % dens.length];
    x[i] = a[0] + (b[0] - a[0]) * f;
    y[i] = a[1] + (b[1] - a[1]) * f;
  }

  // 3) tangentes, normais (lado direito), distância acumulada e curvatura
  const tx = new Float64Array(n), ty = new Float64Array(n), nx = new Float64Array(n), ny = new Float64Array(n), s = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = (i - 1 + n) % n, b = (i + 1) % n;
    const dx = x[b] - x[a], dy = y[b] - y[a], l = Math.hypot(dx, dy);
    tx[i] = dx / l; ty[i] = dy / l; nx[i] = -ty[i]; ny[i] = tx[i]; s[i] = i * ds;
  }
  const curv = suavizar(curvaturaDe(x, y), 2);

  // 4) linha de corrida: desloca para dentro da curva e suaviza (as IAs seguem esta linha)
  const maxOff = def.largura / 2 - 38;
  const cs = suavizar(curv, 14);
  let off = cs.map((k) => Math.max(-maxOff, Math.min(maxOff, k * 16000)));
  off = suavizar(off, 10);
  const lx = new Float64Array(n), ly = new Float64Array(n);
  for (let i = 0; i < n; i++) { lx[i] = x[i] + nx[i] * off[i]; ly[i] = y[i] + ny[i] * off[i]; }
  const lk = suavizar(curvaturaDe(lx, ly), 3);

  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < n; i++) { x0 = Math.min(x0, x[i]); y0 = Math.min(y0, y[i]); x1 = Math.max(x1, x[i]); y1 = Math.max(y1, y[i]); }

  return {
    def, id: def.id, nome: def.nome, tema: def.tema, n, ds, L: total, larg: def.largura,
    borda: def.largura / 2 + MARGEM, x, y, tx, ty, nx, ny, s, curv, off, lx, ly, lk,
    caixa: { x0, y0, x1, y1 },
  };
}

/** Procura a amostra mais próxima perto de i0 (rápido). Escreve em `out` para não alocar objetos. */
export function localizar(p, x, y, i0, out, janela = 40) {
  let melhor = i0, md = Infinity;
  for (let k = -janela; k <= janela; k++) {
    const i = (i0 + k + p.n) % p.n;
    const dx = x - p.x[i], dy = y - p.y[i];
    const d2 = dx * dx + dy * dy;
    if (d2 < md) { md = d2; melhor = i; }
  }
  const dx = x - p.x[melhor], dy = y - p.y[melhor];
  out.idx = melhor;
  out.lado = dx * p.nx[melhor] + dy * p.ny[melhor];   // + = direita do sentido da corrida
  out.adiante = dx * p.tx[melhor] + dy * p.ty[melhor];
  return out;
}

/** Busca global (usada só ao largar e ao recolocar o carro na pista). */
export function localizarGlobal(p, x, y, out) {
  let melhor = 0, md = Infinity;
  for (let i = 0; i < p.n; i++) {
    const d2 = (x - p.x[i]) ** 2 + (y - p.y[i]) ** 2;
    if (d2 < md) { md = d2; melhor = i; }
  }
  return localizar(p, x, y, melhor, out, 3);
}

/** Posição de largada: 2 carros por fileira, atrás da linha de chegada. */
export function posicaoGrade(p, k) {
  const fila = Math.floor(k / 2), lado = k % 2 === 0 ? -1 : 1;
  const dist = 70 + fila * 62 + (lado > 0 ? 28 : 0);
  const i = (p.n - Math.round(dist / p.ds) + p.n) % p.n;
  const off = lado * 40;
  return { x: p.x[i] + p.nx[i] * off, y: p.y[i] + p.ny[i] * off, a: Math.atan2(p.ty[i], p.tx[i]), idx: i };
}

/** Raio mínimo e distância mínima entre trechos distantes (usado nos testes de validação). */
export function validarPista(p) {
  let rMin = Infinity;
  for (let i = 0; i < p.n; i++) if (Math.abs(p.curv[i]) > 1e-6) rMin = Math.min(rMin, 1 / Math.abs(p.curv[i]));
  let sep = Infinity;
  const passo = 2, folga = Math.ceil(1200 / p.ds);
  for (let i = 0; i < p.n; i += passo) {
    for (let j = i + folga; j < p.n; j += passo) {
      if (p.n - (j - i) < folga) continue;
      sep = Math.min(sep, Math.hypot(p.x[i] - p.x[j], p.y[i] - p.y[j]));
    }
  }
  return { rMin, sep };
}

/** Cenário decorativo (árvores, prédios...) gerado com semente fixa. Nada pode invadir a pista nem a barreira. */
export function gerarCenario(p) {
  const r = aleatorio(p.def.semente * 97 + 5);
  const { x0, y0, x1, y1 } = p.caixa;
  const folga = 700;
  const itens = [];
  const livre = p.borda + 45; // distância mínima entre a borda do objeto e o centro da pista

  // menor distância do ponto (px,py) ao centro da pista
  const distPonto = (px, py) => {
    let m = Infinity;
    for (let i = 0; i < p.n; i += 3) { const d = (px - p.x[i]) ** 2 + (py - p.y[i]) ** 2; if (d < m) m = d; }
    return Math.sqrt(m);
  };
  // menor distância do retângulo (com a sombra, que sai 14 para a direita/baixo) ao centro da pista
  const distRet = (rx, ry, w, h) => {
    let m = Infinity;
    const ax = rx, bx = rx + w + 14, ay = ry, by = ry + h + 18;
    for (let i = 0; i < p.n; i += 3) {
      const dx = Math.max(ax - p.x[i], 0, p.x[i] - bx), dy = Math.max(ay - p.y[i], 0, p.y[i] - by);
      const d = dx * dx + dy * dy; if (d < m) m = d;
    }
    return Math.sqrt(m);
  };
  // raio ocupado por cada tipo de objeto (incluindo sombra)
  const EXT = { arvore: 1.35, pinheiro: 1.35, lago: 2.4, palmeira: 1.3, guardasol: 1.0, rocha: 1.4 };

  const alvo = p.tema === 'cidade' ? 520 : 420;
  let tentativas = 0;
  while (itens.length < alvo && tentativas < alvo * 14) {
    tentativas++;
    const px = x0 - folga + r() * (x1 - x0 + 2 * folga);
    const py = y0 - folga + r() * (y1 - y0 + 2 * folga);
    let it;
    if (p.tema === 'cidade') {
      it = { x: px, y: py, r: r(), tipo: 'predio', w: 120 + r() * 160, h: 120 + r() * 160, cor: Math.floor(r() * 4) };
      const d = distRet(it.x, it.y, it.w, it.h);
      if (d < livre || d > p.borda + 700) continue;
    } else {
      if (p.tema === 'orla' && py > y1 + 300) continue; // o mar começa logo abaixo (ver render.js)
      const sorteio = r();
      const tipo = p.tema === 'orla' ? (sorteio < 0.65 ? 'palmeira' : 'guardasol')
        : p.tema === 'serra' ? (sorteio < 0.7 ? 'pinheiro' : 'rocha')
        : sorteio < 0.88 ? 'arvore' : 'lago';
      it = { x: px, y: py, r: r(), tipo, tam: (p.tema === 'orla' ? 26 : 28) + r() * (p.tema === 'orla' ? 22 : 34) };
      if (distPonto(px, py) - it.tam * EXT[tipo] < livre) continue;
      if (p.tema === 'orla' && py + it.tam * EXT[tipo] > y1 + 330) continue; // não invade o mar
    }
    itens.push(it);
  }
  return itens;
}
