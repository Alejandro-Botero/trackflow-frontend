// Formato en español de Colombia, zona horaria local del navegador (sin Intl.DateTimeFormat
// para evitar variaciones de puntuación entre entornos, p. ej. "ago." vs "ago").
const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

function pad2(valor: number): string {
  return valor.toString().padStart(2, "0");
}

export function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  const dia = fecha.getDate();
  const mes = MESES[fecha.getMonth()];
  const anio = fecha.getFullYear();
  return `${dia} ${mes} ${anio}`;
}

export function formatearFechaHora(iso: string): string {
  const fecha = new Date(iso);
  const horas = pad2(fecha.getHours());
  const minutos = pad2(fecha.getMinutes());
  return `${formatearFecha(iso)}, ${horas}:${minutos}`;
}

/** Valor para `<input type="datetime-local">` a partir de una fecha local. */
export function aLocalDateTimeInput(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = pad2(fecha.getMonth() + 1);
  const dia = pad2(fecha.getDate());
  const horas = pad2(fecha.getHours());
  const minutos = pad2(fecha.getMinutes());
  return `${anio}-${mes}-${dia}T${horas}:${minutos}`;
}

/** El valor de un `datetime-local` no trae zona horaria: el motor JS lo interpreta como hora
 *  local, por eso basta con pasarlo a ISO. */
export function deLocalDateTimeInputAIso(valor: string): string {
  return new Date(valor).toISOString();
}
