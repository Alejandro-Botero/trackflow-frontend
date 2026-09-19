import type { ReactNode } from "react";

/**
 * Envoltorio de campo de formulario: label visible + ayuda + error, y le
 * pasa al control (children, render prop) el id, aria-describedby y
 * aria-invalid que necesita para quedar correctamente asociado.
 */
export function CampoForm({
  id,
  etiqueta,
  ayuda,
  error,
  obligatorio,
  children,
}: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  obligatorio?: boolean;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean;
  }) => ReactNode;
}) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const describedBy = [idAyuda, idError].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="rotulo text-tinta-suave">
        {etiqueta}
        {obligatorio && (
          <>
            <span aria-hidden="true" className="text-error">
              {" "}
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        )}
      </label>
      {ayuda && (
        <p id={idAyuda} className="t-apoyo -mt-1 max-w-[45ch]">
          {ayuda}
        </p>
      )}
      {children({ id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) })}
      {error && (
        <p id={idError} role="alert" className="t-apoyo max-w-[45ch] font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
