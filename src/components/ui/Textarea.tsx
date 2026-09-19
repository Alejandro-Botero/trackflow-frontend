import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Área de texto base, misma línea visual que Input. */
export function Textarea({ className, rows = 4, ...resto }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "min-h-11 w-full rounded-none border border-linea bg-hoja px-3 py-2 text-base text-tinta",
        "placeholder:text-tinta-suave",
        "aria-invalid:border-error",
        "disabled:cursor-not-allowed disabled:bg-papel disabled:text-tinta-suave",
        className,
      )}
      {...resto}
    />
  );
}
