import { describe, expect, it } from "vitest";
import {
  ESTADOS,
  TIPOS_EVENTO,
  etiquetaEstado,
  etiquetaTipoEvento,
  ordenEstado,
} from "@/lib/estados";

describe("ESTADOS", () => {
  it("mantiene el orden REGISTERED -> ... -> DELIVERED", () => {
    expect(ESTADOS.map((e) => e.valor)).toEqual([
      "REGISTERED",
      "AT_DISTRIBUTION_CENTER",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ]);
  });

  it("numera orden de 0 a 4 en secuencia", () => {
    expect(ESTADOS.map((e) => e.orden)).toEqual([0, 1, 2, 3, 4]);
  });

  it("trae las etiquetas en español del contrato", () => {
    expect(ESTADOS.map((e) => e.etiqueta)).toEqual([
      "Registrado",
      "En centro de distribución",
      "En tránsito",
      "En reparto",
      "Entregado",
    ]);
  });
});

describe("etiquetaEstado", () => {
  it("devuelve la etiqueta correspondiente", () => {
    expect(etiquetaEstado("IN_TRANSIT")).toBe("En tránsito");
    expect(etiquetaEstado("DELIVERED")).toBe("Entregado");
  });
});

describe("ordenEstado", () => {
  it("devuelve la posición correspondiente", () => {
    expect(ordenEstado("REGISTERED")).toBe(0);
    expect(ordenEstado("OUT_FOR_DELIVERY")).toBe(3);
    expect(ordenEstado("DELIVERED")).toBe(4);
  });
});

describe("TIPOS_EVENTO", () => {
  it("trae los cinco tipos con sus etiquetas", () => {
    expect(TIPOS_EVENTO.map((t) => t.valor)).toEqual([
      "RECEIVED_AT_CENTER",
      "DISPATCHED",
      "ARRIVED_AT_DESTINATION_CENTER",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ]);
    expect(TIPOS_EVENTO.map((t) => t.etiqueta)).toEqual([
      "Recibido en centro",
      "Despachado",
      "Llegó al centro de destino",
      "Salió a reparto",
      "Entregado",
    ]);
  });
});

describe("etiquetaTipoEvento", () => {
  it("devuelve la etiqueta correspondiente", () => {
    expect(etiquetaTipoEvento("DISPATCHED")).toBe("Despachado");
    expect(etiquetaTipoEvento("DELIVERED")).toBe("Entregado");
  });
});
