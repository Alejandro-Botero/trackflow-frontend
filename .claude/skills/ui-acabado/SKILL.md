---
name: ui-acabado
description: Guía de estilo de la casa y procedimiento de revisión para pulir el diseño visual de UI web (polish, refine, visual design, look and feel, make it look professional / designed, not AI-generated) hasta que se lea como producto diseñado y enviado por una empresa real, no como plantilla ni salida genérica de IA. Úsala al crear o revisar pantallas en Tailwind v4 + Next.js App Router con interfaz en español, antes de dar por terminada una vista.
---

# ui-acabado — acabado visual de producto

Esta skill no inventa dirección de arte: **ejecuta con oficio la dirección que el proyecto ya
tiene**. Su trabajo es quitar los tics de "UI generada": todo equidistante, todo del mismo peso,
todo redondeado, sin foco. El resultado buscado es que la pantalla se lea intencional —que alguien
decidió cada tamaño, cada espacio y cada línea.

**Dirección de este proyecto (TrackFlow): la guía de transporte impresa.** No "un look limpio
inspirado en papel": el artefacto. Papel crudo con fibra (`--color-papel`), tinta azul marino,
código de barras sobre el número de guía, casillas rotuladas, sello de caucho para el estado,
libro de registro rayado para el historial, copia al carbón (`.hoja-copia`) en el área interna.
Un único sello naranja por pantalla, esquinas rectas (`rounded-none`), modo claro únicamente. Nunca propongas migrarlo a SaaS genérico
(glassmorphism, degradados, tarjetas grandes redondeadas, sombras difusas). Si una regla general de
esta skill choca con esa dirección, gana la dirección: la skill dice *cómo* ejecutarla mejor.

Referencias (leer bajo demanda, no de entrada):

- [`references/tokens.md`](references/tokens.md) — tokens reales, escala tipográfica, escala de
  espaciado con intención, contrastes medidos.
- [`references/tells.md`](references/tells.md) — catálogo completo de tics de IA con su corrección.
- [`references/checklist.md`](references/checklist.md) — la pasada de revisión, paso a paso, con
  criterio de aprobado/reprobado.

---

## 1. Los tics que delatan una UI generada

Tabla completa en [`references/tells.md`](references/tells.md). Los nueve que más veces hay que
arreglar aquí:

| Tic | Corrección |
|---|---|
| `gap-4` y `p-6` en todas partes | La jerarquía espacial se lee antes que el texto. Usa pasos distintos según el nivel (§3). En este repo `gap-4` aparece 21 veces y `p-6` 18: casi siempre es espaciado por defecto, no decidido. |
| Todas las tarjetas con el mismo peso | Una superficie principal (`.hoja` + padding grande) y el resto degradado a filas con `border-t border-linea`, sin caja. |
| **Versalitas diminutas de adorno** (rótulo sobre cada sección, códigos de formato, pies de documento, contadores) | Doble tic: decora y obliga a leer letra de 10 px. La etiqueta existe solo si nombra un dato concreto, y en tamaño legible (13 px, caja normal). Si la quitas y la pantalla se entiende igual, sobraba. |
| Superficie plana de un solo color | El papel tiene fibra: ruido fractal al 14 % en el fondo y al 7 % en la hoja. Se nota sin verse. |
| Metáfora declarada pero no ejecutada | Si la referencia es un documento, tiene que haber documento: código de barras, folio, casillas, sello, pie de "documento generado por el sistema". Media metáfora se lee como plantilla. |
| Degradados violeta/índigo, sombras `shadow-lg` | Prohibidos. Aquí la profundidad es **valor + hairline**: `bg-papel` → `bg-hoja`, separadas por `border-linea`. Cero `shadow-*` salvo overlays modales. |
| Todo centrado | Centra solo lo que es un estado breve (vacío, error, carga). El contenido de lectura se alinea a la izquierda, con medida controlada. |
| Emoji como iconografía | `lucide-react` siempre, con `aria-hidden="true"` y tamaño ligado al texto (§2). |
| Sin punto focal | Cada pantalla tiene un elemento dominante y se nota a 2 m de distancia (§5). |
| Texto corrido sin medida ni interlineado | `max-w-prose`/`max-w-[68ch]` en cuerpo, `max-w-[45ch]` en apoyo (§2). |
| Borde neutro de 1px en todo | El borde es información. Estructura = `--color-linea`; control interactivo = borde más oscuro; jamás borde donde basta un cambio de fondo. |
| `rounded-xl` / `rounded-lg` | `rounded-none` sin excepción. Si aparece un radio, es un error de copiar/pegar. |

