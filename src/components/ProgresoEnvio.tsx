import { Check } from "lucide-react";
import type { EstadoEnvio } from "@/api/tipos";
import { ESTADOS, ordenEstado } from "@/lib/estados";
import { ICONOS_ESTADO } from "./EstadoBadge";
import { cn } from "@/lib/cn";

/**
 * Barra de 5 pasos (Registrado -> ... -> Entregado). Completado y actual se
 * distinguen con forma e ícono, no solo con color; se apila en vertical en
 * pantallas angostas para no desbordar.
 */
export function ProgresoEnvio({ estado }: { estado: EstadoEnvio }) {
  const ordenActual = ordenEstado(estado);

  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
      {ESTADOS.map((paso, indice) => {
        const Icono = ICONOS_ESTADO[paso.valor];
        const completado = paso.orden < ordenActual;
        const actual = paso.orden === ordenActual;

        return (
          <li
            key={paso.valor}
            aria-current={actual ? "step" : undefined}
            className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-2"
          >
            {indice > 0 && (
              <span aria-hidden="true" className="hidden h-px flex-1 bg-linea sm:-mt-5 sm:block" />
            )}
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center border-2",
                completado && "border-marina bg-marina text-hoja",
                actual && "border-sello bg-hoja text-sello",
                !completado && !actual && "border-linea bg-hoja text-tinta-suave",
              )}
            >
              {completado ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Icono className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <span className={cn("t-apoyo whitespace-nowrap sm:text-center", actual && "font-semibold text-tinta")}>
              {paso.etiqueta}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
