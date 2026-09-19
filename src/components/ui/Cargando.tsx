import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** Indicador de carga inline. role="status" ya implica aria-live="polite". */
export function Cargando({
  texto = "Cargando…",
  tamano = "sm",
}: {
  texto?: string;
  tamano?: "sm" | "lg";
}) {
  return (
    <div role="status" className={cn("flex items-center gap-2 text-tinta-suave", tamano === "lg" && "t-dato")}>
      <Loader2 className={cn("animate-spin", tamano === "lg" ? "h-6 w-6" : "h-4 w-4")} aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}
