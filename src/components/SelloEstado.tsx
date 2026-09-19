import type { EstadoEnvio } from "@/api/tipos";
import { etiquetaEstado } from "@/lib/estados";
import { COLOR_ESTADO, ICONOS_ESTADO } from "./EstadoBadge";
import { cn } from "@/lib/cn";


/**
 * El estado actual, estampado sobre la guía como un sello de caucho: doble filete, ligera
 * rotación e ícono. Es la pieza dominante de la pantalla de resultado; para el estado en
 * listas y formularios sigue estando `EstadoBadge`, que es más callado.
 */
export function SelloEstado({ estado, className }: { estado: EstadoEnvio; className?: string }) {
  const Icono = ICONOS_ESTADO[estado];

  return (
    <span className={cn("sello text-xl sm:text-2xl", COLOR_ESTADO[estado], className)}>
      <Icono className="h-6 w-6 shrink-0" aria-hidden="true" />
      {etiquetaEstado(estado)}
    </span>
  );
}
