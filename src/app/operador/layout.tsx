import type { ReactNode } from "react";
import { ProveedorAuth } from "@/auth/AuthContext";

// Envuelve toda el área de operadores (ingreso + rutas protegidas) con la sesión.
export default function OperadorLayout({ children }: { children: ReactNode }) {
  return <ProveedorAuth>{children}</ProveedorAuth>;
}
