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

export function consultarHistorial(guia: string): Promise<EventoLogisticoResponse[]> {
  return http
    .get<EventoLogisticoResponse[]>(`/api/shipments/${normalizarGuia(guia)}/events`, {
      timeout: TIEMPO_RASTREO,
    })
    .then((respuesta) => respuesta.data);
}
