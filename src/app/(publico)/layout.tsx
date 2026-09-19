import Link from "next/link";

// Cabecera y pie del área pública (HU-03): sin sesión, sin datos personales.
// La cabecera lleva solo la marca: el buscador ya es el héroe de la portada y el acceso de
// operadores no tiene por qué anunciarse al cliente.
export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-linea bg-hoja">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6">
          <Link href="/" className="t-seccion text-marina">
            TrackFlow
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-linea">
        <p className="mx-auto w-full max-w-[1200px] px-4 py-6 t-apoyo sm:px-6">
          TrackFlow no muestra datos personales del remitente ni del destinatario.
        </p>
      </footer>
    </div>
  );
}
