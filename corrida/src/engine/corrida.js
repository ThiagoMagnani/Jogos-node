// ===== Motor da corrida =====
// Cria a corrida (grid, carros, bots) e avança a simulação em passos fixos de 1/120 s:
// física + IA, voltas e posições, colisões, vácuo, partículas e marcas de pneu.

import { construirPista, localizar, localizarGlobal, posicaoGrade, aleatorio, PISTAS } from './pistas';
import { calcularStats, PILOTOS } from './carros';
import { novoCarro, passoFisico, CARRO } from './fisica';
import { prepararBot, decidirBot, novoPerfilBot } from './bots';
import { DIFICULDADES } from './campeonato';

export const PASSO = 1 / 120;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const angDif = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

const cachePistas = {};
export const obterPista = (id) => cachePistas[id] || (cachePistas[id] = construirPista(PISTAS[id]));

const PARADO = { dir: 0, acel: 0, freio: 1, nitro: false, mao: false };

/** Monta uma corrida pronta para começar. O jogador largará em 5º de 6 carros. */
export function criarCorrida({ fase, save, jogadorRobo = false, semente = 1 }) {
  const pista = obterPista(fase.pista);
  const dif = DIFICULDADES[save.dificuldade] || DIFICULDADES.dificil;
  const rnd = aleatorio(semente * 7919 + fase.numero);
  const loc = {};

  const rivais = PILOTOS.map((p) => [rnd(), p]).sort((a, b) => a[0] - b[0]).slice(0, 5).map((x) => x[1]);
  const carros = [];
  const criar = (slot, nome, cor, modelo, stats, perfil, jogador) => {
    const pos = posicaoGrade(pista, slot);
    const c = novoCarro(stats, pos);
    localizarGlobal(pista, c.x, c.y, loc);
    Object.assign(c, {
      nome, cor, modelo, jogador, slot, pos: slot + 1, idx: loc.idx, lado: loc.lado,
      volta: -1, prog: pista.s[loc.idx] + loc.adiante - pista.L, tVolta: 0, tempos: [], melhorVolta: Infinity,
      terminou: false, tempoFinal: null, banda: 0, parado: 0, batidas: 0, ultrap: 0, ultMarca: null, tReset: 0,
      pre: prepararBot(stats, pista), bot: perfil, inp: { dir: 0, acel: 0, freio: 0, nitro: false, mao: false },
    });
    carros.push(c);
    return c;
  };

  let r = 0, jogador = null;
  for (let slot = 0; slot < 6; slot++) {
    if (slot === 4) {
      const st = calcularStats(save.modelo, save.niveis);
      jogador = criar(slot, 'Você', save.cor, save.modelo, st, novoPerfilBot({ skill: 1, agress: 0.5, reacao: 0 }, rnd), true);
    } else {
      const pil = rivais[r++];
      const nivel = Math.max(0, fase.nivelBots + dif.nivel + pil.nivelDelta);
      // nas primeiras fases os rivais usam carros mais simples (o grid fica justo para quem está começando)
      const modelo = fase.numero < 2 ? 'besouro' : fase.numero < 3 && pil.modelo === 'cometa' ? 'pantera' : pil.modelo;
      const st = calcularStats(modelo, { motor: nivel, turbo: nivel, pneus: nivel, freios: nivel, aero: nivel });
      const perfil = novoPerfilBot({ ...pil, skill: fase.skill + dif.skill + (pil.skill - 1) }, rnd);
      criar(slot, pil.nome, pil.cor, modelo, st, perfil, false);
    }
  }

  return {
    pista, fase, dif, jogador, carros, jogadorRobo, rnd, loc, voltas: fase.voltas,
    estado: 'contagem', cont: 4, t: 0, rel: 0, acum: 0, tFim: 0, chegadas: 0,
    particulas: [], marcas: [], marcaI: 0, msgs: [], ev: {}, melhorGeral: { tempo: Infinity, nome: '' },
    posAnterior: jogador.pos, resultado: null,
  };
}

