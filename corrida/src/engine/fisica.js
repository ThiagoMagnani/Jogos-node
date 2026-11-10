// ===== Física arcade do carro =====
// O carro tem uma direção (a) e uma velocidade (vx, vy). A velocidade é separada em
//   vf = parte "para frente" e vl = parte "de lado".
// O pneu amortece a parte lateral (grip): grip alto = anda "no trilho"; grip baixo
// (freio de mão, grama) = o carro derrapa. A esterçada gira a direção e a velocidade vai atrás.

export const CARRO = { comp: 46, larg: 22, raio: 12.5, braco: 11 };

/** Cria o estado físico de um carro. */
export function novoCarro(stats, pos) {
  return {
    stats, x: pos.x, y: pos.y, a: pos.a, vx: 0, vy: 0, vf: 0, vl: 0,
    dir: 0, giro: 0, nitro: stats.nitroCap * 0.6, nitroOn: false,
    fora: 0, derrapa: 0, vacuo: 0, freando: false, roda: 0,
  };
}

/**
 * Avança a física de UM carro por dt segundos.
 * inp = { dir: -1..1, acel: 0..1, freio: 0..1, nitro: bool, mao: bool }
 */
export function passoFisico(c, inp, dt) {
  const s = c.stats;

  // direção suavizada: o teclado vira "analógico" (volante demora um pouco a virar)
  const taxa = Math.abs(inp.dir) > 0.01 ? 7.5 : 12;
  c.dir += (inp.dir - c.dir) * Math.min(1, dt * taxa);

  // nitro: gasta enquanto usa e recarrega quando solta (o vácuo recarrega mais rápido)
  const usa = !!inp.nitro && c.nitro > 0.02 && inp.acel > 0;
  c.nitroOn = usa;
  if (usa) c.nitro = Math.max(0, c.nitro - dt);
  else c.nitro = Math.min(s.nitroCap, c.nitro + (s.nitroRec + c.vacuo * 0.2) * dt);

  // 1) esterçar (usa a velocidade que o carro tinha no começo do passo)
  const vs = Math.abs(c.vf);
  const giroMax = s.giro / (1 + vs / s.refVel);       // em alta velocidade o volante "endurece"
  const sentido = c.vf < -1 ? -1 : 1;
  c.giro = c.dir * giroMax * Math.min(1, vs / 70) * sentido * (inp.mao ? 1.35 : 1);
  c.a += c.giro * dt;

  // 2) separar a velocidade em frente/lado com a nova direção
  const cos = Math.cos(c.a), sin = Math.sin(c.a);
  let vf = c.vx * cos + c.vy * sin;
  let vl = -c.vx * sin + c.vy * cos;
  const fora = c.fora;
  const vmaxLoc = s.vmax * (1 + (usa ? 0.18 : 0) + c.vacuo * 0.04) * (1 - 0.5 * fora);

  // 3) motor, freio e arrasto
  if (inp.acel > 0) {
    const p = Math.max(0, 1 - Math.max(vf, 0) / vmaxLoc);
    vf += s.acel * (1 + (usa ? s.nitroForca : 0)) * (1 + c.vacuo * 0.15) * inp.acel * p * dt;
  } else if (inp.freio <= 0) {
    vf -= vf * 0.5 * dt;                               // freio-motor
  }
  c.freando = inp.freio > 0 && vf > 8;
  if (inp.freio > 0) {
    if (vf > 8) vf = Math.max(0, vf - s.freio * inp.freio * (1 - 0.4 * fora) * dt);
    else vf = Math.max(-s.vmax * 0.3, vf - s.acel * 0.55 * inp.freio * dt); // ré
  }
  if (vf > vmaxLoc) vf -= (vf - vmaxLoc) * 2.2 * dt;   // passou do limite (acabou o nitro, grama...)
  vf -= vf * 2.0 * fora * dt;                          // grama segura o carro
  if (inp.mao) vf -= vf * 0.45 * dt;

  // 4) aderência dos pneus: amortece a velocidade lateral (o que sobra vira derrapagem)
  const grip = s.grip * (1 - 0.6 * fora) * (inp.mao ? 0.22 : 1);
  const vl2 = vl * Math.exp(-grip * dt);
  vf -= Math.sign(vf) * Math.min(Math.abs(vf), Math.abs(vl - vl2) * 0.3); // derrapar custa velocidade
  vl = vl2;

  // 5) recompor e andar
  c.vx = vf * cos - vl * sin;
  c.vy = vf * sin + vl * cos;
  c.x += c.vx * dt;
  c.y += c.vy * dt;
  c.vf = vf; c.vl = vl;
  c.derrapa = Math.max(0, Math.min(1, (Math.abs(vl) - 45) / 60));
  c.roda += vf * dt;
}
