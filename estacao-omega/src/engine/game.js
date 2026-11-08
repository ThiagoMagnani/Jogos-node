import { criarFase, criarArena, MW, zonaDe } from './map';
import { lancarRaio, RES, livre } from './raio';
import { criarInimigo, atualizarInimigo, atualizarProjeteis, danificar, explodir, mensagem, danoJogador, invocar, TIPOS } from './enemies';
import { som } from './audio';

export const ARMAS = {
  pistola: { nome: 'Pistola Padrão', mun: 'balas', dano: 16, cd: 0.3, tiros: 1, espalha: 0.01, max: 80, tecla: 1, desc: 'Confiável. Munição barata.' },
  escopeta: { nome: 'Escopeta Tática', mun: 'cartuchos', dano: 9, cd: 0.85, tiros: 8, espalha: 0.11, max: 24, tecla: 2, desc: 'Devastadora de perto.' },
  pulso: { nome: 'Rifle de Pulso', mun: 'células', dano: 10, cd: 0.1, tiros: 1, espalha: 0.035, max: 150, tecla: 3, desc: 'Rajada rápida e precisa.' },
  plasma: { nome: 'Lança-Plasma', mun: 'plasma', dano: 75, cd: 0.75, tiros: 1, espalha: 0, splash: 2.2, max: 20, tecla: 4, desc: 'Explosão em área.' },
  trilho: { nome: 'Canhão de Trilhos', mun: 'trilhos', dano: 160, cd: 1.4, tiros: 1, espalha: 0, perfura: true, max: 12, tecla: 5, desc: 'Atravessa todos os inimigos.' },
};
const MUN_ITEM = { balas: ['pistola', 14], cartuchos: ['escopeta', 5], celulas: ['pulso', 20], plasma: ['plasma', 3], trilhos: ['trilho', 2] };
const ARMA_ITEM = { arma_escopeta: ['escopeta', 8], arma_pulso: ['pulso', 40], arma_plasma: ['plasma', 5], arma_trilho: ['trilho', 3] };
export const maxMun = (p, k) => Math.round(ARMAS[k].max * p.mod.municao);

export const novoMod = () => ({ dano: 1, cad: 1, municao: 1, vel: 1, dashCd: 3, ondaDano: 60, ondaCd: 12, regen: 0, vampiro: 0, credito: 1 });

/** opcoes: { modo: 'campanha'|'horda', fase, carga } */
export function criarJogo({ modo = 'campanha', fase = 1, carga = null } = {}) {
  const f = modo === 'horda' ? criarArena() : criarFase(fase);
  const j = {
    modo, fase, nome: f.nome, tema: f.tema, objetivo: f.objetivo,
    grade: f.grade, portas: f.portas, terminais: f.terminais, estacoes: f.estacoes, perigo: f.perigo,
    gatilhos: f.gatilhos.map((g) => ({ ...g, usado: false })), teleportes: f.teleportes, terminalAbre: f.terminalAbre, spawns: f.spawns || [],
    inimigos: [], itens: f.itens.map(([tipo, x, y]) => ({ tipo, x: x + 0.5, y: y + 0.5, pego: false })),
    projeteis: [], efeitos: [], msgs: [], minimapa: true, tempo: 0, estado: 'jogando', loja: false, chefeMorto: modo === 'campanha' && !f.chefe, ruido: !!f.ruido, fragmentos: new Set(), hit: 0, ondaFlash: 0, batida: 0,
    horda: null, estat: { abates: 0, total: 0, itens: 0, segredos: 0, segTotal: Object.values(f.portas).filter((p) => p.tranca === 'secreta').length },
    jogador: {
      x: f.inicio.x, y: f.inicio.y, ang: f.inicio.ang, vida: 100, vidaMax: 100, escudo: 0, escudoMax: 100,
      arma: 'pistola', armas: { pistola: true, escopeta: false, pulso: false, plasma: false, trilho: false },
      municao: { pistola: 40, escopeta: 0, pulso: 0, plasma: 0, trilho: 0 },
      chaves: { vermelha: false, azul: false, amarela: false }, mod: novoMod(),
      recarga: 0, recuo: 0, flashDano: 0, veneno: 0, venAc: 0, acAc: 0, bob: 0, movendo: 0, invul: 0,
      dashCd: 0, dashT: 0, dashDx: 0, dashDy: 0, ondaCd: 0, tpCd: 0,
    },
  };
  if (carga) {
    const p = j.jogador;
    Object.assign(p, { vida: Math.max(carga.vida, 60), vidaMax: carga.vidaMax, escudo: carga.escudo, arma: carga.arma });
    p.armas = { ...carga.armas }; p.municao = { ...carga.municao };
    Object.keys(p.municao).forEach((k) => { if (p.armas[k]) p.municao[k] = Math.max(p.municao[k], Math.round(ARMAS[k].max * 0.3)); });
  }
  if (modo === 'horda') {
    j.horda = { onda: 0, vivos: 0, fila: [], tSpawn: 0, creditos: 0, escala: 1, niveis: {}, estado: 'pausa' };
    j.loja = true; // a primeira loja abre antes da onda 1
    f.inimigos.forEach(([t, x, y]) => j.inimigos.push(criarInimigo(t, x, y)));
  } else {
    f.inimigos.forEach(([t, x, y]) => j.inimigos.push(criarInimigo(t, x, y)));
    j.estat.total = j.inimigos.filter((e) => e.tipo !== 'barril').length;
  }
  return j;
}

