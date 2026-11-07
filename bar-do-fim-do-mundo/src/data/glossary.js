// O "dicionário de clientes": traduz o jeito enigmático de falar para números.
// Aparece dentro do Grimório e no tutorial.

export const INTENSIDADES = [
  { frase: 'um toque de · um pouquinho de · uma pitada de', regra: '1 ou mais', nota: 'Basta aparecer.' },
  { frase: 'bastante', regra: '2 ou mais', nota: 'Tem que ser notado.' },
  { frase: 'muito · de sobra', regra: '3 ou mais', nota: 'Tem que dominar o copo.' },
  { frase: 'nada de · sem · zero de', regra: 'exatamente 0', nota: 'Nem uma gota.' },
];

export const TEMPERATURAS = [
  { frase: 'quente · calor', regra: 'temperatura 1 ou mais' },
  { frase: 'bem quente · calor bastante', regra: 'temperatura 2 ou mais' },
  { frase: 'fervendo', regra: 'temperatura 3 ou mais' },
  { frase: '... mas sem queimar', regra: 'no máximo 2' },
  { frase: 'morno · nem frio nem quente', regra: 'de -1 até 1' },
  { frase: 'fresco · fresquinho · fresca', regra: 'temperatura -1 ou menos' },
  { frase: 'gelado', regra: 'temperatura -2 ou menos' },
  { frase: 'congelante', regra: 'temperatura -3 ou menos' },
  { frase: 'nada de frio', regra: 'temperatura 0 ou mais' },
];

export const SABORES = [
  { stat: 'doce', palavras: 'doce · bolo · açúcar · mel' },
  { stat: 'azedo', palavras: 'azedo · ácido · careta · arrependimento' },
  { stat: 'amargo', palavras: 'amargo · café · remédio · segunda-feira' },
  { stat: 'picante', palavras: 'picante · morde a língua · pimenta · esperança' },
  { stat: 'salgado', palavras: 'sal · mar · maresia · lágrima' },
  { stat: 'magia', palavras: 'brilho · mágica · estrelas · lembranças' },
];

export const DICAS = [
  'Os ingredientes se somam. Dois ingredientes iguais dobram o sabor.',
  'Técnicas de preparo também somam (ou subtraem) sabores. O gelo, por exemplo, esfria o drink.',
  'O medidor do copo mostra o resultado final antes de você servir.',
  'Algumas pistas combinam duas condições: "quente, mas sem queimar" tem um mínimo e um máximo.',
  'Clientes especiais deixam presentes se o drink sair perfeito. Presentes são ingredientes raros!',
];
