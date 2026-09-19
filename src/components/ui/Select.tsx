import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Select nativo (mantiene el comportamiento accesible del navegador). */
export function Select({ className, children, ...resto }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-12 w-full rounded-none border border-linea-control bg-hoja px-3.5 text-base text-tinta",
        "hover:border-marina",
        "aria-invalid:border-error aria-invalid:bg-error-fondo",
        "disabled:cursor-not-allowed disabled:border-linea disabled:bg-papel disabled:text-tinta-suave",
        className,
      )}
      {...resto}
    >
      {children}
    </select>
  );
}
