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
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="marco marco-hoja w-full max-w-md p-8 flex flex-col gap-6">
        <div>
          <h1 className="t-titulo">Ingreso de operador</h1>
          <p className="t-apoyo mt-1">
            Usa tu usuario y clave asignados. El sistema determina tu rol automáticamente.
          </p>
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
                  Este entorno corre sin credenciales configuradas, así que no hay ningún
                  usuario con el que entrar. Mientras siga así, el registro de envíos y
                  eventos queda abierto sin token.
                </p>
              )}
            </Aviso>
          </div>
        )}

        <form onSubmit={manejarEnvio} noValidate className="flex flex-col gap-4">
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

          <Boton type="submit" variante="accion" cargando={enviando}>
            Ingresar
          </Boton>
        </form>

        <p className="mt-6 border-t border-linea pt-4">
          <Link
            href="/"
            className="t-apoyo font-medium text-marina underline-offset-4 hover:underline"
          >
            Volver a rastrear un envío
          </Link>
        </p>
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
