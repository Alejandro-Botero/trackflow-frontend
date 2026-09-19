# Pasada de revisión — 8 pasos con criterio de aprobado/reprobado

Ejecutar en orden sobre una pantalla concreta (una ruta de `src/app/**/page.tsx` más los
componentes que renderiza). No saltes pasos: cada uno usa el resultado del anterior.

Al final, reporta **archivo + línea + cambio concreto**. Nada de "mejorar la jerarquía".

---

## Paso 1 — Leer los tokens

Lee `src/app/globals.css` entero y `references/tokens.md`.

- **Aprueba si** puedes nombrar, sin volver a mirar: los dos planos de fondo, el acento, los dos
  neutros de texto y las cinco clases `.t-*`.
- **Reprueba si** vas a introducir cualquier color, tamaño de fuente, familia o radio que no salga
  de ahí.

## Paso 2 — Inventariar la jerarquía

Lista cada bloque de la pantalla y asígnale nivel 1 (lo que la pantalla es), 2 (lo que soporta la
tarea) o 3 (metadatos, resultados, secundarios).

- **Aprueba si** hay exactamente un bloque de nivel 1 y cada nivel se distingue del siguiente por al
  menos **dos** palancas (tamaño, peso, color, presencia de caja).
- **Reprueba si** hay dos niveles 1, o si un nivel 2 y un nivel 3 comparten tamaño, peso y color.

## Paso 3 — Encontrar el punto focal

Describe la pantalla solo por masas (bloques oscuros, cajas, huecos), ignorando el texto.

- **Aprueba si** nombras un único elemento dominante y coincide con la acción principal de la
  historia de usuario.
- **Reprueba si** dudas entre dos, o si el elemento dominante resulta ser un adorno (una ilustración,
  un borde grueso, un bloque de texto legal).

## Paso 4 — Auditar los pasos de espaciado

```bash
grep -rhoE '\b(gap|gap-x|gap-y|p|px|py|pt|pb|mt|mb|space-y)-[0-9.]+' --include='*.tsx' \
  src/app/<ruta> src/components | sort | uniq -c | sort -rn
```

- **Aprueba si** hay ≤5 pasos distintos, cada paso ocupa un solo nivel semántico, y el salto entre
  secciones supera al de tarjetas por ≥2 pasos.
- **Reprueba si** un solo valor concentra más de la mitad de los usos (síntoma de default), si hay
  `mt-*` suelto repetido en hijos hermanos, o si secciones y tarjetas usan el mismo salto.
- Referencia medida en este repo: `gap-4` ×21 y `p-6` ×18 sobre `src` completo. Cada aparición nueva
  debe justificarse por nivel, no por costumbre.

## Paso 5 — Auditar los tamaños de texto

```bash
grep -rhoE '\b(t-(display|titulo|seccion|dato|apoyo)|text-(xs|sm|base|lg|xl|[0-9]xl)|text-\[[^]]+\])\b' \
  --include='*.tsx' src/app/<ruta> src/components | sort | uniq -c | sort -rn
```

- **Aprueba si** hay ≤4 tamaños en la pantalla, todos de la escala, y cada párrafo largo tiene
  `max-w-prose` o `max-w-[45ch]`.
- **Reprueba si** aparece cualquier `text-[...]` arbitrario, si `.t-display` aparece fuera de la
  portada pública, o si hay dos tamaños separados por menos de un paso de escala (p. ej. `text-base`
  junto a `text-lg` haciendo de jerarquía).

## Paso 6 — Estados

Para cada control interactivo de la pantalla, verifica las siete respuestas:

| Estado | Criterio |
|---|---|
| Reposo | Legible sin interacción; el rol (primario/secundario) es evidente. |
| `hover` | Cambio visible de fondo o color, no solo de cursor. |
| `active` | Distinto de `hover` (más oscuro, o desplazamiento de 1px). |
| `focus-visible` | Outline del sistema, visible sobre cualquier fondo de la pantalla. |
| `disabled` | `opacity`/color + `cursor-not-allowed` + el motivo dicho en texto cerca. |
| Error | Texto junto al campo + `aria-invalid` + `aria-describedby`, no solo borde rojo. |
| Cargando | `aria-busy`, control bloqueado, y texto que explica la espera. |

- **Aprueba si** los siete existen y ninguno se confunde con otro.
- **Reprueba si** `hover` y `active` son iguales, si falta el estado de carga en una operación de
  escritura (toda escritura devuelve 202 + polling), o si un error se comunica solo con color.

Además: vacío, sin resultados y error de red son **pantallas diseñadas**, no `null`.

## Paso 7 — Accesibilidad (WCAG 2.1 AA)

| Comprobación | Criterio |
|---|---|
| Labels | Todo control con `label` visible asociado por `htmlFor`/`id`. Nunca solo `placeholder`. |
| Errores | `aria-invalid` + `aria-describedby` apuntando al mensaje; `role="alert"` en el mensaje. |
| Foco | Orden de tabulación lógico; outline nunca suprimido; nada alcanzable solo con ratón. |
| Objetivos táctiles | ≥44×44 px (`min-h-11 min-w-11`). Incluye iconos-botón y enlaces de fila. |
| Encabezados | `h1` único, sin saltar niveles, y `aria-labelledby` en secciones con título. |
| `aria-live` | `polite` en resultados asíncronos y avisos; `role="alert"` en errores. |
| Iconos | Decorativos con `aria-hidden="true"`; informativos con texto equivalente. |
| Contraste | Verificado contra la tabla de `tokens.md` §2, no "a ojo". |
| Idioma | `lang="es"` en `<html>`; textos completos con tildes y `ñ`. |
| Sin color solo | Todo estado lleva además texto e icono. |

- **Reprueba con un solo fallo.** La accesibilidad aquí es requisito del sprint, no mejora.

## Paso 8 — 375 px de ancho

- **Aprueba si**: sin scroll horizontal; todos los objetivos táctiles ≥44 px; las tablas van dentro
  de un contenedor con `overflow-x-auto` y se anuncian como desplazables; el `.t-display` no se
  parte en más de dos líneas ni deja una palabra huérfana; los grids colapsan a una columna; el
  padding lateral es `px-4`.
- **Reprueba si** algo depende de `hover` para ser usable, si un `flex-row` de 5 pasos se aprieta en
  vez de apilar, o si el número de guía se corta.

---

## Formato del informe

```
src/app/(publico)/page.tsx:34 — `gap-8` entre secciones con `gap-5` dentro: solo 1 paso de
  diferencia. Subir a `gap-12` (regla sección ≥ tarjeta + 2 pasos).
src/components/ui/Input.tsx:9 — `border-linea` sobre `bg-hoja` da 1.6:1; un borde de control
  necesita 3:1. Cambiar a `border-tinta-suave`.
```

Una línea por hallazgo, ordenadas por impacto visual (jerarquía > espaciado > tipografía > color >
detalle). Si un hallazgo cambia la identidad del producto (por ejemplo el color del botón de
acción), **propónlo, no lo apliques**.
