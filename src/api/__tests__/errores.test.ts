import { describe, expect, it } from "vitest";
import { mensajeDeCampo, normalizarError } from "@/api/errores";

// Los errores reales los arma axios; aquí se simulan con la misma forma que usa
// axios.isAxiosError para reconocerlos (duck typing sobre `isAxiosError: true`).
function errorAxios(datos: {
  code?: string;
  response?: { status: number; data?: unknown };
}): unknown {
  return { isAxiosError: true, ...datos };
}

describe("normalizarError — red y timeout", () => {
  it("clasifica como red cuando no hay respuesta del servidor", () => {
    const resultado = normalizarError(errorAxios({}));
    expect(resultado.clase).toBe("red");
    expect(resultado.mensaje).toBe(
      "No pudimos contactar el servicio. Revisa tu conexión y vuelve a intentarlo.",
    );
  });

  it("clasifica como timeout con ECONNABORTED", () => {
    const resultado = normalizarError(errorAxios({ code: "ECONNABORTED" }));
    expect(resultado.clase).toBe("timeout");
  });

  it("clasifica como timeout con ETIMEDOUT", () => {
    const resultado = normalizarError(errorAxios({ code: "ETIMEDOUT" }));
    expect(resultado.clase).toBe("timeout");
  });
});

describe("normalizarError — por estado HTTP", () => {
  it("400 sin detail usa el texto por clase y copia camposFaltantes", () => {
    const resultado = normalizarError(
      errorAxios({
        response: {
          status: 400,
          data: { camposFaltantes: { "remitente.ciudadId": "es obligatorio" } },
        },
      }),
    );
    expect(resultado.clase).toBe("validacion");
    expect(resultado.estado).toBe(400);
    expect(resultado.camposFaltantes).toEqual({
      "remitente.ciudadId": "es obligatorio",
    });
  });

  it("400 con detail usa detail como mensaje", () => {
    const resultado = normalizarError(
      errorAxios({
        response: { status: 400, data: { detail: "Datos inválidos" } },
      }),
    );
    expect(resultado.mensaje).toBe("Datos inválidos");
  });

  it("401 usa el texto de autenticación", () => {
    const resultado = normalizarError(errorAxios({ response: { status: 401 } }));
    expect(resultado.clase).toBe("autenticacion");
    expect(resultado.mensaje).toBe("Usuario o clave incorrectos.");
  });

  it("403 usa el texto de autorización", () => {
    const resultado = normalizarError(errorAxios({ response: { status: 403 } }));
    expect(resultado.clase).toBe("autorizacion");
    expect(resultado.mensaje).toBe("Tu sesión no tiene permiso para esta operación.");
  });

  it("404 usa el texto de no encontrado", () => {
    const resultado = normalizarError(errorAxios({ response: { status: 404 } }));
    expect(resultado.clase).toBe("noEncontrado");
    expect(resultado.mensaje).toBe("No encontramos ningún envío con ese número.");
  });

  it("503 usa el texto de no disponible", () => {
    const resultado = normalizarError(errorAxios({ response: { status: 503 } }));
    expect(resultado.clase).toBe("noDisponible");
    expect(resultado.mensaje).toBe("No hay credenciales configuradas en este entorno.");
  });

  it("5xx restantes se clasifican como servidor", () => {
    const resultado = normalizarError(errorAxios({ response: { status: 502 } }));
    expect(resultado.clase).toBe("servidor");
    expect(resultado.mensaje).toBe("El servicio respondió con un error. Vuelve a intentarlo.");
  });

  it("un error que no es de axios se clasifica como desconocido", () => {
    const resultado = normalizarError(new Error("boom"));
    expect(resultado.clase).toBe("desconocido");
  });
});

describe("mensajeDeCampo", () => {
  it("busca la clave exacta anidada", () => {
    const error = normalizarError(
      errorAxios({
        response: {
          status: 400,
          data: {
            camposFaltantes: {
              "remitente.nombreCompleto": "es obligatorio",
              "destinatario.ciudadId": "es obligatorio",
            },
          },
        },
      }),
    );
    expect(mensajeDeCampo(error, "destinatario.ciudadId")).toBe("es obligatorio");
    expect(mensajeDeCampo(error, "remitente.telefono")).toBeUndefined();
  });

  it("devuelve undefined cuando el error es null", () => {
    expect(mensajeDeCampo(null, "remitente.ciudadId")).toBeUndefined();
  });
});