export const snapshotCarga = (j) => {
  const p = j.jogador;
  return { vida: Math.ceil(p.vida), vidaMax: p.vidaMax, escudo: Math.ceil(p.escudo), arma: p.arma, armas: { ...p.armas }, municao: { ...p.municao } };
};

// ---------------------------------------------------------------- Horda
export function iniciarOnda(j) {
  const h = j.horda;
  h.onda += 1;
  h.escala = 1 + 0.08 * (h.onda - 1);
  h.estado = 'combate';
  j.loja = false;
  const pool = [['rastejador', 1], ['infectado', 2], ['cuspidor', 3], ['inchado', 3], ['drone', 4], ['sentinela', 6], ['bruto', 8]].filter(([, w]) => h.onda >= w).map(([t]) => t);
  const n = Math.round(6 + h.onda * 2.5);
  h.fila = [];
  for (let i = 0; i < n; i++) h.fila.push(pool[Math.floor(Math.random() * pool.length)]);
  if (h.onda % 5 === 0) h.fila.push(['matriarca', 'colosso', 'omega'][(h.onda / 5 - 1) % 3]);
  h.vivos = 0; h.tSpawn = 1;
  j.chefeMorto = false;
  mensagem(j, h.onda % 5 === 0 ? `ONDA ${h.onda} — CHEFE!` : `ONDA ${h.onda}`, 'destaque');
  som.item();
}

function atualizarHorda(j, dt) {
  const h = j.horda;
  if (h.estado !== 'combate') return;
  h.tSpawn -= dt;
  const maxVivos = Math.min(16, 7 + Math.floor(h.onda / 2));
  if (h.fila.length && h.tSpawn <= 0 && h.vivos < maxVivos) {
    const p = j.jogador;
    const cand = j.spawns.filter(([x, y]) => Math.hypot(x + 0.5 - p.x, y + 0.5 - p.y) > 7);
    const [x, y] = cand[Math.floor(Math.random() * cand.length)] || j.spawns[0];
    const tipo = h.fila.shift();
    const e = invocar(j, tipo, x, y, true);
    if (e) { j.estat.total -= 1; j.efeitos.push({ x: e.x, y: e.y, tipo: 'boom', t: 0, dur: 0.35, esc: 0.8, lift: 0.3 }); }
    else h.fila.unshift(tipo);
    h.tSpawn = Math.max(0.35, 1.1 - h.onda * 0.04);
  }
  if (!h.fila.length && h.vivos <= 0) {
    h.estado = 'pausa';
    j.loja = true;
    const p = j.jogador;
    p.vida = Math.min(p.vidaMax, p.vida + p.vidaMax * 0.1);
    Object.values(j.estacoes).forEach((s) => { s.cargas = Math.min(3, s.cargas + 1); });
    h.creditos += 20 + h.onda * 5;
    mensagem(j, `Onda ${h.onda} superada! Visite a loja.`, 'destaque');
    som.vitoria();
    try { const m = Number(localStorage.getItem('omega_melhor_onda') || 0); if (h.onda > m) localStorage.setItem('omega_melhor_onda', String(h.onda)); } catch (e) { /* sem storage */ }
  }
}

