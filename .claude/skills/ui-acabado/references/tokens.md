# Tokens, escalas y contrastes medidos

Fuente de verdad: `src/app/globals.css`. Este archivo es la lectura rápida; si hay discrepancia,
gana el CSS.

## 1. Color

| Token | Valor | Rol |
|---|---|---|
| `--color-papel` | `#f2f2f3` | Fondo de página. Nunca superficie de contenido. |
| `--color-hoja` | `#fdfcfa` | Hoja de guía (`.hoja`), fondo de controles. |
| `--color-marina` | `#14305c` | Estructura: títulos, botón secundario, bordes fuertes, iconos. |
| `--color-marina-clara` | `#2f5b96` | Solo `hover` del botón marina. |
| `--color-sello` | `#f4711a` | Acento. Un uso de acción por pantalla + paso actual. Relleno, no texto. |
| `--color-sello-oscura` | `#c9560d` | `hover` del botón de acción; versión usable como texto grande. |
| `--color-tinta` | `#101418` | Texto principal. |
| `--color-tinta-suave` | `#4b5563` | Texto secundario (`.t-apoyo`), placeholders, deshabilitado. |
| `--color-linea` | `#ccc7ba` | Hairline estructural (hojas, separadores, `border-t`). |
| `--color-linea-fuerte` | `#9aa0a8` | Hairline de mayor presencia. |
| `--color-estado-registrado` | `#5b6270` | Estado REGISTERED. |
| `--color-estado-centro` | `#14305c` | Estado AT_DISTRIBUTION_CENTER. |
| `--color-estado-transito` | `#2f6fb5` | Estado IN_TRANSIT. |
| `--color-estado-reparto` | `#b45309` | Estado OUT_FOR_DELIVERY, avisos de atención. |
| `--color-estado-entregado` | `#1d6b45` | Estado DELIVERED, éxito. |
| `--color-error` | `#b3261e` | Texto y borde de error. |
| `--color-error-fondo` | `#fdecea` | Fondo de aviso de error. |

En Tailwind v4 estos tokens ya están expuestos vía `@theme inline`: se usan como `bg-marina`,
`text-tinta-suave`, `border-linea`, etc. **No escribas hex literal en TSX.**

## 2. Contrastes medidos (WCAG 2.1, ratio real)

Umbrales: 4.5:1 texto normal · 3:1 texto ≥24 px o ≥18.7 px en peso 600+ · 3:1 bordes de controles y
gráficos informativos.

| Combinación | Ratio | Veredicto |
|---|---|---|
| `tinta` #101418 sobre `papel` #f2f2f3 | ≈ 17.6:1 | Pasa todo. |
| `tinta` sobre `hoja` #ffffff | ≈ 18.6:1 | Pasa todo. |
| `tinta-suave` #4b5563 sobre `papel` | ≈ 6.8:1 | Pasa AA en cuerpo. |
| `tinta-suave` sobre `hoja` | ≈ 7.6:1 | Pasa AA en cuerpo. |
| `marina` #14305c sobre `hoja` | ≈ 13.1:1 | Pasa todo. |
| `hoja` sobre `marina` (botón marina) | ≈ 13.1:1 | Pasa todo. |
| **`hoja` sobre `sello` #f4711a** (botón acción) | **≈ 2.9:1** | **Falla AA**, incluso para texto grande. |
| **`sello` como texto sobre `hoja`** | **≈ 2.9:1** | **Falla AA.** |
| `hoja` sobre `sello-oscura` #c9560d | ≈ 4.4:1 | Pasa solo como texto grande (≥18.7 px/600). |
| **`linea` #c9ccd1 sobre `hoja`** | **≈ 1.6:1** | Decorativo sí; **borde de `input` no** (pide 3:1). |
| `linea-fuerte` #9aa0a8 sobre `hoja` | ≈ 2.6:1 | Tampoco alcanza 3:1 para bordes de control. |
| `error` #b3261e sobre `error-fondo` #fdecea | ≈ 6.3:1 | Pasa AA. |

Consecuencias operativas:

1. **El naranja es sello, no tinta.** Para un botón de acción accesible hay dos salidas legítimas
   dentro de la dirección de arte: (a) relleno naranja con texto `--color-marina` o `--color-tinta`,
   (b) relleno `--color-sello-oscura` con texto blanco a `.t-dato` (18 px, 600) o mayor. Cualquier
   cambio de este tipo se propone, no se aplica en silencio: afecta a toda la identidad.
2. **El borde de un control necesita un neutro oscuro** (`--color-tinta-suave` da 7.6:1 sobre hoja).
   `--color-linea` se queda para marcos, `border-t` de listas y separadores.
3. El estado nunca depende del color: `EstadoBadge` y `Aviso` ya llevan icono + texto.

## 3. Escala tipográfica

