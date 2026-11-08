import { livre, temLinha } from './raio';
import { som } from './audio';

// Cada tipo de alienígena: vida, velocidade, tamanho, comportamento (ia) e créditos (modo Horda).
export const TIPOS = {
  rastejador: { nome: 'Rastejador', hp: 28, vel: 3.6, raio: 0.3, esc: 0.8, ia: 'investida', dano: 8, cred: 5 },
  infectado: { nome: 'Infectado', hp: 60, vel: 1.7, raio: 0.33, esc: 0.95, ia: 'investida', dano: 14, cred: 10 },
  cuspidor: { nome: 'Cuspidor', hp: 45, vel: 1.2, raio: 0.33, esc: 0.9, ia: 'atirador', proj: 'acido', cd: 1.9, dano: 8, vp: 4.5, cred: 14 },
  inchado: { nome: 'Inchado', hp: 40, vel: 1.6, raio: 0.42, esc: 1.0, ia: 'bomba', cred: 12 },
  sentinela: { nome: 'Sentinela', hp: 70, vel: 1.4, raio: 0.35, esc: 0.95, ia: 'sentinela', proj: 'plasma', cd: 2.3, dano: 10, vp: 6, lift: 0.2, cred: 22 },
  bruto: { nome: 'Bruto', hp: 190, vel: 2.1, raio: 0.42, esc: 1.2, ia: 'bruto', dano: 24, cred: 30 },
  drone: { nome: 'Drone Caçador', hp: 38, vel: 2.8, raio: 0.28, esc: 0.8, ia: 'drone', proj: 'bala', cd: 0.55, dano: 5, vp: 9, lift: 0.22, cred: 15 },
  matriarca: { nome: 'Matriarca', hp: 520, vel: 1.3, raio: 0.55, esc: 1.9, ia: 'matriarca', proj: 'acido', dano: 9, vp: 5, boss: true, cred: 0 },
  colosso: { nome: 'Colosso Blindado', hp: 760, vel: 1.3, raio: 0.55, esc: 1.9, ia: 'colosso', proj: 'plasma', dano: 10, vp: 6, boss: true, cred: 0 },
  omega: { nome: 'ÔMEGA', hp: 1000, vel: 1.4, raio: 0.6, esc: 2.0, ia: 'omega', proj: 'plasma', dano: 11, vp: 5.5, boss: true, cred: 0, lift: 0.1 },
  barril: { nome: 'Barril Explosivo', hp: 15, vel: 0, raio: 0.3, esc: 0.7, ia: 'estatico', cred: 0 },
};

export function criarInimigo(tipo, x, y, escala = 1) {
  const T = TIPOS[tipo];
  return {
    tipo, x: x + 0.5, y: y + 0.5, hp: T.hp * escala, hpMax: T.hp * escala, esc: T.esc, lift: T.lift || 0,
    desperto: false, morto: false, t: Math.random() * 5, cd: 1 + Math.random(), cdMelee: 0, cdInv: 6,
    atq: 0, hurt: 0, tMorte: 0, rajada: 0, carga: 0, fase: 1, lado: Math.random() < 0.5 ? 1 : -1, escala,
  };
}

export const mensagem = (j, texto, tipo = 'info') => {
  j.msgs.push({ texto, tipo, t: 0 });
  if (j.msgs.length > 5) j.msgs.shift();
};

export function danoJogador(j, n) {
  const p = j.jogador;
  if (j.estado !== 'jogando' || p.invul > 0) return;
  if (p.escudo > 0) {
    const abs = Math.min(p.escudo, n);
    p.escudo -= abs;
    n -= abs;
  }
  p.flashDano = 0.35;
  som.dano();
  if (n <= 0) return;
  p.vida -= n;
  if (p.vida <= 0) { p.vida = 0; j.estado = 'morreu'; som.derrota(); }
}

