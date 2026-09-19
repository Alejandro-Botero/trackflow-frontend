import Link from "next/link";

// Cabecera y pie del área pública (HU-03): sin sesión, sin datos personales.
// Solo marca arriba y una línea de privacidad abajo: nada que el cliente no necesite leer.
export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-linea bg-hoja">
        <div className="mx-auto flex w-full max-w-[1160px] items-center px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center bg-marina text-hoja"
            >
              <span className="guia text-sm font-semibold leading-none">TF</span>
            </span>
            <span className="t-seccion leading-none text-marina">TrackFlow</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1160px] flex-1 px-4 py-12 sm:px-6 sm:py-16">
        {children}
      </main>

      <footer className="mt-12 border-t border-linea">
        <p className="mx-auto w-full max-w-[1160px] px-4 py-8 text-sm text-tinta-suave sm:px-6">
          TrackFlow no muestra datos personales del remitente ni del destinatario.
        </p>
      </footer>
    </div>
  );
}
