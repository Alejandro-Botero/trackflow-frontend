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
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="t-display text-marina">Rastrea tu envío</h1>
          <p className="t-apoyo max-w-prose">
            Escribe el número de guía para ver el estado y el historial de movimientos del envío.
          </p>
        </div>

        <div className="marco marco-hoja p-6 sm:p-8">
          <BuscadorGuia ayuda="Formato: TF seguido de 12 dígitos, por ejemplo TF000000000001." />
        </div>
      </section>

      <section aria-labelledby="etapas" className="flex flex-col gap-5">
        <h2 id="etapas" className="t-seccion text-marina">
          Las cinco etapas de un envío
        </h2>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {ESTADOS.map((estado) => (
            <div key={estado.valor} className="flex flex-col gap-2 border-t border-linea pt-4">
              <dt>
                <EstadoBadge estado={estado.valor} />
              </dt>
              <dd className="t-apoyo max-w-[42ch]">{SIGNIFICADO[estado.valor]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
