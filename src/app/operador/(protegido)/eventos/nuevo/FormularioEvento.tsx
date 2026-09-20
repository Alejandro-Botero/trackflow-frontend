"use client";

// HU-02: registrar evento logístico. Ver docs/contrato-ui.md §9-10.
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { registrarEvento } from "@/api/shipments";
import { consultarEstado } from "@/api/tracking";
import { mensajeDeCampo, type ErrorApi } from "@/api/errores";
import type {
  EstadoEnvioResponse,
  EventoAdmitidoResponse,
  RegistrarEventoRequest,
  TipoEvento,
} from "@/api/tipos";
import { errorDeGuia, normalizarGuia } from "@/lib/guia";
import { TIPOS_EVENTO, etiquetaTipoEvento, etiquetaEstado } from "@/lib/estados";
import { aLocalDateTimeInput, deLocalDateTimeInputAIso, formatearFechaHora } from "@/lib/fechas";
import { sondear } from "@/lib/polling";
import { Boton } from "@/components/ui/Boton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Aviso } from "@/components/ui/Aviso";
import { Dialogo } from "@/components/ui/Dialogo";
import { Cargando } from "@/components/ui/Cargando";
import { CampoForm } from "@/components/CampoForm";
import { EstadoBadge } from "@/components/EstadoBadge";

interface FichaEnvio {
  guia: string;
  estado: EstadoEnvioResponse;
}

interface DatosFormularioEvento {
  tipo: TipoEvento;
  punto: string;
  observaciones: string;
  ocurridoEn: string;
}

function formularioVacio(): DatosFormularioEvento {
  return {
    tipo: TIPOS_EVENTO[0].valor,
    punto: "",
    observaciones: "",
    ocurridoEn: aLocalDateTimeInput(new Date()),
  };
}

function validarFormulario(datos: DatosFormularioEvento): Record<string, string> {
  const errores: Record<string, string> = {};
  if (!datos.punto.trim()) {
    errores.punto = "Escribe el punto donde ocurrió el evento.";
  }
  if (!datos.ocurridoEn) {
    errores.ocurridoEn = "Escribe la fecha y hora del evento.";
  } else if (new Date(datos.ocurridoEn).getTime() > Date.now()) {
    errores.ocurridoEn = "La fecha y hora no pueden ser futuras.";
  }
  return errores;
}

