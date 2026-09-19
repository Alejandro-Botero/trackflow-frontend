"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import type { CiudadResponse } from "@/api/tipos";
import { buscarCiudades } from "@/api/ciudades";
import { normalizarError } from "@/api/errores";
import { cn } from "@/lib/cn";

const RETARDO_MS = 250;

/**
 * Autocompletado de ciudad contra GET /api/ciudades. Patrón ARIA combobox
 * con listbox: el valor que viaja al formulario es siempre el id numérico
 * de la ciudad elegida (onChange), nunca el texto libre del campo.
 */
export function ComboboxCiudad({
  id,
  valor,
  onChange,
  error,
  etiqueta,
  obligatorio,
}: {
  id: string;
  valor: number | null;
  onChange: (ciudad: CiudadResponse | null) => void;
  error?: string;
  etiqueta: string;
  obligatorio?: boolean;
}) {
  const [texto, setTexto] = useState("");
  const [seleccion, setSeleccion] = useState<CiudadResponse | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [opciones, setOpciones] = useState<CiudadResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [indiceActivo, setIndiceActivo] = useState(-1);

  const controladorRef = useRef<AbortController | null>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const idLista = `${id}-listbox`;
  const idOpcionBase = `${id}-opcion`;
  const idError = error ? `${id}-error` : undefined;

  // El formulario limpió la selección (p. ej. reset) -> limpiamos el texto local.
  // Se ajusta durante el render, no en un efecto: así no hay un render intermedio
  // con el texto de la ciudad anterior ya borrada del formulario.
  const [valorPrevio, setValorPrevio] = useState(valor);
  if (valor !== valorPrevio) {
    setValorPrevio(valor);
    if (valor === null && seleccion !== null) {
      setSeleccion(null);
      setTexto("");
    }
  }

  useEffect(() => {
    return () => {
      controladorRef.current?.abort();
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    };
  }, []);

  useEffect(() => {
    function alHacerClicFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", alHacerClicFuera);
    return () => document.removeEventListener("mousedown", alHacerClicFuera);
  }, []);

  function buscar(consulta: string) {
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    controladorRef.current?.abort();

    if (consulta.trim().length === 0) {
      setOpciones([]);
      setCargando(false);
      setErrorBusqueda(null);
      return;
    }

    setCargando(true);
    setErrorBusqueda(null);
    setOpciones([]);

    temporizadorRef.current = setTimeout(async () => {
      const controlador = new AbortController();
      controladorRef.current = controlador;
      try {
        const resultado = await buscarCiudades(consulta, controlador.signal);
        setOpciones(resultado);
        setIndiceActivo(resultado.length > 0 ? 0 : -1);
      } catch (err) {
        if (controlador.signal.aborted) return;
        setErrorBusqueda(normalizarError(err).mensaje);
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }, RETARDO_MS);
  }

  function alCambiarTexto(nuevoTexto: string) {
    setTexto(nuevoTexto);
    setAbierto(true);
    if (seleccion) setSeleccion(null);
    if (nuevoTexto.trim().length === 0) onChange(null);
    buscar(nuevoTexto);
  }

  function seleccionar(ciudad: CiudadResponse) {
    setSeleccion(ciudad);
    setTexto(ciudad.etiqueta);
    onChange(ciudad);
    setAbierto(false);
    setOpciones([]);
    setIndiceActivo(-1);
  }

  function alPresionarTecla(evento: KeyboardEvent<HTMLInputElement>) {
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        if (!abierto) {
          setAbierto(true);
          return;
        }
        setIndiceActivo((indice) => Math.min(indice + 1, opciones.length - 1));
        break;
      case "ArrowUp":
        evento.preventDefault();
        setIndiceActivo((indice) => Math.max(indice - 1, 0));
        break;
      case "Home":
        if (abierto) {
          evento.preventDefault();
          setIndiceActivo(0);
        }
        break;
      case "End":
        if (abierto) {
          evento.preventDefault();
          setIndiceActivo(opciones.length - 1);
        }
        break;
      case "Enter":
        if (abierto && indiceActivo >= 0 && opciones[indiceActivo]) {
          evento.preventDefault();
          seleccionar(opciones[indiceActivo]);
        }
        break;
      case "Escape":
        if (abierto) {
          evento.preventDefault();
          setAbierto(false);
        }
        break;
      default:
        break;
    }
  }

  const mostrarLista = abierto && texto.trim().length > 0;
  const idActivo = indiceActivo >= 0 ? `${idOpcionBase}-${indiceActivo}` : undefined;

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
      <div ref={contenedorRef} className="relative">
        <div className="relative">
          <input
            id={id}
            role="combobox"
            type="text"
            autoComplete="off"
            aria-expanded={mostrarLista}
            aria-controls={idLista}
            aria-activedescendant={idActivo}
            aria-invalid={Boolean(error)}
            aria-describedby={idError}
            aria-haspopup="listbox"
            value={texto}
            onChange={(evento) => alCambiarTexto(evento.target.value)}
            onFocus={() => texto.trim().length > 0 && setAbierto(true)}
            onKeyDown={alPresionarTecla}
            className={cn(
              "min-h-12 w-full rounded-none border border-linea-control bg-hoja px-3.5 pr-10 text-base text-tinta",
              "hover:border-marina",
              "aria-invalid:border-error aria-invalid:bg-error-fondo",
            )}
          />
          {cargando ? (
            <Loader2
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-tinta-suave"
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-suave"
              aria-hidden="true"
            />
          )}
        </div>
        {mostrarLista && (
          <ul
            id={idLista}
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto border border-marina bg-hoja"
          >
            {cargando && <li className="t-apoyo px-3.5 py-3">Buscando…</li>}
            {!cargando && errorBusqueda && (
              <li role="alert" className="px-3.5 py-3 text-sm text-error">
                {errorBusqueda}
              </li>
            )}
            {!cargando && !errorBusqueda && opciones.length === 0 && (
              <li className="t-apoyo px-3.5 py-3">Sin resultados</li>
            )}
            {!cargando &&
              !errorBusqueda &&
              opciones.map((ciudad, indice) => (
                <li
                  key={ciudad.id}
                  id={`${idOpcionBase}-${indice}`}
                  role="option"
                  aria-selected={indice === indiceActivo}
                  onMouseDown={(evento) => {
                    evento.preventDefault();
                    seleccionar(ciudad);
                  }}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center border-b border-linea px-3.5 py-2 text-base last:border-b-0",
                    indice === indiceActivo ? "bg-marina text-hoja" : "text-tinta hover:bg-papel",
                  )}
                >
                  {ciudad.etiqueta}
                </li>
              ))}
          </ul>
        )}
      </div>
      {error && (
        <p id={idError} role="alert" className="t-apoyo max-w-[45ch] font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
