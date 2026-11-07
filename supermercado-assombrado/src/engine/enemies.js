import { livre, temLinha } from './raio';
import { som } from './audio';

// Cada tipo de inimigo: vida, velocidade, tamanho e comportamento (ia).
export const TIPOS = {
  carrinho: { nome: 'Carrinho Furioso', hp: 45, vel: 3.1, raio: 0.35, esc: 0.9, ia: 'investida', dano: 12 },
  lata: { nome: 'Lata Bomba', hp: 20, vel: 1.9, raio: 0.3, esc: 0.8, ia: 'bomba' },
  tomate: { nome: 'Tomate Arremessador', hp: 30, vel: 1.3, raio: 0.32, esc: 0.85, ia: 'atirador', proj: 'tomate', cd: 1.7, dano: 9, vp: 4.2 },
  galinha: { nome: 'Galinha Congelada', hp: 55, vel: 1.0, raio: 0.33, esc: 0.9, ia: 'atirador', proj: 'gelo', cd: 1.6, dano: 7, vp: 5, leque: 2 },
  banana: { nome: 'Banana Ninja', hp: 22, vel: 3.6, raio: 0.28, esc: 0.85, ia: 'zigzag', dano: 8 },
  fantasma: { nome: 'Caixa Fantasma', hp: 65, vel: 1.4, raio: 0.32, esc: 0.95, ia: 'fantasma', proj: 'recibo', cd: 2.6, dano: 6, vp: 6.5, lift: 0.12 },
  gerente: { nome: 'Gerente Supremo', hp: 420, vel: 1.5, raio: 0.5, esc: 1.7, ia: 'chefe', proj: 'etiqueta', dano: 8, vp: 6 },
};

const FALAS_CHEFE = [
  'Preciso falar com o responsável... ah, sou eu.',
  'Isso está fora do prazo de validade!',
  'Seu cartão foi recusado!',
  'Hora do inventário... de você!',
  'Aqui não é loja de conveniência. É de INconveniência!',
];

export function criarInimigo(tipo, x, y) {
  const T = TIPOS[tipo];
  return {
    tipo, x: x + 0.5, y: y + 0.5, hp: T.hp, esc: T.esc, lift: T.lift || 0,
    desperto: false, morto: false, t: Math.random() * 5, cd: 1 + Math.random(), cdMelee: 0,
    atq: 0, hurt: 0, tMorte: 0, rajada: 0, carga: 0, reforco: false, lado: Math.random() < 0.5 ? 1 : -1,
  };
}

export const mensagem = (j, texto, tipo = 'info') => {
  j.msgs.push({ texto, tipo, t: 0 });
  if (j.msgs.length > 5) j.msgs.shift();
};

export function danoJogador(j, n) {
  const p = j.jogador;
  if (j.estado !== 'jogando') return;
  p.vida -= n;
  p.flashDano = 0.35;
  som.dano();
  if (p.vida <= 0) { p.vida = 0; j.estado = 'morreu'; som.derrota(); }
}

function mover(j, e, dx, dy, r) {
  if (livre(j, e.x + dx, e.y, r)) e.x += dx;
  if (livre(j, e.x, e.y + dy, r)) e.y += dy;
}

// tenta andar na direção `ang`; se bater, tenta desviar
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

export function atirar(j, e, ang, tipo, dano, vel, efeito) {
  j.projeteis.push({ x: e.x, y: e.y, dx: Math.cos(ang), dy: Math.sin(ang), vel, dano, tipo, efeito: efeito || null, vida: 5 });
  som.lancar();
}

export function explodir(j, x, y, raio, dano, ignora) {
  j.efeitos.push({ x, y, tipo: 'boom', t: 0, dur: 0.45, esc: raio * 0.7, lift: 0.3 });
  som.explosao();
  j.inimigos.forEach((e) => {
    if (e.morto || e === ignora) return;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < raio) danificar(j, e, dano * (1 - d / raio) + dano * 0.3);
  });
  const dj = Math.hypot(j.jogador.x - x, j.jogador.y - y);
  if (dj < raio) danoJogador(j, Math.round(dano * (1 - dj / raio) * 0.8));
}

export function danificar(j, e, n) {
  if (e.morto) return;
  e.hp -= n;
  e.hurt = 0.12;
  e.desperto = true;
  som.acerto();
  const T = TIPOS[e.tipo];
  if (e.hp <= 0) { matar(j, e); return; }
  if (T.ia === 'fantasma' && Math.random() < 0.3) teleportar(j, e);
}

function matar(j, e) {
  e.morto = true;
  e.tMorte = 0;
  j.estat.abates += 1;
  som.morte();
  if (e.tipo === 'lata') { e.morto = true; explodir(j, e.x, e.y, 2.4, 40, e); }
  if (e.tipo === 'tomate') j.efeitos.push({ x: e.x, y: e.y, tipo: 'splat', t: 0, dur: 4, esc: 0.8, lift: 0 });
  if (e.tipo === 'gerente') {
    j.chefeMorto = true;
    mensagem(j, 'O Gerente Supremo foi demitido! A SAÍDA ABRIU!', 'destaque');
    som.vitoria();
  } else if (e.tipo === 'fantasma' || e.tipo === 'galinha') {
    mensagem(j, `${TIPOS[e.tipo].nome} fora de estoque.`);
  }
}

