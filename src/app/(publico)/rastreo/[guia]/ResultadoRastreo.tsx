"use client";

// Carga estado e historial en paralelo y cubre los 5 estados de la consulta pública (HU-03).
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { consultarEstado, consultarHistorial } from "@/api/tracking";
import type { ErrorApi } from "@/api/errores";
import type { EstadoEnvioResponse, EventoLogisticoResponse } from "@/api/tipos";
import { formatearFechaHora } from "@/lib/fechas";
import { EstadoBadge } from "@/components/EstadoBadge";
import { ProgresoEnvio } from "@/components/ProgresoEnvio";
import { Timeline } from "@/components/Timeline";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { Cargando } from "@/components/ui/Cargando";

interface ResultadoRastreoProps {
  guia: string;
}

interface DatosEnvio {
  estado: EstadoEnvioResponse;
  eventos: EventoLogisticoResponse[];
}

export function ResultadoRastreo({ guia }: ResultadoRastreoProps) {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState<DatosEnvio | null>(null);
  const [error, setError] = useState<ErrorApi | null>(null);

  // La cadena arranca con una promesa ya resuelta para que los setState queden en un callback
  // y no en el cuerpo del efecto que llama a `cargar` (regla react-hooks/set-state-in-effect).
  const cargar = useCallback(() => {
    Promise.resolve()
      .then(() => {
        setCargando(true);
        setError(null);
        return Promise.all([consultarEstado(guia), consultarHistorial(guia)]);
      })
      .then(([estado, eventos]) => {
        setDatos({ estado, eventos });
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
    <div aria-live="polite" className="flex flex-col gap-6">
      {cargando && (
        <div className="marco marco-hoja flex flex-col items-center gap-3 p-10 text-center">
          <Cargando texto="Consultando el envío…" tamano="lg" />
          <p className="t-apoyo max-w-prose">
            El servicio puede tardar hasta 25 segundos en responder si acaba de arrancar en frío.
          </p>
        </div>
      )}

      {!cargando && error && error.clase === "noEncontrado" && (
        <Aviso tono="error" titulo="Envío no encontrado">
          <p>No encontramos ningún envío con ese número. Verifica el número e inténtalo de nuevo.</p>
          <p className="t-apoyo mt-2">
            Número consultado: <span className="guia">{guia}</span>
          </p>
        </Aviso>
      )}

      {!cargando && error && error.clase !== "noEncontrado" && (
        <Aviso
          tono="error"
          titulo="No se pudo consultar el envío"
          accion={
            <Boton type="button" variante="contorno" onClick={cargar}>
              Reintentar
            </Boton>
          }
        >
          {error.mensaje}
        </Aviso>
      )}

      {!cargando && !error && datos && (
        <>
          <div className="marco marco-hoja flex flex-col gap-4 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="t-apoyo">Guía</p>
                <p className="guia text-xl">{datos.estado.trackingNumber}</p>
              </div>
              <EstadoBadge estado={datos.estado.estado} tamano="lg" />
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="t-apoyo">Ciudad de destino</dt>
                <dd className="t-dato">{datos.estado.ciudadDestino ?? "Sin definir"}</dd>
              </div>
              <div>
                <dt className="t-apoyo">Fecha de registro</dt>
                <dd className="t-dato">{formatearFechaHora(datos.estado.registeredAt)}</dd>
              </div>
              {datos.estado.tieneMovimientos && (
                <>
                  <div>
                    <dt className="t-apoyo">Último punto</dt>
                    <dd className="t-dato">{datos.estado.ultimoPunto}</dd>
                  </div>
                  <div>
                    <dt className="t-apoyo">Fecha del último movimiento</dt>
                    <dd className="t-dato">
                      {datos.estado.ultimoMovimientoAt
                        ? formatearFechaHora(datos.estado.ultimoMovimientoAt)
                        : "—"}
                    </dd>
                  </div>
                </>
              )}
            </dl>

            <ProgresoEnvio estado={datos.estado.estado} />
          </div>

          {datos.estado.tieneMovimientos ? (
            <div className="flex flex-col gap-3">
              <h2 className="t-seccion text-marina">Historial de movimientos</h2>
              <Timeline eventos={datos.eventos} />
            </div>
          ) : (
            <Aviso tono="info" titulo="Sin movimientos">
              Aún no registra movimientos.
            </Aviso>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Boton
              type="button"
              variante="marina"
              onClick={() => router.push(`/operador/eventos/nuevo?guia=${datos.estado.trackingNumber}`)}
            >
              Reportar movimiento
            </Boton>
            <Link
              href="/"
              className="t-apoyo font-medium text-marina underline-offset-4 hover:underline"
            >
              Consultar otra guía
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