Y el tic de composición: **héroe + grid de 3 features + CTA**. Si el layout se puede describir con
esa frase, todavía no está diseñado. La portada de este repo escapa de eso porque **es** una guía en
blanco: membrete, casilla del número con el buscador dentro, condiciones impresas al pie y el anexo
de estados como tabla. Mantenlo así.

---

## 2. Tipografía

Escala base 16 px, razón ≈1.25 en el rango de texto y ≈1.33 en los títulos condensados. Las clases
ya existen en `src/app/globals.css`; **no inventes tamaños sueltos con `text-[N]`**.

| Rol | Clase | Tamaño | `line-height` | `letter-spacing` |
|---|---|---|---|---|
| Display | `.t-display` | `clamp(2.75rem, 7vw, 4.5rem)` | 0.96 | 0 a +0.005em |
| Título | `.t-titulo` | `clamp(1.75rem, 3.4vw, 2.375rem)` | 1.08 | 0.005em |
| Sección | `.t-seccion` | 1.375rem | 1.15 | 0.005em |
| Dato / label | `.t-dato` | 1.125rem | 1.3 | +0.02em |
| Cuerpo | (base) | 1rem | 1.55 | 0 |
| Apoyo | `.t-apoyo` | 0.875rem | 1.45 | 0 a +0.01em |
| Guía / ID | `.guia` | hereda | — | mono, +0.04em, `tabular-nums` |
| Fecha, hora, total | `.cifras` | 0.94em | — | mono, `tabular-nums` |
| Etiqueta de dato | `.rotulo` | 0.8125rem | 1.4 | texto, sin tracking, caja normal |

Reglas con número:

- **Interlineado por tamaño**: cuanto más grande, más apretado. ≥2.5rem → 0.95–1.05. 1.1–1.6rem →
  1.1–1.3. Cuerpo → 1.5–1.6. Nunca `leading-relaxed` en un título ni 1.2 en un párrafo.
- **Medida (measure)**: cuerpo 60–75 caracteres (`max-w-prose` ≈ 65ch). Texto de apoyo, descripción
  de tarjeta o pie: 45ch máximo (`max-w-[45ch]`). Una columna de texto que cruza 1200 px es un
  defecto, aunque el contenedor lo permita.
- **Tracking**: negativo (−0.01 a −0.02em) solo en display de tipografías de ancho normal. Barlow
  Condensed ya viene estrecha: aquí el display va en 0/+0.005em y el tracking **positivo** se
  reserva para lo pequeño en mayúsculas: labels (`.t-dato`, +0.02em), rótulos de casilla
  (`.rotulo`, +0.16em) y códigos (`.guia`, +0.04em sobre mono).
- **Tres familias, cada una con su trabajo**: Barlow Condensed titula, Barlow narra, IBM Plex Mono
  **compone todo lo que es código**: guías, códigos de estado, fechas, horas y totales —nada más.
  Mezclar una mono real es lo que separa un documento de un rectángulo con texto; usarla también
  para etiquetas y adornos lo convierte en disfraz.
- **Cifras tabulares** obligatorias en todo lo que se compare o se alinee en columna: guías, pesos,
  fechas, contadores, tablas. `.guia` y `.cifras` ya lo traen; en tablas nuevas usa `.cifras`.
- **Pesos**: dos por pantalla, máximo tres. Aquí 600 en títulos/labels y 400 en cuerpo; 700 solo en
  `.t-display`. No uses 500 como "medio peso" decorativo: o hay contraste de peso o no lo hay.
- **Par icono + texto**: el icono mide la altura de la x o la cap-height de su etiqueta, no más.
  `text-sm` → `h-4 w-4`; `.t-dato`/`text-lg` → `h-5 w-5`; `text-xs` → `h-3.5 w-3.5`. Un icono de
  24 px junto a `text-sm` es tic de IA.

---

## 3. Espaciado y ritmo

Base 4 px (escala de Tailwind). Lo que importa no es la escala, es **qué significa cada paso**:

