import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Campo de texto base. El estado de error lo marca el padre con aria-invalid. */
export function Input({ className, ...resto }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-none border border-linea bg-hoja px-3 text-base text-tinta",
        "placeholder:text-tinta-suave",
        "aria-invalid:border-error",
        "disabled:cursor-not-allowed disabled:bg-papel disabled:text-tinta-suave",
        className,
      )}
      {...resto}
    />
  );
}
