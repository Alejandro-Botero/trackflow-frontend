export const PATRON_GUIA: RegExp = /^TF\d{12}$/;

/** trim + toUpperCase, la normalización estándar de la guía en toda la app. */
export function normalizarGuia(valor: string): string {
  return valor.trim().toUpperCase();
}

export function esGuiaValida(valor: string): boolean {
  return PATRON_GUIA.test(normalizarGuia(valor));
}

export function errorDeGuia(valor: string): string | null {
  const normalizada = normalizarGuia(valor);
  if (normalizada === "") {
    return "Escribe un número de guía.";
  }
  if (!PATRON_GUIA.test(normalizada)) {
    return "El número de guía tiene el formato TF seguido de 12 dígitos, por ejemplo TF000000000001.";
  }
  return null;
}
