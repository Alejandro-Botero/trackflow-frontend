# Catálogo de tics de UI generada, con su corrección

Cada fila: el síntoma, por qué delata, y la corrección concreta en esta dirección de arte
(documento logístico impreso, Tailwind v4, español).

## Espaciado

| Tic | Por qué delata | Corrección |
|---|---|---|
| `gap-4` / `p-6` en todos los contenedores | Es el valor que sale por defecto cuando nadie decidió. Sin jerarquía espacial, el ojo no agrupa. | Asigna el paso por nivel (micro/intra/grupo/lista/superficie/bloque/sección). Ver `tokens.md` §4. |
| Sección y tarjeta con el mismo salto | La página se lee como una lista plana de cajas. | Sección ≥ tarjeta + 2 pasos. `gap-4` dentro → `gap-12` entre secciones. |
| `mt-4` repetido en cada hijo | Márgenes huérfanos, colapsos inconsistentes, se rompe al reordenar. | `flex flex-col gap-N` en el padre. `mt-*` solo para una excepción deliberada. |
| 9 pasos distintos en una pantalla | Ruido: ningún salto significa nada porque todos son distintos. | Máximo ~5 pasos. |
| Padding simétrico en elementos con tipografía condensada/mayúsculas | Se ve descentrado aunque los números cuadren. | Ajuste óptico (`pt-2 pb-1.5`) cuando el desbalance se note. |
| Aire de landing en una pantalla de operador | La herramienta se siente lenta y vacía. | Densidad por contexto: operador `gap-2`/`py-2`/`text-sm`; público `gap-8`/`gap-12`. |

## Tipografía

| Tic | Por qué delata | Corrección |
|---|---|---|
| Cuerpo a 16 px con `leading-normal` en todas partes | No hay sistema, hay defaults. | Interlineado por tamaño: 0.96 en display, 1.08–1.3 en títulos, 1.55 en cuerpo. |
| Párrafos que cruzan todo el contenedor | Ilegible pasados ~80 caracteres; nadie que diseñe lo deja. | `max-w-prose` en cuerpo, `max-w-[45ch]` en apoyo. |
| Cuatro pesos distintos, incluido 500 "medio" | Sin contraste de peso real. | Dos pesos (400/600), 700 solo en `.t-display`. |
| Tamaños arbitrarios `text-[13px]`, `text-[27px]` | Sale de ajustar a ojo sin escala. | Solo las clases `.t-*` y la escala de Tailwind. |
| Números proporcionales en columnas y códigos | Las cifras bailan al actualizarse. | `tabular-nums` (ya en `.guia`); añádelo a celdas numéricas. |
| Tracking negativo en Barlow Condensed | La condensada ya es estrecha: negativa se pega. | 0/+0.005em en display; positivo (+0.02 a +0.08em) en labels y códigos. |
| Icono de 24 px junto a `text-sm` | No hay relación de tamaño entre icono y etiqueta. | Icono ≈ cap-height del texto: `text-sm`→`h-4`, `.t-dato`→`h-5`, `text-xs`→`h-3.5`. |
| Todo en mayúsculas sostenidas sin tracking | Ilegible y con aire de plantilla. | Mayúsculas solo en eyebrows cortos, con `tracking-[0.12em]`. |

## Color y superficie

| Tic | Por qué delata | Corrección |
|---|---|---|
| Degradado violeta/índigo | Firma inconfundible de salida generada. | Prohibido. Rampa neutra + un acento sólido. |
| `shadow-lg` por defecto en tarjetas | Profundidad barata, no hace falta. | Valor + hairline: `bg-papel` → `bg-hoja` + `border-linea`. Sombra solo en modal. |
| Borde 1px gris en absolutamente todo | El borde deja de significar algo. | Borde donde hay un límite real; `border-t` para separar iguales; nada donde basta el fondo. |
| Acento repartido por toda la pantalla | Si todo destaca, nada destaca. | Un `variante="accion"` por pantalla. |
| Color como único portador de estado | Falla para daltonismo, impresión y escala de grises. | Icono + texto + color, siempre. |
| `dark:` copiado "por si acaso" | Este sistema es de un solo modo, declarado. | Elimínalo. `color-scheme: light` es intencional. |
| Texto naranja pequeño | 2.9:1 sobre hoja: falla AA. | Naranja es relleno; para texto usa marina o `sello-oscura` a tamaño grande. |

