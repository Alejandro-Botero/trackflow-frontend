"use client";

// Consulta pública del estado actual (HU-03): cubre los 5 estados de la vista. El historial de
// movimientos es HU-04, fuera del alcance de este sprint, y por eso aquí no se pide ni se pinta.
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { consultarEstado } from "@/api/tracking";
import type { ErrorApi } from "@/api/errores";
import type { EstadoEnvioResponse } from "@/api/tipos";
import { formatearFechaHora } from "@/lib/fechas";
import { CodigoBarras } from "@/components/CodigoBarras";
import { ProgresoEnvio } from "@/components/ProgresoEnvio";
import { SelloEstado } from "@/components/SelloEstado";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { Cargando } from "@/components/ui/Cargando";

interface ResultadoRastreoProps {
  guia: string;
  /** El número ya agrupado para leerlo en voz alta: "TF 0000 0000 0002". */
  guiaAgrupada: string;
}

/** Casilla rotulada del formato: nombre impreso arriba, dato mecanografiado debajo. */
function Casilla({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="casilla">
      <dt className="rotulo">{rotulo}</dt>
      <dd className="mt-1.5 font-medium text-tinta">{children}</dd>
    </div>
  );
}

export function ResultadoRastreo({ guia, guiaAgrupada }: ResultadoRastreoProps) {
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState<EstadoEnvioResponse | null>(null);
  const [error, setError] = useState<ErrorApi | null>(null);

  // La cadena arranca con una promesa ya resuelta para que los setState queden en un callback
  // y no en el cuerpo del efecto que llama a `cargar` (regla react-hooks/set-state-in-effect).
  const cargar = useCallback(() => {
    Promise.resolve()
      .then(() => {
        setCargando(true);
        setError(null);
        return consultarEstado(guia);
      })
      .then((estado) => {
        setDatos(estado);
      })
      .catch((err: ErrorApi) => {
        setError(err);
        setDatos(null);
      })
      .finally(() => setCargando(false));
  }, [guia]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="flex flex-col gap-8">
      {/* La hoja existe siempre: mientras carga o cuando falla, el membrete ya está impreso. */}
      <section className="hoja" aria-labelledby="estado">
        <div className="flex flex-col gap-6 border-b border-linea p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-12 sm:p-8">
          <h1 className="guia text-2xl font-semibold text-marina sm:text-3xl">{guiaAgrupada}</h1>
          <CodigoBarras valor={guia} className="h-12 w-full text-marina sm:w-64" />
        </div>

        <div aria-live="polite">
          {cargando && (
            <div className="flex flex-col gap-2 p-6 sm:p-8">
              <Cargando texto="Consultando el envío…" tamano="lg" />
              <p className="t-apoyo max-w-[45ch]">
                El servicio puede tardar hasta 25 segundos en responder si acaba de arrancar en
                frío.
              </p>
            </div>
          )}

          {!cargando && error && (
            <div className="p-6 sm:p-8">
              <Aviso
                tono="error"
                titulo={
                  error.clase === "noEncontrado"
                    ? "Envío no encontrado"
                    : "No se pudo consultar el envío"
                }
                accion={
                  error.clase === "noEncontrado" ? undefined : (
                    <Boton type="button" variante="contorno" onClick={cargar}>
                      Reintentar
                    </Boton>
                  )
                }
              >
                {error.clase === "noEncontrado"
                  ? "No hay ningún envío registrado con ese número. Verifica que sean las dos letras TF seguidas de 12 dígitos, sin espacios."
                  : error.mensaje}
              </Aviso>
            </div>
          )}

          {!cargando && !error && datos && (
            <>
              <div className="flex flex-col gap-6 border-b border-linea p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:p-8">
                <h2 id="estado" className="sr-only">
                  Estado actual
                </h2>
                <SelloEstado estado={datos.estado} />
                {datos.tieneMovimientos && (
                  <div className="flex flex-col gap-1 border-t border-linea pt-4 sm:border-t-0 sm:pt-0 sm:text-right">
                    <p className="rotulo">Último movimiento</p>
                    <p className="cifras text-tinta">
                      {datos.ultimoMovimientoAt
                        ? formatearFechaHora(datos.ultimoMovimientoAt)
                        : "Sin fecha"}
                    </p>
                    <p className="t-apoyo max-w-[34ch] sm:ml-auto">{datos.ultimoPunto}</p>
                  </div>
                )}
              </div>

              <dl className="grid gap-px bg-linea sm:grid-cols-2">
                <Casilla rotulo="Ciudad de destino">
                  {datos.ciudadDestino ?? "Sin definir"}
                </Casilla>
                <Casilla rotulo="Fecha de registro">
                  <span className="cifras">{formatearFechaHora(datos.registeredAt)}</span>
                </Casilla>
              </dl>

              <div className="border-t border-linea px-6 py-7 sm:px-8">
                <ProgresoEnvio estado={datos.estado} />
              </div>
            </>
          )}
        </div>

      </section>

      {!cargando && !error && datos && (
        <>
          {!datos.tieneMovimientos && (
            <Aviso tono="info" titulo="Sin movimientos">
              El envío ya tiene guía, pero todavía no pasa por ningún punto de control. Vuelve a
              consultar más tarde.
            </Aviso>
          )}

          <p>
            <Link
              href="/"
              className="text-sm font-semibold text-marina underline decoration-linea-fuerte underline-offset-4 hover:decoration-marina"
            >
              Consultar otra guía
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
