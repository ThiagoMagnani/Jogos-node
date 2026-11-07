import { NOITES, slotsDaNoite } from '../data/nights';
import { acharSolucoes, calcularMistura, calcularVeredito, avaliarPistas } from './mixer';
import { ingredientesDisponiveis, tecnicasDisponiveis } from './rules';

test('os sabores dos ingredientes e da técnica se somam', () => {
  const s = calcularMistura(['mel', 'brasa'], 'direto');
  expect(s.doce).toBe(2);
  expect(s.temp).toBe(2);
  expect(calcularMistura(['gelo'], 'gelo').temp).toBe(-5);
});

test('técnica sozinha não altera um copo vazio', () => {
  expect(calcularMistura([], 'flambar').temp).toBe(0);
});

test('Marlene fica perfeita com Lágrima de Sereia', () => {
  const marlene = NOITES[0].clientes[0];
  const pistas = avaliarPistas(marlene, calcularMistura(['lagrima'], 'direto'));
  expect(calcularVeredito(pistas)).toBe('perfeito');
});

test('todo cliente tem pelo menos uma receita possível', () => {
  NOITES.forEach((noite) => {
    const ings = ingredientesDisponiveis(noite.numero, []).map((i) => i.id);
    const techs = tecnicasDisponiveis(noite.numero).map((t) => t.id);
    noite.clientes.forEach((c) => {
      expect(acharSolucoes(c, ings, techs, slotsDaNoite(noite.numero), 1).length).toBeGreaterThan(0);
    });
  });
});
