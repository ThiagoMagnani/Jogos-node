// ===== IA dos pilotos rivais =====
// Cada bot recebe, na largada, um "plano de velocidade" para a pista inteira:
//   1) velocidade máxima possível em cada curva (usa o MESMO modelo de esterçada do jogador);
//   2) uma passada de trás para frente que garante que ele comece a frear a tempo.
// Durante a corrida ele persegue um ponto à frente da linha de corrida (pure pursuit),
// desvia de quem está na frente, pega vácuo e usa nitro nas retas.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const angDif = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/** Maior velocidade com que o carro consegue fazer uma curva de curvatura k. */
export function velCurva(s, k) {
  if (k < 1e-5) return s.vmax * 1.3;
  let lo = 40, hi = s.vmax * 1.3;
  for (let it = 0; it < 22; it++) {
    const mid = (lo + hi) / 2;
    const omega = s.giro / (1 + mid / s.refVel);
    if (mid * k <= omega * 0.88) lo = mid; else hi = mid;
  }
  return lo;
}

/** Plano de velocidade por amostra da pista para um carro específico. */
export function prepararBot(stats, pista) {
  const n = pista.n;
  const alvo = new Float64Array(n);
  for (let i = 0; i < n; i++) alvo[i] = Math.min(velCurva(stats, Math.abs(pista.lk[i])), stats.vmax * 1.2);
  const bd = stats.freio * 0.75; // desaceleração "de projeto" (considera um pouco de folga)
  for (let r = 0; r < 2 * n; r++) {
    const i = n - 1 - (r % n);
    const prox = alvo[(i + 1) % n];
    const lim = Math.sqrt(prox * prox + 2 * bd * pista.ds);
    if (lim < alvo[i]) alvo[i] = lim;
  }
  return alvo;
}

export function novoPerfilBot(piloto, rnd) {
  return {
    skill: piloto.skill, agress: piloto.agress, reacao: piloto.reacao,
    extra: 0, lado: 1, tLado: 0, erro: 0, tErro: 0, tProx: rnd() * 2,
  };
}

/** Decide os controles do bot neste instante. Preenche e devolve c.inp. */
export function decidirBot(c, corr, dt) {
  const p = corr.pista, b = c.bot, st = c.stats, n = p.n;
  const v = Math.max(c.vf, 0);
  const i = c.idx;

  // --- desvio / ultrapassagem: olha quem está logo à frente na mesma faixa
  let bloqueado = false;
  for (const o of corr.carros) {
    if (o === c) continue;
    const dp = o.prog - c.prog;
    const dl = o.lado - c.lado;
    if (dp > 6 && dp < 110 + v * 0.22 && Math.abs(dl) < 40) {
      bloqueado = true;
      if (b.tLado <= 0) {
        const preferido = dl > 0 ? -1 : 1;
        // se a opção escolhida já é perto da barreira, vai pro outro lado
        const futuro = c.lado + preferido * 45;
        b.lado = Math.abs(futuro) > p.larg / 2 - 14 ? -preferido : preferido;
        b.tLado = 1.1;
      }
    }
  }
  b.tLado -= dt;
  const alvoExtra = bloqueado ? b.lado * (30 + 14 * b.agress) : 0;
  b.extra += (alvoExtra - b.extra) * Math.min(1, dt * 3);
  const maxLat = p.larg / 2 - 26;
  const extra = clamp(p.off[i] + b.extra, -maxLat, maxLat) - p.off[i];

  // --- pequenos erros humanos (menos talento = mais erros)
  b.tProx -= dt;
  if (b.tProx <= 0) {
    b.tProx = 0.6 + corr.rnd();
    b.erro = corr.rnd() < (1.04 - b.skill) * 0.35 ? (corr.rnd() - 0.5) * 0.5 : 0;
    b.tErro = 0.35;
  }
  if (b.tErro > 0) b.tErro -= dt; else b.erro = 0;

  // --- mira: ponto à frente da linha de corrida
  const ld = 55 + v * 0.3;
  const j = (i + Math.round(ld / p.ds)) % n;
  const tx = p.lx[j] + p.nx[j] * extra;
  const ty = p.ly[j] + p.ny[j] * extra;
  let e = angDif(Math.atan2(ty - c.y, tx - c.x) - c.a) + b.erro;
  const giroEf = Math.max(0.3, st.giro / (1 + v / st.refVel));
  const omega = (2 * Math.max(v, 60) * Math.sin(clamp(e, -1.4, 1.4))) / ld;
  let dir = clamp(omega / giroEf, -1, 1);
  if (Math.abs(e) > 0.7) dir = Math.sign(e);

  // --- velocidade desejada
  const m = (i + 3 + Math.round((v * 0.06) / p.ds)) % n;
  const skillEf = clamp(b.skill * (1 + c.banda), 0.85, 1.08);
  let vt = c.pre[m] * skillEf;
  if (Math.abs(c.vl) > 85) vt *= 0.88;
  if (c.fora > 0.3) vt *= 0.6;
  vt = Math.min(vt, st.vmax * 1.2);

  const inp = c.inp;
  inp.dir = dir;
  inp.acel = clamp((vt - v) / 8, 0, 1);
  inp.freio = vt - v < -10 ? clamp((v - vt - 10) / 35, 0, 1) : 0;
  inp.mao = false;

  // --- nitro: só em retas, com tanque e sem esterçar forte
  let reta = true;
  for (let k = 4; k < 42; k += 6) if (Math.abs(p.lk[(i + k) % n]) > 1 / 1100) { reta = false; break; }
  inp.nitro = reta && c.nitro > 0.7 && Math.abs(dir) < 0.35 && inp.acel > 0.9 && v > st.vmax * 0.55;
  return inp;
}
