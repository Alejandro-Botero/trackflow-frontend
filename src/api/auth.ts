import { http, TIEMPO_NORMAL } from "./client";
import type { LoginRequest, TokenResponse } from "./tipos";

export function iniciarSesion(datos: LoginRequest): Promise<TokenResponse> {
  return http
    .post<TokenResponse>("/api/auth/login", datos, { timeout: TIEMPO_NORMAL })
    .then((respuesta) => respuesta.data);
}
