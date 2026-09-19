// Instancia de axios compartida por todos los módulos de src/api.
import axios, { type AxiosInstance } from "axios";
import { normalizarError } from "./errores";

export const BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? "https://trackflow-5enb.onrender.com";

export const TIEMPO_RASTREO = 25_000; // arranque en frío de Render
export const TIEMPO_CIUDADES = 6_000;
export const TIEMPO_NORMAL = 10_000;

let token: string | null = null;

/** Token que el interceptor pone en `Authorization: Bearer`. */
export function fijarToken(valor: string | null): void {
  token = valor;
}

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

http.interceptors.request.use((config) => {
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

http.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => Promise.reject(normalizarError(error)),
);