export function FormularioEvento() {
  const parametros = useSearchParams();

  const [guia, setGuia] = useState(parametros.get("guia") ?? "");
  const [errorGuia, setErrorGuia] = useState<string | undefined>(undefined);
  const [buscando, setBuscando] = useState(false);
  const [ficha, setFicha] = useState<FichaEnvio | null>(null);

  const [formulario, setFormulario] = useState<DatosFormularioEvento>(formularioVacio);
  const [erroresCliente, setErroresCliente] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<ErrorApi | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [resultadoEvento, setResultadoEvento] = useState<EventoAdmitidoResponse | null>(null);
  const [sondeando, setSondeando] = useState(false);
  const [sondeoAgotado, setSondeoAgotado] = useState(false);

  function errorDeCampo(campo: string): string | undefined {
    return erroresCliente[campo] ?? mensajeDeCampo(errorServidor, campo);
  }

  async function buscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const problema = errorDeGuia(guia);
    if (problema) {
      setErrorGuia(problema);
      document.getElementById("guia")?.focus();
      return;
    }

    setErrorGuia(undefined);
    setFicha(null);
    setResultadoEvento(null);
    setBuscando(true);
    const guiaNormalizada = normalizarGuia(guia);
    try {
      const estado = await consultarEstado(guiaNormalizada);
      setFicha({ guia: guiaNormalizada, estado });
      setFormulario(formularioVacio());
      setErroresCliente({});
      setErrorServidor(null);
    } catch (err) {
      setErrorGuia((err as ErrorApi).mensaje);
    } finally {
      setBuscando(false);
    }
  }

  function pedirConfirmacion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const errores = validarFormulario(formulario);
    setErroresCliente(errores);
    setErrorServidor(null);

    const primerCampoConError = Object.keys(errores)[0];
    if (primerCampoConError) {
      document.getElementById(primerCampoConError)?.focus();
      return;
    }
    setMostrarConfirmacion(true);
  }

  async function confirmarYRegistrar() {
    if (!ficha) return;
    setMostrarConfirmacion(false);
    setEnviando(true);
    setErrorServidor(null);

    const payload: RegistrarEventoRequest = {
      tipo: formulario.tipo,
      punto: formulario.punto.trim(),
      ocurridoEn: deLocalDateTimeInputAIso(formulario.ocurridoEn),
      ...(formulario.observaciones.trim()
        ? { observaciones: formulario.observaciones.trim() }
        : {}),
    };

    let respuesta: EventoAdmitidoResponse;
    try {
      respuesta = await registrarEvento(ficha.guia, payload);
    } catch (err) {
      setErrorServidor(err as ErrorApi);
      setEnviando(false);
      document.getElementById("resumen-error-evento")?.focus();
      return;
    }

    setEnviando(false);
    setResultadoEvento(respuesta);
    setSondeando(true);
    // El 202 solo dice que el evento se admitió: la proyección de lectura se confirma cuando
    // cambia la marca del último movimiento (o el estado). Un evento con fecha anterior al
    // último ya registrado no mueve ninguna de las dos, así que ahí el sondeo se agota y el
    // aviso invita a consultar la guía en unos segundos.
    const marcaPrevia = ficha.estado.ultimoMovimientoAt;
    const estadoPrevio = ficha.estado.estado;
    try {
      const { valor, confirmado } = await sondear(
        () => consultarEstado(ficha.guia),
        (estado) =>
          estado.ultimoMovimientoAt !== marcaPrevia || estado.estado !== estadoPrevio,
      );
      if (valor) {
        setFicha({ guia: ficha.guia, estado: valor });
      }
      setSondeoAgotado(!confirmado);
    } catch {
      setSondeoAgotado(true);
    } finally {
      setSondeando(false);
    }
  }

  function registrarOtroEvento() {
    setGuia("");
    setErrorGuia(undefined);
    setFicha(null);
    setFormulario(formularioVacio());
    setErroresCliente({});
    setErrorServidor(null);
    setResultadoEvento(null);
    setSondeoAgotado(false);
    document.getElementById("guia")?.focus();
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={buscar}
        noValidate
        className="hoja hoja-copia flex max-w-[46rem] flex-col gap-5 p-6 sm:p-8"
      >
        <div className="border-b border-linea pb-3">
          <h2 className="t-seccion text-marina">Buscar envío</h2>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full min-w-48 sm:w-80">
            <CampoForm id="guia" etiqueta="Número de guía" obligatorio error={errorGuia}>
              {(campo) => (
                <Input
                  {...campo}
                  value={guia}
                  onChange={(evento) => setGuia(evento.target.value)}
                  placeholder="TF000000000001"
                  className="guia"
                />
              )}
            </CampoForm>
          </div>
          <Boton type="submit" variante="marina" cargando={buscando}>
            Buscar
          </Boton>
        </div>
      </form>

      {buscando && (
        <div className="flex justify-center p-4">
          <Cargando />
        </div>
      )}

      {ficha && !resultadoEvento && (
        <>
          <div
            className="flex max-w-[46rem] flex-wrap items-start justify-between gap-x-8 gap-y-5 border-y border-linea py-5"
            aria-live="polite"
          >
            <div className="flex flex-col gap-1">
              <p className="rotulo">Envío encontrado</p>
              <p className="guia t-dato text-marina">{ficha.guia}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="rotulo">Estado actual</p>
              <EstadoBadge estado={ficha.estado.estado} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="rotulo">Último movimiento</p>
              <p className="t-apoyo max-w-[36ch] text-tinta">
                {ficha.estado.ultimoPunto && ficha.estado.ultimoMovimientoAt
                  ? `${ficha.estado.ultimoPunto} · ${formatearFechaHora(
                      ficha.estado.ultimoMovimientoAt,
                    )}`
                  : "Aún no registra movimientos."}
              </p>
            </div>
          </div>

          <form
            onSubmit={pedirConfirmacion}
            noValidate
            className="hoja hoja-copia flex max-w-[46rem] flex-col gap-5 p-6 sm:p-8"
          >
            <div className="border-b border-linea pb-3">
              <h2 className="t-seccion text-marina">Nuevo evento</h2>
            </div>

            <CampoForm id="tipo" etiqueta="Tipo de evento" obligatorio>
              {(campo) => (
                <Select
                  {...campo}
                  value={formulario.tipo}
                  onChange={(evento) =>
                    setFormulario((anterior) => ({
                      ...anterior,
                      tipo: evento.target.value as TipoEvento,
                    }))
                  }
                >
                  {TIPOS_EVENTO.map((tipo) => (
                    <option key={tipo.valor} value={tipo.valor}>
                      {tipo.etiqueta}
                    </option>
                  ))}
                </Select>
              )}
            </CampoForm>

            <CampoForm id="punto" etiqueta="Punto" obligatorio error={errorDeCampo("punto")}>
              {(campo) => (
                <Input
                  {...campo}
                  value={formulario.punto}
                  onChange={(evento) =>
                    setFormulario((anterior) => ({ ...anterior, punto: evento.target.value }))
                  }
                />
              )}
            </CampoForm>

            <CampoForm id="observaciones" etiqueta="Observaciones">
              {(campo) => (
                <Textarea
                  {...campo}
                  value={formulario.observaciones}
                  onChange={(evento) =>
                    setFormulario((anterior) => ({
                      ...anterior,
                      observaciones: evento.target.value,
                    }))
                  }
                  rows={2}
                />
              )}
            </CampoForm>

            <CampoForm
              id="ocurridoEn"
              etiqueta="Fecha y hora del evento"
              obligatorio
              ayuda="Si estás reportando un evento pasado, ajusta la fecha y hora; no puede ser futura."
              error={errorDeCampo("ocurridoEn")}
            >
              {(campo) => (
                <Input
                  {...campo}
                  type="datetime-local"
                  value={formulario.ocurridoEn}
                  onChange={(evento) =>
                    setFormulario((anterior) => ({ ...anterior, ocurridoEn: evento.target.value }))
                  }
                />
              )}
            </CampoForm>

            {errorServidor && (
              <div id="resumen-error-evento" tabIndex={-1}>
                <Aviso tono="error" titulo="No se pudo registrar el evento">
                  {errorServidor.mensaje}
                </Aviso>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-linea pt-5">
              <Boton type="submit" variante="accion" cargando={enviando}>
                Revisar y confirmar
              </Boton>
              <p className="t-apoyo max-w-[45ch]">
                Verás un resumen antes de registrarlo de forma definitiva.
              </p>
            </div>
          </form>
        </>
      )}

      {resultadoEvento && ficha && (
        <div className="hoja flex max-w-[46rem] flex-col gap-6 p-6 sm:p-8" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
            <div className="flex flex-col gap-1">
              <p className="rotulo">Evento registrado en la guía</p>
              <p className="guia t-titulo text-marina">{ficha.guia}</p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <p className="rotulo">Estado actual</p>
              <EstadoBadge estado={ficha.estado.estado} tamano="lg" />
            </div>
          </div>

          {sondeando && (
            <Aviso tono="info">Registrado. El sistema está procesando el movimiento.</Aviso>
          )}
          {!sondeando && sondeoAgotado && (
            <Aviso tono="atencion">Sigue en proceso; consulta la guía en unos segundos.</Aviso>
          )}
          {!sondeando && !sondeoAgotado && (
            <Aviso tono="exito">
              Confirmado: el envío quedó en estado {etiquetaEstado(ficha.estado.estado)}.
            </Aviso>
          )}

          <div className="border-t border-linea pt-6">
            <Boton variante="accion" onClick={registrarOtroEvento}>
              Registrar otro evento
            </Boton>
          </div>
        </div>
      )}

      {ficha && (
        <Dialogo
          abierto={mostrarConfirmacion}
          titulo="Confirmar registro del evento"
          onCerrar={() => setMostrarConfirmacion(false)}
          pie={
            <>
              <Boton
                type="button"
                variante="contorno"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </Boton>
              <Boton
                type="button"
                variante="accion"
                cargando={enviando}
                onClick={() => void confirmarYRegistrar()}
              >
                Confirmar y registrar
              </Boton>
            </>
          }
        >
          <dl className="flex flex-col border-b border-linea">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-linea py-2.5">
              <dt className="rotulo">Guía</dt>
              <dd className="guia text-marina">{ficha.guia}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-linea py-2.5">
              <dt className="rotulo">Tipo de evento</dt>
              <dd className="font-medium text-tinta">{etiquetaTipoEvento(formulario.tipo)}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-linea py-2.5">
              <dt className="rotulo">Punto</dt>
              <dd className="font-medium text-tinta">{formulario.punto}</dd>
            </div>
            {formulario.observaciones.trim() && (
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-linea py-2.5">
                <dt className="rotulo">Observaciones</dt>
                <dd className="max-w-[40ch] font-medium text-tinta">{formulario.observaciones}</dd>
              </div>
            )}
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-linea py-2.5">
              <dt className="rotulo">Fecha y hora</dt>
              <dd className="cifras font-medium text-tinta">
                {formatearFechaHora(deLocalDateTimeInputAIso(formulario.ocurridoEn))}
              </dd>
            </div>
          </dl>
          <p className="t-apoyo mt-4 max-w-[45ch]">
            Este evento no se podrá editar ni borrar una vez registrado.
          </p>
        </Dialogo>
      )}
    </div>
  );
}
