import { criarFase, MW } from './map';
import { lancarRaio, RES, livre } from './raio';
import { criarInimigo, atualizarInimigo, atualizarProjeteis, danificar, explodir, mensagem, danoJogador, TIPOS } from './enemies';
import { som } from './audio';

export const ARMAS = {
  pistola: { nome: 'Pistola de Ar', municao: 'balas', dano: 18, cd: 0.34, tiros: 1, espalha: 0.012, tecla: 1 },
  espingarda: { nome: 'Espingarda de Ervilhas', municao: 'ervilhas', dano: 9, cd: 0.85, tiros: 7, espalha: 0.13, tecla: 2 },
  canhao: { nome: 'Canhão de Baguete', municao: 'pães', dano: 90, cd: 1.3, tiros: 1, espalha: 0, splash: 2.3, tecla: 3 },
};

export function criarJogo() {
  const f = criarFase();
  return {
    grade: f.grade,
    portas: f.portas,
    inimigos: f.inimigos.map(([t, x, y]) => criarInimigo(t, x, y)),
    itens: f.itens.map(([tipo, x, y]) => ({ tipo, x: x + 0.5, y: y + 0.5, pego: false })),
    projeteis: [],
    efeitos: [],
    msgs: [],
    minimapa: true,
    tempo: 0,
    estado: 'jogando', // 'jogando' | 'morreu' | 'venceu'
    chefeMorto: false,
    estat: { abates: 0, total: f.inimigos.length, itens: 0 },
    jogador: {
      x: f.inicio.x, y: f.inicio.y, ang: f.inicio.ang, vida: 100,
      arma: 'pistola', armas: { pistola: true, espingarda: false, canhao: false },
      municao: { pistola: 36, espingarda: 0, canhao: 0 },
      chaves: { vermelha: false, azul: false },
      recarga: 0, recuo: 0, flashDano: 0, congelado: 0, bob: 0, movendo: 0,
    },
  };
}

// ---------------------------------------------------------------- tiro
function disparar(j) {
  const p = j.jogador;
  const A = ARMAS[p.arma];
  if (p.recarga > 0) return;
  if (p.municao[p.arma] <= 0) { som.vazio(); p.recarga = 0.25; mensagem(j, `Sem ${A.municao}! Troque de arma (1, 2, 3).`); return; }
  p.municao[p.arma] -= 1;
  p.recarga = A.cd;
  p.recuo = 1;
  som[p.arma]();
  // o barulho acorda quem estiver perto
  j.inimigos.forEach((e) => { if (!e.morto && !e.desperto && Math.hypot(e.x - p.x, e.y - p.y) < 9) e.desperto = true; });

  for (let i = 0; i < A.tiros; i++) {
    const a = p.ang + (Math.random() - 0.5) * 2 * A.espalha;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    lancarRaio(j, p.x, p.y, dx, dy);
    const parede = RES.dist;
    let alvo = null;
    let ta = parede;
    j.inimigos.forEach((e) => {
      if (e.morto) return;
      const vx = e.x - p.x;
      const vy = e.y - p.y;
      const t = vx * dx + vy * dy;
      if (t <= 0 || t >= ta) return;
      const perp = Math.abs(vx * dy - vy * dx);
      if (perp < TIPOS[e.tipo].raio * 0.9) { alvo = e; ta = t; }
    });
    if (A.splash) {
      explodir(j, p.x + dx * (ta - 0.2), p.y + dy * (ta - 0.2), A.splash, A.dano);
    } else if (alvo) {
      danificar(j, alvo, A.dano);
    } else {
      j.efeitos.push({ x: p.x + dx * (parede - 0.05), y: p.y + dy * (parede - 0.05), tipo: 'puff', t: 0, dur: 0.25, esc: 0.3, lift: 0.5 });
    }
  }
}

// ---------------------------------------------------------------- itens
const ITENS = {
  maca: { msg: 'Maçã orgânica! +15 de vida (o caixa cobrou 3x).', pode: (p) => p.vida < 100, usa: (p) => { p.vida = Math.min(100, p.vida + 15); } },
  pizza: { msg: 'Pizza de ontem! +40 de vida (não pergunte).', pode: (p) => p.vida < 100, usa: (p) => { p.vida = Math.min(100, p.vida + 40); } },
  municao: { msg: 'Balas de ar comprimido. Pshhh!', pode: (p) => p.municao.pistola < 99, usa: (p) => { p.municao.pistola = Math.min(99, p.municao.pistola + 20); } },
  ervilhas: { msg: 'Lata de ervilhas: munição de espingarda!', pode: (p) => p.municao.espingarda < 40, usa: (p) => { p.municao.espingarda += 8; } },
  pao: { msg: 'Pão francês amanhecido: munição pesada!', pode: (p) => p.municao.canhao < 20, usa: (p) => { p.municao.canhao += 4; } },
  espingarda: { msg: 'ESPINGARDA DE ERVILHAS! (tecla 2)', pode: () => true, usa: (p) => { p.armas.espingarda = true; p.municao.espingarda += 10; p.arma = 'espingarda'; }, arma: true },
  canhao: { msg: 'CANHÃO DE BAGUETE! Cuidado com o recuo. (tecla 3)', pode: () => true, usa: (p) => { p.armas.canhao = true; p.municao.canhao += 6; p.arma = 'canhao'; }, arma: true },
  chaveVermelha: { msg: 'Cartão VERMELHO do estoque! (alguém esqueceu no freezer)', pode: () => true, usa: (p) => { p.chaves.vermelha = true; }, chave: true },
  chaveAzul: { msg: 'Cartão AZUL da gerência! Hora de pedir um aumento.', pode: () => true, usa: (p) => { p.chaves.azul = true; }, chave: true },
};

