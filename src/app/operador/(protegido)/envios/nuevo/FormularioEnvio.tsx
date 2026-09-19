"use client";

// HU-01: registrar envío. Un solo formulario, sin recargar; ver docs/contrato-ui.md §9-10.
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { registrarEnvio } from "@/api/shipments";
import { consultarEstado } from "@/api/tracking";
import { mensajeDeCampo, type ErrorApi } from "@/api/errores";
import type {
  EnvioAdmitidoResponse,
  EstadoEnvioResponse,
  PersonaRequest,
  RegistrarEnvioRequest,
  TipoDocumento,
} from "@/api/tipos";
import { TIPOS_DOCUMENTO, validarDocumento } from "@/lib/documento";
import { etiquetaEstado } from "@/lib/estados";
import { sondear } from "@/lib/polling";
import { Boton } from "@/components/ui/Boton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Aviso } from "@/components/ui/Aviso";
import { CampoForm } from "@/components/CampoForm";
import { ComboboxCiudad } from "@/components/ComboboxCiudad";
import { CodigoBarras } from "@/components/CodigoBarras";
import { CopiarNumero } from "@/components/CopiarNumero";
import { EstadoBadge } from "@/components/EstadoBadge";

interface PersonaFormulario {
  nombreCompleto: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  ciudadId: number | null;
}

const PERSONA_VACIA: PersonaFormulario = {
  nombreCompleto: "",
  tipoDocumento: "CC",
  numeroDocumento: "",
  telefono: "",
  direccion: "",
  ciudadId: null,
};

function validarPersona(
  prefijo: "remitente" | "destinatario",
  persona: PersonaFormulario,
): Record<string, string> {
  const errores: Record<string, string> = {};
  if (!persona.nombreCompleto.trim()) {
    errores[`${prefijo}.nombreCompleto`] = "Escribe el nombre completo.";
  }
  const errorDocumento = validarDocumento(persona.tipoDocumento, persona.numeroDocumento);
  if (errorDocumento) {
    errores[`${prefijo}.numeroDocumento`] = errorDocumento;
  }
  if (!persona.telefono.trim()) {
    errores[`${prefijo}.telefono`] = "Escribe un teléfono de contacto.";
  }
  if (!persona.direccion.trim()) {
    errores[`${prefijo}.direccion`] = "Escribe la dirección.";
  }
  if (persona.ciudadId == null) {
    errores[`${prefijo}.ciudadId`] = "Selecciona una ciudad.";
  }
  return errores;
}

function aPersonaRequest(persona: PersonaFormulario): PersonaRequest {
  return {
    nombreCompleto: persona.nombreCompleto.trim(),
    tipoDocumento: persona.tipoDocumento,
    numeroDocumento: persona.numeroDocumento.trim(),
    telefono: persona.telefono.trim(),
    direccion: persona.direccion.trim(),
    // Ya validado antes de construir el payload: nunca es null en este punto.
    ciudadId: persona.ciudadId as number,
  };
}

