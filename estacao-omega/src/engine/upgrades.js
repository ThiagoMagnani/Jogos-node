// Loja do modo Horda: melhorias permanentes (na partida) e compras avulsas, pagas com créditos dos abates.
export const UPGRADES = [
  { id: 'vida', nome: 'Reforço Cardíaco', desc: '+25 vida máxima (e cura 25)', icone: '❤', max: 6, custo: (n) => 55 + 35 * n, aplica: (p) => { p.vidaMax += 25; p.vida = Math.min(p.vidaMax, p.vida + 25); } },
  { id: 'escudo', nome: 'Gerador de Escudo', desc: '+25 escudo máximo (e recarrega 25)', icone: '🛡', max: 4, custo: (n) => 50 + 35 * n, aplica: (p) => { p.escudoMax += 25; p.escudo = Math.min(p.escudoMax, p.escudo + 25); } },
  { id: 'dano', nome: 'Munição Perfurante', desc: '+12% de dano em todas as armas', icone: '💥', max: 8, custo: (n) => 80 + 55 * n, aplica: (p) => { p.mod.dano += 0.12; } },
  { id: 'cad', nome: 'Gatilho Rápido', desc: 'Armas atiram 8% mais rápido', icone: '⚡', max: 6, custo: (n) => 65 + 50 * n, aplica: (p) => { p.mod.cad *= 0.92; } },
  { id: 'mun', nome: 'Bolsa Expandida', desc: '+20% de munição máxima', icone: '🎒', max: 5, custo: (n) => 45 + 35 * n, aplica: (p) => { p.mod.municao += 0.2; } },
  { id: 'vel', nome: 'Servo-Pernas', desc: '+6% de velocidade', icone: '👟', max: 4, custo: (n) => 55 + 40 * n, aplica: (p) => { p.mod.vel += 0.06; } },
  { id: 'dash', nome: 'Propulsor (Q)', desc: 'Dash recarrega 0,25s mais rápido', icone: '💨', max: 4, custo: (n) => 50 + 45 * n, aplica: (p) => { p.mod.dashCd = Math.max(0.6, p.mod.dashCd - 0.25); } },
  { id: 'onda', nome: 'Onda de Choque (F)', desc: '+30 de dano e recarga 1,5s menor', icone: '🌀', max: 5, custo: (n) => 65 + 50 * n, aplica: (p) => { p.mod.ondaDano += 30; p.mod.ondaCd = Math.max(4, p.mod.ondaCd - 1.5); } },
  { id: 'regen', nome: 'Nanoreparo', desc: '+0,8 de vida por segundo', icone: '✚', max: 4, custo: (n) => 90 + 65 * n, aplica: (p) => { p.mod.regen += 0.8; } },
  { id: 'vampiro', nome: 'Sede Biológica', desc: '+2 de vida a cada abate', icone: '🩸', max: 4, custo: (n) => 110 + 80 * n, aplica: (p) => { p.mod.vampiro += 2; } },
  { id: 'credito', nome: 'Contrato de Caça', desc: '+15% de créditos por abate', icone: '💰', max: 4, custo: (n) => 65 + 55 * n, aplica: (p) => { p.mod.credito += 0.15; } },
];

export const COMPRAS = [
  { id: 'kit', nome: 'Kit Médico', desc: '+50 de vida', custo: 35, icone: '➕', aplica: (p) => { p.vida = Math.min(p.vidaMax, p.vida + 50); }, pode: (p) => p.vida < p.vidaMax },
  { id: 'escudoR', nome: 'Célula de Escudo', desc: '+50 de escudo', custo: 40, icone: '🔷', aplica: (p) => { p.escudo = Math.min(p.escudoMax, p.escudo + 50); }, pode: (p) => p.escudo < p.escudoMax },
  { id: 'municaoR', nome: 'Reabastecer Munição', desc: 'Enche a munição de todas as armas', custo: 50, icone: '📦', aplica: 'municao', pode: () => true },
];

export const ARMAS_LOJA = [
  { id: 'escopeta', custo: 80 }, { id: 'pulso', custo: 195 }, { id: 'plasma', custo: 330 }, { id: 'trilho', custo: 495 },
];

export const nivelDe = (j, id) => j.horda.niveis[id] || 0;

/** Tenta comprar algo. Retorna texto de resultado. */
export function comprar(j, tipo, id, ARMAS, maxMun) {
  const p = j.jogador;
  const h = j.horda;
  if (h.infinito) h.creditos = 999999;
  if (tipo === 'up') {
    const u = UPGRADES.find((x) => x.id === id);
    const n = nivelDe(j, id);
    if (n >= u.max) return 'Nível máximo!';
    const c = u.custo(n);
    if (h.creditos < c) return 'Créditos insuficientes.';
    h.creditos -= c; h.niveis[id] = n + 1; u.aplica(p);
    return `${u.nome} nível ${n + 1}!`;
  }
  if (tipo === 'item') {
    const it = COMPRAS.find((x) => x.id === id);
    if (h.creditos < it.custo) return 'Créditos insuficientes.';
    if (!it.pode(p)) return 'Já está no máximo.';
    h.creditos -= it.custo;
    if (it.aplica === 'municao') Object.keys(ARMAS).forEach((k) => { if (p.armas[k]) p.municao[k] = maxMun(p, k); });
    else it.aplica(p);
    return `${it.nome} comprado.`;
  }
  const a = ARMAS_LOJA.find((x) => x.id === id);
  if (p.armas[id]) { p.municao[id] = maxMun(p, id); return 'Munição da arma recarregada (grátis na compra de arma).'; }
  if (h.creditos < a.custo) return 'Créditos insuficientes.';
  h.creditos -= a.custo; p.armas[id] = true; p.municao[id] = Math.round(maxMun(p, id) * 0.6); p.arma = id;
  return `${ARMAS[id].nome} adquirida!`;
}
