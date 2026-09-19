import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type VarianteBoton = "accion" | "marina" | "contorno" | "texto";

/**
 * Botón base del sistema. "accion" (naranja/sello) se reserva para un único
 * botón de acción por pantalla; el resto de variantes usan azul marino o
 * quedan neutras. Mide siempre al menos 44x44 px.
 */
export function Boton({
  variante = "marina",
  cargando = false,
  className,
  children,
  disabled,
  type = "button",
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  cargando?: boolean;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-none px-4 text-sm font-semibold tracking-wide",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variante === "accion" && "bg-sello text-hoja hover:bg-sello-oscura",
        variante === "marina" && "bg-marina text-hoja hover:bg-marina-clara",
        variante === "contorno" && "border border-marina bg-transparent text-marina",
        variante === "texto" && "bg-transparent text-marina underline-offset-4 hover:underline",
        className,
      )}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...resto}
    >
      {cargando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
