import { MapPin, Package, PackageCheck, Truck, Warehouse, type LucideIcon } from "lucide-react";
import type { EstadoEnvio } from "@/api/tipos";
import { etiquetaEstado } from "@/lib/estados";
import { cn } from "@/lib/cn";

export const ICONOS_ESTADO: Record<EstadoEnvio, LucideIcon> = {
  REGISTERED: Package,
  AT_DISTRIBUTION_CENTER: Warehouse,
  IN_TRANSIT: Truck,
  OUT_FOR_DELIVERY: MapPin,
  DELIVERED: PackageCheck,
};

/** Tinta de cada estado: la comparten el distintivo, el sello y el paso actual del progreso. */
export const COLOR_ESTADO: Record<EstadoEnvio, string> = {
  REGISTERED: "border-estado-registrado text-estado-registrado",
  AT_DISTRIBUTION_CENTER: "border-estado-centro text-estado-centro",
  IN_TRANSIT: "border-estado-transito text-estado-transito",
  OUT_FOR_DELIVERY: "border-estado-reparto text-estado-reparto",
  DELIVERED: "border-estado-entregado text-estado-entregado",
};

/**
 * Estado del envío: siempre ícono + texto + color, nunca solo color.
 *
 * `enmarcado` dibuja el recuadro; dentro de una tabla se apaga, porque ahí la fila ya es la
 * caja y dos marcos seguidos ensucian la lectura en columna.
 */
export function EstadoBadge({
  estado,
  tamano = "sm",
  enmarcado = true,
}: {
  estado: EstadoEnvio;
  tamano?: "sm" | "lg";
  enmarcado?: boolean;
}) {
  const Icono = ICONOS_ESTADO[estado];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold",
        enmarcado ? "border bg-hoja" : "border-0 bg-transparent",
        COLOR_ESTADO[estado],
        // Padding óptico: la condensada en mayúscula inicial deja más aire abajo que arriba.
        enmarcado && (tamano === "lg" ? "px-4 pt-2 pb-1.5" : "px-2.5 pt-1.5 pb-1"),
        tamano === "lg" ? "t-dato" : "text-sm",
      )}
    >
      <Icono
        className={cn("shrink-0", tamano === "lg" ? "h-5 w-5" : "h-4 w-4")}
        aria-hidden="true"
      />
      {etiquetaEstado(estado)}
    </span>
  );
}
