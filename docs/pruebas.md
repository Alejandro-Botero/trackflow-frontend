# Pruebas y estado de verificación

Detalle que no cabe en el README. Fecha de la verificación contra el servicio desplegado:
2026-09-18.

## Cómo probar

### Automático

```bash
npm test        # 56 pruebas: documento (incl. NIT/DIAN), guía, mapeo de errores
npm run lint
npm run typecheck
npm run build
```

### A mano, con el servidor en `http://localhost:3000`

Lo que sigue se puede probar hoy, apuntando a Render (la configuración por defecto). Cubre los
tres criterios de aceptación de HU-03.

| Paso | Qué hacer | Qué debe pasar |
|---|---|---|
| 1 | Abrir `/` y escribir `123` → Consultar | Error junto al campo con el formato esperado; no navega |
| 2 | Escribir `tf000000000002` (minúsculas) → Consultar | Navega a `/rastreo/TF000000000002`: se normaliza |
| 3 | Ver `/rastreo/TF000000000002` | Estado *En tránsito*, ciudad de destino, último punto y fecha, barra en el paso 3 de 5, historial con 2 movimientos |
| 4 | Ver `/rastreo/TF000000000001` | Estado *Registrado* y el aviso "Aún no registra movimientos" |
| 5 | Ver `/rastreo/TF000000000003` | Estado *Entregado*, barra completa, historial de 3 movimientos |
| 6 | Ver `/rastreo/TF000000000099` | "No encontramos ningún envío con ese número…", sin datos de otro envío |
| 7 | En cualquier resultado, revisar la pantalla | No aparece nombre, documento, teléfono ni dirección de nadie |
| 8 | Recargar `/rastreo/TF000000000002` | La URL es compartible: el resultado se vuelve a cargar |
| 9 | Navegar solo con el teclado (Tab, Enter) | Foco siempre visible; se puede consultar sin ratón |
| 10 | Estrechar la ventana a ~390 px | Una columna, sin desplazamiento horizontal |
| 11 | Abrir `/operador/envios/nuevo` sin sesión | Redirige a `/operador/ingresar?destino=…` |
| 12 | Intentar entrar con cualquier usuario y clave | Aviso con el 503 del backend: ese entorno no tiene credenciales |

Para ver los estados de red: en DevTools → Network → *Offline*, recargar un rastreo. Debe
aparecer el mensaje de conexión y el botón "Reintentar".

### Probar el área de operadores (HU-01 y HU-02)

No hay backend con el código nuevo, y contra el desplegado no se escribe. Para poder recorrer
las dos historias hay un backend de mentira en `mock/servidor.mjs` que imita el contrato,
incluidas las respuestas `202` con retraso.

```bash
npm run mock       # escucha en 8099; los datos viven en memoria
```

Con `NEXT_PUBLIC_API_URL=http://localhost:8099` en `.env.local` y `npm run dev`:

| Paso | Qué hacer | Qué debe pasar |
|---|---|---|
| 1 | `/operador/envios/nuevo` sin sesión | Redirige a `/operador/ingresar?destino=…` |
| 2 | Entrar con `operador` / `operador123` | Barra "Sesión iniciada como operador · Roles: OPERADOR" |
| 3 | Enviar el formulario vacío | Un error por campo, junto al campo, y el foco salta al primero |
| 4 | Escribir `mede` en Ciudad | Lista con MEDELLÍN; se elige con flechas y Enter |
| 5 | Completar y registrar | La guía aparece de inmediato (NFR: menos de 3 s) con "procesando", y al confirmarse cambia a "Confirmado: el envío quedó registrado" |
| 6 | `/operador/eventos/nuevo`, buscar `TF000000000099` | "No encontramos ningún envío con ese número" |
| 7 | Buscar la guía recién creada y registrar un evento | Diálogo de confirmación, luego el estado nuevo y el historial actualizado |
| 8 | Poner una fecha futura en el evento | Lo rechaza antes de enviar |
| 9 | Ir a `/operador/admin` siendo `operador` | "Sin permiso: tu usuario no tiene el rol ADMIN" |
| 10 | Salir y entrar con `admin` / `admin123` | Aparece "Administración" en el menú y la reconstrucción devuelve los conteos |
| 11 | Abrir `/rastreo/<guía creada>` | El envío y su movimiento se ven en la vista pública |