function mover(j, e, dx, dy, r) {
  if (livre(j, e.x + dx, e.y, r)) e.x += dx;
  if (livre(j, e.x, e.y + dy, r)) e.y += dy;
}

function andar(j, e, ang, vel, dt) {
  const r = TIPOS[e.tipo].raio;
  for (const d of [0, 0.7, -0.7, 1.4, -1.4]) {
    const a = ang + d;
    const dx = Math.cos(a) * vel * dt;
    const dy = Math.sin(a) * vel * dt;
    if (livre(j, e.x + dx, e.y + dy, r)) { e.x += dx; e.y += dy; return true; }
  }
  return false;
}

export function atirar(j, e, ang, tipo, dano, vel, veneno = 0) {
  j.projeteis.push({ x: e.x, y: e.y, dx: Math.cos(ang), dy: Math.sin(ang), vel, dano, tipo, veneno, vida: 5 });
  if (tipo === 'acido') som.cuspe(); else if (tipo === 'plasma') som.zap(); else som.metralha();
}

const leque = (j, e, ang, n, abre, T, veneno) => { for (let i = 0; i < n; i++) atirar(j, e, ang + (i - (n - 1) / 2) * abre, T.proj, T.dano, T.vp, veneno); };
const anel = (j, e, n, off, T) => { for (let i = 0; i < n; i++) atirar(j, e, off + (i * Math.PI * 2) / n, T.proj, T.dano, T.vp); };

export function explodir(j, x, y, raio, dano, ignora, veneno = 0) {
  j.efeitos.push({ x, y, tipo: 'boom', t: 0, dur: 0.45, esc: raio * 0.7, lift: 0.3 });
  som.explosao();
  j.inimigos.forEach((e) => {
    if (e.morto || e === ignora) return;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < raio) danificar(j, e, dano * (1 - d / raio) + dano * 0.3, true);
  });
  const dj = Math.hypot(j.jogador.x - x, j.jogador.y - y);
  if (dj < raio && !(ignora === 'jogador')) {
    danoJogador(j, Math.round(dano * (1 - dj / raio) * 0.75));
    if (veneno) j.jogador.veneno = Math.max(j.jogador.veneno, veneno);
  }
}

export function danificar(j, e, n, silencio) {
  if (e.morto) return;
  e.hp -= n;
  e.hurt = 0.12;
  e.desperto = true;
  if (!silencio) { som.acerto(); j.hit = 0.18; }
  if (e.hp <= 0) { matar(j, e); return; }
  if (e.tipo === 'sentinela' && Math.random() < 0.18) teleportar(j, e, 3, 6);
}

const DROPS_MUN = { pistola: 'balas', escopeta: 'cartuchos', pulso: 'celulas', plasma: 'plasma', trilho: 'trilhos' };

function soltar(j, e) {
  const T = TIPOS[e.tipo];
  const p = j.jogador;
  const chance = j.modo === 'horda' ? 0.18 : 0.1;
  if (T.boss || e.tipo === 'barril' || Math.random() > chance) return;
  const r = Math.random();
  let tipo;
  if (r < 0.3) tipo = p.vida < 50 ? 'kit' : 'balas';
  else if (r < 0.36) tipo = 'kitG';
  else if (r < 0.42) tipo = 'escudo';
  else {
    const donas = Object.keys(DROPS_MUN).filter((k) => p.armas[k]);
    tipo = DROPS_MUN[donas[Math.floor(Math.random() * donas.length)]];
  }
  j.itens.push({ tipo, x: e.x, y: e.y, pego: false });
}

