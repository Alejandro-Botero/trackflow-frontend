import type { ErrorApi } from "../api/errores";

export interface OpcionesSondeo {
  intervaloMs?: number; // 300 por defecto
  limiteMs?: number; // 5000 por defecto
  signal?: AbortSignal;
}

function esperar(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const temporizador = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(temporizador);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

function esErrorApi(valor: unknown): valor is ErrorApi {
  return typeof valor === "object" && valor !== null && "clase" in valor;
}

/** Repite `consulta` hasta que `condicion` se cumpla o venza el límite. Resuelve con el último
 *  valor obtenido y si se agotó el tiempo (`confirmado: false`). Nunca lanza por 404. */
export async function sondear<T>(
  consulta: () => Promise<T>,
  condicion: (valor: T) => boolean,
  opciones: OpcionesSondeo = {},
): Promise<{ valor: T | null; confirmado: boolean }> {
  const intervaloMs = opciones.intervaloMs ?? 300;
  const limiteMs = opciones.limiteMs ?? 5000;
  const signal = opciones.signal;
  const inicio = Date.now();

  let ultimoValor: T | null = null;

  while (Date.now() - inicio < limiteMs) {
    if (signal?.aborted) {
      throw signal.reason;
    }

    try {
      const valor = await consulta();
      ultimoValor = valor;
      if (condicion(valor)) {
        return { valor, confirmado: true };
      }
    } catch (error) {
      if (!esErrorApi(error) || error.clase !== "noEncontrado") {
        throw error;
      }
      // 404: todavía no existe, se sigue intentando.
    }

    await esperar(intervaloMs, signal);
  }

  return { valor: ultimoValor, confirmado: false };
}