function SeccionPersona({
  titulo,
  prefijo,
  datos,
  onCambiar,
  errorDeCampo,
}: {
  titulo: string;
  prefijo: "remitente" | "destinatario";
  datos: PersonaFormulario;
  onCambiar: (cambio: Partial<PersonaFormulario>) => void;
  errorDeCampo: (campo: string) => string | undefined;
}) {
  const ayudaDocumento = TIPOS_DOCUMENTO.find((tipo) => tipo.valor === datos.tipoDocumento)?.ayuda;

  return (
    <section className="hoja hoja-copia flex flex-col gap-5 p-6 sm:p-8">
      <div className="border-b border-linea pb-3">
        <h2 className="t-seccion text-marina">{titulo}</h2>
      </div>

      <CampoForm
        id={`${prefijo}-nombreCompleto`}
        etiqueta="Nombre completo"
        obligatorio
        error={errorDeCampo(`${prefijo}.nombreCompleto`)}
      >
        {(campo) => (
          <Input
            {...campo}
            value={datos.nombreCompleto}
            onChange={(evento) => onCambiar({ nombreCompleto: evento.target.value })}
            autoComplete="name"
          />
        )}
      </CampoForm>

      {/* items-end alinea los dos controles aunque solo uno lleve línea de ayuda. */}
      <div className="grid grid-cols-2 items-end gap-4">
        <CampoForm
          id={`${prefijo}-tipoDocumento`}
          etiqueta="Tipo de documento"
          obligatorio
          error={errorDeCampo(`${prefijo}.tipoDocumento`)}
        >
          {(campo) => (
            <Select
              {...campo}
              value={datos.tipoDocumento}
              onChange={(evento) =>
                onCambiar({ tipoDocumento: evento.target.value as TipoDocumento })
              }
            >
              {TIPOS_DOCUMENTO.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.etiqueta}
                </option>
              ))}
            </Select>
          )}
        </CampoForm>

        <CampoForm
          id={`${prefijo}-numeroDocumento`}
          etiqueta="Número de documento"
          obligatorio
          ayuda={ayudaDocumento}
          error={errorDeCampo(`${prefijo}.numeroDocumento`)}
        >
          {(campo) => (
            <Input
              {...campo}
              value={datos.numeroDocumento}
              onChange={(evento) => onCambiar({ numeroDocumento: evento.target.value })}
            />
          )}
        </CampoForm>
      </div>

      <CampoForm
        id={`${prefijo}-telefono`}
        etiqueta="Teléfono"
        obligatorio
        error={errorDeCampo(`${prefijo}.telefono`)}
      >
        {(campo) => (
          <Input
            {...campo}
            type="tel"
            value={datos.telefono}
            onChange={(evento) => onCambiar({ telefono: evento.target.value })}
            autoComplete="tel"
          />
        )}
      </CampoForm>

      <CampoForm
        id={`${prefijo}-direccion`}
        etiqueta="Dirección"
        obligatorio
        error={errorDeCampo(`${prefijo}.direccion`)}
      >
        {(campo) => (
          <Input
            {...campo}
            value={datos.direccion}
            onChange={(evento) => onCambiar({ direccion: evento.target.value })}
            autoComplete="street-address"
          />
        )}
      </CampoForm>

      <ComboboxCiudad
        id={`${prefijo}-ciudadId`}
        etiqueta="Ciudad"
        obligatorio
        valor={datos.ciudadId}
        onChange={(ciudad) => onCambiar({ ciudadId: ciudad ? ciudad.id : null })}
        error={errorDeCampo(`${prefijo}.ciudadId`)}
      />
    </section>
  );
}

