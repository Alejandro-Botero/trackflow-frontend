import { Ayuda } from "@/components/Ayuda";
import { BuscadorGuia } from "@/components/BuscadorGuia";
import { EstadoBadge } from "@/components/EstadoBadge";
import { ESTADOS } from "@/lib/estados";
import type { EstadoEnvio } from "@/api/tipos";

// Qué significa cada estado, para que la página de resultado no sea la primera vez que el
// cliente los ve.
const SIGNIFICADO: Record<EstadoEnvio, string> = {
  REGISTERED: "El envío ya tiene guía, pero todavía no registra movimientos.",
  AT_DISTRIBUTION_CENTER: "Está en un centro de distribución, a la espera del siguiente despacho.",
  IN_TRANSIT: "Va en ruta entre dos puntos de la cadena.",
  OUT_FOR_DELIVERY: "Salió del centro de destino hacia la dirección del destinatario.",
  DELIVERED: "Se entregó en la dirección del destinatario.",
};

export default function PaginaInicio() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <h1 className="t-display text-marina">Rastrea tu envío</h1>
          <Ayuda
            etiqueta="Qué muestra la consulta"
            texto="Con el número de la guía ves el estado actual y cada punto de control por el que pasó el paquete."
            className="self-start sm:self-center"
          />
        </div>

        <div className="hoja p-6 sm:p-8">
          <BuscadorGuia />
        </div>
      </section>

      <section aria-labelledby="etapas" className="flex flex-col gap-6">
        <h2 id="etapas" className="t-titulo text-marina">
          Las cinco etapas de un envío
        </h2>

        <dl className="flex flex-col border-t border-linea">
          {ESTADOS.map((estado) => (
            <div
              key={estado.valor}
              className="flex flex-col gap-1 border-b border-linea py-4 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <dt className="sm:w-64 sm:shrink-0">
                <EstadoBadge estado={estado.valor} enmarcado={false} />
              </dt>
              <dd className="max-w-[62ch] text-tinta-suave">{SIGNIFICADO[estado.valor]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
