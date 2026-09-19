// Normalización de errores de la API. Ningún módulo de src/api debe propagar el error crudo
// de axios: todos pasan por normalizarError antes de rechazar su promesa.
import axios from "axios";

export type ClaseError =
  | "red" // sin respuesta del servidor
  | "timeout"
  | "validacion" // 400
  | "autenticacion" // 401
  | "autorizacion" // 403
  | "noEncontrado" // 404
  | "noDisponible" // 503
  | "servidor" // 5xx restantes
  | "desconocido";

export interface ErrorApi {
  clase: ClaseError;
  mensaje: string; // listo para mostrar (usa `detail` si viene)
  estado?: number;
  camposFaltantes?: Record<string, string>; // claves anidadas tal cual las manda el backend
}

const MENSAJES_POR_CLASE: Record<ClaseError, string> = {
  red: "No pudimos contactar el servicio. Revisa tu conexión y vuelve a intentarlo.",
  timeout: "El servicio tardó demasiado en responder. Vuelve a intentarlo.",
  validacion: "El servicio respondió con un error. Vuelve a intentarlo.",
  autenticacion: "Usuario o clave incorrectos.",
  autorizacion: "Tu sesión no tiene permiso para esta operación.",
  noEncontrado: "No encontramos ningún envío con ese número.",
  noDisponible: "No hay credenciales configuradas en este entorno.",
  servidor: "El servicio respondió con un error. Vuelve a intentarlo.",
  desconocido: "El servicio respondió con un error. Vuelve a intentarlo.",
};

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

/** Extrae `detail` del cuerpo ProblemDetail, si viene y es texto. */
function extraerDetail(data: unknown): string | undefined {
  if (!esRegistro(data)) return undefined;
  const detail = data["detail"];
  return typeof detail === "string" ? detail : undefined;
}

/** Copia `camposFaltantes` del cuerpo del 400 tal cual, descartando valores que no sean texto. */
function extraerCamposFaltantes(data: unknown): Record<string, string> | undefined {
  if (!esRegistro(data)) return undefined;
  const campos = data["camposFaltantes"];
  if (!esRegistro(campos)) return undefined;
  const resultado: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(campos)) {
    if (typeof valor === "string") {
      resultado[clave] = valor;
    }
  }
  return resultado;
}

function claseDesdeEstado(estado: number): ClaseError {
  switch (estado) {
    case 400:
      return "validacion";
    case 401:
      return "autenticacion";
    case 403:
      return "autorizacion";
    case 404:
      return "noEncontrado";
    case 503:
      return "noDisponible";
    default:
      return estado >= 500 ? "servidor" : "desconocido";
  }
}

export function normalizarError(error: unknown): ErrorApi {
  if (axios.isAxiosError(error)) {
    const codigo = error.code;
    if (codigo === "ECONNABORTED" || codigo === "ETIMEDOUT") {
      return { clase: "timeout", mensaje: MENSAJES_POR_CLASE.timeout };
    }

    if (!error.response) {
      return { clase: "red", mensaje: MENSAJES_POR_CLASE.red };
    }

    const { status, data } = error.response;
    const clase = claseDesdeEstado(status);
    const detail = extraerDetail(data);
    const mensaje = detail ?? MENSAJES_POR_CLASE[clase];
    const camposFaltantes = clase === "validacion" ? extraerCamposFaltantes(data) : undefined;

    return {
      clase,
      mensaje,
      estado: status,
      ...(camposFaltantes ? { camposFaltantes } : {}),
    };
  }

  return { clase: "desconocido", mensaje: MENSAJES_POR_CLASE.desconocido };
}

/** Mensaje de un campo del formulario, p. ej. campoConError(err, "remitente.ciudadId"). */
export function mensajeDeCampo(error: ErrorApi | null, campo: string): string | undefined {
  return error?.camposFaltantes?.[campo];
}