const msg = (corr, texto, tipo = '') => { corr.msgs.push({ texto, tipo, t: corr.rel }); if (corr.msgs.length > 6) corr.msgs.shift(); };

function emitir(corr, x, y, vx, vy, vida, tam, cor, tipo = 'fumaca') {
  if (corr.particulas.length > 260) return;
  corr.particulas.push({ x, y, vx, vy, vida, max: vida, tam, cor, tipo });
}

/** Avança a corrida em passos fixos; dtReal é o tempo real desde o último quadro. */
export function avancar(corr, inpJ, dtReal) {
  corr.acum = Math.min(0.1, corr.acum + dtReal);
  while (corr.acum >= PASSO) { atualizar(corr, inpJ, PASSO); corr.acum -= PASSO; }
}

export function atualizar(corr, inpJ, dt) {
  corr.rel += dt;
  if (corr.estado === 'contagem') {
    corr.cont -= dt;
    if (corr.cont <= 0) { corr.estado = 'correndo'; corr.t = 0; corr.ev.largada = true; }
  } else corr.t += dt;
  if (corr.estado === 'chegada') {
    corr.tFim += dt;
    if (corr.tFim > 3.5) finalizar(corr);
  }
  const correndo = corr.estado !== 'contagem';
  const jg = corr.jogador;

  for (const c of corr.carros) {
    // "banda elástica" leve: bots muito atrás do jogador ganham um fôlego extra
    if (!c.jogador) {
      const delta = c.prog - jg.prog;
      let alvo = delta < -500 ? Math.min(0.045, (-delta - 500) / 25000) : 0;
      if (corr.dif.id === 'esperto' && delta > 1800) alvo = -Math.min(0.03, (delta - 1800) / 30000);
      c.banda += (alvo - c.banda) * Math.min(1, dt);
    }

    let inp;
    if (!correndo) inp = PARADO;
    else if (c.jogador && !corr.jogadorRobo && !c.terminou) inp = inpJ;
    else {
      inp = decidirBot(c, corr, dt);
      if (c.terminou) { inp.nitro = false; inp.acel = c.vf < 170 ? 0.6 : 0; inp.freio = 0; }
      if (corr.t < c.bot.reacao && corr.estado === 'correndo') inp.acel = 0;
    }
    if (inp.reset && c.tReset <= 0) { recolocar(corr, c); c.tReset = 1.5; }
    c.tReset -= dt;

    passoFisico(c, inp, dt);
    atualizarPosicao(corr, c);
    efeitos(corr, c, dt);

    // preso? (parado por muito tempo) → volta para a pista
    if (correndo && !c.terminou && corr.t > 3 && Math.abs(c.vf) < 12) c.parado += dt; else c.parado = 0;
    if (c.parado > 2.5) { recolocar(corr, c); c.parado = 0; }
  }

  vacuo(corr, dt);
  for (let a = 0; a < corr.carros.length; a++) for (let b = a + 1; b < corr.carros.length; b++) colidir(corr, corr.carros[a], corr.carros[b]);
  ranking(corr);
  atualizarParticulas(corr, dt);
}