function teleportar(j, e) {
  const p = j.jogador;
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = 3 + Math.random() * 4;
    const x = p.x + Math.cos(a) * d;
    const y = p.y + Math.sin(a) * d;
    if (livre(j, x, y, 0.35) && temLinha(j, x, y, p.x, p.y)) { e.x = x; e.y = y; return; }
  }
}

/** Atualiza um inimigo por `dt` segundos. */
export function atualizarInimigo(j, e, dt) {
  if (e.morto) { e.tMorte += dt; return; }
  const T = TIPOS[e.tipo];
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
      if (e.tipo === 'gerente') { mensagem(j, 'Gerente: "Quem autorizou você a entrar na minha sala?!"', 'fala'); som.fala(); }
    }
    return;
  }
  const vejo = d < 16 && temLinha(j, e.x, e.y, p.x, p.y);

  switch (T.ia) {
    case 'investida':
      andar(j, e, ang, T.vel * (d < 5 ? 1.35 : 1), dt);
      if (d < 0.95 && e.cdMelee <= 0) { danoJogador(j, T.dano); e.cdMelee = 0.9; e.atq = 0.35; }
      break;
    case 'bomba':
      andar(j, e, ang, T.vel, dt);
      e.atq = d < 3 ? 0.1 : 0;
      if (d < 1.15) { e.hp = 0; matar(j, e); }
      break;
    case 'atirador': {
      if (d > 6.5) andar(j, e, ang, T.vel, dt);
      else if (d < 3.5) andar(j, e, ang + Math.PI, T.vel, dt);
      else andar(j, e, ang + (Math.PI / 2) * e.lado, T.vel * 0.6, dt);
      if (e.cd <= 0 && vejo) {
        e.cd = T.cd + Math.random() * 0.6;
        e.atq = 0.4;
        const n = T.leque || 1;
        for (let i = 0; i < n; i++) atirar(j, e, ang + (i - (n - 1) / 2) * 0.16, T.proj, T.dano, T.vp, T.proj === 'gelo' ? 'gelo' : null);
      }
      break;
    }
    case 'zigzag':
      andar(j, e, ang + Math.sin(e.t * 5) * 0.9, T.vel, dt);
      e.atq = d < 1.6 ? 0.1 : 0;
      if (d < 0.9 && e.cdMelee <= 0) { danoJogador(j, T.dano); e.cdMelee = 0.5; }
      break;
    case 'fantasma':
      if (d > 5) andar(j, e, ang, T.vel, dt);
      else if (d < 2.5) andar(j, e, ang + Math.PI, T.vel, dt);
      if (e.rajada > 0) {
        e.rajada -= dt;
        e.atq = 0.2;
        if (e.rajada <= 0 || Math.floor(e.rajada * 8) !== Math.floor((e.rajada + dt) * 8)) atirar(j, e, ang, T.proj, T.dano, T.vp);
      } else if (e.cd <= 0 && vejo) { e.cd = T.cd; e.rajada = 0.5; }
      break;
    case 'chefe': {
      if (e.carga > 0) {
        e.carga -= dt;
        e.atq = 0.1;
        andar(j, e, ang, 6.5, dt);
        if (d < 1.3 && e.cdMelee <= 0) { danoJogador(j, 25); e.cdMelee = 1; }
      } else {
        if (d > 5) andar(j, e, ang, T.vel, dt);
        else if (d < 3) andar(j, e, ang + Math.PI, T.vel * 0.8, dt);
        else andar(j, e, ang + (Math.PI / 2) * e.lado, T.vel * 0.7, dt);
        if (e.cd <= 0 && vejo) {
          const fase2 = e.hp < T.hp / 2;
          e.cd = fase2 ? 1.3 : 2.1;
          if (Math.random() < 0.3) { e.carga = 1.1; mensagem(j, 'Gerente: "VOCÊ ESTÁ ATRASADO PARA A REUNIÃO!"', 'fala'); som.fala(); }
          else {
            e.atq = 0.45;
            for (let i = -2; i <= 2; i++) atirar(j, e, ang + i * 0.17, T.proj, T.dano, T.vp);
            if (Math.random() < 0.35) { mensagem(j, `Gerente: "${FALAS_CHEFE[Math.floor(Math.random() * FALAS_CHEFE.length)]}"`, 'fala'); som.fala(); }
          }
        }
        if (!e.reforco && e.hp < T.hp / 2) {
          e.reforco = true;
          mensagem(j, 'Gerente: "REPOSIÇÃO NO CORREDOR 3!" (chegaram carrinhos)', 'fala');
          som.fala();
          [[-2, 2], [2, 2]].forEach(([ox, oy]) => {
            const c = criarInimigo('carrinho', Math.floor(e.x + ox), Math.floor(e.y + oy));
            c.desperto = true; j.inimigos.push(c);
          });
        }
      }
      break;
    }
    default:
  }

  // separação simples entre inimigos (não se empilham)
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
      if (q.efeito === 'gelo') { p.congelado = 2.2; mensagem(j, 'Brrr! Você está congelando (mais lento)!'); }
      return false;
    }
    return true;
  });
}
