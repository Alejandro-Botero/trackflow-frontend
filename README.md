# TrackFlow — frontend

Interfaz web del Sistema de Tracking Logístico. Cubre las tres historias del Sprint 1:
registrar un envío (HU-01), registrar un evento logístico (HU-02) y consultar el estado de un
envío (HU-03).

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · axios.

## Arrancar

```bash
npm install
npm run dev        # http://localhost:3000
```

El backend se configura con `NEXT_PUBLIC_API_URL` en `.env.local` (ver `.env.example`). Por
defecto apunta al servicio desplegado en Render, que **escribe en la base real: contra él, solo
consultas**.

Otros comandos: `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`.

## Rutas

| Ruta | Quién | Qué |
|---|---|---|
| `/` | Público | Buscador de guía |
| `/rastreo/<guía>` | Público | Estado, etapas e historial del envío |
| `/operador/ingresar` | Público | Ingreso de operador |
| `/operador/envios/nuevo` | Operador | HU-01 |
| `/operador/eventos/nuevo` | Operador | HU-02 |
| `/operador/admin` | Admin | Reconstruir proyecciones |

## Probar el área de operadores

El backend con `/api/ciudades` y `tipoDocumento` todavía no está disponible, así que hay un
backend de mentira para poder recorrer HU-01 y HU-02:

```bash
npm run mock       # :8099, datos en memoria; usuarios operador/operador123 y admin/admin123
```

Con `NEXT_PUBLIC_API_URL=http://localhost:8099` en `.env.local`, reinicia `npm run dev`.
Esas claves son del mock y no sirven en ningún entorno real.

## Estructura

```
src/api/         cliente axios, normalización de errores, un módulo por recurso
src/auth/        sesión: JWT en sessionStorage, roles y expiración
src/components/  primitivas propias (ui/) y componentes del dominio
src/lib/         guía, documento (NIT con DV DIAN), estados, sondeo, fechas
src/app/         (publico)/ y operador/
```

`docs/contrato-ui.md` es la fuente de verdad del contrato de API y de las firmas.
`docs/pruebas.md` tiene el plan de pruebas y el estado de la verificación.
