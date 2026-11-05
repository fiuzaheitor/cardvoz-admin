/**
 * Fichas coladas de uma lista: uma por linha, "pergunta; resposta".
 * Aceita também TAB (copiar duas colunas de uma planilha) e "|". Separa no
 * primeiro separador da linha; o resto fica na resposta. Linhas sem as duas
 * partes são contadas como ignoradas.
 * @param {string} texto
 * @returns {{ fichas: { question: string, answer: string }[], ignoradas: number }}
 */
export function colarFichas(texto) {
  const fichas = [];
  let ignoradas = 0;
  for (const linha of texto.split(/\r?\n/)) {
    if (!linha.trim()) continue;
    const separador = ["\t", ";", "|"].find((s) => linha.includes(s));
    const posicao = separador ? linha.indexOf(separador) : -1;
    const question = posicao >= 0 ? linha.slice(0, posicao).trim() : "";
    const answer = posicao >= 0 ? linha.slice(posicao + 1).trim() : "";
    if (question && answer) fichas.push({ question, answer });
    else ignoradas++;
  }
  return { fichas, ignoradas };
}
