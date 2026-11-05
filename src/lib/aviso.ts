/** Aviso que aparece na próxima página (ex.: "“Biologia” salvo." depois do editor). */
const CHAVE = "cardvoz-admin.aviso";

export function guardarAviso(texto: string) {
  try {
    sessionStorage.setItem(CHAVE, texto);
  } catch {}
}

export function lerAviso(): string {
  try {
    const texto = sessionStorage.getItem(CHAVE) ?? "";
    sessionStorage.removeItem(CHAVE);
    return texto;
  } catch {
    return "";
  }
}