export function FormularioEnvio() {
  const [remitente, setRemitente] = useState<PersonaFormulario>(PERSONA_VACIA);
  const [destinatario, setDestinatario] = useState<PersonaFormulario>(PERSONA_VACIA);
  const [descripcion, setDescripcion] = useState("");

  const [erroresCliente, setErroresCliente] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<ErrorApi | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [resultado, setResultado] = useState<EnvioAdmitidoResponse | null>(null);
  const [estadoConfirmado, setEstadoConfirmado] = useState<EstadoEnvioResponse | null>(null);
  const [sondeando, setSondeando] = useState(false);
  const [sondeoAgotado, setSondeoAgotado] = useState(false);

  function errorDeCampo(campo: string): string | undefined {
    return erroresCliente[campo] ?? mensajeDeCampo(errorServidor, campo);
  }

  // Mueve el foco al primer campo con error (cliente o servidor) tras un envío fallido.
  useEffect(() => {
    if (errorServidor?.camposFaltantes) {
      const primerCampo = Object.keys(errorServidor.camposFaltantes)[0];
      if (primerCampo) {
        document.getElementById(primerCampo.replace(".", "-"))?.focus();
        return;
      }
    }
    if (errorServidor) {
      document.getElementById("resumen-error-envio")?.focus();
    }
  }, [errorServidor]);

  function limpiarFormulario() {
    setRemitente(PERSONA_VACIA);
    setDestinatario(PERSONA_VACIA);
    setDescripcion("");
    setErroresCliente({});
    setErrorServidor(null);
    setResultado(null);
    setEstadoConfirmado(null);
    setSondeoAgotado(false);
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const errores: Record<string, string> = {
      ...validarPersona("remitente", remitente),
      ...validarPersona("destinatario", destinatario),
      ...(descripcion.trim() ? {} : { descripcion: "Describe el contenido del paquete." }),
    };
    setErroresCliente(errores);
    setErrorServidor(null);

    const primerCampoConError = Object.keys(errores)[0];
    if (primerCampoConError) {
      document.getElementById(primerCampoConError.replace(".", "-"))?.focus();
      return;
    }

    setEnviando(true);
    const payload: RegistrarEnvioRequest = {
      remitente: aPersonaRequest(remitente),
      destinatario: aPersonaRequest(destinatario),
      descripcion: descripcion.trim(),
    };

    let respuesta: EnvioAdmitidoResponse;
    try {
      respuesta = await registrarEnvio(payload);
    } catch (err) {
      setErrorServidor(err as ErrorApi);
      setEnviando(false);
      return;
    }

    // El número de guía debe verse de inmediato (< 3 s), sin esperar al sondeo.
    setResultado(respuesta);
    setEnviando(false);
    setSondeando(true);
    try {
      const { valor, confirmado } = await sondear(
        () => consultarEstado(respuesta.trackingNumber),
        (estado) => estado.trackingNumber === respuesta.trackingNumber,
      );
      setEstadoConfirmado(valor);
      setSondeoAgotado(!confirmado);
    } catch {
      setSondeoAgotado(true);
    } finally {
      setSondeando(false);
    }
  }

  if (resultado) {
    return (
      <div className="hoja flex flex-col gap-6 p-6 sm:p-8" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
          <div className="flex flex-col gap-2">
            <p className="rotulo">Envío registrado · número de guía</p>
            <p className="guia text-2xl font-semibold text-marina">{resultado.trackingNumber}</p>
            <div className="mt-2">
              <EstadoBadge estado="REGISTERED" />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <CodigoBarras valor={resultado.trackingNumber} className="h-12 text-marina" />
            <p className="rotulo mt-2 text-center">{resultado.trackingNumber}</p>
          </div>
        </div>

        <div className="perforado" aria-hidden="true" />

        <CopiarNumero valor={resultado.trackingNumber} />

        {sondeando && (
          <Aviso tono="info">Registrado. El sistema está procesando el movimiento.</Aviso>
        )}
        {!sondeando && sondeoAgotado && (
          <Aviso tono="atencion">Sigue en proceso; consulta la guía en unos segundos.</Aviso>
        )}
        {!sondeando && !sondeoAgotado && estadoConfirmado && (
          <Aviso tono="exito">
            Confirmado: el envío quedó registrado con estado{" "}
            {etiquetaEstado(estadoConfirmado.estado)}.
          </Aviso>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-linea pt-6">
          <Boton variante="accion" onClick={limpiarFormulario}>
            Registrar otro envío
          </Boton>
          <Link
            href={`/rastreo/${resultado.trackingNumber}`}
            className="text-sm font-semibold text-marina underline decoration-linea-fuerte underline-offset-4 hover:decoration-marina"
          >
            Rastrear este envío
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="flex flex-col gap-6">
      {errorServidor && (
        <div id="resumen-error-envio" tabIndex={-1}>
          <Aviso tono="error" titulo="No se pudo registrar el envío">
            {errorServidor.mensaje}
          </Aviso>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SeccionPersona
          titulo="Remitente"
          prefijo="remitente"
          datos={remitente}
          onCambiar={(cambio) => setRemitente((anterior) => ({ ...anterior, ...cambio }))}
          errorDeCampo={errorDeCampo}
        />
        <SeccionPersona
          titulo="Destinatario"
          prefijo="destinatario"
          datos={destinatario}
          onCambiar={(cambio) => setDestinatario((anterior) => ({ ...anterior, ...cambio }))}
          errorDeCampo={errorDeCampo}
        />
      </div>

      <section className="hoja hoja-copia flex flex-col gap-5 p-6 sm:p-8">
        <div className="border-b border-linea pb-3">
          <h2 className="t-seccion text-marina">Paquete</h2>
        </div>
        <CampoForm
          id="descripcion"
          etiqueta="Descripción del contenido"
          obligatorio
          error={errorDeCampo("descripcion")}
        >
          {(campo) => (
            <Textarea
              {...campo}
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              rows={3}
            />
          )}
        </CampoForm>
      </section>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-linea pt-6">
        <Boton type="submit" variante="accion" cargando={enviando}>
          Registrar envío
        </Boton>
        <p className="t-apoyo max-w-[45ch]">
          El número de guía se genera al registrar y aparece en esta misma pantalla.
        </p>
      </div>
    </form>
  );
}
