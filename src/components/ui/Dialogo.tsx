"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Diálogo modal sobre <dialog> nativo: showModal()/close() atrapan el foco y
 * lo devuelven al abridor automáticamente. Esc dispara "cancel" -> onCerrar.
 */
export function Dialogo({
  abierto,
  titulo,
  onCerrar,
  children,
  pie,
}: {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  pie: ReactNode;
}) {
  const referencia = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const nodo = referencia.current;
    if (!nodo) return;
    if (abierto && !nodo.open) {
      nodo.showModal();
    } else if (!abierto && nodo.open) {
      nodo.close();
    }
  }, [abierto]);

  return (
    <dialog
      ref={referencia}
      aria-labelledby={idTitulo}
      onCancel={(evento) => {
        evento.preventDefault();
        onCerrar();
      }}
      onClose={onCerrar}
      className="w-full max-w-lg rounded-none border border-marina bg-hoja p-0 shadow-[0_18px_48px_rgba(16,20,24,0.22)] backdrop:bg-tinta/55"
    >
      <div className="flex items-center justify-between gap-4 border-b border-linea px-5 py-4">
        <h2 id={idTitulo} className="t-seccion text-marina">
          {titulo}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="-mr-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center text-tinta-suave hover:text-marina"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-linea bg-papel px-5 py-4">
        {pie}
      </div>
    </dialog>
  );
}
