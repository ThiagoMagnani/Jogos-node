// Melhorias vendidas na loja entre uma noite e outra (a "Prateleira do Tião").
export const MELHORIAS = [
  {
    id: 'relogio',
    nome: 'Relógio do Tião',
    icon: '⏳',
    preco: 40,
    desc: 'Todos os clientes ficam 30% mais pacientes. O tempo anda mais devagar perto dele.',
  },
  {
    id: 'lupa',
    nome: 'Lupa do Grimório',
    icon: '🔍',
    preco: 45,
    desc: '+2 pistas reveladas por noite. A lupa mostra o número exato por trás de uma frase.',
  },
  {
    id: 'copo',
    nome: 'Copo Encantado',
    icon: '🥂',
    preco: 60,
    desc: 'Em cada noite, o primeiro drink ruim não custa nenhuma vida. Um perdão por noite.',
  },
  {
    id: 'coracao',
    nome: 'Coração Extra',
    icon: '❤️',
    preco: 70,
    desc: '+1 vida por noite. Mais uma chance de errar sem fechar o bar.',
  },
  {
    id: 'jukebox',
    nome: 'Jukebox Antiga',
    icon: '🎵',
    preco: 50,
    desc: 'Música boa deixa todo mundo generoso: +25% de gorjeta.',
  },
];

// Item consumível, pode ser comprado várias vezes.
export const PACOTE_PISTAS = {
  id: 'pistas',
  nome: 'Pacote de Pistas',
  icon: '📜',
  preco: 15,
  desc: '+1 pista extra na próxima noite.',
};
