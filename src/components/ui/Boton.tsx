import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type VarianteBoton = "accion" | "marina" | "contorno" | "texto";
type TamanoBoton = "md" | "lg";

/**
 * Botón base del sistema. "accion" (naranja/sello) se reserva para un único
 * botón de acción por pantalla; el resto de variantes usan azul marino o
 * quedan neutras. Mide siempre al menos 44x44 px.
 *
 * El sello lleva tinta oscura encima (6.4:1): blanco sobre naranja puro se
 * queda en 2.9:1 y no pasa AA.
 */
export function Boton({
  variante = "marina",
  tamano = "md",
  cargando = false,
  className,
  children,
  disabled,
  type = "button",
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  cargando?: boolean;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-none font-semibold tracking-[0.01em]",
        tamano === "lg" ? "min-h-14 px-8 text-base" : "px-5 text-sm",
        "disabled:cursor-not-allowed disabled:opacity-55",
        variante === "accion" &&
          "bg-sello text-tinta hover:bg-sello-oscura hover:text-hoja active:bg-sello-oscura active:text-hoja",
        variante === "marina" &&
          "bg-marina text-hoja hover:bg-marina-clara active:bg-marina-honda",
        variante === "contorno" &&
          "border border-marina bg-transparent text-marina hover:bg-marina hover:text-hoja active:bg-marina-honda active:text-hoja",
        variante === "texto" &&
          "bg-transparent px-1 text-marina underline decoration-linea-fuerte underline-offset-4 hover:decoration-marina active:text-marina-honda",
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
