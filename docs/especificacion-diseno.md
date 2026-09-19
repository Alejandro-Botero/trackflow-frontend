# Prompt para Figma (Make / First Draft) — Prototipo Sprint 1

**Proyecto:** Sistema de Tracking Logístico (caso tipo FedEx) · equipo CodeF@ctory
**HU del sprint:** HU-01 (registrar envío), HU-02 (registrar evento logístico), HU-03 (consultar estado)
**Uso:** pegar en el cuadro "Describe your idea and make it come to life" de Figma, o en Figma Make.

---

## Prompt (versión para pegar, un bloque)

```
Crea un prototipo web navegable de alta fidelidad, en español, para el "Sistema de Tracking Logístico" (plataforma de rastreo de envíos tipo FedEx). Tres audiencias: (a) operador de logística en el centro de origen, (b) operador de un punto de la cadena (centro de distribución / vehículo), (c) cliente final. Genera estas pantallas y su navegación.

PANTALLA 1 — Registrar envío (HU-01, rol: operador de logística). Formulario en una sola vista, sin recargar, dividido en dos tarjetas: "Remitente" y "Destinatario", cada una con nombre, documento/identificación, teléfono, correo, dirección, ciudad. Debajo, tarjeta "Paquete" con descripción del contenido, peso (kg) y punto de origen (selector con el catálogo de centros). Botón primario "Registrar envío" y botón secundario "Cancelar". Los campos obligatorios llevan asterisco y, si faltan al enviar, se marcan en rojo con el mensaje de error junto al campo (no en un aviso general). Estado de éxito: modal/panel de confirmación que muestra el número de seguimiento generado (formato ejemplo TRK-2026-000123), el estado inicial "Registrado", un botón "Copiar número" y "Registrar otro envío".

PANTALLA 2 — Registrar evento logístico (HU-02, rol: operador de un punto de la cadena). Barra superior con el usuario operador autenticado y su punto asignado. Campo "Número de seguimiento" con botón "Buscar". Al encontrar el envío se muestra una ficha de solo lectura: número, remitente/destinatario (resumidos), estado actual y último movimiento. Debajo, formulario "Nuevo evento": selector de tipo de evento (Recibido en centro, En tránsito, En reparto, Entregado, Incidencia), punto (precargado con el del operador), fecha y hora (por defecto ahora), y notas opcionales. Para "Entregado" aparece un campo extra "Recibido por (nombre)". Botón "Registrar evento". Éxito: confirmación que muestra el nuevo estado del envío y el evento agregado al historial (timeline). Error: número inexistente muestra "No se encontró ningún envío con ese número" sin exponer datos de otros envíos.

PANTALLA 3 — Consultar estado del envío (HU-03, rol: cliente, vista pública sin login). Página limpia tipo landing: título "Rastrea tu envío", un solo campo "Número de seguimiento" y botón "Consultar". Resultado: tarjeta grande con el estado actual destacado (badge de color), el punto y la fecha del último movimiento, y una línea de progreso con las etapas (Registrado → En tránsito → En reparto → Entregado). Debajo, enlace "Ver historial completo" que despliega el timeline cronológico de movimientos (fecha, punto, descripción). Caso "sin movimientos aún": muestra estado "Registrado" y el texto "Aún no registra movimientos". Caso "número inexistente": mensaje "No encontramos ningún envío con ese número. Verifica el número e inténtalo de nuevo." La vista del cliente NO muestra datos personales completos del remitente ni del destinatario (solo ciudad de origen y destino).

NAVEGACIÓN / FLUJO PROTOTIPADO: pantalla de inicio con dos accesos —"Soy operador" (lleva a un login simple y luego a Pantalla 1 / Pantalla 2 según rol) y "Rastrear un envío" (lleva a Pantalla 3). Flujo demo encadenado: registrar envío en P1 → copiar número → usarlo en P2 para registrar "En tránsito" → consultarlo en P3 y ver el estado actualizado y el historial.

SISTEMA VISUAL: estilo profesional y sobrio, apto para uso operativo diario. Color primario azul corporativo, acentos para estados (gris=Registrado, azul=En tránsito, ámbar=En reparto/Incidencia, verde=Entregado, rojo=error). Tipografía sans-serif legible, tamaño base 16px. Componentes reutilizables: campo de texto con label arriba y texto de ayuda/error abajo, botón primario/secundario, badge de estado, tarjeta, timeline, tabla. Modo claro. Grid de 12 columnas, ancho máx 1200px, diseño responsive (una columna en móvil).

ACCESIBILIDAD (WCAG 2.1 AA): contraste de texto mínimo 4.5:1; todos los campos con label visible asociado; foco de teclado visible en cada control interactivo; navegación completa por teclado y orden de tabulación lógico; errores anunciables (texto de error junto al campo, no solo color); área táctil mínima 44x44px; los estados no se comunican solo con color (llevan también texto/ícono); textos alternativos en íconos informativos; encabezados jerárquicos correctos.

SEGURIDAD: las pantallas 1 y 2 requieren inicio de sesión de operador (mostrar pantalla de login y estado "sesión iniciada como…"); cada evento registrado queda con la identidad del operador y fecha/hora (mostrarlo en la ficha del envío); la consulta pública (Pantalla 3) solo pide el número de seguimiento y no expone datos personales ni permite enumerar envíos; mensajes de error genéricos que no revelan si un dato existe más allá de lo necesario; botón de cerrar sesión visible para el operador; aviso de "los eventos no se pueden borrar" en la pantalla 2.

Entrega el prototipo con las pantallas conectadas para poder hacer una demo navegable de las 3 HU.
```

---

## Notas de uso

- Figma Make genera mejor si se ejecuta el prompt completo de una vez. Si el resultado queda incompleto, pedir por partes: primero P3 (más simple), luego P1, luego P2.
- Tras generar: crear un **frame por HU** o marcar en el archivo qué pantalla cubre HU-01 / HU-02 / HU-03.
- **Vincular en Azure DevOps:** en cada User Story (#57 HU-01, #58 HU-02, #59 HU-03) agregar el enlace del archivo Figma en el campo de descripción o como *Link → Hyperlink*.
- Compartir el archivo Figma con permiso de comentario para el docente.
- Accesibilidad y seguridad salen del *documento de lineamientos* del curso (no está en el repo) — revisar ese documento y ajustar el prototipo a sus puntos concretos antes de la review.
