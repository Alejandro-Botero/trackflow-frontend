import { cn } from "@/lib/cn";

/**
 * Representación gráfica del número de guía, como la que lleva impresa cualquier guía de
 * transporte. Es decorativa —no codifica un simbolismo estándar— y por eso va con
 * `aria-hidden`: el número legible siempre se imprime junto a ella.
 *
 * Las barras se derivan del propio texto, así que la misma guía dibuja siempre el mismo
 * código y dos guías distintas se ven distintas.
 */
export function CodigoBarras({
  valor,
  className,
}: {
  valor: string;
  className?: string;
}) {
  const barras: { x: number; ancho: number }[] = [];
  let x = 2;

  for (const caracter of valor.toUpperCase()) {
    const codigo = caracter.charCodeAt(0);
    for (let posicion = 0; posicion < 4; posicion += 1) {
      const ancho = ((codigo >> posicion) & 0b11) + 1;
      const separacion = ((codigo >> (posicion + 3)) & 0b11) + 1;
      barras.push({ x, ancho });
      x += ancho + separacion;
    }
  }

  const total = x + 2;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${total} 100`}
      preserveAspectRatio="none"
      className={cn("block h-12 w-full text-tinta", className)}
    >
      {barras.map((barra) => (
        <rect
          key={barra.x}
          x={barra.x}
          y={0}
          width={barra.ancho}
          height={100}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
