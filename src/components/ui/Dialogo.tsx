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
      className="marco marco-hoja w-full max-w-lg rounded-none p-0 backdrop:bg-tinta/50"
    >
      <div className="flex items-center justify-between gap-4 border-b border-linea p-4">
        <h2 id={idTitulo} className="t-seccion text-marina">
          {titulo}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-marina"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="p-4">{children}</div>
      <div className="flex justify-end gap-2 border-t border-linea p-4">{pie}</div>
    </dialog>
  );
}
