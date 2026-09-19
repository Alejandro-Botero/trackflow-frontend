import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Área de texto base, misma línea visual que Input. */
export function Textarea({ className, rows = 4, ...resto }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full rounded-none border border-linea-control bg-hoja px-3.5 py-2.5 text-base text-tinta",
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
