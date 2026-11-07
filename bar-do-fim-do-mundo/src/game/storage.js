// Salva o progresso no navegador (localStorage). Tudo em try/catch: se o navegador
// bloquear o armazenamento, o jogo continua funcionando, só não salva.
const CHAVE = 'bar-do-fim-do-mundo:save:v1';

export function salvarJogo(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch (e) {
    /* sem armazenamento disponível: ignorar */
  }
}

export function carregarJogo() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : null;
  } catch (e) {
    return null;
  }
}

export function apagarJogo() {
  try {
    localStorage.removeItem(CHAVE);
  } catch (e) {
    /* ignorar */
  }
}

// Finais já descobertos (ficam salvos separados do progresso, para sobreviver a "novo jogo").
const CHAVE_FINAIS = 'bar-do-fim-do-mundo:finais:v1';

export function carregarFinais() {
  try {
    const bruto = localStorage.getItem(CHAVE_FINAIS);
    return bruto ? JSON.parse(bruto) : [];
  } catch (e) {
    return [];
  }
}

export function registrarFinal(tipo) {
  try {
    const atuais = carregarFinais();
    if (!atuais.includes(tipo)) localStorage.setItem(CHAVE_FINAIS, JSON.stringify([...atuais, tipo]));
  } catch (e) {
    /* ignorar */
  }
}