// ---------------------------------------------------------------- tiro
function disparar(j) {
  const p = j.jogador;
  const A = ARMAS[p.arma];
  if (p.recarga > 0) return;
  if (p.municao[p.arma] <= 0) {
    som.vazio(); p.recarga = 0.25;
    const alt = Object.keys(ARMAS).filter((k) => p.armas[k] && p.municao[k] > 0).sort((a, b) => ARMAS[b].tecla - ARMAS[a].tecla)[0];
    if (alt) { p.arma = alt; mensagem(j, `Sem ${A.mun}! Trocando para ${ARMAS[alt].nome}.`); } else mensagem(j, 'SEM MUNIÇÃO! Procure suprimentos.', 'fala');
    return;
  }
  p.municao[p.arma] -= 1;
  p.recarga = A.cd * p.mod.cad;
  p.recuo = 1;
  som[p.arma]();
  j.inimigos.forEach((e) => { if (!e.morto && !e.desperto && Math.hypot(e.x - p.x, e.y - p.y) < 9) e.desperto = true; });
  const dano = A.dano * p.mod.dano;
  for (let i = 0; i < A.tiros; i++) {
    const a = p.ang + (Math.random() - 0.5) * 2 * A.espalha;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    lancarRaio(j, p.x, p.y, dx, dy);
    const parede = RES.dist;
    const alvos = [];
    j.inimigos.forEach((e) => {
      if (e.morto) return;
      const vx = e.x - p.x;
      const vy = e.y - p.y;
      const t = vx * dx + vy * dy;
      if (t <= 0 || t >= parede) return;
      if (Math.abs(vx * dy - vy * dx) < TIPOS[e.tipo].raio * 0.9) alvos.push([t, e]);
    });
    alvos.sort((u, v) => u[0] - v[0]);
    if (A.perfura) {
      alvos.forEach(([, e]) => danificar(j, e, dano));
      j.efeitos.push({ x: p.x + dx * (parede - 0.05), y: p.y + dy * (parede - 0.05), tipo: 'puff', t: 0, dur: 0.25, esc: 0.5, lift: 0.5 });
    } else {
      const ta = alvos.length ? alvos[0][0] : parede;
      if (A.splash) explodir(j, p.x + dx * (ta - 0.25), p.y + dy * (ta - 0.25), A.splash, dano, 'jogador');
      else if (alvos.length) danificar(j, alvos[0][1], dano);
      else j.efeitos.push({ x: p.x + dx * (parede - 0.05), y: p.y + dy * (parede - 0.05), tipo: 'puff', t: 0, dur: 0.25, esc: 0.3, lift: 0.5 });
    }
  }
}

