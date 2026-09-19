import type { ReactNode } from "react";

/**
 * Encabezado de pantalla interna: título y una línea de contexto con medida
 * limitada, cerrado por un filete. Da el mismo arranque a todas las vistas de
 * operador sin repetir la composición en cada página.
 */
export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-linea pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-titulo text-marina">{titulo}</h1>
        {descripcion && <p className="t-apoyo max-w-[60ch]">{descripcion}</p>}
      </div>
      {acciones}
    </header>
  );
}
