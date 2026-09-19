import { describe, expect, it } from "vitest";
import { PATRON_GUIA, errorDeGuia, esGuiaValida, normalizarGuia } from "@/lib/guia";

describe("normalizarGuia", () => {
  it("recorta espacios y pasa a mayúsculas", () => {
    expect(normalizarGuia("  tf000000000001  ")).toBe("TF000000000001");
  });

  it("no cambia una guía ya normalizada", () => {
    expect(normalizarGuia("TF000000000001")).toBe("TF000000000001");
  });
});

describe("PATRON_GUIA", () => {
  it("acepta TF seguido de 12 dígitos", () => {
    expect(PATRON_GUIA.test("TF000000000001")).toBe(true);
  });

  it("rechaza otro prefijo", () => {
    expect(PATRON_GUIA.test("AB000000000001")).toBe(false);
  });

  it("rechaza longitud incorrecta de dígitos", () => {
    expect(PATRON_GUIA.test("TF0000000001")).toBe(false); // 10 dígitos
    expect(PATRON_GUIA.test("TF0000000000001")).toBe(false); // 13 dígitos
  });
});

describe("esGuiaValida", () => {
  it("acepta minúsculas y espacios porque normaliza antes de validar", () => {
    expect(esGuiaValida("  tf000000000001  ")).toBe(true);
  });

  it("rechaza prefijo malo", () => {
    expect(esGuiaValida("XX000000000001")).toBe(false);
  });

  it("rechaza longitud incorrecta", () => {
    expect(esGuiaValida("TF1234")).toBe(false);
  });

  it("rechaza cadena vacía", () => {
    expect(esGuiaValida("")).toBe(false);
  });
});

describe("errorDeGuia", () => {
  it("pide escribir una guía cuando está vacía", () => {
    expect(errorDeGuia("")).toBe("Escribe un número de guía.");
  });

  it("pide escribir una guía cuando solo hay espacios", () => {
    expect(errorDeGuia("   ")).toBe("Escribe un número de guía.");
  });

  it("da el mensaje de formato con prefijo malo", () => {
    expect(errorDeGuia("XX000000000001")).toBe(
      "El número de guía tiene el formato TF seguido de 12 dígitos, por ejemplo TF000000000001.",
    );
  });

  it("da el mensaje de formato con longitud incorrecta", () => {
    expect(errorDeGuia("TF123")).toBe(
      "El número de guía tiene el formato TF seguido de 12 dígitos, por ejemplo TF000000000001.",
    );
  });

  it("devuelve null cuando la guía es válida, incluso con minúsculas y espacios", () => {
    expect(errorDeGuia(" tf000000000001 ")).toBeNull();
  });
});
