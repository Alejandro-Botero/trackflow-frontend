import type { Metadata } from "next";
import { normalizarGuia, errorDeGuia } from "@/lib/guia";
import { Aviso } from "@/components/ui/Aviso";
import { ResultadoRastreo } from "./ResultadoRastreo";

export async function generateMetadata({
  params,
}: PageProps<"/rastreo/[guia]">): Promise<Metadata> {
  const { guia } = await params;
  return { title: `Envío ${normalizarGuia(guia)} · TrackFlow` };
}

// Server Component: valida el formato antes de intentar cualquier llamada a la API.
export default async function PaginaRastreo({ params }: PageProps<"/rastreo/[guia]">) {
  const { guia } = await params;
  const guiaNormalizada = normalizarGuia(guia);
  const mensajeError = errorDeGuia(guiaNormalizada);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="t-titulo text-marina">
        Seguimiento de la guía <span className="guia">{guiaNormalizada}</span>
      </h1>

      {mensajeError ? (
        <Aviso tono="error" titulo="Número de guía inválido">
          {mensajeError}
        </Aviso>
      ) : (
        <ResultadoRastreo guia={guiaNormalizada} />
      )}
    </section>
  );
}
