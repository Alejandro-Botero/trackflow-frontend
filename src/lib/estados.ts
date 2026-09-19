import type { EstadoEnvio, TipoEvento } from "../api/tipos";

export const ESTADOS: ReadonlyArray<{ valor: EstadoEnvio; etiqueta: string; orden: number }> = [
  { valor: "REGISTERED", etiqueta: "Registrado", orden: 0 },
  { valor: "AT_DISTRIBUTION_CENTER", etiqueta: "En centro de distribución", orden: 1 },
  { valor: "IN_TRANSIT", etiqueta: "En tránsito", orden: 2 },
  { valor: "OUT_FOR_DELIVERY", etiqueta: "En reparto", orden: 3 },
  { valor: "DELIVERED", etiqueta: "Entregado", orden: 4 },
];

export function etiquetaEstado(estado: EstadoEnvio): string {
  return ESTADOS.find((item) => item.valor === estado)?.etiqueta ?? estado;
}

export function ordenEstado(estado: EstadoEnvio): number {
  return ESTADOS.find((item) => item.valor === estado)?.orden ?? -1;
}

export const TIPOS_EVENTO: ReadonlyArray<{
  valor: TipoEvento;
  etiqueta: string;
  resultante: EstadoEnvio;
}> = [
  { valor: "RECEIVED_AT_CENTER", etiqueta: "Recibido en centro", resultante: "AT_DISTRIBUTION_CENTER" },
  { valor: "DISPATCHED", etiqueta: "Despachado", resultante: "IN_TRANSIT" },
  {
    valor: "ARRIVED_AT_DESTINATION_CENTER",
    etiqueta: "Llegó al centro de destino",
    resultante: "AT_DISTRIBUTION_CENTER",
  },
  { valor: "OUT_FOR_DELIVERY", etiqueta: "Salió a reparto", resultante: "OUT_FOR_DELIVERY" },
  { valor: "DELIVERED", etiqueta: "Entregado", resultante: "DELIVERED" },
];

export function etiquetaTipoEvento(tipo: TipoEvento): string {
  return TIPOS_EVENTO.find((item) => item.valor === tipo)?.etiqueta ?? tipo;
}
