import { Check } from "lucide-react";
import type { EstadoEnvio } from "@/api/tipos";
import { ESTADOS, ordenEstado } from "@/lib/estados";
import { COLOR_ESTADO, ICONOS_ESTADO } from "./EstadoBadge";
import { cn } from "@/lib/cn";

/**
 * Barra de 5 pasos (Registrado -> ... -> Entregado). Completado, actual y
 * pendiente se distinguen con forma e ícono, no solo con color. El conector
 * arranca en el centro del marcador anterior: en vertical bajo pantallas
 * angostas, en horizontal a partir de sm.
 */
export function ProgresoEnvio({ estado }: { estado: EstadoEnvio }) {
  const ordenActual = ordenEstado(estado);

  return (
    <ol className="flex flex-col sm:flex-row">
      {ESTADOS.map((paso, indice) => {
        const Icono = ICONOS_ESTADO[paso.valor];
        const completado = paso.orden < ordenActual;
        const actual = paso.orden === ordenActual;
        const recorrido = paso.orden <= ordenActual;

        return (
          <li
            key={paso.valor}
            aria-current={actual ? "step" : undefined}
            className="relative flex flex-1 items-center gap-4 pb-5 last:pb-0 sm:flex-col sm:items-center sm:gap-2.5 sm:pb-0"
          >
            {indice > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  // Vertical: del marcador anterior a este. Horizontal: mitad izquierda de la celda.
                  // El conector va de centro a centro: los marcadores lo tapan con su fondo.
                  "absolute left-[21px] -top-5 h-5 w-px sm:-left-1/2 sm:top-[21px] sm:right-1/2 sm:h-px sm:w-auto",
                  recorrido ? "bg-marina" : "bg-linea",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center border",
                completado && "border-marina bg-marina text-hoja",
                // El paso actual se pinta con la tinta de ese estado: el mismo color que el
                // sello y el distintivo, para que los tres hablen del mismo hecho.
                actual && cn("border-2 bg-hoja", COLOR_ESTADO[paso.valor]),
                !completado && !actual && "border-linea-control bg-hoja text-tinta-suave",
              )}
            >
              {completado ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Icono className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <span
              className={cn(
                "t-apoyo sm:max-w-[12ch] sm:text-center",
                actual ? "font-semibold text-tinta" : "text-tinta-suave",
              )}
            >
              {paso.etiqueta}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
