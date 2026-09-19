import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import { FormularioEnvio } from "./FormularioEnvio";

export default function PaginaNuevoEnvio() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-10 sm:px-6">
      <EncabezadoPagina
        titulo="Registrar envío"
        descripcion="Los datos del remitente y del destinatario quedan en el registro interno; la consulta pública solo muestra la ciudad de destino."
      />
      <FormularioEnvio />
    </div>
  );
}