// ---------------------------------------------------------------- atualização principal
export function atualizar(j, dt, inp) {
  if (j.estado !== 'jogando') return;
  const p = j.jogador;
  j.tempo += dt;

  // girar
  p.ang += (inp.giro || 0) * dt * 2.5 + (inp.mouseDX || 0) * 0.0024;
  inp.mouseDX = 0;

  // andar
  const fw = (inp.frente ? 1 : 0) - (inp.tras ? 1 : 0);
  const st = (inp.dir ? 1 : 0) - (inp.esq ? 1 : 0);
  p.congelado = Math.max(0, p.congelado - dt);
  const vel = (inp.correr ? 5.6 : 3.7) * (p.congelado > 0 ? 0.45 : 1);
  let mx = Math.cos(p.ang) * fw - Math.sin(p.ang) * st;
  let my = Math.sin(p.ang) * fw + Math.cos(p.ang) * st;
  const len = Math.hypot(mx, my);
  p.movendo += ((len > 0 ? 1 : 0) - p.movendo) * Math.min(1, dt * 10);
  if (len > 0) {
    mx = (mx / len) * vel * dt;
    my = (my / len) * vel * dt;
    if (livre(j, p.x + mx, p.y, 0.26)) p.x += mx;
    if (livre(j, p.x, p.y + my, 0.26)) p.y += my;
    p.bob += dt * (inp.correr ? 12 : 8);
  }

  // armas
  p.recarga = Math.max(0, p.recarga - dt);
  p.recuo = Math.max(0, p.recuo - dt * 4);
  p.flashDano = Math.max(0, p.flashDano - dt);
  if (inp.trocar) {
    const alvo = Object.keys(ARMAS).find((k) => ARMAS[k].tecla === inp.trocar);
    if (alvo && p.armas[alvo]) p.arma = alvo;
    else if (alvo) mensagem(j, 'Você ainda não achou essa arma.');
    inp.trocar = 0;
  }
  if (inp.atirar) disparar(j);

  // portas
  Object.values(j.portas).forEach((po) => {
    po.aviso = Math.max(0, po.aviso - dt);
    const d = Math.hypot(po.x + 0.5 - p.x, po.y + 0.5 - p.y);
    const ok = po.tranca === null || (po.tranca === 'vermelha' && p.chaves.vermelha) || (po.tranca === 'azul' && p.chaves.azul) || (po.tranca === 'saida' && j.chefeMorto);
    if (d < 1.9) {
      if (ok) { if (po.alvo === 0) { po.alvo = 1; som.porta(); } }
      else if (po.aviso <= 0) {
        po.aviso = 2.5; som.negado();
        mensagem(j, po.tranca === 'saida' ? 'A saída está trancada. Derrote o Gerente Supremo!' : `Trancada! Precisa do cartão ${po.tranca}.`);
      }
    } else if (d > 2.6 && po.alvo === 1 && po.tranca !== 'saida') po.alvo = 0;
    po.aberta += Math.sign(po.alvo - po.aberta) * Math.min(Math.abs(po.alvo - po.aberta), dt * 1.8);
    if (po.tranca === 'saida' && po.aberta >= 1 && d < 1.2) { j.estado = 'venceu'; som.vitoria(); }
  });

  // itens
  j.itens.forEach((it) => {
    if (it.pego || Math.hypot(it.x - p.x, it.y - p.y) > 0.65) return;
    const def = ITENS[it.tipo];
    if (!def.pode(p)) return;
    it.pego = true;
    def.usa(p);
    j.estat.itens += 1;
    mensagem(j, def.msg, def.arma || def.chave ? 'destaque' : 'info');
    if (def.arma || def.chave) som.arma(); else som.item();
  });

  // inimigos, projéteis, efeitos
  j.inimigos.forEach((e) => atualizarInimigo(j, e, dt));
  atualizarProjeteis(j, dt);
  j.efeitos = j.efeitos.filter((e) => { e.t += dt; return e.t < e.dur; });
  j.msgs.forEach((m) => { m.t += dt; });
  j.msgs = j.msgs.filter((m) => m.t < 5);
}

export { MW, danoJogador };
