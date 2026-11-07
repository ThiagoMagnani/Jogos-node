import { MW, MH } from './map';

// Resultado reaproveitado (evita criar objetos 320x por quadro).
export const RES = { dist: 0, lado: 0, u: 0, tipo: 0 };

/** Parede/porta sólida para movimento? Portas abertas (>70%) deixam passar. */
export function solido(j, cx, cy) {
  if (cx < 0 || cy < 0 || cx >= MW || cy >= MH) return true;
  const v = j.grade[cy * MW + cx];
  if (v === 0) return false;
  const p = j.portas[cy * MW + cx];
  return p ? p.aberta < 0.7 : true;
}

/** Círculo livre? (colisão de jogador, inimigos e projéteis) */
export function livre(j, x, y, r) {
  return !solido(j, Math.floor(x - r), Math.floor(y - r)) && !solido(j, Math.floor(x + r), Math.floor(y - r)) &&
    !solido(j, Math.floor(x - r), Math.floor(y + r)) && !solido(j, Math.floor(x + r), Math.floor(y + r));
}

/** DDA: lança um raio e preenche RES com a primeira parede. Portas deslizam para o lado. */
export function lancarRaio(j, ox, oy, dx, dy) {
  let mx = Math.floor(ox);
  let my = Math.floor(oy);
  const ddx = Math.abs(1 / (dx || 1e-9));
  const ddy = Math.abs(1 / (dy || 1e-9));
  const sx = dx < 0 ? -1 : 1;
  const sy = dy < 0 ? -1 : 1;
  let lx = (dx < 0 ? ox - mx : mx + 1 - ox) * ddx;
  let ly = (dy < 0 ? oy - my : my + 1 - oy) * ddy;
  let lado = 0;

  for (let i = 0; i < 80; i++) {
    if (lx < ly) { lx += ddx; mx += sx; lado = 0; } else { ly += ddy; my += sy; lado = 1; }
    if (mx < 0 || my < 0 || mx >= MW || my >= MH) break;
    const v = j.grade[my * MW + mx];
    if (v === 0) continue;
    const dist = lado === 0 ? lx - ddx : ly - ddy;
    let u = lado === 0 ? oy + dist * dy : ox + dist * dx;
    u -= Math.floor(u);
    const porta = j.portas[my * MW + mx];
    if (porta) {
      if (porta.aberta >= 1) continue;
      if (u < porta.aberta) continue; // parte já deslizada: o raio passa
      u -= porta.aberta;
    }
    RES.dist = dist; RES.lado = lado; RES.u = u; RES.tipo = v;
    return RES;
  }
  RES.dist = 40; RES.lado = 0; RES.u = 0; RES.tipo = 1;
  return RES;
}

/** Existe linha de visão livre entre dois pontos? */
export function temLinha(j, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Math.hypot(dx, dy);
  if (d < 0.01) return true;
  return lancarRaio(j, x0, y0, dx / d, dy / d).dist >= d - 0.05;
}
