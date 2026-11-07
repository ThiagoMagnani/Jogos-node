// Mapa do supermercado, montado por código (salas escavadas dentro de um bloco de parede).
// Tipos de parede: 1 prateleira · 2 azulejo · 3 freezer · 4 caixotes · 5 porta de vidro
// 6 madeira (gerência) · 7 porta ESTOQUE (cartão vermelho) · 8 porta GERÊNCIA (cartão azul) · 9 SAÍDA
export const MW = 36;
export const MH = 30;

const TRANCA = { 5: null, 7: 'vermelha', 8: 'azul', 9: 'saida' };

export function criarFase() {
  const g = Array.from({ length: MH }, () => Array(MW).fill('2'));
  const fill = (x0, y0, x1, y1, c) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c;
  };
  const sala = (x0, y0, x1, y1, parede) => {
    fill(x0 - 1, y0 - 1, x1 + 1, y1 + 1, parede);
    fill(x0, y0, x1, y1, '.');
  };

  sala(1, 24, 34, 28, '2'); // entrada / caixas
  sala(1, 8, 34, 22, '2'); // corredores
  fill(16, 23, 19, 23, '.'); // passagem entrada -> corredores
  // balcões dos caixas (cobertura)
  fill(10, 24, 10, 26, '2');
  fill(15, 26, 15, 28, '2');
  fill(20, 24, 20, 26, '2');
  fill(25, 26, 25, 28, '2');
  // prateleiras com vãos alternados
  [10, 13, 16, 19].forEach((y, i) => {
    fill(3, y, 30, y, '1');
    (i % 2 ? [14, 20] : [8, 25]).forEach((x) => {
      g[y][x] = '.';
    });
  });
  sala(23, 2, 34, 6, '3'); // freezer
  g[7][28] = '5';
  g[7][29] = '5';
  sala(1, 2, 11, 6, '4'); // estoque
  g[7][6] = '7';
  sala(14, 2, 20, 6, '6'); // sala do gerente
  g[7][17] = '8';
  g[1][17] = '9'; // saída

  const grade = new Uint8Array(MW * MH);
  const portas = {};
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const c = g[y][x];
      const v = c === '.' ? 0 : Number(c);
      grade[y * MW + x] = v;
      if (TRANCA[v] !== undefined) portas[y * MW + x] = { x, y, tipo: v, aberta: 0, alvo: 0, tranca: TRANCA[v], aviso: 0 };
    }
  }

  const inimigos = [
    // entrada
    ['banana', 22, 27], ['lata', 30, 25], ['tomate', 32, 27],
    // corredores
    ['carrinho', 8, 9], ['tomate', 18, 9], ['tomate', 29, 9], ['banana', 20, 9],
    ['carrinho', 26, 12], ['lata', 6, 12], ['tomate', 20, 15], ['banana', 30, 15],
    ['fantasma', 10, 18], ['lata', 24, 18], ['carrinho', 4, 21], ['fantasma', 28, 21], ['tomate', 14, 21],
    // freezer
    ['galinha', 26, 3], ['galinha', 30, 3], ['galinha', 33, 5], ['galinha', 25, 5], ['banana', 29, 5],
    // estoque
    ['lata', 3, 3], ['lata', 5, 5], ['lata', 8, 3], ['lata', 10, 5], ['carrinho', 7, 4], ['fantasma', 9, 6],
    // chefe
    ['gerente', 17, 3],
  ];

  const itens = [
    ['municao', 5, 26], ['maca', 3, 24],
    ['espingarda', 2, 11], ['ervilhas', 31, 12], ['pizza', 33, 9], ['maca', 2, 18], ['municao', 33, 18],
    ['ervilhas', 17, 21], ['maca', 9, 15], ['pizza', 21, 12], ['municao', 12, 9], ['maca', 15, 18],
    ['chaveVermelha', 33, 3], ['pizza', 24, 3], ['ervilhas', 32, 6], ['municao', 28, 6],
    ['canhao', 2, 3], ['chaveAzul', 11, 4], ['pao', 10, 3], ['pao', 4, 6], ['pizza', 2, 6], ['municao', 6, 2],
    ['pizza', 14, 5], ['ervilhas', 20, 5], ['municao', 14, 2], ['pao', 20, 2], ['maca', 20, 6],
  ];

  return { grade, portas, inimigos, itens, inicio: { x: 3.5, y: 26.5, ang: 0 } };
}