/** Calcula idx, lado e progresso; trata linha de chegada, barreira e grama. */
function atualizarPosicao(corr, c) {
  const p = corr.pista, loc = corr.loc, antes = c.idx;
  localizar(p, c.x, c.y, antes, loc, 40);
  if (antes > p.n * 0.75 && loc.idx < p.n * 0.25) { c.volta++; cruzouLinha(corr, c); }
  else if (antes < p.n * 0.25 && loc.idx > p.n * 0.75) c.volta--;
  c.idx = loc.idx; c.lado = loc.lado;
  c.prog = c.volta * p.L + p.s[loc.idx] + loc.adiante;
  c.fora = clamp((Math.abs(c.lado) - p.larg / 2) / 14, 0, 1);

  // barreira de pneus: empurra de volta e perde velocidade
  const exc = Math.abs(c.lado) - p.borda;
  if (exc > 0) {
    const sg = Math.sign(c.lado), nx = p.nx[c.idx] * sg, ny = p.ny[c.idx] * sg;
    c.x -= nx * exc; c.y -= ny * exc;
    const vn = c.vx * nx + c.vy * ny;
    if (vn > 0) {
      c.vx -= 1.3 * vn * nx; c.vy -= 1.3 * vn * ny;
      const k = 1 - Math.min(0.3, vn / 1500);
      c.vx *= k; c.vy *= k;
      if (vn > 40) {
        c.batidas++;
        corr.ev.parede = Math.max(corr.ev.parede || 0, vn);
        for (let i = 0; i < 6; i++) emitir(corr, c.x, c.y, -nx * 80 + (corr.rnd() - 0.5) * 160, -ny * 80 + (corr.rnd() - 0.5) * 160, 0.4, 2.2, '#ffd23b', 'faisca');
      }
    }
    c.a += angDif(Math.atan2(p.ty[c.idx], p.tx[c.idx]) - c.a) * 0.08;
    c.vx *= 0.995; c.vy *= 0.995;
  }
}

function cruzouLinha(corr, c) {
  if (c.volta === 0) { c.tVolta = corr.t; return; }
  if (c.volta < 1) return;
  const tv = corr.t - c.tVolta;
  c.tempos.push(tv); c.tVolta = corr.t;
  if (tv < c.melhorVolta) c.melhorVolta = tv;
  if (tv < corr.melhorGeral.tempo) {
    corr.melhorGeral = { tempo: tv, nome: c.nome };
    if (c.jogador) msg(corr, 'MELHOR VOLTA DA CORRIDA!', 'destaque');
  }
  if (c.volta >= corr.voltas && !c.terminou) {
    c.terminou = true; c.tempoFinal = corr.t; corr.chegadas++;
    if (c.jogador) { corr.estado = 'chegada'; corr.tFim = 0; corr.ev.chegada = true; msg(corr, 'BANDEIRA XADREZ!', 'destaque'); }
  } else if (c.jogador) { corr.ev.volta = true; msg(corr, `VOLTA ${c.volta + 1}/${corr.voltas}`); }
}

/** Marcas de pneu, fumaça, chamas do nitro. */
function efeitos(corr, c, dt) {
  const cos = Math.cos(c.a), sin = Math.sin(c.a);
  const derrapando = c.derrapa > 0.3 || (c.freando && c.vf > 250 && c.stats && c.fora < 0.1 && Math.abs(c.dir) > 0.5);
  const rodas = [[-14, -8], [-14, 8]];
  if (derrapando && c.fora < 0.5) {
    const novo = rodas.map(([lx, ly]) => [c.x + lx * cos - ly * sin, c.y + lx * sin + ly * cos]);
    if (c.ultMarca) {
      for (let k = 0; k < 2; k++) {
        const seg = [c.ultMarca[k][0], c.ultMarca[k][1], novo[k][0], novo[k][1], Math.min(0.5, 0.15 + c.derrapa * 0.4)];
        corr.marcas[corr.marcaI] = seg; corr.marcaI = (corr.marcaI + 1) % 900;
      }
    }
    c.ultMarca = novo;
    if (corr.rnd() < dt * 40) emitir(corr, novo[0][0], novo[0][1], (corr.rnd() - 0.5) * 30, (corr.rnd() - 0.5) * 30, 0.7, 7, 'rgba(230,230,240,0.35)');
    if (c.jogador) corr.ev.derrapa = Math.max(corr.ev.derrapa || 0, c.derrapa);
  } else c.ultMarca = null;

  if (c.fora > 0.6 && Math.abs(c.vf) > 80 && corr.rnd() < dt * 50) {
    emitir(corr, c.x - cos * 14, c.y - sin * 14, (corr.rnd() - 0.5) * 60, (corr.rnd() - 0.5) * 60, 0.8, 8, 'rgba(150,120,80,0.45)');
  }
  if (c.nitroOn && corr.rnd() < dt * 120) {
    const ox = c.x - cos * 24, oy = c.y - sin * 24;
    emitir(corr, ox, oy, -cos * 220 + (corr.rnd() - 0.5) * 50, -sin * 220 + (corr.rnd() - 0.5) * 50, 0.28, 5, corr.rnd() < 0.5 ? '#4fe3ff' : '#ffd23b', 'chama');
  }
}