| Paso | px | Significado |
|---|---|---|
| `1` | 4 | Intracomponente: icono↔texto, label↔asterisco |
| `2` | 8 | Label↔control, elementos de un chip o badge |
| `3` | 12 | Campos hermanos dentro de un grupo |
| `4` | 16 | Ítems de una lista, padding interior en móvil |
| `6` | 24 | Padding interior de superficie principal |
| `8` | 32 | Bloques dentro de una sección |
| `12` | 48 | **Entre secciones** |
| `16`/`20` | 64/80 | Corte mayor de página / cambio de región |

Reglas:

1. **El salto entre secciones supera al salto entre tarjetas por al menos 2 pasos.** Si las tarjetas
   van `gap-4`, las secciones van `gap-12`, no `gap-6`. Ese único cambio es lo que hace que una
   página se lea agrupada en vez de como una lista plana.
2. **Máximo ~5 pasos distintos por pantalla.** Más que eso es ruido; menos de 3 es la página plana.
3. **Un contenedor manda el espaciado, no sus hijos.** `flex flex-col gap-N` en el padre; evita
   `mt-*` suelto en cada hijo (produce colapsos inconsistentes y márgenes huérfanos al reordenar).
4. **Padding óptico, no aritmético.** Con tipografía condensada y mayúsculas, el padding inferior se
   percibe mayor que el superior: en botones y badges compensa (`pt-2 pb-1.5` frente a `py-2`)
   cuando el desbalance se nota. Ajusta por lo que ves, no por lo que suma.
5. **Ritmo vertical**: dentro de una sección, los saltos deben ser monótonos —nunca `gap-8` seguido
   de `gap-3` seguido de `gap-8` sin que el cambio signifique algo.
6. El borde superior (`border-t border-linea pt-4`) es un separador más barato y más "impreso" que
   una tarjeta. Úsalo para listas de ítems equivalentes.

---

## 4. Color

- **Un acento, usado poco.** `--color-sello` (naranja) marca **un solo elemento de acción por
  pantalla** y el paso actual del progreso. Si aparece dos veces como botón, una de las dos está mal.
- **El trabajo lo hace la rampa neutra**: `--color-papel` (fondo) → `--color-hoja` (superficie) →
  `--color-linea` (hairline) → `--color-tinta-suave` (texto secundario) → `--color-tinta` (texto).
  `--color-marina` es la estructura: títulos, bordes fuertes, botones no-acción.
- **Profundidad sin sombra**: subir de plano = cambiar de valor (`bg-papel`→`bg-hoja`) y cerrar con
  hairline. `shadow-*` solo en overlay modal. Nada de `shadow-lg` por defecto.
- **Contraste**: cuerpo ≥4.5:1, texto grande (≥24 px o ≥18.7 px en 600+) ≥3:1, bordes de controles y
  elementos gráficos con significado ≥3:1. Valores medidos de este proyecto en
  [`references/tokens.md`](references/tokens.md) — con dos trampas ya detectadas:
  - **`--color-sello` sobre blanco/hoja da 2.9:1**: naranja es color de **relleno y de marca, no de
    texto**. Texto naranja pequeño y blanco sobre naranja no pasan AA; usa
    `--color-sello-oscura` a partir de 18.7 px/600, o marina para el texto.
  - **`--color-linea` sobre `--color-hoja` da 1.6:1**: sirve como regla decorativa, pero no como
    borde de un `input` (necesita 3:1). Para el borde de un control usa un neutro oscuro.
- **Nunca color solo.** Todo estado lleva texto + icono + color (`EstadoBadge`, `Aviso` ya lo hacen).
  La pantalla tiene que seguir siendo legible en escala de grises y en una impresión en blanco y
  negro — que para esta dirección es literalmente el caso de uso.

---

## 5. Densidad y jerarquía

- **Un elemento primario por pantalla**, y se identifica en 3 segundos entrecerrando los ojos. En la
  portada es el buscador de guía; en el resultado, el estado actual; en un formulario, el botón de
  envío. Si hay dos candidatos, degrada uno.
- **Degradar se hace con cuatro palancas, no con la posición**: tamaño, peso, color
  (`text-tinta-suave`), y quitar la caja. Mover algo abajo no lo degrada.
- **El ratio del focal contra su vecino debe ser visible**: al menos un paso completo de escala
  (1.25×) o un salto de peso, preferiblemente ambos.
