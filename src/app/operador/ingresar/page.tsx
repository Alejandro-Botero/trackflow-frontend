"use client";

// El rol lo decide el backend: este formulario no ofrece selector de rol.
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSesion } from "@/auth/AuthContext";
import type { ErrorApi } from "@/api/errores";
import { Boton } from "@/components/ui/Boton";
import { Input } from "@/components/ui/Input";
import { Aviso } from "@/components/ui/Aviso";
import { Cargando } from "@/components/ui/Cargando";
import { CampoForm } from "@/components/CampoForm";

/** Solo permite redirigir dentro del área de operadores (evita redirecciones externas). */
function destinoSeguro(destino: string | null): string {
  if (destino && destino.startsWith("/operador")) return destino;
  return "/operador/envios/nuevo";
}

function FormularioIngreso() {
  const { sesion, cargando, entrar } = useSesion();
  const router = useRouter();
  const parametros = useSearchParams();
  const destino = destinoSeguro(parametros.get("destino"));

  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<ErrorApi | null>(null);
  const yaRedirigido = useRef(false);

  // Si ya hay una sesión válida, no tiene sentido mostrar el formulario.
  useEffect(() => {
    if (!cargando && sesion && !yaRedirigido.current) {
      yaRedirigido.current = true;
      router.replace(destino);
    }
  }, [cargando, sesion, destino, router]);

  async function intentarIngreso() {
    if (!usuario.trim() || !clave) {
      setError({ clase: "validacion", mensaje: "Escribe tu usuario y tu clave." });
      document.getElementById("usuario")?.focus();
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      await entrar({ usuario: usuario.trim(), clave });
      yaRedirigido.current = true;
      router.replace(destino);
    } catch (err) {
      setError(err as ErrorApi);
      document.getElementById("usuario")?.focus();
    } finally {
      setEnviando(false);
    }
  }

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void intentarIngreso();
  }

  if (cargando || sesion) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Cargando />
      </div>
    );
  }

  const puedeReintentar = error?.clase === "red" || error?.clase === "timeout";

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-20 lg:py-20">
      <div className="flex flex-col gap-6 lg:pt-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center bg-marina text-hoja"
          >
            <span className="guia text-sm leading-none">TF</span>
          </span>
          <span className="t-seccion leading-none text-marina">TrackFlow</span>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="t-display text-marina">Panel de operación</h1>
          <p className="max-w-[46ch] text-lg text-tinta-suave">
            Desde aquí se registran los envíos y los eventos de la cadena logística. La consulta
            pública de guías no requiere sesión.
          </p>
        </div>

        <p>
          <Link
            href="/"
            className="text-sm font-semibold text-marina underline decoration-linea-fuerte underline-offset-4 hover:decoration-marina"
          >
            Volver a rastrear un envío
          </Link>
        </p>
      </div>

      <div className="hoja flex h-fit flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="t-seccion text-marina">Ingreso de operador</h2>
          <p className="t-apoyo max-w-[45ch]">Usa el usuario y la clave asignados.</p>
        </div>

        {error && (
          <div id="resumen-error" tabIndex={-1}>
            <Aviso
              tono="error"
              titulo="No se pudo iniciar sesión"
              accion={
                puedeReintentar ? (
                  <Boton type="button" variante="contorno" onClick={() => void intentarIngreso()}>
                    Reintentar
                  </Boton>
                ) : undefined
              }
            >
              <p>{error.mensaje}</p>
              {error.clase === "noDisponible" && (
                <p className="t-apoyo mt-1">
                  Este entorno corre sin credenciales configuradas, así que no hay ningún usuario
                  con el que entrar. Mientras siga así, el registro de envíos y eventos queda
                  abierto sin token.
                </p>
              )}
            </Aviso>
          </div>
        )}

        <form onSubmit={manejarEnvio} noValidate className="flex flex-col gap-5">
          <CampoForm id="usuario" etiqueta="Usuario" obligatorio>
            {(campo) => (
              <Input
                {...campo}
                value={usuario}
                onChange={(evento) => setUsuario(evento.target.value)}
                autoComplete="username"
                autoFocus
              />
            )}
          </CampoForm>

          <CampoForm id="clave" etiqueta="Clave" obligatorio>
            {(campo) => (
              <Input
                {...campo}
                type="password"
                value={clave}
                onChange={(evento) => setClave(evento.target.value)}
                autoComplete="current-password"
              />
            )}
          </CampoForm>

          <Boton type="submit" variante="accion" cargando={enviando} className="mt-1">
            Ingresar
          </Boton>
        </form>
      </div>
    </div>
  );
}

export default function PaginaIngresar() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <Cargando />
        </div>
      }
    >
      <FormularioIngreso />
    </Suspense>
  );
}
