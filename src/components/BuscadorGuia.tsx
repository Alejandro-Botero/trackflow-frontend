"use client";

// Buscador de guía de la portada: valida el formato antes de navegar al resultado.
import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { errorDeGuia, normalizarGuia } from "@/lib/guia";
import { CampoForm } from "@/components/CampoForm";
import { Boton } from "@/components/ui/Boton";
import { cn } from "@/lib/cn";

interface BuscadorGuiaProps {
  className?: string;
}

/**
 * Casilla del número de guía: recuadro de trazo grueso con el campo y el botón dentro, como
 * el bloque que se rellena a mano en el formato impreso.
 */
export function BuscadorGuia({ className }: BuscadorGuiaProps) {
  const id = useId();
  const router = useRouter();
  const [valor, setValor] = useState("");
  const [error, setError] = useState<string | null>(null);

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const mensaje = errorDeGuia(valor);
    if (mensaje) {
      setError(mensaje);
      return;
    }
    setError(null);
    router.push(`/rastreo/${normalizarGuia(valor)}`);
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className={cn("flex flex-col", className)}>
      <CampoForm
        id={`guia-buscador-${id}`}
        etiqueta="Número de guía"
        error={error ?? undefined}
      >
        {(campo) => (
          <div
            className={cn(
              "flex flex-col border-2 bg-hoja sm:flex-row sm:items-stretch",
              // El foco se pinta en el recuadro completo: dentro, el campo no lleva contorno.
              "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sello-oscura",
              error ? "border-error" : "border-marina",
            )}
          >
            <input
              {...campo}
              value={valor}
              onChange={(evento) => {
                setValor(evento.target.value);
                if (error) setError(null);
              }}
              placeholder="TF000000000001"
              autoComplete="off"
              inputMode="text"
              spellCheck={false}
              className="guia min-h-16 flex-1 border-0 bg-transparent px-4 text-xl text-tinta placeholder:text-linea-control focus-visible:outline-none sm:text-2xl"
            />
            <Boton
              type="submit"
              variante="accion"
              tamano="lg"
              className="min-h-16 border-t-2 border-marina sm:border-t-0 sm:border-l-2"
            >
              Consultar
            </Boton>
          </div>
        )}
      </CampoForm>
    </form>
  );
}