- **Superficies densas vs. de presentación**: una tabla de operador o un timeline admiten
  `py-2`/`gap-2` y `text-sm`; una portada pública respira con `gap-8`/`gap-12`. No apliques la
  densidad de una a la otra: un formulario de operador con aire de landing se siente lento de usar,
  y una portada con densidad de tabla se siente barata.
- **Estados vacíos, de carga y de error son diseño**, no `null`. Cada uno dice qué pasó y cuál es el
  siguiente paso, en una superficie con la misma calidad que el estado feliz.

---

## 6. Movimiento e interacción

- **120–200 ms, `ease-out`**, y solo en propiedades baratas (`opacity`, `transform`, `color`,
  `border-color`, `background-color`). Nada de animar `height`, `width` ni `top`.
- **Nada decorativo**: sin fade-in al entrar, sin parallax, sin números que cuentan hacia arriba.
  El movimiento confirma una acción o explica un cambio de estado; si no hace ninguna de las dos,
  se borra. (Hoy este repo no tiene ni una sola transición: añadir una tiene que justificarse.)
- **`hover`, `active` y `focus-visible` deben ser tres respuestas distintas.** Nunca uses hover como
  único estado, nunca elimines el outline. `focus-visible` global ya está resuelto en `globals.css`
  (outline 2 px `--color-sello`, offset 2) — no lo sobrescribas por componente.
- **Sin hover en táctil**: nada crítico puede vivir solo en `:hover`.
- **`prefers-reduced-motion: reduce`** ya está cubierto globalmente; si añades una animación en JS
  (no CSS), compruébalo con `matchMedia` tú mismo.
- **Feedback de espera**: toda escritura responde 202 y hay polling, así que el botón pasa a
  `cargando` con `aria-busy` y el resultado se anuncia en una región `aria-live="polite"`.

---

## 7. Redacción en español

El texto es el 80 % de la interfaz; la copia genérica delata la plantilla más rápido que el CSS.

- **Específico antes que amable.** "Consultar" mejor que "Empieza ahora"; "No encontramos ningún
  envío con ese número" mejor que "Algo salió mal". Nombra el objeto real: guía, envío, evento, punto.
- **Prohibido**: "¡Bienvenido!", "Empieza ahora", "Potencia tu…", "Todo lo que necesitas para…",
  "Simple, rápido y seguro", "¡Listo!". Si la frase serviría igual para un CRM, sobra.
- **Sin signos de exclamación.** Ninguno. Tampoco en los mensajes de éxito.
- **Mayúscula solo inicial** en labels, botones, encabezados y pestañas ("Registrar envío", no
  "Registrar Envío"). Sin mayúsculas sostenidas salvo en códigos (`TF000000000001`).
- **Botones = verbo en infinitivo** y objeto si hace falta: "Registrar envío", "Consultar",
  "Copiar número". Nunca "Enviar", "OK", "Continuar" a secas.
- **Ortografía completa**: tildes y `ñ` siempre, incluidas mayúsculas ("Envío", "Administración",
  "Logística"), `¿`/`¡` de apertura cuando corresponda, y `…` como carácter único.
- **Raya (—) y comillas latinas («»)** con moderación: la raya para incisos, nunca como guion; `«»`
  antes que `""` si hay que citar. Mejor dos frases que una con tres incisos.
- **Errores**: qué pasó + qué hacer, junto al campo, sin culpar al usuario ni exponer detalles del
  backend. Los textos salen de `src/api/errores.ts`, no se escriben sueltos en la página.
- **Números y fechas** en formato local (`src/lib/fechas.ts`), no ISO crudo en la interfaz.

---

## 8. Procedimiento de revisión

Ejecuta los ocho pasos en orden sobre la página objetivo. Criterios de aprobación detallados y
comandos de auditoría en [`references/checklist.md`](references/checklist.md).

1. **Leer los tokens.** `src/app/globals.css` completo, antes de tocar nada.
   *Aprueba si* no vas a introducir ningún valor de color, tamaño o fuente fuera de esos tokens.
2. **Inventariar la jerarquía.** Lista los bloques de la página y asígnale a cada uno nivel 1, 2 o 3.
   *Reprueba si* hay más de un nivel 1, o si dos bloques de nivel distinto se ven igual.
3. **Encontrar el punto focal.** Entrecierra los ojos (o describe la página por masas, no por texto).
   *Aprueba si* nombras un único elemento dominante sin leer una palabra.
