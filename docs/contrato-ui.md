# Contrato del frontend

Fuente de verdad compartida: tipos de la API, firmas exportadas y textos. Verificado contra el
OpenAPI del servicio desplegado (`/v3/api-docs`) el 2026-09-18. Ningún archivo puede desviarse de
las firmas de este documento sin actualizarlo primero.

## 1. API HTTP

Base: `process.env.NEXT_PUBLIC_API_URL ?? "https://trackflow-5enb.onrender.com"`.
Documentación viva: <https://trackflow-5enb.onrender.com/swagger-ui/index.html>.
Todas las escrituras responden **202 Accepted**.

Comprobado el 2026-09-18 contra el desplegado: el número de guía es sensible a mayúsculas
(`tf000000000002` da 404), `GET /api/ciudades` devuelve como mucho 10 resultados, y
`POST /api/auth/login` responde 503 porque ese entorno no tiene credenciales configuradas —
mientras sea así, las escrituras no exigen token.

| Método y ruta | Acceso | Cuerpo | Respuesta |
|---|---|---|---|
| `POST /api/auth/login` | público | `LoginRequest` | `TokenResponse` · 401 credenciales · 503 sin credenciales configuradas |
| `GET /api/ciudades?q=` | público | — | `CiudadResponse[]` (máx. 10) · 400 si falta `q` |
| `POST /api/shipments` | OPERADOR | `RegistrarEnvioRequest` | 202 `EnvioAdmitidoResponse` |
| `POST /api/shipments/{tn}/events` | OPERADOR | `RegistrarEventoRequest` | 202 `EventoAdmitidoResponse` · 404 guía inexistente · 400 fecha futura |
| `GET /api/tracking/{tn}` | público | — | `EstadoEnvioResponse` · 404 |
| `GET /api/shipments/{tn}/events` | público | — | `EventoLogisticoResponse[]` ordenados por `ocurridoEn` |
| `POST /api/admin/reconstruir-proyecciones` | ADMIN | sin cuerpo | `Record<string, number>` |

Errores: `ProblemDetail` de Spring (`{ type, title, status, detail, instance }`); los 400 de
validación añaden `camposFaltantes: Record<string, string>` con claves anidadas
(`remitente.nombreCompleto`, `destinatario.ciudadId`).

## 2. `src/api/tipos.ts`

```ts
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
  solicitadoEn: string;        // ISO-8601
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
  etiqueta: string; // tal cual la manda el backend: "MEDELLÍN - ANTIOQUIA"
}

export interface LoginRequest {
  usuario: string;
  clave: string;
}

export interface TokenResponse {
  token: string;
  tipo: string;  // "Bearer"
  roles: string; // separado por espacios: "OPERADOR" o "ADMIN OPERADOR"
  expiraEnSegundos: number;
}
```

## 3. `src/api/errores.ts`

```ts
export type ClaseError =
  | "red"        // sin respuesta del servidor
  | "timeout"
  | "validacion" // 400
  | "autenticacion" // 401
  | "autorizacion"  // 403
  | "noEncontrado"  // 404
  | "noDisponible"  // 503
  | "servidor"      // 5xx restantes
  | "desconocido";

export interface ErrorApi {
  clase: ClaseError;
  mensaje: string;                          // listo para mostrar (usa `detail` si viene)
  estado?: number;
  camposFaltantes?: Record<string, string>; // claves anidadas tal cual las manda el backend
}

export function normalizarError(error: unknown): ErrorApi;
/** Mensaje de un campo del formulario, p. ej. campoConError(err, "remitente.ciudadId"). */
export function mensajeDeCampo(error: ErrorApi | null, campo: string): string | undefined;
```

Mensajes por clase cuando el backend no manda `detail`:

- `red`: "No pudimos contactar el servicio. Revisa tu conexión y vuelve a intentarlo."
- `timeout`: "El servicio tardó demasiado en responder. Vuelve a intentarlo."
- `autenticacion`: "Usuario o clave incorrectos."
- `autorizacion`: "Tu sesión no tiene permiso para esta operación."
- `noEncontrado`: "No encontramos ningún envío con ese número."
- `noDisponible`: "No hay credenciales configuradas en este entorno."
- `servidor` / `desconocido`: "El servicio respondió con un error. Vuelve a intentarlo."

## 4. `src/api/client.ts`

```ts
import type { AxiosInstance } from "axios";

export const BASE_URL: string;
export const TIEMPO_RASTREO = 25_000;  // arranque en frío de Render
export const TIEMPO_CIUDADES = 6_000;
export const TIEMPO_NORMAL = 10_000;

export const http: AxiosInstance;
/** Token que el interceptor pone en `Authorization: Bearer`. */
export function fijarToken(token: string | null): void;
```

