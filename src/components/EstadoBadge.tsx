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

const COLOR_ESTADO: Record<EstadoEnvio, string> = {
  REGISTERED: "border-estado-registrado text-estado-registrado",
  AT_DISTRIBUTION_CENTER: "border-estado-centro text-estado-centro",
  IN_TRANSIT: "border-estado-transito text-estado-transito",
  OUT_FOR_DELIVERY: "border-estado-reparto text-estado-reparto",
  DELIVERED: "border-estado-entregado text-estado-entregado",
};

/** Estado del envío: siempre ícono + texto + color, nunca solo color. */
export function EstadoBadge({ estado, tamano = "sm" }: { estado: EstadoEnvio; tamano?: "sm" | "lg" }) {
  const Icono = ICONOS_ESTADO[estado];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border bg-hoja font-semibold",
        COLOR_ESTADO[estado],
        tamano === "lg" ? "t-dato px-4 py-2" : "px-2 py-1 text-sm",
      )}
    >
      <Icono className={tamano === "lg" ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
      {etiquetaEstado(estado)}
    </span>
  );
}
