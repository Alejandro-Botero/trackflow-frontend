import { http, TIEMPO_NORMAL } from "./client";
import { normalizarGuia } from "../lib/guia";
import type {
  EnvioAdmitidoResponse,
  EventoAdmitidoResponse,
  RegistrarEnvioRequest,
  RegistrarEventoRequest,
} from "./tipos";

export function registrarEnvio(datos: RegistrarEnvioRequest): Promise<EnvioAdmitidoResponse> {
  return http
    .post<EnvioAdmitidoResponse>("/api/shipments", datos, { timeout: TIEMPO_NORMAL })
    .then((respuesta) => respuesta.data);
}

export function registrarEvento(
  guia: string,
  datos: RegistrarEventoRequest,
): Promise<EventoAdmitidoResponse> {
  return http
    .post<EventoAdmitidoResponse>(`/api/shipments/${normalizarGuia(guia)}/events`, datos, {
      timeout: TIEMPO_NORMAL,
    })
    .then((respuesta) => respuesta.data);
}
