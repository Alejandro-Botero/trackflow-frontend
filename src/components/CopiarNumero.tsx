"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type EstadoCopia = "inactivo" | "copiado" | "manual";

/**
 * Botón "Copiar número" con confirmación accesible. Si la API de
 * portapapeles no está disponible (o falla), selecciona el texto para que
 * la persona lo copie con Ctrl+C.
 */
export function CopiarNumero({ valor }: { valor: string }) {
  const [estado, setEstado] = useState<EstadoCopia>("inactivo");
  const textoRef = useRef<HTMLSpanElement>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    },
    [],
  );

  function volverAInactivoEnDosSegundos() {
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    temporizadorRef.current = setTimeout(() => setEstado("inactivo"), 2000);
  }

  function seleccionarTextoManualmente() {
    const nodo = textoRef.current;
    const seleccion = window.getSelection?.();
    if (!nodo || !seleccion) return;
    const rango = document.createRange();
    rango.selectNodeContents(nodo);
    seleccion.removeAllRanges();
    seleccion.addRange(rango);
  }

  async function copiar() {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(valor);
        setEstado("copiado");
        volverAInactivoEnDosSegundos();
        return;
      } catch {
        // Sin permiso u otro fallo: sigue al camino manual.
      }
    }
    seleccionarTextoManualmente();
    setEstado("manual");
    volverAInactivoEnDosSegundos();
  }

  const mensaje =
    estado === "copiado"
      ? "Número copiado al portapapeles."
      : estado === "manual"
        ? "Copia el número con Ctrl+C."
        : "";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span ref={textoRef} className="guia text-lg text-marina">
        {valor}
      </span>
      <button
        type="button"
        onClick={copiar}
        className="inline-flex min-h-11 min-w-11 items-center gap-2 border border-marina px-3 text-sm font-semibold text-marina hover:bg-marina hover:text-hoja"
      >
        {estado === "copiado" ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        Copiar número
      </button>
      <span aria-live="polite" className="t-apoyo">
        {mensaje}
      </span>
    </div>
  );
}