// ---------------------------------------------------------------- itens
const def = (msg, pode, usa, extra = {}) => ({ msg, pode, usa, ...extra });
const ITENS = {
  kit: def('Kit médico: +20 de vida.', (p) => p.vida < p.vidaMax, (p) => { p.vida = Math.min(p.vidaMax, p.vida + 20); }),
  kitG: def('Injetor de nanomáquinas: +45 de vida!', (p) => p.vida < p.vidaMax, (p) => { p.vida = Math.min(p.vidaMax, p.vida + 45); }),
  escudo: def('Célula de escudo: +40 de escudo.', (p) => p.escudo < p.escudoMax, (p) => { p.escudo = Math.min(p.escudoMax, p.escudo + 40); }),
  fragmento: def('Fragmento de mapa recuperado!', () => true, () => {}, { chave: true }),
  cartao_vermelho: def('Cartão de acesso VERMELHO.', () => true, (p) => { p.chaves.vermelha = true; }, { chave: true }),
  cartao_azul: def('Cartão de acesso AZUL.', () => true, (p) => { p.chaves.azul = true; }, { chave: true }),
  cartao_amarelo: def('Cartão de acesso AMARELO.', () => true, (p) => { p.chaves.amarela = true; }, { chave: true }),
};
Object.keys(MUN_ITEM).forEach((k) => {
  const [arma, qtd] = MUN_ITEM[k];
  ITENS[k] = def(`Munição: ${ARMAS[arma].mun} (+${qtd}).`, (p) => p.municao[arma] < maxMun(p, arma), (p) => { p.municao[arma] = Math.min(maxMun(p, arma), p.municao[arma] + qtd); });
});
Object.keys(ARMA_ITEM).forEach((k) => {
  const [arma, qtd] = ARMA_ITEM[k];
  ITENS[k] = def(`NOVA ARMA: ${ARMAS[arma].nome.toUpperCase()}! (tecla ${ARMAS[arma].tecla})`, () => true, (p) => { p.armas[arma] = true; p.municao[arma] = Math.min(maxMun(p, arma), p.municao[arma] + qtd); p.arma = arma; }, { arma: true });
});

// ---------------------------------------------------------------- interação (tecla E)
function usar(j) {
  const p = j.jogador;
  lancarRaio(j, p.x, p.y, Math.cos(p.ang), Math.sin(p.ang));
  if (RES.dist > 1.9) return;
  const k = RES.cy * MW + RES.cx;
  if (RES.tipo === 12 && j.terminais[k]) {
    const t = j.terminais[k];
    if (t.usado) { mensagem(j, 'Terminal já ativado.'); return; }
    t.usado = true; som.arma();
    Object.values(j.portas).forEach((po) => { if (po.tranca === 'lacre') { po.liberada = true; po.fixa = true; } });
    mensagem(j, 'TERMINAL: portas blindadas LIBERADAS.', 'destaque');
  } else if (RES.tipo === 13 && j.estacoes[k]) {
    const s = j.estacoes[k];
    if (s.cargas <= 0) mensagem(j, 'Estação médica vazia.');
    else if (p.vida >= p.vidaMax) mensagem(j, 'Você já está com a vida cheia.');
    else { s.cargas -= 1; p.vida = Math.min(p.vidaMax, p.vida + 35); p.veneno = 0; som.item(); mensagem(j, `Estação médica: +35 de vida (${s.cargas} cargas restantes).`); }
  } else if (RES.tipo === 11 && j.portas[k] && !j.portas[k].liberada) {
    j.portas[k].liberada = true; j.portas[k].fixa = true; j.estat.segredos += 1;
    som.arma(); mensagem(j, 'SEGREDO ENCONTRADO!', 'destaque');
  }
}

