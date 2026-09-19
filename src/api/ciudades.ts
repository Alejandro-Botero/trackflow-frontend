import { http, TIEMPO_CIUDADES } from "./client";
import type { CiudadResponse } from "./tipos";

export function buscarCiudades(q: string, signal?: AbortSignal): Promise<CiudadResponse[]> {
  return http
    .get<CiudadResponse[]>("/api/ciudades", {
      params: { q },
      timeout: TIEMPO_CIUDADES,
      signal,
    })
    .then((respuesta) => respuesta.data);
}