/** Vácuo: andar colado atrás de outro carro dá velocidade extra e recarrega o nitro. */
function vacuo(corr, dt) {
  for (const c of corr.carros) {
    let achou = false;
    for (const o of corr.carros) {
      if (o === c) continue;
      const dp = o.prog - c.prog;
      if (dp > 15 && dp < 190 && Math.abs(o.lado - c.lado) < 26 && o.vf > 150 && c.vf > 120) { achou = true; break; }
    }
    c.vacuo += ((achou ? 1 : 0) - c.vacuo) * Math.min(1, dt * (achou ? 3 : 4));
    if (c.jogador && c.vacuo > 0.6 && !c.avisouVacuo) { c.avisouVacuo = true; msg(corr, 'VÁCUO!'); }
    if (c.jogador && c.vacuo < 0.1) c.avisouVacuo = false;
  }
}

/** Colisão carro × carro: cada carro é feito de 2 círculos (frente e traseira). */
function colidir(corr, a, b) {
  const d0x = b.x - a.x, d0y = b.y - a.y;
  if (d0x * d0x + d0y * d0y > 3600) return;
  const R = CARRO.raio, B = CARRO.braco, minD = 2 * R;
  const ca = Math.cos(a.a), sa = Math.sin(a.a), cb = Math.cos(b.a), sb = Math.sin(b.a);
  const ma = a.stats.massa, mb = b.stats.massa, ia = 1 / ma, ib = 1 / mb, soma = ia + ib;
  for (let sa_ = -1; sa_ <= 1; sa_ += 2) {
    for (let sb_ = -1; sb_ <= 1; sb_ += 2) {
      const ax = a.x + ca * B * sa_, ay = a.y + sa * B * sa_;
      const bx = b.x + cb * B * sb_, by = b.y + sb * B * sb_;
      const dx = bx - ax, dy = by - ay, d2 = dx * dx + dy * dy;
      if (d2 >= minD * minD || d2 === 0) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, pen = minD - d;
      a.x -= nx * pen * (ia / soma) * 0.8; a.y -= ny * pen * (ia / soma) * 0.8;
      b.x += nx * pen * (ib / soma) * 0.8; b.y += ny * pen * (ib / soma) * 0.8;
      const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rv < 0) {
        const j = (-(1 + 0.3) * rv) / soma;
        a.vx -= j * nx * ia; a.vy -= j * ny * ia;
        b.vx += j * nx * ib; b.vy += j * ny * ib;
        // torque: o carro gira um pouco com a pancada
        const px = (ax + bx) / 2, py = (ay + by) / 2;
        a.a += clamp(((px - a.x) * -ny - (py - a.y) * -nx) * j * ia * 0.00025, -0.3, 0.3);
        b.a += clamp(((px - b.x) * ny - (py - b.y) * nx) * j * ib * 0.00025, -0.3, 0.3);
        if (-rv > 35) {
          corr.ev.batida = Math.max(corr.ev.batida || 0, -rv);
          if (a.jogador || b.jogador) (a.jogador ? a : b).batidas++;
          for (let i = 0; i < 5; i++) emitir(corr, px, py, (corr.rnd() - 0.5) * 220, (corr.rnd() - 0.5) * 220, 0.35, 2, '#ffd23b', 'faisca');
        }
      }
    }
  }
}

