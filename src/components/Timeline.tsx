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
 * Pendiente de HU-04 (consultar el historial de movimientos): ninguna pantalla lo monta en este
 * sprint, pero la firma está fijada en docs/contrato-ui.md §7 y se conserva para esa historia.
 *
 * Libro de registro del envío: una fila por movimiento, ordenada por `ocurridoEn` ascendente,
 * con el número de asiento, la hora en cifras mono y el punto donde ocurrió. Es una tabla
 * porque eso es: un registro que se lee en columna y se compara fila con fila.
 *
 * Si la lista viene vacía no renderiza nada: el vacío lo maneja la página.
 */
export function Timeline({ eventos }: { eventos: EventoLogisticoResponse[] }) {
  if (eventos.length === 0) return null;

  const ordenados = [...eventos].sort(
    (a, b) => new Date(a.ocurridoEn).getTime() - new Date(b.ocurridoEn).getTime(),
  );

  const filas = ordenados.map((evento) => ({
    evento,
    Icono: ICONOS_EVENTO[evento.tipo],
    rezagado:
      new Date(evento.registradoEn).getTime() - new Date(evento.ocurridoEn).getTime() >
      UNA_HORA_MS,
  }));

  return (
    <>
      {/* En pantalla angosta el registro se lee como asientos apilados: una tabla de cuatro
          columnas ahí solo se puede desplazar en horizontal, que es peor que apilarla. */}
      <ol className="flex flex-col border-t border-linea sm:hidden">
        {filas.map(({ evento, Icono, rezagado }) => (
          <li key={evento.id} className="border-b border-linea py-3">
            <span className="cifras text-sm text-tinta-suave">
              {formatearFechaHora(evento.ocurridoEn)}
            </span>
            <p className="mt-1 flex items-start gap-2 font-semibold text-marina">
              <Icono className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {etiquetaTipoEvento(evento.tipo)}
            </p>
            <p className="mt-0.5 pl-6 text-sm text-tinta-suave">{evento.punto}</p>
            {evento.observaciones && (
              <p className="mt-0.5 pl-6 text-sm text-tinta">{evento.observaciones}</p>
            )}
            {rezagado && (
              <p className="mt-1 flex items-start gap-1.5 pl-6 text-sm text-estado-reparto">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Reporte rezagado
              </p>
            )}
          </li>
        ))}
      </ol>

      <table className="registro hidden w-full border-collapse text-left sm:table">
        <thead>
          <tr>
            <th scope="col" className="rotulo w-48 pb-2 pr-6 align-bottom font-medium">
              Fecha y hora
            </th>
            <th scope="col" className="rotulo w-56 pb-2 pr-6 align-bottom font-medium">
              Movimiento
            </th>
            <th scope="col" className="rotulo pb-2 align-bottom font-medium">
              Punto
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ evento, Icono, rezagado }) => (
            <tr key={evento.id}>
              <td className="cifras py-3 pr-6 align-top text-sm whitespace-nowrap text-tinta-suave">
                {formatearFechaHora(evento.ocurridoEn)}
              </td>
              <td className="py-3 pr-6 align-top">
                <span className="flex items-start gap-2 font-semibold text-marina">
                  <Icono className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {etiquetaTipoEvento(evento.tipo)}
                </span>
                {rezagado && (
                  <span className="mt-1 flex items-start gap-1.5 text-sm text-estado-reparto">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Reporte rezagado
                  </span>
                )}
              </td>
              <td className="py-3 align-top text-tinta-suave">
                {evento.punto}
                {evento.observaciones && (
                  <span className="mt-1 block text-sm text-tinta">{evento.observaciones}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
