import { Clock, MapPin, PackageCheck, Send, Warehouse, type LucideIcon } from "lucide-react";
import type { EventoLogisticoResponse, TipoEvento } from "@/api/tipos";
import { etiquetaTipoEvento } from "@/lib/estados";
import { formatearFechaHora } from "@/lib/fechas";

const ICONOS_EVENTO: Record<TipoEvento, LucideIcon> = {
  RECEIVED_AT_CENTER: PackageCheck,
  DISPATCHED: Send,
  ARRIVED_AT_DESTINATION_CENTER: Warehouse,
  OUT_FOR_DELIVERY: MapPin,
  DELIVERED: PackageCheck,
};

const UNA_HORA_MS = 60 * 60 * 1000;

/**
 * Historial vertical ordenado por ocurridoEn ascendente. Si la lista viene
 * vacía no renderiza nada: el vacío lo maneja la página.
 */
export function Timeline({ eventos }: { eventos: EventoLogisticoResponse[] }) {
  if (eventos.length === 0) return null;

  const ordenados = [...eventos].sort(
    (a, b) => new Date(a.ocurridoEn).getTime() - new Date(b.ocurridoEn).getTime(),
  );

  return (
    <ol className="flex flex-col">
      {ordenados.map((evento, indice) => {
        const Icono = ICONOS_EVENTO[evento.tipo];
        const rezagado =
          new Date(evento.registradoEn).getTime() - new Date(evento.ocurridoEn).getTime() > UNA_HORA_MS;

        return (
          <li key={evento.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-marina bg-hoja text-marina">
                <Icono className="h-4 w-4" aria-hidden="true" />
              </span>
              {indice < ordenados.length - 1 && (
                <span aria-hidden="true" className="w-px flex-1 bg-linea" />
              )}
            </div>
            <div className="pb-6">
              <p className="t-dato text-marina">{etiquetaTipoEvento(evento.tipo)}</p>
              <p className="t-apoyo">
                {formatearFechaHora(evento.ocurridoEn)} · {evento.punto}
              </p>
              {evento.observaciones && <p className="t-apoyo mt-1 text-tinta">{evento.observaciones}</p>}
              {rezagado && (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-estado-reparto">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Reporte rezagado: este evento se registró en el sistema después de haber ocurrido.
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