/** Ordena os carros e detecta ultrapassagens do jogador. */
function ranking(corr) {
  const ord = corr.carros.slice().sort((a, b) => {
    if (a.terminou && b.terminou) return a.tempoFinal - b.tempoFinal;
    if (a.terminou) return -1;
    if (b.terminou) return 1;
    return b.prog - a.prog;
  });
  ord.forEach((c, i) => { c.pos = i + 1; });
  corr.ordem = ord;
  const j = corr.jogador;
  if (corr.estado === 'correndo' && corr.t > 3 && j.pos < corr.posAnterior) {
    j.ultrap += corr.posAnterior - j.pos;
    msg(corr, `ULTRAPASSAGEM! P${j.pos}`, 'destaque');
    corr.ev.ultrap = true;
  }
  corr.posAnterior = j.pos;
}

function atualizarParticulas(corr, dt) {
  const ps = corr.particulas;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.vida -= dt;
    if (p.vida <= 0) { ps[i] = ps[ps.length - 1]; ps.pop(); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    const k = Math.exp(-2.5 * dt); p.vx *= k; p.vy *= k;
  }
}

/** Coloca o carro de volta no centro da pista, virado para a frente. */
export function recolocar(corr, c) {
  const p = corr.pista;
  localizarGlobal(p, c.x, c.y, corr.loc);
  const i = corr.loc.idx;
  c.x = p.x[i]; c.y = p.y[i]; c.a = Math.atan2(p.ty[i], p.tx[i]);
  c.vx = c.vy = c.vf = c.vl = 0; c.dir = 0; c.idx = i; c.ultMarca = null;
  c.resets = (c.resets || 0) + 1;
}

function finalizar(corr) {
  const j = corr.jogador;
  const tabela = corr.ordem.map((c, i) => ({
    pos: i + 1, nome: c.nome, cor: c.cor, jogador: c.jogador, modelo: c.modelo,
    tempo: c.terminou ? c.tempoFinal : null,
    voltasFeitas: c.terminou ? corr.voltas : Math.max(0, c.volta),
    melhorVolta: isFinite(c.melhorVolta) ? c.melhorVolta : null,
  }));
  corr.resultado = {
    pos: j.pos, tabela, tempo: j.tempoFinal, voltas: corr.voltas,
    melhorVolta: isFinite(j.melhorVolta) ? j.melhorVolta : null,
    melhorVoltaCorrida: isFinite(corr.melhorGeral.tempo) ? corr.melhorGeral : null,
    ultrap: j.ultrap, batidas: j.batidas,
  };
  corr.estado = 'fim';
}

/** Resumo leve para o HUD em React (o estado grande fica fora do React). */
export function snapshot(corr) {
  const j = corr.jogador, lider = corr.ordem ? corr.ordem[0] : j;
  return {
    estado: corr.estado, cont: Math.max(0, Math.ceil(corr.cont)), go: corr.estado === 'correndo' && corr.t < 1.1,
    t: corr.t, volta: clamp(j.volta + 1, 1, corr.voltas), voltas: corr.voltas, pos: j.pos, total: corr.carros.length,
    vel: Math.round(Math.max(0, j.vf) * 0.45), nitro: j.nitro / j.stats.nitroCap, nitroOn: j.nitroOn, vacuo: j.vacuo,
    voltaAtual: j.volta >= 1 ? corr.t - j.tVolta : corr.t, melhor: isFinite(j.melhorVolta) ? j.melhorVolta : null,
    ranking: (corr.ordem || corr.carros).map((c) => ({
      nome: c.nome, cor: c.cor, jogador: c.jogador, terminou: c.terminou,
      gap: c === lider ? 0 : Math.max(0, (lider.prog - c.prog) / Math.max(120, c.vf)),
    })),
    msgs: corr.msgs.filter((m) => corr.rel - m.t < 2.6).slice(-3).map((m) => ({ texto: m.texto, tipo: m.tipo, t: m.t })),
  };
}
