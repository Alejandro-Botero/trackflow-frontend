"use client";

// Sesión de operador. Ver docs/contrato-ui.md sección 8.
// El token se guarda en sessionStorage (clave "trackflow.sesion") y el estado de la sesión
// (usuario, roles, expiración) se deriva siempre decodificando el payload del JWT con atob:
// no se guarda por separado para no arriesgar que quede desincronizado. No se verifica la
// firma del token: eso es responsabilidad del backend.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { iniciarSesion } from "@/api/auth";
import { fijarToken } from "@/api/client";
import type { ErrorApi } from "@/api/errores";
import type { LoginRequest } from "@/api/tipos";

const CLAVE_SESION = "trackflow.sesion";

export interface Sesion {
  token: string;
  usuario: string;
  roles: string[]; // ["OPERADOR"] | ["OPERADOR", "ADMIN"]
  expiraEn: number; // epoch ms, del claim `exp`
}

interface ContextoAuth {
  sesion: Sesion | null;
  cargando: boolean; // true hasta leer sessionStorage en el cliente
  entrar: (datos: LoginRequest) => Promise<void>;
  salir: () => void;
  esAdmin: boolean;
}

const ContextoSesion = createContext<ContextoAuth | null>(null);

/** Decodifica el payload de un JWT (sin verificar firma) para leer sub, roles y exp. */
function decodificarToken(token: string): Sesion | null {
  try {
    const partes = token.split(".");
    if (partes.length !== 3) return null;

    const payloadBase64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload: unknown = JSON.parse(atob(payloadBase64));
    if (typeof payload !== "object" || payload === null) return null;

    const { sub, roles, exp } = payload as Record<string, unknown>;
    if (typeof sub !== "string" || typeof roles !== "string" || typeof exp !== "number") {
      return null;
    }

    return {
      token,
      usuario: sub,
      // El backend emite el claim separado por espacios ("ADMIN OPERADOR"), que es lo que
      // espera JwtGrantedAuthoritiesConverter. Aceptamos también comas por si cambia.
      roles: roles
        .split(/[\s,]+/)
        .map((rol) => rol.trim())
        .filter(Boolean),
      expiraEn: exp * 1000,
    };
  } catch {
    return null;
  }
}

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limpiarTemporizador = useCallback(() => {
    if (temporizador.current !== null) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  const salir = useCallback(() => {
    limpiarTemporizador();
    sessionStorage.removeItem(CLAVE_SESION);
    fijarToken(null);
    setSesion(null);
  }, [limpiarTemporizador]);

  const programarCierre = useCallback(
    (sesionActiva: Sesion) => {
      limpiarTemporizador();
      const espera = sesionActiva.expiraEn - Date.now();
      if (espera <= 0) {
        salir();
        return;
      }
      temporizador.current = setTimeout(salir, espera);
    },
    [limpiarTemporizador, salir],
  );

  // Rehidrata la sesión desde sessionStorage al montar (solo en el cliente). La lectura va en
  // un microtask porque la regla react-hooks/set-state-in-effect prohíbe el setState síncrono
  // en el cuerpo del efecto; el retraso no es observable, `cargando` sigue siendo true hasta
  // que termina.
  useEffect(() => {
    let cancelado = false;
    queueMicrotask(() => {
      if (cancelado) return;
      const tokenGuardado = sessionStorage.getItem(CLAVE_SESION);
      if (tokenGuardado) {
        const decodificada = decodificarToken(tokenGuardado);
        if (decodificada && decodificada.expiraEn > Date.now()) {
          fijarToken(decodificada.token);
          setSesion(decodificada);
          programarCierre(decodificada);
        } else {
          sessionStorage.removeItem(CLAVE_SESION);
        }
      }
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [programarCierre]);

  useEffect(() => limpiarTemporizador, [limpiarTemporizador]);

  const entrar = useCallback(
    async (datos: LoginRequest) => {
      const respuesta = await iniciarSesion(datos);
      const decodificada = decodificarToken(respuesta.token);
      if (!decodificada) {
        const error: ErrorApi = {
          clase: "servidor",
          mensaje: "No pudimos interpretar la sesión que devolvió el servicio.",
        };
        throw error;
      }
      sessionStorage.setItem(CLAVE_SESION, respuesta.token);
      fijarToken(decodificada.token);
      setSesion(decodificada);
      programarCierre(decodificada);
    },
    [programarCierre],
  );

  const esAdmin = sesion?.roles.includes("ADMIN") ?? false;

  const valor = useMemo<ContextoAuth>(
    () => ({ sesion, cargando, entrar, salir, esAdmin }),
    [sesion, cargando, entrar, salir, esAdmin],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): ContextoAuth {
  const contexto = useContext(ContextoSesion);
  if (!contexto) {
    throw new Error("useSesion debe usarse dentro de ProveedorAuth");
  }
  return contexto;
}
