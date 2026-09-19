import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Select nativo (mantiene el comportamiento accesible del navegador). */
export function Select({ className, children, ...resto }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-none border border-linea bg-hoja px-3 text-base text-tinta",
        "aria-invalid:border-error",
        "disabled:cursor-not-allowed disabled:bg-papel disabled:text-tinta-suave",
        className,
      )}
      {...resto}
    >
      {children}
    </select>
  );
}
