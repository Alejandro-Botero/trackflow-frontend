"use client";

// Administración: solo ADMIN (la guarda de rol vive en el layout protegido).
import { useState } from "react";
import { reconstruirProyecciones } from "@/api/admin";
import type { ErrorApi } from "@/api/errores";
import { EncabezadoPagina } from "@/components/EncabezadoPagina";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";

export default function PaginaAdmin() {
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<ErrorApi | null>(null);

  async function reconstruir() {
    setProcesando(true);
    setError(null);
    try {
      const conteos = await reconstruirProyecciones();
      setResultado(conteos);
    } catch (err) {
      setError(err as ErrorApi);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-10 sm:px-6">
      <EncabezadoPagina
        titulo="Administración"
        descripcion="Herramientas de mantenimiento del lado de lectura. No modifican los eventos registrados."
      />

      <section aria-labelledby="reconstruir" className="hoja max-w-[46rem] p-6 sm:p-8">
        <div className="flex flex-col gap-3">
          <h2 id="reconstruir" className="t-seccion text-marina">
            Reconstruir proyecciones
          </h2>
          <p className="t-apoyo max-w-[60ch]">
            Vuelve a calcular el estado y el historial a partir de los eventos ya guardados. Tarda
            unos segundos y no modifica los eventos originales.
          </p>
        </div>
        <div className="mt-6">
          <Boton variante="accion" cargando={procesando} onClick={() => void reconstruir()}>
            Reconstruir proyecciones
          </Boton>
        </div>
      </section>

      <div aria-live="polite" className="flex flex-col gap-6">
        {error && (
          <Aviso tono="error" titulo="No se pudo reconstruir">
            {error.clase === "autorizacion"
              ? "Tu sesión no tiene permiso para esta operación (se requiere rol ADMIN)."
              : error.mensaje}
          </Aviso>
        )}

        {resultado && (
          <section aria-labelledby="resultado" className="flex max-w-[46rem] flex-col gap-4">
            <h2 id="resultado" className="rotulo">
              Resultado de la reconstrucción
            </h2>
            <table className="registro w-full border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="rotulo pb-2 pr-4 align-bottom font-medium">
                    Proyección
                  </th>
                  <th scope="col" className="rotulo pb-2 text-right align-bottom font-medium">
                    Registros procesados
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(resultado).map(([clave, valor]) => (
                  <tr key={clave}>
                    <td className="py-2.5 pr-4">{clave}</td>
                    <td className="cifras py-2.5 text-right text-marina">{valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>

    </div>
  );
}
