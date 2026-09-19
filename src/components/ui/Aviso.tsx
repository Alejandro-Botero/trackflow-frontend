import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CircleCheck, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type TonoAviso = "error" | "info" | "exito" | "atencion";

const CONFIG: Record<TonoAviso, { icono: LucideIcon; borde: string; texto: string; fondo: string }> = {
  error: { icono: AlertCircle, borde: "border-l-error", texto: "text-error", fondo: "bg-error-fondo" },
  info: { icono: Info, borde: "border-l-marina", texto: "text-marina", fondo: "bg-hoja" },
  exito: { icono: CircleCheck, borde: "border-l-estado-entregado", texto: "text-estado-entregado", fondo: "bg-hoja" },
  atencion: { icono: AlertTriangle, borde: "border-l-estado-reparto", texto: "text-estado-reparto", fondo: "bg-hoja" },
};

/** Aviso con ícono + color + texto (nunca solo color). role="alert" en tono error. */
export function Aviso({
  tono,
  titulo,
  children,
  accion,
}: {
  tono: TonoAviso;
  titulo?: string;
  children: ReactNode;
  accion?: ReactNode;
}) {
  const { icono: Icono, borde, texto, fondo } = CONFIG[tono];

  return (
    <div
      role={tono === "error" ? "alert" : "status"}
      className={cn("flex gap-3 border border-linea border-l-4 p-4", borde, fondo)}
    >
      <Icono className={cn("mt-0.5 h-5 w-5 shrink-0", texto)} aria-hidden="true" />
      <div className="flex-1">
        {titulo && <p className={cn("t-dato", texto)}>{titulo}</p>}
        <div className="t-apoyo mt-1 text-tinta">{children}</div>
        {accion && <div className="mt-3">{accion}</div>}
      </div>
    </div>
  );
}
