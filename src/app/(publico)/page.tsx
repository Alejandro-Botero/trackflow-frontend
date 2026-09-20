import { Ayuda } from "@/components/Ayuda";
import { BuscadorGuia } from "@/components/BuscadorGuia";

export default function PaginaInicio() {
  return (
    <div>
      <section className="flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <h1 className="t-display text-marina">Rastrea tu envío</h1>
          <Ayuda
            etiqueta="Qué muestra la consulta"
            texto="Con el número de la guía ves en qué estado está el envío y dónde se registró su último movimiento."
            className="self-start sm:self-center"
          />
        </div>

        <div className="hoja p-6 sm:p-8">
          <BuscadorGuia />
        </div>
      </section>
    </div>
  );
}
