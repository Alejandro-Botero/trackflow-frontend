"use client";

// Administración: solo ADMIN (la guarda de rol vive en el layout protegido).
import { useState } from "react";
import { reconstruirProyecciones } from "@/api/admin";
import type { ErrorApi } from "@/api/errores";
import { Boton } from "@/components/ui/Boton";
import { Dialogo } from "@/components/ui/Dialogo";
import { Aviso } from "@/components/ui/Aviso";

export default function PaginaAdmin() {
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<ErrorApi | null>(null);

  async function reconstruir() {
    setMostrarDialogo(false);
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
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
      <h1 className="t-titulo">Administración</h1>
      <p className="t-apoyo">
        Reconstruye las proyecciones de lectura (estado y historial) a partir de los eventos ya
        guardados. Úsalo solo si esos datos de consulta no coinciden con lo esperado.
      </p>

      <div>
        <Boton variante="marina" onClick={() => setMostrarDialogo(true)} disabled={procesando}>
          Reconstruir proyecciones
        </Boton>
      </div>

      <div aria-live="polite" className="flex flex-col gap-4">
        {error && (
          <Aviso tono="error" titulo="No se pudo reconstruir">
            {error.clase === "autorizacion"
              ? "Tu sesión no tiene permiso para esta operación (se requiere rol ADMIN)."
              : error.mensaje}
          </Aviso>
        )}

        {resultado && (
          <div className="marco marco-hoja p-6">
            <h2 className="t-seccion mb-3">Resultado de la reconstrucción</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-linea">
                  <th className="py-2 t-apoyo font-normal">Proyección</th>
                  <th className="py-2 t-apoyo font-normal">Registros procesados</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(resultado).map(([clave, valor]) => (
                  <tr key={clave} className="border-b border-linea">
                    <td className="py-2">{clave}</td>
                    <td className="py-2 t-dato">{valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialogo
        abierto={mostrarDialogo}
        titulo="Reconstruir proyecciones"
        onCerrar={() => setMostrarDialogo(false)}
        pie={
          <>
            <Boton type="button" variante="contorno" onClick={() => setMostrarDialogo(false)}>
              Cancelar
            </Boton>
            <Boton
              type="button"
              variante="accion"
              cargando={procesando}
              onClick={() => void reconstruir()}
            >
              Sí, reconstruir
            </Boton>
          </>
        }
      >
        <p>
          Esta acción reprocesa todas las proyecciones de lectura (estado, historial) a partir de
          los eventos guardados. Puede tardar unos segundos y no modifica los eventos originales.
        </p>
      </Dialogo>
    </div>
  );
}
