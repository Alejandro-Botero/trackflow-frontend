import { http, TIEMPO_RASTREO } from "./client";
import { normalizarGuia } from "../lib/guia";
import type { EstadoEnvioResponse, EventoLogisticoResponse } from "./tipos";

export function consultarEstado(guia: string): Promise<EstadoEnvioResponse> {
  return http
    .get<EstadoEnvioResponse>(`/api/tracking/${normalizarGuia(guia)}`, {
      timeout: TIEMPO_RASTREO,
    })
    .then((respuesta) => respuesta.data);
}

// HU-04 (historial de movimientos): fuera del alcance de este sprint, así que hoy no la llama
// ninguna pantalla. Se mantiene porque la firma es parte del contrato (docs/contrato-ui.md §5).
export function consultarHistorial(guia: string): Promise<EventoLogisticoResponse[]> {
  return http
    .get<EventoLogisticoResponse[]>(`/api/shipments/${normalizarGuia(guia)}/events`, {
      timeout: TIEMPO_RASTREO,
    })
    .then((respuesta) => respuesta.data);
}
