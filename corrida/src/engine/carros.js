// ===== Carros, upgrades e pilotos =====
// Os números de desempenho do carro vêm de UMA função (calcularStats): o jogador e os bots
// usam exatamente o mesmo modelo físico, a diferença é só o nível dos upgrades e o talento.

export const MAX_NIVEL = 5;

/** Modelos de carro. "bloqueado" = chega na segunda metade do jogo. */
export const MODELOS = {
  besouro: {
    id: 'besouro', nome: 'Besouro GT', preco: 0, cor: '#ff3b3b',
    desc: 'Leve e ágil. Perdoa erros e adora curvas.',
    base: { vmax: 500, acel: 320, freio: 760, giro: 2.5, grip: 6.6, nitro: 3.0 }, massa: 1.0,
  },
  pantera: {
    id: 'pantera', nome: 'Pantera RS', preco: 14000, cor: '#b24bff',
    desc: 'Equilibrado: mais motor sem perder aderência.',
    base: { vmax: 540, acel: 345, freio: 800, giro: 2.45, grip: 7.0, nitro: 3.4 }, massa: 1.1,
  },
  cometa: {
    id: 'cometa', nome: 'Cometa X', preco: 34000, cor: '#4fe3ff',
    desc: 'Foguete de reta longa. Exige pilotagem limpa.',
    base: { vmax: 585, acel: 375, freio: 840, giro: 2.4, grip: 7.3, nitro: 3.8 }, massa: 1.2,
  },
  fantasma: {
    id: 'fantasma', nome: 'Fantasma 9', preco: 70000, cor: '#e8e8ff', bloqueado: true,
    desc: 'Protótipo secreto. Chega na 2ª metade do jogo.',
    base: { vmax: 620, acel: 400, freio: 880, giro: 2.4, grip: 7.6, nitro: 4.2 }, massa: 1.25,
  },
};

export const UPGRADES = [
  { id: 'motor', nome: 'Motor', icone: '⚙️', base: 600, desc: 'Mais aceleração e velocidade máxima.' },
  { id: 'turbo', nome: 'Nitro', icone: '🔥', base: 450, desc: 'Tanque maior, recarga mais rápida e mais empuxo.' },
  { id: 'pneus', nome: 'Pneus', icone: '🛞', base: 500, desc: 'Mais aderência e resposta nas curvas.' },
  { id: 'freios', nome: 'Freios', icone: '🛑', base: 350, desc: 'Frenagens mais curtas e estáveis.' },
  { id: 'aero', nome: 'Aerodinâmica', icone: '🪽', base: 400, desc: 'Mantém a esterçada em alta velocidade.' },
];

export const CORES = ['#ff3b3b', '#ffd23b', '#4fe3ff', '#7dff9a', '#b24bff', '#ff8a3b', '#ff5fd2', '#f4eaff'];

/** Preço do próximo nível (cresce a cada compra). */
export const custoUpgrade = (id, nivel) => {
  const u = UPGRADES.find((x) => x.id === id);
  return Math.round((u.base * (1 + 0.9 * nivel) * (1 + 0.12 * nivel)) / 10) * 10;
};

export const niveisZerados = () => ({ motor: 0, turbo: 0, pneus: 0, freios: 0, aero: 0 });

/** Converte (modelo + níveis dos upgrades) nos números usados pela física. Níveis podem ser fracionados (bots). */
export function calcularStats(modeloId, niveis) {
  const m = MODELOS[modeloId] || MODELOS.besouro;
  const b = m.base;
  const n = { ...niveisZerados(), ...niveis };
  const stats = {
    vmax: b.vmax * (1 + 0.04 * n.motor) * (1 + 0.025 * n.aero),
    acel: b.acel * (1 + 0.07 * n.motor),
    freio: b.freio * (1 + 0.09 * n.freios),
    giro: b.giro * (1 + 0.035 * n.pneus),
    grip: b.grip * (1 + 0.07 * n.pneus) * (1 + 0.02 * n.freios),
    refVel: 450 * (1 + 0.1 * n.aero),
    nitroCap: b.nitro + 0.6 * n.turbo,
    nitroRec: 0.1 * (1 + 0.12 * n.turbo),
    nitroForca: 0.9 + 0.05 * n.turbo,
    massa: m.massa,
  };
  stats.rating = Math.round(100 * (
    0.26 * stats.vmax / 500 + 0.22 * stats.acel / 320 + 0.08 * stats.freio / 760 + 0.12 * stats.giro / 2.5 +
    0.14 * stats.grip / 6.6 + 0.08 * stats.nitroCap / 3 + 0.05 * stats.refVel / 450 + 0.05 * stats.massa));
  return stats;
}

/** Pilotos rivais. skill = talento (1.0 = referência), agress = quão perto passa dos outros. */
export const PILOTOS = [
  { nome: 'Rafa Nitro', cor: '#4fe3ff', modelo: 'besouro', skill: 1.01, agress: 0.7, reacao: 0.12, nivelDelta: 0.2 },
  { nome: 'Duda Drift', cor: '#ffd23b', modelo: 'pantera', skill: 0.99, agress: 0.9, reacao: 0.2, nivelDelta: 0.0 },
  { nome: 'Cadu Zero', cor: '#7dff9a', modelo: 'besouro', skill: 1.0, agress: 0.4, reacao: 0.1, nivelDelta: 0.3 },
  { nome: 'Mari Turbo', cor: '#ff5fd2', modelo: 'pantera', skill: 1.02, agress: 0.5, reacao: 0.14, nivelDelta: -0.1 },
  { nome: 'Bruno Freio', cor: '#ff8a3b', modelo: 'besouro', skill: 0.98, agress: 0.8, reacao: 0.25, nivelDelta: 0.4 },
  { nome: 'Lu Relâmpago', cor: '#b24bff', modelo: 'cometa', skill: 1.0, agress: 0.6, reacao: 0.16, nivelDelta: -0.4 },
  { nome: 'Kiko Kamikaze', cor: '#f4eaff', modelo: 'pantera', skill: 0.97, agress: 1.0, reacao: 0.3, nivelDelta: 0.1 },
];
