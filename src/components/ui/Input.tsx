import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Campo de texto base: casilla de formulario impreso. El borde llega a 4.3:1 porque un
 * control interactivo necesita al menos 3:1; el estado de error lo marca el padre con
 * aria-invalid.
 */
export function Input({ className, ...resto }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-none border border-linea-control bg-hoja px-3.5 text-base text-tinta",
        "hover:border-marina",
        "placeholder:text-tinta-suave",
        "aria-invalid:border-error aria-invalid:bg-error-fondo",
        "disabled:cursor-not-allowed disabled:border-linea disabled:bg-papel disabled:text-tinta-suave",
        className,
      )}
      {...resto}
    />
  );
}
