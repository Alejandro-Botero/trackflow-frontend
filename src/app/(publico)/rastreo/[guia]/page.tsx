import type { Metadata } from "next";
import { normalizarGuia, errorDeGuia } from "@/lib/guia";
import { CodigoBarras } from "@/components/CodigoBarras";
import { Aviso } from "@/components/ui/Aviso";
import { ResultadoRastreo } from "./ResultadoRastreo";

export async function generateMetadata({
  params,
}: PageProps<"/rastreo/[guia]">): Promise<Metadata> {
  const { guia } = await params;
  return { title: `Envío ${normalizarGuia(guia)}` };
}

/** "TF000000000002" -> "TF 0000 0000 0002": agrupado, como se lee en voz alta. */
function agrupar(guia: string): string {
  return `${guia.slice(0, 2)} ${guia.slice(2).replace(/(.{4})(?=.)/g, "$1 ")}`;
}

// Server Component: valida el formato antes de intentar cualquier llamada a la API.
export default async function PaginaRastreo({ params }: PageProps<"/rastreo/[guia]">) {
  const { guia } = await params;
  const guiaNormalizada = normalizarGuia(guia);
  const mensajeError = errorDeGuia(guiaNormalizada);

  // Con un número inválido no hay guía que mostrar: solo el membrete y el motivo del rechazo.
  if (mensajeError) {
    return (
      <div className="flex flex-col gap-8">
        <header className="hoja flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-12 sm:p-8">
          <div className="flex flex-col gap-2">
            <p className="rotulo">Guía de transporte</p>
            <h1 className="guia text-2xl font-semibold text-marina sm:text-3xl">
              {agrupar(guiaNormalizada)}
            </h1>
          </div>
          <div className="w-full sm:w-72">
            <CodigoBarras valor={guiaNormalizada} className="h-12 text-marina opacity-40" />
            <p className="rotulo mt-2 text-center">{guiaNormalizada}</p>
          </div>
        </header>

        <Aviso tono="error" titulo="Número de guía inválido">
          {mensajeError}
        </Aviso>
      </div>
    );
  }

  return <ResultadoRastreo guia={guiaNormalizada} guiaAgrupada={agrupar(guiaNormalizada)} />;
}
