import { describe, expect, it } from "vitest";
import { digitoVerificacionNit, validarDocumento } from "@/lib/documento";

describe("validarDocumento — CC", () => {
  it("acepta un número válido", () => {
    expect(validarDocumento("CC", "1094567890")).toBeNull();
  });

  it("rechaza menos de 6 dígitos", () => {
    expect(validarDocumento("CC", "123")).not.toBeNull();
  });

  it("rechaza más de 10 dígitos", () => {
    expect(validarDocumento("CC", "123456789012")).not.toBeNull();
  });

  it("rechaza letras", () => {
    expect(validarDocumento("CC", "10A45678")).not.toBeNull();
  });
});

describe("validarDocumento — CE", () => {
  it("acepta un número válido", () => {
    expect(validarDocumento("CE", "654321")).toBeNull();
  });

  it("rechaza vacío", () => {
    expect(validarDocumento("CE", "")).toBe("El número de documento es obligatorio.");
  });
});

describe("validarDocumento — TI", () => {
  it("acepta 10 dígitos", () => {
    expect(validarDocumento("TI", "1002345678")).toBeNull();
  });

  it("acepta 11 dígitos", () => {
    expect(validarDocumento("TI", "10023456789")).toBeNull();
  });

  it("rechaza 9 dígitos", () => {
    expect(validarDocumento("TI", "100234567")).not.toBeNull();
  });
});

describe("validarDocumento — PP", () => {
  it("acepta letras y números entre 5 y 15 caracteres", () => {
    expect(validarDocumento("PP", "AB12345")).toBeNull();
  });

  it("rechaza menos de 5 caracteres", () => {
    expect(validarDocumento("PP", "AB12")).not.toBeNull();
  });

  it("rechaza más de 15 caracteres", () => {
    expect(validarDocumento("PP", "A".repeat(16))).not.toBeNull();
  });

  it("rechaza caracteres especiales", () => {
    expect(validarDocumento("PP", "AB-123456")).not.toBeNull();
  });
});

describe("validarDocumento — NIT", () => {
  it("acepta la base sola, sin dígito de verificación", () => {
    expect(validarDocumento("NIT", "890903938")).toBeNull();
  });

  it("acepta base de 10 dígitos", () => {
    expect(validarDocumento("NIT", "8909039380")).toBeNull();
  });

  it("acepta con dígito de verificación correcto", () => {
    expect(validarDocumento("NIT", "890903938-8")).toBeNull();
  });

  it("rechaza con dígito de verificación incorrecto y explica cuál es el correcto", () => {
    const error = validarDocumento("NIT", "890903938-5");
    expect(error).not.toBeNull();
    expect(error).toContain("890903938");
    expect(error).toContain("8");
  });

  it("rechaza base con longitud incorrecta", () => {
    expect(validarDocumento("NIT", "12345")).not.toBeNull();
  });

  it("rechaza vacío", () => {
    expect(validarDocumento("NIT", "")).toBe("El número de documento es obligatorio.");
  });
});

describe("digitoVerificacionNit — NIT reales colombianos", () => {
  it("890903938 -> 8", () => {
    expect(digitoVerificacionNit("890903938")).toBe(8);
  });

  it("811000231 -> 7", () => {
    expect(digitoVerificacionNit("811000231")).toBe(7);
  });

  it("830053812 -> 2", () => {
    expect(digitoVerificacionNit("830053812")).toBe(2);
  });
});
