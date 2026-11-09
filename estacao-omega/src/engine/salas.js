import { MW, MH } from './map';

/** Divide o mapa em "salas": regiões de chão ligadas sem passar por portas. Regiões enormes (labirinto) são fatiadas em blocos. */
export function calcularSalas(grade) {
  const id = new Int16Array(MW * MH).fill(-1);
  let n = 0;
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      if (grade[y * MW + x] !== 0 || id[y * MW + x] !== -1) continue;
      const pilha = [[x, y]];
      const cels = [];
      id[y * MW + x] = n;
      while (pilha.length) {
        const [cx, cy] = pilha.pop();
        cels.push(cy * MW + cx);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => {
          const nx = cx + a; const ny = cy + b;
          if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) return;
          const k = ny * MW + nx;
          if (grade[k] === 0 && id[k] === -1) { id[k] = n; pilha.push([nx, ny]); }
        });
      }
      if (cels.length > 380) cels.forEach((k) => { id[k] = n * 100 + 50 + Math.floor((k % MW) / 9) + 5 * Math.floor(Math.floor(k / MW) / 9); });
      n += 1;
    }
  }
  return id;
}

export const salaDe = (j, x, y) => {
  const xi = Math.floor(x); const yi = Math.floor(y);
  if (xi < 0 || yi < 0 || xi >= MW || yi >= MH) return -1;
  return j.salas[yi * MW + xi];
};
