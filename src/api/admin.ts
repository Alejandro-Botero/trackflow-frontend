import { http, TIEMPO_NORMAL } from "./client";

export function reconstruirProyecciones(): Promise<Record<string, number>> {
  return http
    .post<Record<string, number>>("/api/admin/reconstruir-proyecciones", undefined, {
      timeout: TIEMPO_NORMAL,
    })
    .then((respuesta) => respuesta.data);
}
