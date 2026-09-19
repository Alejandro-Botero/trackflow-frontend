import { Suspense } from "react";
import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import { Cargando } from "@/components/ui/Cargando";
import { FormularioEvento } from "./FormularioEvento";

export default function PaginaNuevoEvento() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-10 sm:px-6">
      <EncabezadoPagina
        titulo="Registrar evento logístico"
        descripcion="Un evento no se puede editar ni borrar: corrígelo registrando el movimiento siguiente."
      />
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
