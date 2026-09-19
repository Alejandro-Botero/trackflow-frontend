"use client";

// Buscador de guía de la portada: valida el formato antes de navegar al resultado.
import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { errorDeGuia, normalizarGuia } from "@/lib/guia";
import { CampoForm } from "@/components/CampoForm";
import { Input } from "@/components/ui/Input";
import { Boton } from "@/components/ui/Boton";
import { cn } from "@/lib/cn";

interface BuscadorGuiaProps {
  /** Línea de ayuda con el formato de la guía. */
  ayuda?: string;
  className?: string;
}

export function BuscadorGuia({ ayuda, className }: BuscadorGuiaProps) {
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
    <form
      onSubmit={manejarEnvio}
      noValidate
      className={cn("flex flex-col items-stretch gap-3 sm:flex-row sm:items-end", className)}
    >
      <div className="flex-1">
        <CampoForm
          id={`guia-buscador-${id}`}
          etiqueta="Número de guía"
          ayuda={ayuda}
          error={error ?? undefined}
        >
          {(campo) => (
            <Input
              {...campo}
              value={valor}
              onChange={(evento) => {
                setValor(evento.target.value);
                if (error) setError(null);
              }}
              placeholder="TF000000000001"
              autoComplete="off"
              className="guia h-14 text-lg sm:text-xl"
            />
          )}
        </CampoForm>
      </div>
      <Boton type="submit" variante="accion" className="h-14 px-8">
        Consultar
      </Boton>
    </form>
  );
}