## Composición y jerarquía

| Tic | Por qué delata | Corrección |
|---|---|---|
| Héroe + grid de 3 features + CTA | Es la plantilla por defecto. | Que la composición salga de la tarea real (aquí: el buscador es el héroe y hace el trabajo). |
| Todo centrado | Centrar es el default de quien no compuso. | Centra solo estados breves (vacío, error, carga). Contenido a la izquierda. |
| Tres tarjetas idénticas en fila | Peso visual uniforme, cero jerarquía. | Una superficie principal + resto degradado a filas con hairline. |
| Sin punto focal identificable | Nadie decidió qué importa. | Un elemento dominante por pantalla, un paso de escala + un salto de peso por encima del vecino. |
| Jerarquía hecha solo con posición | Bajar algo no lo degrada. | Degrada con tamaño + peso + color + quitar la caja. |
| Grid de iguales para cosas desiguales | Empaquetar en `grid-cols-3` todo lo que hay. | Que el layout refleje la importancia: lo primario ocupa más. |
| `rounded-xl` en todo | Default de plantilla moderna; contradice la dirección. | `rounded-none`. |

## Iconos, movimiento, estados

| Tic | Por qué delata | Corrección |
|---|---|---|
| Emoji como icono (📦 ✅ 🚚) | Inconfundible. Además rompe accesibilidad y tipografía. | `lucide-react` con `aria-hidden="true"`. |
| Fade-in al cargar, contadores animados, parallax | Movimiento decorativo, cuesta y no informa. | Solo movimiento que confirme acción o explique un cambio de estado. |
| Transición de 300–500 ms | Se siente lento. | 120–200 ms, `ease-out`. |
| `hover` como único feedback | Inexistente en táctil, y el teclado queda fuera. | `hover`, `active` y `focus-visible` distintos entre sí. |
| Outline de foco eliminado o sustituido por `ring` tenue | Rompe WCAG y delata prisa. | Respeta el `outline` global de `globals.css`. |
| Estado vacío devuelto como `null` | La pantalla se queda en blanco sin explicación. | Vacío, carga y error diseñados, con siguiente paso explícito. |
| Spinner sin texto y sin `aria-busy` | No se anuncia, no se entiende cuánto falta. | `Cargando` con texto + `aria-busy` + región `aria-live`. |

## Redacción (español)

| Tic | Corrección |
|---|---|
| "¡Bienvenido!", "Empieza ahora", "Todo lo que necesitas para…" | Nombra el objeto y la acción reales: "Rastrea tu envío", "Consultar". |
| Signos de exclamación | Ninguno, tampoco en éxito. |
| "Registrar Envío" (mayúsculas de título) | Mayúscula solo inicial. |
| "Enviar", "OK", "Continuar" en botones | Verbo + objeto: "Registrar envío", "Copiar número". |
| "Algo salió mal" | Qué pasó y qué hacer, junto al campo, desde `src/api/errores.ts`. |
| Tildes y `ñ` ausentes en mayúsculas | "Envío", "Administración", "Logística" correctas siempre. |
| Fechas en ISO crudo en la interfaz | Formato local vía `src/lib/fechas.ts`. |
| Tres incisos con rayas en una frase | Dos frases. `—` y `«»` con moderación. |
| Texto traducido del inglés palabra por palabra ("Aplicar cambios", "Obtener empezado") | Escribe en español desde cero, con el vocabulario del dominio. |