4. **Auditar los pasos de espaciado realmente usados.** Extrae las utilidades de espaciado del
   archivo. *Reprueba si* hay más de 5 pasos distintos, o si el salto entre secciones no supera al
   de las tarjetas por 2 pasos, o si un mismo paso hace de separación intra e intersección.
5. **Auditar los tamaños de texto realmente usados.** *Reprueba si* aparece un `text-[…]` arbitrario,
   si hay más de 4 tamaños en la pantalla, o si un párrafo largo no tiene medida limitada.
6. **Estados.** Para cada control: reposo, `hover`, `active`, `focus-visible`, `disabled`, error,
   cargando. *Reprueba si* dos de ellos se ven iguales o si falta el de carga en una escritura.
7. **Accesibilidad.** `label` visible asociado, `aria-describedby`/`aria-invalid` en error, objetivos
   ≥44×44 px, jerarquía `h1→h2→h3` sin saltos, `aria-live` en resultados, iconos `aria-hidden`,
   contraste verificado contra la tabla de tokens. *Reprueba con un solo fallo.*
8. **375 px de ancho.** *Reprueba si* hay scroll horizontal, si algo queda por debajo de 44 px de
   alto táctil, si una tabla desborda sin contenedor con scroll, o si el display se rompe en tres
   líneas huérfanas.

Al terminar, reporta los hallazgos como lista de correcciones concretas (archivo + línea + cambio),
no como consejos generales.

---

## 8 bis. Primitivas del formato

Antes de inventar una composición, mira si ya existe la pieza. Todas viven en
`src/app/globals.css` y en `src/components/`.

| Pieza | Qué es | Cuándo |
|---|---|---|
| `.hoja` | Hoja de guía: papel con fibra, filete y marcas de registro en las cuatro esquinas. | Superficie principal de cualquier pantalla. |
| `.hoja-copia` | La misma hoja en papel de copia al carbón. | Formularios del área de operador: deja claro que es el duplicado interno. |
| `.casilla` | Recuadro rotulado con filete marino a la izquierda. | Pares rótulo/dato de una ficha. Sustituye a la fila etiqueta-valor suelta. |
| `.registro` | Tabla rayada con alternancia al 3,5 %. | Historiales y listados. Bajo `sm` se apila: nunca dejes una tabla de 4 columnas con scroll horizontal. |
| `.rotulo` | Etiqueta de dato, 13 px, caja normal. | Encima de un dato concreto. **No** encima de cada sección. |
| `.perforado` | Troquel entre original y copia. | Separar regiones dentro de una hoja. |
| `.sello` / `SelloEstado` | Sello de caucho: doble filete, rotación −3°, tinta del estado. | El estado actual, una vez por pantalla. |
| `CodigoBarras` | Barras derivadas del número, decorativas y `aria-hidden`. | Junto a un número de guía que importa (membrete, comprobante). |
| `EstadoBadge` | Distintivo callado, con o sin marco (`enmarcado={false}` dentro de tablas). | Estado en listas, tablas y formularios. |

El distintivo, el sello y el paso actual del progreso comparten `COLOR_ESTADO`: un estado tiene
una sola tinta en toda la aplicación.

## 9. No hagas esto

- `rounded-*` distinto de `rounded-none`; `gradient`; sombras difusas de tarjeta (la hoja lleva una
  sombra de contacto mínima, y el modal la suya: nada más).
- Poner un `.rotulo` encima de cada título "para que se vea diseñado", ni rellenar la pantalla con
  códigos de formato, pies de documento o contadores que nadie va a leer.
- Emoji en la interfaz; iconos sin `aria-hidden`; iconos decorativos de 24 px junto a `text-sm`.
- Colores, tamaños o fuentes literales (`#fff`, `text-[13px]`, `font-['Inter']`) en vez de tokens.
- Modo oscuro, `dark:` o `prefers-color-scheme`: este sistema es de un solo modo, a propósito.
- Dos botones `variante="accion"` en la misma pantalla.
- `text-center` en párrafos de más de dos líneas.
- Sustituir el `outline` de foco por un `ring` propio, o quitarlo "porque se ve mal".
- Añadir librerías de UI, animación o iconos nuevas: hay `tailwind` v4, `lucide-react` y nada más.
- Tocar `src/api/*` para arreglar un problema visual, o escribir textos de error fuera de
  `src/api/errores.ts`.