## 5. Módulos de API

```ts
// src/api/tracking.ts
export function consultarEstado(guia: string): Promise<EstadoEnvioResponse>;
export function consultarHistorial(guia: string): Promise<EventoLogisticoResponse[]>;

// src/api/shipments.ts
export function registrarEnvio(datos: RegistrarEnvioRequest): Promise<EnvioAdmitidoResponse>;
export function registrarEvento(guia: string, datos: RegistrarEventoRequest): Promise<EventoAdmitidoResponse>;

// src/api/ciudades.ts
export function buscarCiudades(q: string, signal?: AbortSignal): Promise<CiudadResponse[]>;

// src/api/auth.ts
export function iniciarSesion(datos: LoginRequest): Promise<TokenResponse>;

// src/api/admin.ts
export function reconstruirProyecciones(): Promise<Record<string, number>>;
```

Todos lanzan `ErrorApi` (ya normalizado) en caso de fallo.

## 6. `src/lib/`

```ts
// guia.ts
export const PATRON_GUIA: RegExp;                 // /^TF\d{12}$/
export function normalizarGuia(valor: string): string;   // trim + toUpperCase
export function esGuiaValida(valor: string): boolean;
export function errorDeGuia(valor: string): string | null;
//   "" -> "Escribe un número de guía."
//   formato -> "El número de guía tiene el formato TF seguido de 12 dígitos, por ejemplo TF000000000001."

// documento.ts
export const TIPOS_DOCUMENTO: ReadonlyArray<{ valor: TipoDocumento; etiqueta: string; ayuda: string }>;
//   CC "Cédula de ciudadanía" "6 a 10 dígitos"
//   CE "Cédula de extranjería" "6 a 10 dígitos"
//   TI "Tarjeta de identidad" "10 u 11 dígitos"
//   PP "Pasaporte" "5 a 15 caracteres, letras y números"
//   NIT "NIT" "9 o 10 dígitos, con dígito de verificación opcional (890903938-8)"
export function validarDocumento(tipo: TipoDocumento, numero: string): string | null; // null = válido
export function digitoVerificacionNit(base: string): number; // ponderaciones DIAN

// estados.ts
export const ESTADOS: ReadonlyArray<{ valor: EstadoEnvio; etiqueta: string; orden: number }>;
//   REGISTERED "Registrado" 0 · AT_DISTRIBUTION_CENTER "En centro de distribución" 1
//   IN_TRANSIT "En tránsito" 2 · OUT_FOR_DELIVERY "En reparto" 3 · DELIVERED "Entregado" 4
export function etiquetaEstado(estado: EstadoEnvio): string;
export function ordenEstado(estado: EstadoEnvio): number;
export const TIPOS_EVENTO: ReadonlyArray<{ valor: TipoEvento; etiqueta: string; resultante: EstadoEnvio }>;
//   RECEIVED_AT_CENTER "Recibido en centro" · DISPATCHED "Despachado"
//   ARRIVED_AT_DESTINATION_CENTER "Llegó al centro de destino" · OUT_FOR_DELIVERY "Salió a reparto"
//   DELIVERED "Entregado"
export function etiquetaTipoEvento(tipo: TipoEvento): string;

// polling.ts
export interface OpcionesSondeo {
  intervaloMs?: number; // 300 por defecto
  limiteMs?: number;    // 5000 por defecto
  signal?: AbortSignal;
}
/** Repite `consulta` hasta que `condicion` se cumpla o venza el límite. Resuelve con el último
 *  valor obtenido y si se agotó el tiempo (`confirmado: false`). Nunca lanza por 404. */
export function sondear<T>(
  consulta: () => Promise<T>,
  condicion: (valor: T) => boolean,
  opciones?: OpcionesSondeo,
): Promise<{ valor: T | null; confirmado: boolean }>;

// fechas.ts
export function formatearFechaHora(iso: string): string; // "12 ago 2026, 14:30"
export function formatearFecha(iso: string): string;     // "12 ago 2026"
export function aLocalDateTimeInput(fecha: Date): string; // valor de <input type="datetime-local">
export function deLocalDateTimeInputAIso(valor: string): string;

// cn.ts
export function cn(...clases: Array<string | false | null | undefined>): string; // clsx + tailwind-merge
```

## 7. Componentes compartidos (`src/components/`)

