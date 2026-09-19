import { Suspense } from "react";
import { Cargando } from "@/components/ui/Cargando";
import { FormularioEvento } from "./FormularioEvento";

export default function PaginaNuevoEvento() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
      <h1 className="t-titulo">Registrar evento logístico</h1>
      <Suspense
        fallback={
          <div className="flex min-h-[30vh] items-center justify-center">
            <Cargando />
          </div>
        }
      >
        <FormularioEvento />
      </Suspense>
    </div>
  );
}
