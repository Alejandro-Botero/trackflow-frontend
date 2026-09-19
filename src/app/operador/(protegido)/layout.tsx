"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSesion } from "@/auth/AuthContext";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { Aviso } from "@/components/ui/Aviso";

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
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Cargando />
      </div>
    );
  }

  const exigeAdmin = pathname.startsWith("/operador/admin");
  if (exigeAdmin && !esAdmin) {
    return (
      <div className="flex flex-col gap-4 p-6 max-w-3xl mx-auto w-full">
        <h1 className="t-titulo">Administración</h1>
        <Aviso tono="error" titulo="Sin permiso">
          Tu usuario ({sesion.usuario}) no tiene el rol ADMIN necesario para ver esta página.
        </Aviso>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="marco marco-hoja border-x-0 border-t-0 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="t-dato">Sesión iniciada como {sesion.usuario}</p>
          <p className="t-apoyo">Roles: {sesion.roles.join(", ")}</p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
          aria-label="Navegación de operador"
        >
          <Link href="/operador/envios/nuevo" className="t-dato hover:underline">
            Registrar envío
          </Link>
          <Link href="/operador/eventos/nuevo" className="t-dato hover:underline">
            Registrar evento
          </Link>
          {esAdmin && (
            <Link href="/operador/admin" className="t-dato hover:underline">
              Administración
            </Link>
          )}
          <Boton variante="contorno" onClick={salir}>
            Cerrar sesión
          </Boton>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