```tsx
// EstadoBadge.tsx  — texto + ícono + color
export function EstadoBadge(props: { estado: EstadoEnvio; tamano?: "sm" | "lg" }): JSX.Element;

// ProgresoEnvio.tsx — barra de 5 pasos (Registrado → … → Entregado)
export function ProgresoEnvio(props: { estado: EstadoEnvio }): JSX.Element;

// Timeline.tsx — historial vertical; marca "reporte rezagado" si registradoEn - ocurridoEn > 1 h
export function Timeline(props: { eventos: EventoLogisticoResponse[] }): JSX.Element;

// CopiarNumero.tsx — botón "Copiar número" con confirmación accesible
export function CopiarNumero(props: { valor: string }): JSX.Element;

// CampoForm.tsx — label visible + ayuda + error (aria-describedby, aria-invalid)
export function CampoForm(props: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  obligatorio?: boolean;
  children: (props: { id: string; "aria-describedby": string | undefined; "aria-invalid": boolean }) => React.ReactNode;
}): JSX.Element;

// ComboboxCiudad.tsx — "use client"; autocompletado contra GET /api/ciudades (debounce 250 ms)
export function ComboboxCiudad(props: {
  id: string;
  valor: number | null;
  onChange: (ciudad: CiudadResponse | null) => void;
  error?: string;
  etiqueta: string;
}): JSX.Element;
```

Primitivas en `src/components/ui/`: `Boton`, `Input`, `Textarea`, `Select`, `Dialogo`, `Aviso`,
`Cargando`. Sin dependencias externas de UI.

```tsx
// ui/Boton.tsx
export function Boton(props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "accion" | "marina" | "contorno" | "texto"; // "accion" = naranja, uno por pantalla
  cargando?: boolean;
}): JSX.Element;

// ui/Aviso.tsx
export function Aviso(props: {
  tono: "error" | "info" | "exito" | "atencion";
  titulo?: string;
  children: React.ReactNode;
  accion?: React.ReactNode; // p. ej. botón "Reintentar"
}): JSX.Element; // role="alert" cuando tono === "error"

// ui/Dialogo.tsx — "use client", <dialog> nativo, foco atrapado, Esc cierra
export function Dialogo(props: {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
  pie: React.ReactNode;
}): JSX.Element;
```

## 8. Sesión (`src/auth/`)

```tsx
// AuthContext.tsx — "use client"
export interface Sesion {
  token: string;
  usuario: string;
  roles: string[];      // ["OPERADOR"] | ["OPERADOR","ADMIN"]
  expiraEn: number;     // epoch ms, del claim `exp`
}
export function ProveedorAuth(props: { children: React.ReactNode }): JSX.Element;
export function useSesion(): {
  sesion: Sesion | null;
  cargando: boolean;              // true hasta leer sessionStorage en el cliente
  entrar: (datos: LoginRequest) => Promise<void>;
  salir: () => void;
  esAdmin: boolean;
};
```

Token en `sessionStorage` con la clave `trackflow.sesion`. El claim `roles` viene como cadena
**separada por espacios** dentro del JWT (`"ADMIN OPERADOR"`, que es lo que espera
`JwtGrantedAuthoritiesConverter` en el backend); se decodifica el *payload* con `atob` (sin
verificar la firma: la verificación es del backend). Si `exp` ya pasó, la sesión se descarta y
se vuelve al login.

## 9. Rutas

```
src/app/
  layout.tsx                     # fuentes y tokens (ya escrito, no tocar)
  (publico)/layout.tsx           # cabecera pública + pie
  (publico)/page.tsx             # buscador de guía
  (publico)/rastreo/[guia]/page.tsx
  operador/page.tsx                  # portada del área interna: elige destino y va al ingreso
  operador/ingresar/page.tsx
  operador/(protegido)/layout.tsx    # guarda de sesión + barra de operador
  operador/(protegido)/envios/nuevo/page.tsx
  operador/(protegido)/eventos/nuevo/page.tsx
  operador/(protegido)/admin/page.tsx
```

`/operador/eventos/nuevo` acepta `?guia=TF…` para precargar la guía.

## 10. Textos fijos

- Vacío en rastreo: "Aún no registra movimientos."
- 404 en rastreo: "No encontramos ningún envío con ese número. Verifica el número e inténtalo de nuevo."
- Aviso de asincronía tras un 202: "Registrado. El sistema está procesando el movimiento."
- Aviso permanente en registrar evento: "Los eventos no se pueden borrar ni editar."
- Pie público: "TrackFlow no muestra datos personales del remitente ni del destinatario."