- Cambiar la dirección de arte "para modernizar". La dirección es del proyecto, no de la skill.

---

## 10. Antes / después (Tailwind v4 + TSX, tokens reales)

El "antes" es el patrón real de `src/app/operador/(protegido)/admin/page.tsx`: un solo paso de
espaciado para todo, todo centrado en la columna, título sin contexto, ninguna jerarquía entre el
encabezado, la explicación y la acción.

```tsx
// ANTES — plano: gap-6 para todo, sin foco, sin medida de lectura.
<div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
  <h1 className="t-titulo">Administración</h1>
  <p className="t-apoyo">
    Reconstruye las proyecciones de lectura a partir de los eventos ya guardados.
  </p>
  <div>
    <Boton variante="marina" onClick={abrir}>Reconstruir proyecciones</Boton>
  </div>
</div>
```

```tsx
// DESPUÉS — tres niveles distintos, un foco, medida controlada, saltos con intención.
<div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
  {/* Nivel 1: encabezado de página. Salto de sección = gap-12 (2 pasos por encima del interno). */}
  <div className="flex flex-col gap-12">
    <header className="flex flex-col gap-2 border-b border-linea pb-6">
      <p className="t-apoyo tracking-[0.12em] uppercase text-tinta-suave">Operación interna</p>
      <h1 className="t-titulo text-marina">Administración</h1>
      <p className="max-w-[45ch] t-apoyo">
        Reconstruye las proyecciones de lectura a partir de los eventos ya guardados.
      </p>
    </header>

    {/* Nivel 2: la acción es el foco — única superficie con caja y con el sello. */}
    <section aria-labelledby="reconstruir" className="hoja p-6 sm:p-8">
      <div className="flex flex-col gap-3">
        <h2 id="reconstruir" className="t-seccion text-marina">
          Reconstruir proyecciones
        </h2>
        <p className="max-w-[45ch] t-apoyo">
          Úsalo solo si el estado o el historial no coinciden con los eventos registrados.
          La operación no borra ni modifica eventos.
        </p>
      </div>
      <div className="mt-6">
        <Boton variante="accion" onClick={abrir} disabled={procesando}>
          Reconstruir proyecciones
        </Boton>
      </div>
    </section>

    {/* Nivel 3: resultado degradado — sin caja, filas separadas por hairline, cifras tabulares. */}
    <section aria-live="polite" className="flex flex-col gap-4">
      <h2 className="t-dato text-tinta-suave">Última reconstrucción</h2>
      <dl className="flex flex-col">
        {filas.map(({ nombre, total }) => (
          <div key={nombre} className="flex items-baseline justify-between border-t border-linea py-3">
            <dt className="t-apoyo text-tinta">{nombre}</dt>
            <dd className="t-dato tabular-nums text-marina">{total}</dd>
          </div>
        ))}
      </dl>
    </section>
  </div>
</div>
```

Qué cambió, y por qué cada cambio es del tipo que separa "hecho" de "acabado":

1. **Pasos de espaciado con intención**: `gap-2` intracomponente, `gap-3`/`gap-4` entre hermanos,
   `mt-6` para separar la acción de su explicación, `gap-12` entre secciones (regla de los 2 pasos).
2. **Tres niveles visibles**: `.t-titulo` marina → `.t-seccion` marina → `.t-dato` en
   `text-tinta-suave`. El nivel 3 baja de tamaño **y** de peso **y** de color.
3. **Un solo foco**: la única caja (`.hoja`) y el único `variante="accion"` de la pantalla.
4. **Medida controlada**: `max-w-[45ch]` en el texto de apoyo, en vez de dejarlo cruzar 1200 px.
5. **Profundidad sin sombra**: caja = cambio de valor + hairline; el resultado ni siquiera lleva
   caja, solo `border-t border-linea`.
6. **Cifras tabulares** en la columna numérica, y `items-baseline` para alinear ópticamente etiqueta
   y dato pese a que tienen tamaños distintos.
7. **Copia específica**: se explica cuándo usarlo y se garantiza que no destruye datos, en vez de
   una sola línea descriptiva sin consecuencias.
8. **Semántica que además es diseño**: `<dl>` para pares etiqueta/valor, `aria-labelledby`,
   `aria-live` en el bloque de resultado.