// ---------------------------------------------------------------- atualização principal
export function atualizar(j, dt, inp) {
  if (j.estado !== 'jogando' || j.loja) return;
  const p = j.jogador;
  j.tempo += dt;
  p.ang += (inp.giro || 0) * dt * 2.5 + (inp.mouseDX || 0) * 0.0024;
  inp.mouseDX = 0;

  const fw = (inp.frente ? 1 : 0) - (inp.tras ? 1 : 0);
  const st = (inp.dir ? 1 : 0) - (inp.esq ? 1 : 0);
  const vel = (inp.correr ? 5.8 : 3.8) * p.mod.vel;
  let mx = Math.cos(p.ang) * fw - Math.sin(p.ang) * st;
  let my = Math.sin(p.ang) * fw + Math.cos(p.ang) * st;
  const len = Math.hypot(mx, my);

  // dash (Q) e onda de choque (F)
  p.dashCd = Math.max(0, p.dashCd - dt);
  p.ondaCd = Math.max(0, p.ondaCd - dt);
  p.invul = Math.max(0, p.invul - dt);
  if (inp.dash && p.dashCd <= 0) {
    p.dashCd = p.mod.dashCd; p.dashT = 0.18; p.invul = 0.3;
    p.dashDx = len > 0 ? mx / len : Math.cos(p.ang); p.dashDy = len > 0 ? my / len : Math.sin(p.ang);
    som.dash();
  }
  inp.dash = false;
  if (inp.onda && p.ondaCd <= 0) {
    p.ondaCd = p.mod.ondaCd;
    som.onda(); j.ondaFlash = 0.3;
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; j.efeitos.push({ x: p.x + Math.cos(a) * 0.5, y: p.y + Math.sin(a) * 0.5, vx: Math.cos(a) * 11, vy: Math.sin(a) * 11, tipo: 'onda', t: 0, dur: 0.42, esc: 0.45, lift: 0.08 }); }
    const dano = p.mod.ondaDano;
    j.inimigos.forEach((e) => {
      if (e.morto) return;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d > 4.5) return;
      danificar(j, e, dano * (1 - d / 6), true);
      e.hurt = 0.3;
      j.efeitos.push({ x: e.x, y: e.y, tipo: 'acerto', t: 0, dur: 0.5, esc: 1.0, lift: 0.4 });
      const k = d > 0.01 ? 1.6 / d : 0;
      const nx = e.x + (e.x - p.x) * k; const ny = e.y + (e.y - p.y) * k;
      if (!TIPOS[e.tipo].boss && livre(j, nx, ny, TIPOS[e.tipo].raio)) { e.x = nx; e.y = ny; }
    });
    j.projeteis = j.projeteis.filter((q) => Math.hypot(q.x - p.x, q.y - p.y) > 4);
  }
  inp.onda = false;

  p.movendo += ((len > 0 ? 1 : 0) - p.movendo) * Math.min(1, dt * 10);
  let sx = 0; let sy = 0;
  if (p.dashT > 0) { p.dashT -= dt; sx = p.dashDx * 15 * dt; sy = p.dashDy * 15 * dt; }
  else if (len > 0) { sx = (mx / len) * vel * dt; sy = (my / len) * vel * dt; p.bob += dt * (inp.correr ? 12 : 8); }
  if (livre(j, p.x + sx, p.y, 0.26)) p.x += sx;
  if (livre(j, p.x, p.y + sy, 0.26)) p.y += sy;

  // armas
  p.recarga = Math.max(0, p.recarga - dt);
  p.recuo = Math.max(0, p.recuo - dt * 4);
  p.flashDano = Math.max(0, p.flashDano - dt);
  if (inp.trocar) {
    const alvo = Object.keys(ARMAS).find((k) => ARMAS[k].tecla === inp.trocar);
    if (alvo && p.armas[alvo]) p.arma = alvo;
    else if (alvo) mensagem(j, 'Você ainda não tem essa arma.');
    inp.trocar = 0;
  }
  if (inp.usar) { usar(j); inp.usar = false; }
  if (inp.atirar) disparar(j);

  // regeneração, veneno, ácido
  if (p.mod.regen > 0 && p.vida < p.vidaMax) p.vida = Math.min(p.vidaMax, p.vida + p.mod.regen * dt);
  if (p.veneno > 0) {
    p.veneno -= dt; p.venAc += 3 * dt;
    if (p.venAc >= 1) { p.venAc -= 1; p.vida -= 1; p.flashDano = Math.max(p.flashDano, 0.12); if (p.vida <= 0) { p.vida = 0; j.estado = 'morreu'; som.derrota(); } }
  }
  if (j.perigo[Math.floor(p.y) * MW + Math.floor(p.x)] && p.invul <= 0) {
    p.acAc += dt;
    if (p.acAc > 0.35) { p.acAc = 0; danoJogador(j, 4); p.veneno = Math.max(p.veneno, 1.5); }
  }

  // teleportes
  p.tpCd = Math.max(0, p.tpCd - dt);
  if (p.tpCd <= 0) {
    j.teleportes.some((t) => {
      if (Math.hypot(t.x + 0.5 - p.x, t.y + 0.5 - p.y) >= 0.5) return false;
      p.x = t.dx + 0.5; p.y = t.dy + 0.5; p.tpCd = 2; som.tele(); mensagem(j, 'Teletransportado!');
      j.efeitos.push({ x: p.x, y: p.y, tipo: 'boom', t: 0, dur: 0.4, esc: 1.2, lift: 0.3 });
      return true;
    });
  }

  // gatilhos de emboscada
  j.gatilhos.forEach((g) => {
    if (g.usado || Math.hypot(g.x + 0.5 - p.x, g.y + 0.5 - p.y) > g.r) return;
    g.usado = true;
    mensagem(j, g.msg, 'fala'); som.fala();
    g.spawns.forEach(([t, x, y]) => invocar(j, t, x, y, true));
  });

  // portas
  Object.values(j.portas).forEach((po) => {
    po.aviso = Math.max(0, po.aviso - dt);
    const d = Math.hypot(po.x + 0.5 - p.x, po.y + 0.5 - p.y);
    const t = po.tranca;
    const ok = t === null || (t === 'vermelha' && p.chaves.vermelha) || (t === 'azul' && p.chaves.azul) || (t === 'amarela' && p.chaves.amarela) || (t === 'saida' && j.chefeMorto) || ((t === 'lacre' || t === 'secreta') && po.liberada);
    const pertoIni = t === null && j.inimigos.some((en) => !en.morto && en.desperto && Math.abs(en.x - po.x - 0.5) < 1.4 && Math.abs(en.y - po.y - 0.5) < 1.4);
    if (d < 1.9 || pertoIni) {
      if (ok) { if (po.alvo === 0) { po.alvo = 1; som.porta(); } }
      else if (po.aviso <= 0 && t !== 'secreta') {
        po.aviso = 2.5; som.negado();
        mensagem(j, t === 'saida' ? 'A saída está selada. Destrua o chefe!' : t === 'lacre' ? 'Porta blindada. Procure um terminal (E).' : `Trancada! Precisa do cartão ${t}.`);
      }
    } else if (d > 2.6 && !pertoIni && po.alvo === 1 && t !== 'saida' && !po.fixa) po.alvo = 0;
    po.aberta += Math.sign(po.alvo - po.aberta) * Math.min(Math.abs(po.alvo - po.aberta), dt * 1.8);
    if (t === 'saida' && po.aberta >= 1 && d < 1.2) { j.estado = 'venceu'; som.vitoria(); }
  });

  // itens
  j.itens.forEach((it) => {
    if (it.pego || Math.hypot(it.x - p.x, it.y - p.y) > 0.65) return;
    const d = ITENS[it.tipo];
    if (!d.pode(p)) return;
    it.pego = true; d.usa(p); j.estat.itens += 1;
    if (it.tipo === 'fragmento') { j.fragmentos.add(zonaDe(Math.floor(it.x), Math.floor(it.y))); mensagem(j, `Fragmento de mapa recuperado! (${j.fragmentos.size}/5)`, 'destaque'); som.fragmento(); return; }
    mensagem(j, d.msg, d.arma || d.chave ? 'destaque' : 'info');
    if (d.arma || d.chave) som.arma(); else som.item();
  });

  j.inimigos.forEach((e) => atualizarInimigo(j, e, dt));
  atualizarProjeteis(j, dt);
  if (j.horda) atualizarHorda(j, dt);
  j.efeitos = j.efeitos.filter((e) => { e.t += dt; if (e.vx) { e.x += e.vx * dt; e.y += e.vy * dt; } return e.t < e.dur; });
  j.hit = Math.max(0, j.hit - dt); j.ondaFlash = Math.max(0, j.ondaFlash - dt);
  if (p.vida < 30) { j.batida -= dt; if (j.batida <= 0) { j.batida = 0.9; som.batida(); } }
  j.msgs.forEach((m) => { m.t += dt; });
  j.msgs = j.msgs.filter((m) => m.t < 5);
  if (j.itens.length > 60) j.itens = j.itens.filter((i) => !i.pego);
}

export { MW, danoJogador };
