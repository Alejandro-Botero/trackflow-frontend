"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSesion } from "@/auth/AuthContext";
import { Cargando } from "@/components/ui/Cargando";
import { Aviso } from "@/components/ui/Aviso";
import { cn } from "@/lib/cn";

const ENLACES = [
  { href: "/operador/envios/nuevo", etiqueta: "Registrar envío", soloAdmin: false },
  { href: "/operador/eventos/nuevo", etiqueta: "Registrar evento", soloAdmin: false },
  { href: "/operador/admin", etiqueta: "Administración", soloAdmin: true },
] as const;

export default function LayoutProtegido({ children }: { children: ReactNode }) {
  const { sesion, cargando, salir, esAdmin } = useSesion();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !sesion) {
      router.replace(`/operador/ingresar?destino=${encodeURIComponent(pathname)}`);
    }
  }, [cargando, sesion, pathname, router]);

  if (cargando || !sesion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Cargando texto="Verificando la sesión…" />
      </div>
    );
  }

  const exigeAdmin = pathname.startsWith("/operador/admin");
  if (exigeAdmin && !esAdmin) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6">
        <h1 className="t-titulo text-marina">Administración</h1>
        <Aviso tono="error" titulo="Sin permiso">
          Tu usuario ({sesion.usuario}) no tiene el rol ADMIN necesario para ver esta página.
        </Aviso>
      </div>
    );
  }

  const enlacesVisibles = ENLACES.filter((enlace) => !enlace.soloAdmin || esAdmin);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Banda de identificación: área interna, distinta del sitio público a primera vista. */}
      <div className="bg-marina text-hoja">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/operador/envios/nuevo" className="t-seccion leading-none">
            TrackFlow
          </Link>
          <div className="flex items-center gap-5">
            <p className="text-sm">
              <span className="font-semibold">{sesion.usuario}</span>
              <span className="text-hoja/75"> · {sesion.roles.join(", ")}</span>
            </p>
            <button
              type="button"
              onClick={salir}
              className="inline-flex min-h-11 items-center gap-2 border border-hoja/45 px-3 text-sm font-semibold hover:bg-hoja hover:text-marina"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <header className="border-b border-linea bg-hoja">
        <nav
          aria-label="Navegación de operador"
          className="mx-auto flex w-full max-w-[1200px] flex-wrap gap-x-8 px-4 sm:px-6"
        >
          {enlacesVisibles.map((enlace) => {
            const activo = pathname.startsWith(enlace.href);
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-2 py-3 text-sm font-semibold",
                  activo
                    ? "border-sello-oscura text-marina"
                    : "border-transparent text-tinta-suave hover:border-linea-fuerte hover:text-marina",
                )}
              >
                {enlace.etiqueta}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