function matar(j, e) {
  const T = TIPOS[e.tipo];
  e.morto = true;
  e.hurt = 0;
  e.tMorte = 0;
  som.morte();
  if (e.tipo === 'barril') { explodir(j, e.x, e.y, 2.8, 75, e); return; }
  j.estat.abates += 1;
  if (j.horda) { j.horda.creditos += Math.round(T.cred * j.jogador.mod.credito); j.horda.vivos -= 1; }
  const vamp = j.jogador.mod.vampiro;
  if (vamp) j.jogador.vida = Math.min(j.jogador.vidaMax, j.jogador.vida + vamp);
  if (e.tipo === 'inchado') explodir(j, e.x, e.y, 2.3, 34, e, 3);
  j.efeitos.push({ x: e.x, y: e.y, tipo: 'mancha', t: 0, dur: 6, esc: 0.7, lift: 0 });
  soltar(j, e);
  if (T.boss) {
    j.chefeMorto = true;
    mensagem(j, `${T.nome} foi destruído! A SAÍDA ABRIU!`, 'destaque');
    j.inimigos.forEach((o) => { if (!o.morto && o !== e && o.invocado) { o.hp = 0; o.morto = true; } });
    som.vitoria();
  }
}

function teleportar(j, e, dmin = 3, dmax = 7) {
  const p = j.jogador;
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = dmin + Math.random() * (dmax - dmin);
    const x = p.x + Math.cos(a) * d;
    const y = p.y + Math.sin(a) * d;
    if (livre(j, x, y, 0.4) && temLinha(j, x, y, p.x, p.y)) {
      j.efeitos.push({ x: e.x, y: e.y, tipo: 'boom', t: 0, dur: 0.3, esc: 0.6, lift: 0.3 });
      e.x = x; e.y = y;
      return;
    }
  }
}

export function invocar(j, tipo, x, y, desperto = true) {
  const n = criarInimigo(tipo, Math.floor(x), Math.floor(y), j.horda ? j.horda.escala : 1);
  n.desperto = desperto; n.invocado = true;
  if (!livre(j, n.x, n.y, TIPOS[tipo].raio)) return null;
  j.inimigos.push(n);
  j.estat.total += 1;
  if (j.horda) j.horda.vivos += 1;
  return n;
}

const FALAS = {
  matriarca: ['Filhotes... ao ataque.', '*SCREEECH*'],
  colosso: ['SISTEMA DE CONTENÇÃO: FALHA.', 'ALVO ADQUIRIDO.'],
  omega: ['Vocês são a semente da colmeia.', 'Eu sou a estação. Eu sou a fome.', 'Resistir é... biologicamente inútil.'],
};
const fala = (j, e) => { const l = FALAS[e.tipo]; mensagem(j, `${TIPOS[e.tipo].nome}: "${l[Math.floor(Math.random() * l.length)]}"`, 'fala'); som.fala(); };

