import type { TipoDocumento } from "../api/tipos";

export const TIPOS_DOCUMENTO: ReadonlyArray<{
  valor: TipoDocumento;
  etiqueta: string;
  ayuda: string;
}> = [
  { valor: "CC", etiqueta: "Cédula de ciudadanía", ayuda: "6 a 10 dígitos" },
  { valor: "CE", etiqueta: "Cédula de extranjería", ayuda: "6 a 10 dígitos" },
  { valor: "TI", etiqueta: "Tarjeta de identidad", ayuda: "10 u 11 dígitos" },
  { valor: "PP", etiqueta: "Pasaporte", ayuda: "5 a 15 caracteres, letras y números" },
  {
    valor: "NIT",
    etiqueta: "NIT",
    ayuda: "9 o 10 dígitos, con dígito de verificación opcional (890903938-8)",
  },
];

// Ponderaciones DIAN, de derecha a izquierda sobre la base del NIT.
const PONDERACIONES_NIT = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/** Dígito de verificación del NIT (módulo 11 con ponderaciones DIAN). */
export function digitoVerificacionNit(base: string): number {
  const digitos = base
    .trim()
    .split("")
    .reverse()
    .map((caracter) => Number(caracter));

  const suma = digitos.reduce((acumulado, digito, indice) => {
    const ponderacion = PONDERACIONES_NIT[indice] ?? 0;
    return acumulado + digito * ponderacion;
  }, 0);

  const resto = suma % 11;
  if (resto === 0) return 0;
  if (resto === 1) return 1;
  return 11 - resto;
}

function etiquetaDe(tipo: TipoDocumento): string {
  return TIPOS_DOCUMENTO.find((item) => item.valor === tipo)?.etiqueta ?? tipo;
}

/** Valida el número de documento según el tipo. Devuelve el mensaje de error o null si es válido. */
export function validarDocumento(tipo: TipoDocumento, numero: string): string | null {
  const valor = numero.trim();
  if (valor === "") {
    return "El número de documento es obligatorio.";
  }

  switch (tipo) {
    case "CC":
    case "CE": {
      if (!/^\d{6,10}$/.test(valor)) {
        return `${etiquetaDe(tipo)} debe tener entre 6 y 10 dígitos.`;
      }
      return null;
    }
    case "TI": {
      if (!/^\d{10,11}$/.test(valor)) {
        return "La tarjeta de identidad debe tener 10 u 11 dígitos.";
      }
      return null;
    }
    case "PP": {
      if (!/^[A-Za-z0-9]{5,15}$/.test(valor)) {
        return "El pasaporte debe tener entre 5 y 15 caracteres, solo letras y números.";
      }
      return null;
    }
    case "NIT": {
      const partes = valor.split("-");
      if (partes.length > 2) {
        return "El NIT tiene un formato inválido.";
      }

      const base = partes[0];
      if (!/^\d{9,10}$/.test(base)) {
        return "El NIT debe tener 9 o 10 dígitos.";
      }

      if (partes.length === 2) {
        const dvTexto = partes[1];
        if (!/^\d$/.test(dvTexto)) {
          return "El dígito de verificación del NIT debe ser un solo dígito.";
        }

        const dvEsperado = digitoVerificacionNit(base);
        if (Number(dvTexto) !== dvEsperado) {
          return `El dígito de verificación no coincide: para ${base} debería ser ${dvEsperado}.`;
        }
      }

      return null;
    }
    default: {
      const _exhaustivo: never = tipo;
      return _exhaustivo;
    }
  }
}
