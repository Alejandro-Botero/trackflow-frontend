# TrackFlow — frontend

Frontend del Sistema de Tracking Logístico (Sprint 1: HU-01 registrar envío, HU-02 registrar
evento logístico, HU-03 consultar estado). Next.js 16 App Router · React 19 · TypeScript ·
Tailwind CSS v4 · axios · lucide-react. Español en toda la interfaz.

## Comandos

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest (validadores y normalizadores)
```

`NEXT_PUBLIC_API_URL` define el backend (`.env.local`). Por defecto
`https://trackflow-5enb.onrender.com`. Para pruebas de escritura: `http://localhost:8080`.

**El servicio desplegado escribe en la base real. Contra él solo se hacen lecturas.**

## Dos áreas

| | Usuarios (público) | Operadores |
|---|---|---|
| Rutas | `/`, `/rastreo/[guia]` | `/operador/ingresar`, `/operador/envios/nuevo`, `/operador/eventos/nuevo`, `/operador/admin` |
| Sesión | No | Token JWT en `sessionStorage` |
| Datos personales | Nunca (solo ciudad de destino) | Sí |

El layout de `operador/(protegido)` lleva la guarda de sesión y de rol; `/operador/admin`
exige rol `ADMIN`.

## Contrato de API

Ver `docs/contrato-ui.md` — es la fuente de verdad de tipos, firmas y textos. Reglas que no se
negocian:

- Toda escritura responde **202 Accepted**: el dato todavía no existe. Después de un 202 hay que
  hacer *polling* antes de decir "listo".
- No hay PUT, PATCH ni DELETE. Los eventos no se pueden borrar ni editar.
- Guía: `TF` + 12 dígitos. Normalizar siempre con `trim().toUpperCase()`.
- Ciudad: siempre `ciudadId` (entero del autocompletado), nunca texto libre.
- En los errores 400 se muestra `detail` tal cual y `camposFaltantes` junto a cada campo.

## Sistema visual

Referencia: documento logístico impreso. Tokens en `src/app/globals.css` (no hay modo oscuro).

- Azul marino `--color-marina` para la estructura; naranja `--color-sello` para **un solo botón
  de acción por pantalla**; fondo `--color-papel`.
- Esquinas rectas (`rounded-none`), marcos de línea fina con marcas de registro (clase `.marco`),
  tarjetas sin relleno salvo `.marco-hoja`.
- Títulos en Barlow Condensed (`.t-display`, `.t-titulo`, `.t-seccion`, `.t-dato`), texto en
  Barlow, 16 px base. Números de guía con la clase `.guia`.
- Estados siempre con texto e ícono, nunca solo color.

## Accesibilidad (WCAG 2.1 AA)

Contraste ≥ 4.5:1, `label` visible asociado a cada campo, foco visible, navegación completa por
teclado, objetivos táctiles de 44 px, errores junto al campo con `aria-describedby` y
`aria-invalid`, encabezados jerárquicos, `aria-live` en resultados y avisos.

## Al tocar este código

- Componentes de servidor por defecto; `"use client"` solo donde hay estado o eventos.
- Nada de `any`. Los tipos del contrato viven en `src/api/tipos.ts`.
- Los textos de error de la UI salen de `src/api/errores.ts`, no se escriben sueltos en las páginas.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
