import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Logotipo de TrackFlow. Dos versiones del mismo archivo: `color` para fondos claros (papel y
 * hoja) e `inverso` para la banda azul marino del área de operadores, donde la palabra va en
 * blanco y el naranja se aclara para no perder contraste contra la marina.
 *
 * El alto se fija con `className` (`h-7`, `h-9`…) y el ancho sale de la proporción original.
 */
export function Logo({
  tono = "color",
  className,
}: {
  tono?: "color" | "inverso";
  className?: string;
}) {
  return (
    <Image
      src={tono === "inverso" ? "/trackflow-logo-inverso.png" : "/trackflow-logo.png"}
      alt="TrackFlow"
      width={900}
      height={175}
      priority
      className={cn("h-7 w-auto", className)}
    />
  );
}
