"use client";

// HU-02: registrar evento logístico. Ver docs/contrato-ui.md §9-10.
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { registrarEvento } from "@/api/shipments";
import { consultarEstado, consultarHistorial } from "@/api/tracking";
import { mensajeDeCampo, type ErrorApi } from "@/api/errores";
import type {
  EstadoEnvioResponse,
  EventoAdmitidoResponse,
  EventoLogisticoResponse,
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
import { Timeline } from "@/components/Timeline";

interface FichaEnvio {
  guia: string;
  estado: EstadoEnvioResponse;
  historial: EventoLogisticoResponse[];
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
      const [estado, historial] = await Promise.all([
        consultarEstado(guiaNormalizada),
        consultarHistorial(guiaNormalizada),
      ]);
      setFicha({ guia: guiaNormalizada, estado, historial });
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
    const longitudPrevia = ficha.historial.length;
    try {
      const { valor, confirmado } = await sondear(
        async () => {
          const [estado, historial] = await Promise.all([
            consultarEstado(ficha.guia),
            consultarHistorial(ficha.guia),
          ]);
          return { estado, historial };
        },
        (datos) => datos.historial.length > longitudPrevia,
      );
      if (valor) {
        setFicha({ guia: ficha.guia, estado: valor.estado, historial: valor.historial });
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
    <div className="flex flex-col gap-6">
      <Aviso tono="atencion">Los eventos no se pueden borrar ni editar.</Aviso>

      <form onSubmit={buscar} noValidate className="marco marco-hoja p-6 flex flex-col gap-4">
        <h2 className="t-seccion">Buscar envío</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-48">
            <CampoForm id="guia" etiqueta="Número de guía" obligatorio error={errorGuia}>
              {(campo) => (
                <Input
                  {...campo}
                  value={guia}
                  onChange={(evento) => setGuia(evento.target.value)}
                  placeholder="TF000000000001"
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
          <div className="marco marco-hoja p-6 flex flex-col gap-3" aria-live="polite">
            <h2 className="t-seccion">Envío encontrado</h2>
            <p>
              Guía: <span className="guia">{ficha.guia}</span>
            </p>
            <div className="flex items-center gap-3">
              <span className="t-apoyo">Estado actual:</span>
              <EstadoBadge estado={ficha.estado.estado} />
            </div>
            <p className="t-apoyo">
              {ficha.estado.ultimoPunto && ficha.estado.ultimoMovimientoAt
                ? `Último movimiento: ${ficha.estado.ultimoPunto}, ${formatearFechaHora(
                    ficha.estado.ultimoMovimientoAt,
                  )}`
                : "Aún no registra movimientos."}
            </p>
          </div>

          <form
            onSubmit={pedirConfirmacion}
            noValidate
            className="marco marco-hoja p-6 flex flex-col gap-4"
          >
            <h2 className="t-seccion">Nuevo evento</h2>

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

            <div>
              <Boton type="submit" variante="marina" cargando={enviando}>
                Revisar y confirmar
              </Boton>
            </div>
          </form>
        </>
      )}

      {resultadoEvento && ficha && (
        <div className="marco marco-hoja p-6 flex flex-col gap-4" aria-live="polite">
          <h2 className="t-seccion">Evento registrado</h2>
          <div className="flex items-center gap-3">
            <span className="t-apoyo">Estado actual:</span>
            <EstadoBadge estado={ficha.estado.estado} />
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

          <div>
            <h3 className="t-dato mb-2">Historial</h3>
            <Timeline eventos={ficha.historial} />
          </div>

          <div>
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
          <dl className="flex flex-col gap-2">
            <div>
              <dt className="t-apoyo">Guía</dt>
              <dd className="guia">{ficha.guia}</dd>
            </div>
            <div>
              <dt className="t-apoyo">Tipo de evento</dt>
              <dd>{etiquetaTipoEvento(formulario.tipo)}</dd>
            </div>
            <div>
              <dt className="t-apoyo">Punto</dt>
              <dd>{formulario.punto}</dd>
            </div>
            {formulario.observaciones.trim() && (
              <div>
                <dt className="t-apoyo">Observaciones</dt>
                <dd>{formulario.observaciones}</dd>
              </div>
            )}
            <div>
              <dt className="t-apoyo">Fecha y hora</dt>
              <dd>{formatearFechaHora(deLocalDateTimeInputAIso(formulario.ocurridoEn))}</dd>
            </div>
          </dl>
          <p className="t-apoyo mt-3">
            Este evento no se podrá editar ni borrar una vez registrado.
          </p>
        </Dialogo>
      )}
    </div>
  );
}