El mock guarda todo en memoria: al pararlo desaparece. Para volver al servicio desplegado, deja
`NEXT_PUBLIC_API_URL=https://trackflow-5enb.onrender.com` y reinicia `npm run dev`.

### Lo que todavía no se puede probar

HU-01 y HU-02 de extremo a extremo. Hacen falta dos cosas que hoy no existen:

1. Un backend con el código nuevo (el que expone `/api/ciudades`, `tipoDocumento`, `ciudadId` y
   `ocurridoEn`). El que corre en `localhost:8080` es el build viejo: `/api/ciudades` responde
   `404` y su base está vacía.
2. Credenciales de operador en ese backend (`TRACKFLOW_OPERADOR_CLAVE`,
   `TRACKFLOW_ADMIN_CLAVE`), si además se quiere probar el ingreso y el rol ADMIN. Sin ellas el
   login responde `503` y la escritura queda abierta.

Con esas dos cosas, el flujo completo es: `NEXT_PUBLIC_API_URL=http://localhost:8080` en
`.env.local`, reiniciar `npm run dev`, entrar en `/operador/ingresar`, registrar un envío,
copiar la guía, registrarle un evento en `/operador/eventos/nuevo` y consultarla en `/rastreo/…`.

## Estado de la verificación

`build`, `lint`, `typecheck` y los 56 tests pasan.

Probado contra el servicio desplegado (`/swagger-ui/index.html` documenta los siete endpoints):

| Prueba | Resultado |
|---|---|
| `GET /api/tracking` de las tres guías semilla | 200, ~200 ms (el NFR pide menos de 2 s) |
| Guía inexistente y guía en minúsculas | 404 en ambos: el número es sensible a mayúsculas |
| `GET /api/shipments/{tn}/events` | 0 eventos en `…01`, 3 en `…03`, ordenados |
| `GET /api/ciudades` | tope de 10 resultados; `400` si falta `q` |
| `POST /api/auth/login` | **503 "No hay credenciales configuradas en este entorno"** |
| `POST /api/shipments` sin token | `400` de validación: entra al controlador, no lo frena la seguridad |
| `POST /api/shipments/{tn}/events` sin token | igual, `400` de validación |
| `POST /api/shipments` con un Bearer inválido | `401`: el token sí se valida cuando se envía |
| `GET /api/admin/reconstruir-proyecciones` | `405` del dispatcher, no `401`: la ruta de admin no exige rol |
| `/actuator/env`, `configprops`, `beans`, `mappings`… | `404`; solo `health` está expuesto |

Dos cosas que conviene arreglar en el backend, no en el frontend:

1. **El entorno desplegado no tiene credenciales**, así que no se puede obtener token y el área
   de operadores no se puede ejercitar ahí.
2. **Sin credenciales, la escritura queda abierta.** No es un fallo del código: en
   `SecurityConfig` las reglas `hasRole(...)` viven dentro de `if (proteccionActiva())`, y esa
   condición es falsa mientras `TRACKFLOW_OPERADOR_CLAVE` y `TRACKFLOW_ADMIN_CLAVE` estén
   vacías. En `render.yaml` están declaradas con `sync: false`, o sea que el valor hay que
   escribirlo en el dashboard de Render; nadie lo hizo. Definirlas y redesplegar cierra tanto
   la escritura como `/api/admin/**`.

Pendiente: el flujo de escritura (HU-01 y HU-02) no se ha probado de extremo a extremo. Contra
el desplegado no se escribe porque va a la base real y no hay endpoint para borrar; en local
hace falta el backend con el código que expone `/api/ciudades`, `tipoDocumento` y `ocurridoEn`,
que no está en el repositorio.
