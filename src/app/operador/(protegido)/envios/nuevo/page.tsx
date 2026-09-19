import { FormularioEnvio } from "./FormularioEnvio";

export default function PaginaNuevoEnvio() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <h1 className="t-titulo">Registrar envío</h1>
      <FormularioEnvio />
    </div>
  );
}
