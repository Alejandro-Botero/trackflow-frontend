// Tipos compartidos del contrato de la API. Ver docs/contrato-ui.md secciones 1-2.

export type TipoDocumento = "CC" | "CE" | "TI" | "PP" | "NIT";

export type TipoEvento =
  | "RECEIVED_AT_CENTER"
  | "DISPATCHED"
  | "ARRIVED_AT_DESTINATION_CENTER"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export type EstadoEnvio =
  | "REGISTERED"
  | "AT_DISTRIBUTION_CENTER"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface PersonaRequest {
  nombreCompleto: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  ciudadId: number;
}

export interface RegistrarEnvioRequest {
  remitente: PersonaRequest;
  destinatario: PersonaRequest;
  descripcion: string;
}

export interface EnvioAdmitidoResponse {
  trackingNumber: string;
  eventId: string;
  destinatario: string;
  ciudadDestino: string;
  solicitadoEn: string; // ISO-8601
  estadoProcesamiento: string; // "ENCOLADO"
}

export interface RegistrarEventoRequest {
  tipo: TipoEvento;
  punto: string;
  observaciones?: string;
  ocurridoEn?: string; // ISO-8601; si se omite, el backend usa "ahora"
}

export interface EventoAdmitidoResponse {
  eventId: string;
  trackingNumber: string;
  tipo: string;
  punto: string;
  ocurridoEn: string;
  estadoProcesamiento: string;
}

export interface EstadoEnvioResponse {
  trackingNumber: string;
  estado: EstadoEnvio;
  ciudadDestinoId: number | null;
  ciudadDestino: string | null;
  registeredAt: string;
  tieneMovimientos: boolean;
  ultimoPunto: string | null;
  ultimoMovimientoAt: string | null;
}

export interface EventoLogisticoResponse {
  id: number;
  trackingNumber: string;
  tipo: TipoEvento;
  estadoResultante: EstadoEnvio;
  punto: string;
  observaciones: string | null;
  ocurridoEn: string;
  registradoEn: string;
}

export interface CiudadResponse {
  id: number;
  nombre: string;
  departamento: string;
  etiqueta: string; // "Medellín, Antioquia"
}

export interface LoginRequest {
  usuario: string;
  clave: string;
}

export interface TokenResponse {
  token: string;
  tipo: string; // "Bearer"
  roles: string; // "OPERADOR" o "OPERADOR,ADMIN"
  expiraEnSegundos: number;
}