/** Atualiza um inimigo por `dt` segundos. */
export function atualizarInimigo(j, e, dt) {
  if (e.morto) { e.tMorte += dt; e.hurt = 0; return; }
  const T = TIPOS[e.tipo];
  if (T.ia === 'estatico') { e.hurt = Math.max(0, e.hurt - dt); return; }
  const p = j.jogador;
  e.t += dt;
  e.hurt = Math.max(0, e.hurt - dt);
  e.atq = Math.max(0, e.atq - dt);
  e.cd -= dt;
  e.cdMelee -= dt;
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const d = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);

  if (!e.desperto) {
    if (d < 13 && temLinha(j, e.x, e.y, p.x, p.y)) {
      e.desperto = true;
      if (T.boss) { fala(j, e); }
    }
    return;
  }
  const vejo = d < 16 && temLinha(j, e.x, e.y, p.x, p.y);
  const lento = j.horda ? 1 + Math.min(0.35, j.horda.onda * 0.02) : 1;
  const vel = T.vel * lento;

  switch (T.ia) {
    case 'investida':
      andar(j, e, ang, vel * (d < 5 ? 1.3 : 1), dt);
      e.atq = d < 1.3 ? 0.1 : 0;
      if (d < 0.95 && e.cdMelee <= 0) { danoJogador(j, T.dano); e.cdMelee = 0.8; e.atq = 0.3; }
      break;
    case 'bomba':
      andar(j, e, ang, vel, dt);
      e.atq = d < 3 ? 0.1 : 0;
      if (d < 1.2) { e.hp = 0; matar(j, e); }
      break;
    case 'atirador':
      if (d > 6.5) andar(j, e, ang, vel, dt);
      else if (d < 3.5) andar(j, e, ang + Math.PI, vel, dt);
      else andar(j, e, ang + (Math.PI / 2) * e.lado, vel * 0.6, dt);
      if (e.cd <= 0 && vejo) { e.cd = T.cd + Math.random() * 0.6; e.atq = 0.4; atirar(j, e, ang, T.proj, T.dano, T.vp, 4); }
      break;
    case 'sentinela':
      if (d > 7) andar(j, e, ang, vel, dt);
      else if (d < 4) andar(j, e, ang + Math.PI, vel, dt);
      else andar(j, e, ang + (Math.PI / 2) * e.lado, vel * 0.7, dt);
      if (e.rajada > 0) {
        e.rajada -= dt; e.atq = 0.2;
        if (Math.floor(e.rajada * 5) !== Math.floor((e.rajada + dt) * 5)) atirar(j, e, ang, T.proj, T.dano, T.vp);
      } else if (e.cd <= 0 && vejo) { e.cd = T.cd; e.rajada = 0.7; }
      break;
    case 'drone':
      if (d > 5.5) andar(j, e, ang + Math.sin(e.t * 2) * 0.4, vel, dt);
      else if (d < 3) andar(j, e, ang + Math.PI, vel, dt);
      else andar(j, e, ang + (Math.PI / 2) * e.lado, vel * 0.9, dt);
      if (e.cd <= 0 && vejo) { e.cd = T.cd + Math.random() * 0.3; e.atq = 0.15; atirar(j, e, ang + (Math.random() - 0.5) * 0.12, T.proj, T.dano, T.vp); }
      if (Math.random() < dt * 0.4) e.lado *= -1;
      break;
    case 'bruto':
      if (e.carga > 0) {
        e.carga -= dt; e.atq = 0.1;
        andar(j, e, ang, 6.2, dt);
        if (d < 1.2 && e.cdMelee <= 0) { danoJogador(j, T.dano + 8); e.cdMelee = 1; e.carga = 0; }
      } else {
        andar(j, e, ang, vel, dt);
        if (d < 1.1 && e.cdMelee <= 0) { danoJogador(j, T.dano); e.cdMelee = 0.9; e.atq = 0.35; }
        else if (d > 3 && d < 9 && e.cd <= 0 && vejo) { e.carga = 1.0; e.cd = 4; }
      }
      break;
    case 'matriarca': {
      const f2 = e.hp < T.hp * 0.5 * e.escala;
      if (d > 6) andar(j, e, ang, vel, dt);
      else if (d < 3) andar(j, e, ang + Math.PI, vel, dt);
      else andar(j, e, ang + (Math.PI / 2) * e.lado, vel * 0.7, dt);
      if (e.cd <= 0 && vejo) {
        e.cd = f2 ? 1.3 : 2.1; e.atq = 0.45;
        leque(j, e, ang, f2 ? 7 : 5, 0.2, T, 4);
        if (Math.random() < 0.3) fala(j, e);
      }
      e.cdInv -= dt;
      if (e.cdInv <= 0) {
        e.cdInv = f2 ? 6 : 9;
        if (j.inimigos.filter((o) => o.invocado && !o.morto).length < 6) { invocar(j, 'rastejador', e.x + 1, e.y); invocar(j, 'rastejador', e.x - 1, e.y); mensagem(j, 'A Matriarca chocou ovos! Mais rastejadores!', 'fala'); }
      }
      break;
    }
    case 'colosso': {
      const f2 = e.hp < T.hp * 0.5 * e.escala;
      if (e.carga > 0) {
        e.carga -= dt; e.atq = 0.1;
        andar(j, e, ang, 6, dt);
        if (d < 1.4 && e.cdMelee <= 0) { danoJogador(j, 28); e.cdMelee = 1; e.carga = 0; }
      } else {
        if (d > 6) andar(j, e, ang, vel, dt);
        else if (d < 3) andar(j, e, ang + Math.PI, vel * 0.8, dt);
        else andar(j, e, ang + (Math.PI / 2) * e.lado, vel * 0.7, dt);
        if (e.cd <= 0 && vejo) {
          e.cd = f2 ? 1.7 : 2.4;
          const r = Math.random();
          if (r < 0.28) { e.carga = 1.0; fala(j, e); }
          else if (f2 && r < 0.6) { e.atq = 0.5; anel(j, e, 14, Math.random(), T); }
          else { e.atq = 0.5; leque(j, e, ang, 5, 0.17, T); }
        }
        if (f2 && !e.reforco) { e.reforco = true; mensagem(j, 'Colosso: "MODO DE EMERGÊNCIA ATIVADO." Drones liberados!', 'fala'); som.fala(); invocar(j, 'drone', e.x + 2, e.y); invocar(j, 'drone', e.x - 2, e.y); }
      }
      break;
    }
    case 'omega': {
      const f2 = e.hp < T.hp * 0.66 * e.escala;
      const f3 = e.hp < T.hp * 0.33 * e.escala;
      if (d > 6) andar(j, e, ang, vel * (f3 ? 1.5 : 1), dt);
      else if (d < 3) andar(j, e, ang + Math.PI, vel, dt);
      else andar(j, e, ang + (Math.PI / 2) * e.lado, vel * 0.8, dt);
      e.rajada += dt;
      if (e.cd <= 0 && vejo) {
        e.cd = f3 ? 0.9 : f2 ? 1.4 : 2;
        e.atq = 0.4;
        const r = Math.random();
        if (r < 0.4) leque(j, e, ang, f3 ? 9 : 5, 0.16, T);
        else if (r < 0.8) anel(j, e, f3 ? 18 : 12, e.t, T);
        else { teleportar(j, e, 3, 6); fala(j, e); }
      }
      e.cdInv -= dt;
      if (e.cdInv <= 0) {
        e.cdInv = f3 ? 7 : 11;
        if (f2 && j.inimigos.filter((o) => o.invocado && !o.morto).length < 5) { invocar(j, 'drone', e.x + 1.5, e.y); invocar(j, 'rastejador', e.x - 1.5, e.y); mensagem(j, 'Ômega gera crias da própria carne!', 'fala'); }
      }
      if (f2 && !e.reforco) { e.reforco = true; mensagem(j, 'ÔMEGA: "ENTÃO VOCÊ SANGRA... EU TAMBÉM."', 'fala'); som.fala(); }
      break;
    }
    default:
  }

  for (const o of j.inimigos) {
    if (o === e || o.morto) continue;
    const ox = e.x - o.x;
    const oy = e.y - o.y;
    const od = Math.hypot(ox, oy);
    if (od > 0.001 && od < 0.55) mover(j, e, (ox / od) * dt * 1.2, (oy / od) * dt * 1.2, T.raio);
  }
}

export function atualizarProjeteis(j, dt) {
  const p = j.jogador;
  j.projeteis = j.projeteis.filter((q) => {
    q.vida -= dt;
    q.x += q.dx * q.vel * dt;
    q.y += q.dy * q.vel * dt;
    if (q.vida <= 0 || !livre(j, q.x, q.y, 0.05)) {
      j.efeitos.push({ x: q.x, y: q.y, tipo: 'puff', t: 0, dur: 0.3, esc: 0.4, lift: 0.3 });
      return false;
    }
    if (Math.hypot(q.x - p.x, q.y - p.y) < 0.4) {
      danoJogador(j, q.dano);
      if (q.veneno && p.invul <= 0) { p.veneno = Math.max(p.veneno, q.veneno); }
      return false;
    }
    return true;
  });
}