Base 16 px. Razón ≈1.25 en el rango de texto, ≈1.33 en los títulos condensados.

| Clase | `font-family` | `font-size` | `font-weight` | `line-height` | `letter-spacing` | Uso |
|---|---|---|---|---|---|---|
| `.t-display` | Barlow Condensed | `clamp(2.75rem, 7vw, 4.5rem)` | 700 | 0.96 | 0 | Una vez por pantalla, y no en todas. |
| `.t-titulo` | Barlow Condensed | `clamp(1.75rem, 3.4vw, 2.375rem)` | 600 | 1.08 | 0.005em | `h1` de página interior. |
| `.t-seccion` | Barlow Condensed | 1.375rem | 600 | 1.15 | 0.005em | `h2` de bloque. |
| `.t-dato` | Barlow Condensed | 1.125rem | 600 | 1.3 | 0.02em | Labels, valores destacados, títulos de aviso. |
| (base) | Barlow | 1rem | 400 | 1.55 | 0 | Cuerpo. |
| `.t-apoyo` | Barlow | 0.875rem | 400 | ~1.45 | 0 | Ayuda, metadatos, pies. Color `tinta-suave`. |
| `.guia` | IBM Plex Mono | hereda | 500 | — | 0.04em | Guías y códigos. `tabular-nums`. |
| `.cifras` | IBM Plex Mono | 0.94em | 400 | — | — | Fechas, horas, totales. |
| `.rotulo` | Barlow | 0.8125rem | 500 | 1.4 | 0 | Etiqueta de dato. |

- Máximo **4 tamaños por pantalla**. Si necesitas un quinto, casi siempre el problema es que falta
  jerarquía de color o de peso, no un tamaño nuevo.
- Medida: cuerpo `max-w-prose` (≈65ch) o `max-w-[68ch]`; apoyo `max-w-[45ch]`.
- Tabular obligatorio en guías, pesos, fechas en columna, contadores y celdas numéricas.
- `.t-display` solo en la portada pública. Un display en una pantalla de operador es ruido.

## 4. Escala de espaciado con intención

Base 4 px (Tailwind). Un paso solo significa una cosa dentro de una pantalla.

| Paso | px | Nivel | Ejemplos |
|---|---|---|---|
| `0.5`–`1` | 2–4 | Micro | Icono↔texto de un badge, label↔asterisco. |
| `2` | 8 | Intracomponente | Label↔control, chip interior, título↔subtítulo. |
| `3` | 12 | Grupo | Campos hermanos, título de sección↔su párrafo. |
| `4` | 16 | Lista | Ítems equivalentes, padding interior en móvil. |
| `6` | 24 | Superficie | Padding de `.hoja`, separación entre bloques hermanos. |
| `8` | 32 | Bloque | Bloques dentro de una sección, padding en `sm:` y superior. |
| `12` | 48 | **Sección** | Entre secciones de una página. |
| `16`/`20` | 64/80 | Región | Corte mayor: héroe↔contenido, contenido↔pie. |

Reglas duras:

- Sección ≥ tarjeta **+ 2 pasos** (`gap-4` → `gap-12`, no `gap-6`).
- Máximo ~5 pasos distintos en una pantalla.
- El padre reparte con `gap-*`; nada de `mt-*` suelto en cada hijo.
- Padding horizontal de página: `px-4` móvil, `sm:px-6`. Ancho máximo `max-w-[1200px]`.

## 5. Contenedores y estructura

- `.hoja` — papel con fibra, borde 1px `--color-linea-fuerte` y cuatro marcas de registro.
  Es la unidad de composición. Sin padding propio: lo pone quien lo usa.
- `.hoja-copia` — la hoja en papel de copia (`--color-papel-copia`), para el área de operador.
- `.casilla`, `.registro`, `.sello`, `.perforado` — casilla rotulada, tabla rayada, sello de caucho y troquel.
- Lista de ítems equivalentes: **sin caja**, `border-t border-linea pt-4` por ítem.
- Elevación: solo dos planos (`papel` y `hoja`). Un tercer plano indica que la página tiene
  demasiada estructura anidada.
- Radio: `rounded-none` en todo. Sombra: ninguna, salvo overlay de `Dialogo`.

## 6. Interacción

- Foco global ya definido: `outline: 2px solid var(--color-sello); outline-offset: 2px` sobre
  `a, button, input, select, textarea, [tabindex]`. No lo redefinas por componente.
- `prefers-reduced-motion: reduce` ya neutraliza transiciones y animaciones CSS globalmente.
- Objetivo táctil mínimo 44×44 px: `min-h-11 min-w-11` (ya en `Boton` e `Input`).
- Transiciones: 120–200 ms `ease-out`, solo `opacity`/`transform`/`color`/`border-color`/
  `background-color`.
