"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Botón de ayuda con globo emergente. El texto no es imprescindible para usar la pantalla:
 * por eso está aquí y no impreso debajo del título.
 *
 * Accesibilidad: se abre con el puntero encima y también al recibir el foco por teclado —un
 * globo que solo responde a `:hover` no existe para quien navega con tabulador ni en táctil—,
 * se cierra con Escape o al tocar fuera, y el botón queda asociado al globo con
 * `aria-describedby` para que el lector de pantalla lo anuncie.
 */
export function Ayuda({
  texto,
  etiqueta = "Ver más información",
  className,
}: {
  texto: string;
  etiqueta?: string;
  className?: string;
}) {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!abierto) return;

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }
    function alTocarFuera(evento: PointerEvent) {
      if (!contenedorRef.current?.contains(evento.target as Node)) setAbierto(false);
    }

    document.addEventListener("keydown", alPresionarTecla);
    document.addEventListener("pointerdown", alTocarFuera);
    return () => {
      document.removeEventListener("keydown", alPresionarTecla);
      document.removeEventListener("pointerdown", alTocarFuera);
    };
  }, [abierto]);

  return (
    <span
      ref={contenedorRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <button
        type="button"
        aria-label={etiqueta}
        aria-expanded={abierto}
        aria-describedby={abierto ? id : undefined}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onClick={() => setAbierto((anterior) => !anterior)}
        className="inline-flex h-11 w-11 items-center justify-center text-tinta-suave hover:text-marina"
      >
        <HelpCircle className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* En móvil el botón queda cerca del borde derecho: el globo crece hacia la izquierda
          para no empujar la página en horizontal. */}
      {abierto && (
        <span
          role="tooltip"
          id={id}
          className="absolute top-full right-0 left-auto z-20 w-72 max-w-[calc(100vw-2.5rem)] border border-marina bg-hoja px-4 py-3 text-sm leading-normal text-tinta shadow-[0_10px_24px_-18px_rgba(16,20,24,0.8)] sm:right-auto sm:left-0"
        >
          {texto}
        </span>
      )}
    </span>
  );
}
