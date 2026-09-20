import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, PackagePlus, Wrench } from "lucide-react";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Acceso interno",
  description: "Entrada al área de operadores de TrackFlow.",
};

/**
 * Portada del área interna. No decide el rol —eso lo hace el backend al validar las
 * credenciales—: solo elige a qué pantalla entrar, y pasa ese destino al formulario de ingreso.
 */
const ACCESOS = [
  {
    titulo: "Operador",
    descripcion: "Registrar envíos y los eventos de la cadena logística.",
    destino: "/operador/envios/nuevo",
    Icono: PackagePlus,
  },
  {
    titulo: "Administrador",
    descripcion: "Además, las herramientas de mantenimiento del lado de lectura.",
    destino: "/operador/admin",
    Icono: Wrench,
  },
] as const;

export default function PaginaOperador() {
  return (
    <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-12 px-4 py-12 sm:px-6 lg:py-20">
      <header className="flex flex-col gap-6">
        <Logo className="h-9 self-start" />
        <div className="flex flex-col gap-3">
          <h1 className="t-display text-marina">Acceso interno</h1>
          <p className="t-apoyo max-w-[45ch]">
            El usuario y la clave deciden qué puedes hacer. Elige por dónde entrar.
          </p>
        </div>
      </header>

      {/* Copia al carbón: el duplicado interno, no el original que ve el cliente. */}
      <nav aria-label="Accesos del área interna" className="hoja hoja-copia">
        <ul>
          {ACCESOS.map(({ titulo, descripcion, destino, Icono }, indice) => (
            <li key={titulo} className={indice > 0 ? "border-t border-linea" : undefined}>
              <Link
                href={`/operador/ingresar?destino=${encodeURIComponent(destino)}`}
                className="flex items-center gap-5 p-6 hover:bg-hoja sm:p-8"
              >
                <Icono className="h-5 w-5 shrink-0 text-marina" aria-hidden="true" />
                <span className="flex flex-col gap-1">
                  <span className="t-seccion text-marina">{titulo}</span>
                  <span className="t-apoyo max-w-[45ch]">{descripcion}</span>
                </span>
                <ChevronRight
                  className="ml-auto h-5 w-5 shrink-0 text-tinta-suave"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-4 border-t border-linea pt-6">
        <p className="t-apoyo max-w-[45ch]">
          El rol lo asigna el sistema al validar las credenciales: si tu usuario no tiene ADMIN,
          la administración queda bloqueada aunque entres por esa puerta.
        </p>
        <p>
          <Link
            href="/"
            className="text-sm font-semibold text-marina underline decoration-linea-fuerte underline-offset-4 hover:decoration-marina"
          >
            Volver a rastrear un envío
          </Link>
        </p>
      </div>
    </div>
  );
}
