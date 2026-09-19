/**
 * Backend de mentira para probar el área de operadores.
 *
 * Existe porque el backend con `/api/ciudades`, `tipoDocumento` y `ocurridoEn` todavía no está
 * en el repositorio, y contra el servicio desplegado no se escribe: usa la base real. Imita el
 * contrato de docs/contrato-ui.md, incluidas las respuestas 202 con retraso, para poder recorrer
 * HU-01 y HU-02 de punta a punta sin tocar nada de verdad.
 *
 *   node mock/servidor.mjs            # escucha en 8099
 *   PUERTO=9000 node mock/servidor.mjs
 *
 * Usuarios: operador/operador123 (OPERADOR) y admin/admin123 (ADMIN OPERADOR).
 */
import { createServer } from "node:http";

const PUERTO = Number(process.env.PUERTO ?? 8099);
const RETRASO_PROCESAMIENTO = Number(process.env.RETRASO_MS ?? 900);

const USUARIOS = {
  operador: { clave: "operador123", roles: "OPERADOR" },
  admin: { clave: "admin123", roles: "ADMIN OPERADOR" },
};

const CIUDADES = [
  { id: 1, nombre: "MEDELLÍN", departamento: "ANTIOQUIA" },
  { id: 2, nombre: "ENVIGADO", departamento: "ANTIOQUIA" },
  { id: 3, nombre: "BELLO", departamento: "ANTIOQUIA" },
  { id: 4, nombre: "CALI", departamento: "VALLE DEL CAUCA" },
  { id: 5, nombre: "PALMIRA", departamento: "VALLE DEL CAUCA" },
  { id: 6, nombre: "BARRANQUILLA", departamento: "ATLÁNTICO" },
  { id: 7, nombre: "CARTAGENA", departamento: "BOLÍVAR" },
  { id: 8, nombre: "BUCARAMANGA", departamento: "SANTANDER" },
  { id: 9, nombre: "PEREIRA", departamento: "RISARALDA" },
  { id: 10, nombre: "BOGOTÁ", departamento: "CUNDINAMARCA" },
  { id: 11, nombre: "CAJICÁ", departamento: "CUNDINAMARCA" },
  { id: 12, nombre: "DUITAMA", departamento: "BOYACÁ" },
].map((c) => ({ ...c, etiqueta: `${c.nombre} - ${c.departamento}` }));

const RESULTANTE = {
  RECEIVED_AT_CENTER: "AT_DISTRIBUTION_CENTER",
  DISPATCHED: "IN_TRANSIT",
  ARRIVED_AT_DESTINATION_CENTER: "AT_DISTRIBUTION_CENTER",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
};

// --- Estado en memoria; se pierde al parar el proceso, que es justo lo que queremos. ---

let siguienteGuia = 4;
let siguienteEvento = 100;
const envios = new Map();

function sembrar() {
  const base = Date.parse("2026-09-16T19:35:21Z");
  crearSemilla("TF000000000001", 10, base, []);
  crearSemilla("TF000000000002", 10, base + 2000, [
    { tipo: "RECEIVED_AT_CENTER", punto: "Centro de distribución Medellín", desfase: 4000 },
    { tipo: "DISPATCHED", punto: "Ruta Medellín - Bogotá", desfase: 6000 },
  ]);
  crearSemilla("TF000000000003", 10, base + 3000, [
    { tipo: "RECEIVED_AT_CENTER", punto: "Centro de distribución Cali", desfase: 4000 },
    { tipo: "OUT_FOR_DELIVERY", punto: "Reparto Cali norte", desfase: 6000 },
    { tipo: "DELIVERED", punto: "Dirección del destinatario", desfase: 8000 },
  ]);
}

function crearSemilla(trackingNumber, ciudadId, registrado, movimientos) {
  const ciudad = CIUDADES.find((c) => c.id === ciudadId);
  const envio = {
    trackingNumber,
    estado: "REGISTERED",
    ciudadDestinoId: ciudad.id,
    ciudadDestino: ciudad.etiqueta,
    registeredAt: new Date(registrado).toISOString(),
    eventos: [],
  };
  for (const m of movimientos) {
    const ocurridoEn = new Date(registrado + m.desfase).toISOString();
    envio.eventos.push({
      id: siguienteEvento++,
      trackingNumber,
      tipo: m.tipo,
      estadoResultante: RESULTANTE[m.tipo],
      punto: m.punto,
      observaciones: null,
      ocurridoEn,
      registradoEn: ocurridoEn,
    });
    envio.estado = RESULTANTE[m.tipo];
  }
  envios.set(trackingNumber, envio);
}

sembrar();

// --- Utilidades HTTP ---

function responder(res, estado, cuerpo) {
  const texto = cuerpo === undefined ? "" : JSON.stringify(cuerpo);
  res.writeHead(estado, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(texto);
}

/** Mismo formato que el ProblemDetail de Spring, que es lo que espera el frontend. */
function problema(res, estado, titulo, detalle, extra = {}) {
  responder(res, estado, { status: estado, title: titulo, detail: detalle, ...extra });
}

function base64url(objeto) {
  return Buffer.from(JSON.stringify(objeto)).toString("base64url");
}

function emitirToken(usuario, roles) {
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = base64url({ alg: "HS256", typ: "JWT" });
  const carga = base64url({
    iss: "trackflow-mock",
    sub: usuario,
    roles, // separado por espacios, igual que el backend real
    iat: ahora,
    exp: ahora + 60 * 60,
  });
  // El frontend solo decodifica el payload; la firma la verifica el backend de verdad.
  return `${cabecera}.${carga}.firma-de-mentira`;
}

function sesionDe(req) {
  const cabecera = req.headers.authorization;
  if (!cabecera?.startsWith("Bearer ")) return null;
  try {
    const carga = JSON.parse(Buffer.from(cabecera.slice(7).split(".")[1], "base64url").toString());
    if (typeof carga.exp === "number" && carga.exp * 1000 < Date.now()) return null;
    return { usuario: carga.sub, roles: String(carga.roles ?? "").split(/[\s,]+/).filter(Boolean) };
  } catch {
    return null;
  }
}

function leerCuerpo(req) {
  return new Promise((resolve, reject) => {
    let datos = "";
    req.on("data", (trozo) => {
      datos += trozo;
      if (datos.length > 1e6) reject(new Error("cuerpo demasiado grande"));
    });
    req.on("end", () => {
      if (!datos.trim()) return resolve({});
      try {
        resolve(JSON.parse(datos));
      } catch {
        reject(new Error("json inválido"));
      }
    });
    req.on("error", reject);
  });
}

// --- Validación, con las mismas claves anidadas que manda el backend ---

const CAMPOS_PERSONA = {
  nombreCompleto: "el nombre completo es obligatorio",
  tipoDocumento: "el tipo de documento es obligatorio",
  numeroDocumento: "el número de documento es obligatorio",
  telefono: "el teléfono es obligatorio",
  direccion: "la dirección es obligatoria",
  ciudadId: "la ciudad es obligatoria",
};

function validarPersona(persona, prefijo, faltantes) {
  if (!persona || typeof persona !== "object") {
    faltantes[prefijo] = `los datos del ${prefijo} son obligatorios`;
    return;
  }
  for (const [campo, mensaje] of Object.entries(CAMPOS_PERSONA)) {
    const valor = persona[campo];
    const vacio = campo === "ciudadId" ? !Number.isInteger(valor) : !String(valor ?? "").trim();
    if (vacio) faltantes[`${prefijo}.${campo}`] = mensaje;
  }
  if (Number.isInteger(persona.ciudadId) && !CIUDADES.some((c) => c.id === persona.ciudadId)) {
    faltantes[`${prefijo}.ciudadId`] = "la ciudad indicada no existe en el catálogo";
  }
}

// --- Rutas ---

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PUERTO}`);
  const ruta = url.pathname;

  if (req.method === "OPTIONS") return responder(res, 204);

  console.log(`${req.method} ${ruta}${url.search}`);

  if (req.method === "GET" && ruta === "/actuator/health") {
    return responder(res, 200, { status: "UP" });
  }

  if (req.method === "POST" && ruta === "/api/auth/login") {
    const cuerpo = await leerCuerpo(req).catch(() => ({}));
    const usuario = USUARIOS[cuerpo.usuario];
    if (!usuario || usuario.clave !== cuerpo.clave) {
      return problema(res, 401, "Unauthorized", "Usuario o clave incorrectos");
    }
    return responder(res, 200, {
      token: emitirToken(cuerpo.usuario, usuario.roles),
      tipo: "Bearer",
      roles: usuario.roles,
      expiraEnSegundos: 3600,
    });
  }

  if (req.method === "GET" && ruta === "/api/ciudades") {
    const q = url.searchParams.get("q");
    if (!q) return problema(res, 400, "Bad Request", "Required parameter 'q' is not present.");
    const termino = q
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    const coincide = CIUDADES.filter((c) =>
      c.etiqueta
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .includes(termino),
    ).slice(0, 10);
    return responder(res, 200, coincide);
  }

  const rastreo = ruta.match(/^\/api\/tracking\/([^/]+)$/);
  if (req.method === "GET" && rastreo) {
    const guia = decodeURIComponent(rastreo[1]);
    const envio = envios.get(guia);
    if (!envio || envio.pendiente) {
      return problema(
        res,
        404,
        "Not Found",
        `No se encontró ningún envío con el número de seguimiento ${guia}`,
      );
    }
    const visibles = envio.eventos.filter((e) => !e.pendiente);
    const ultimo = visibles.at(-1);
    return responder(res, 200, {
      trackingNumber: envio.trackingNumber,
      estado: envio.estado,
      ciudadDestinoId: envio.ciudadDestinoId,
      ciudadDestino: envio.ciudadDestino,
      registeredAt: envio.registeredAt,
      tieneMovimientos: visibles.length > 0,
      ultimoPunto: ultimo?.punto ?? null,
      ultimoMovimientoAt: ultimo?.ocurridoEn ?? null,
    });
  }

  const eventos = ruta.match(/^\/api\/shipments\/([^/]+)\/events$/);
  if (eventos) {
    const guia = decodeURIComponent(eventos[1]);

    if (req.method === "GET") {
      const envio = envios.get(guia);
      if (!envio || envio.pendiente) {
        return problema(
          res,
          404,
          "Not Found",
          `No se encontró ningún envío con el número de seguimiento ${guia}`,
        );
      }
      const visibles = envio.eventos
        .filter((e) => !e.pendiente)
        .map((e) => {
          const visible = { ...e };
          delete visible.pendiente;
          return visible;
        })
        .sort((a, b) => a.ocurridoEn.localeCompare(b.ocurridoEn));
      return responder(res, 200, visibles);
    }

    if (req.method === "POST") {
      const sesion = sesionDe(req);
      if (!sesion) return problema(res, 401, "Unauthorized", "Se requiere un token de operador");

      const cuerpo = await leerCuerpo(req).catch(() => ({}));
      const faltantes = {};
      if (!cuerpo.tipo) faltantes.tipo = "el tipo de evento es obligatorio";
      else if (!RESULTANTE[cuerpo.tipo]) faltantes.tipo = "el tipo de evento no es válido";
      if (!String(cuerpo.punto ?? "").trim()) {
        faltantes.punto = "el punto de la cadena logística es obligatorio";
      }
      if (Object.keys(faltantes).length > 0) {
        return problema(
          res,
          400,
          "Datos obligatorios incompletos",
          "La solicitud no se puede procesar porque faltan datos obligatorios",
          { camposFaltantes: faltantes },
        );
      }

      const envio = envios.get(guia);
      if (!envio || envio.pendiente) {
        return problema(
          res,
          404,
          "Not Found",
          `No se encontró ningún envío con el número de seguimiento ${guia}`,
        );
      }

      const ocurridoEn = cuerpo.ocurridoEn ? new Date(cuerpo.ocurridoEn) : new Date();
      if (Number.isNaN(ocurridoEn.getTime())) {
        return problema(res, 400, "Bad Request", "La fecha del evento no es válida");
      }
      if (ocurridoEn.getTime() > Date.now() + 60_000) {
        return problema(res, 400, "Bad Request", "La fecha del evento no puede estar en el futuro");
      }

      const evento = {
        id: siguienteEvento++,
        trackingNumber: guia,
        tipo: cuerpo.tipo,
        estadoResultante: RESULTANTE[cuerpo.tipo],
        punto: cuerpo.punto.trim(),
        observaciones: cuerpo.observaciones?.trim() || null,
        ocurridoEn: ocurridoEn.toISOString(),
        registradoEn: new Date().toISOString(),
        pendiente: true,
      };
      envio.eventos.push(evento);

      // 202: el registro ocurre al consumir la cola, así que el dato aparece más tarde.
      setTimeout(() => {
        evento.pendiente = false;
        const visibles = envio.eventos.filter((e) => !e.pendiente);
        visibles.sort((a, b) => a.ocurridoEn.localeCompare(b.ocurridoEn));
        envio.estado = visibles.at(-1).estadoResultante;
        console.log(`  → evento ${evento.id} procesado; ${guia} queda en ${envio.estado}`);
      }, RETRASO_PROCESAMIENTO);

      return responder(res, 202, {
        eventId: String(evento.id),
        trackingNumber: guia,
        tipo: evento.tipo,
        punto: evento.punto,
        ocurridoEn: evento.ocurridoEn,
        estadoProcesamiento: "ENCOLADO",
      });
    }
  }

  if (req.method === "POST" && ruta === "/api/shipments") {
    const sesion = sesionDe(req);
    if (!sesion) return problema(res, 401, "Unauthorized", "Se requiere un token de operador");

    const cuerpo = await leerCuerpo(req).catch(() => ({}));
    const faltantes = {};
    validarPersona(cuerpo.remitente, "remitente", faltantes);
    validarPersona(cuerpo.destinatario, "destinatario", faltantes);
    if (!String(cuerpo.descripcion ?? "").trim()) {
      faltantes.descripcion = "la descripción del paquete es obligatoria";
    }
    if (Object.keys(faltantes).length > 0) {
      return problema(
        res,
        400,
        "Datos obligatorios incompletos",
        "La solicitud no se puede procesar porque faltan datos obligatorios",
        { camposFaltantes: faltantes },
      );
    }

    const trackingNumber = `TF${String(siguienteGuia++).padStart(12, "0")}`;
    const ciudad = CIUDADES.find((c) => c.id === cuerpo.destinatario.ciudadId);
    envios.set(trackingNumber, {
      trackingNumber,
      estado: "REGISTERED",
      ciudadDestinoId: ciudad.id,
      ciudadDestino: ciudad.etiqueta,
      registeredAt: new Date().toISOString(),
      eventos: [],
      pendiente: true,
    });

    setTimeout(() => {
      envios.get(trackingNumber).pendiente = false;
      console.log(`  → envío ${trackingNumber} procesado`);
    }, RETRASO_PROCESAMIENTO);

    return responder(res, 202, {
      trackingNumber,
      eventId: `evt-${trackingNumber}`,
      destinatario: cuerpo.destinatario.nombreCompleto,
      ciudadDestino: ciudad.etiqueta,
      solicitadoEn: new Date().toISOString(),
      estadoProcesamiento: "ENCOLADO",
    });
  }

  if (req.method === "POST" && ruta === "/api/admin/reconstruir-proyecciones") {
    const sesion = sesionDe(req);
    if (!sesion) return problema(res, 401, "Unauthorized", "Se requiere un token de operador");
    if (!sesion.roles.includes("ADMIN")) {
      return problema(res, 403, "Forbidden", "Esta operación requiere rol de administrador");
    }
    const totalEventos = [...envios.values()].reduce((n, e) => n + e.eventos.length, 0);
    return responder(res, 200, { enviosRepublicados: envios.size, eventosRepublicados: totalEventos });
  }

  problema(res, 404, "Not Found", `No hay ninguna ruta ${req.method} ${ruta}`);
});

servidor.listen(PUERTO, () => {
  console.log(`Mock de TrackFlow en http://localhost:${PUERTO}`);
  console.log("  operador/operador123  ·  admin/admin123");
  console.log(`  guías semilla: ${[...envios.keys()].join(", ")}`);
  console.log(`  las escrituras tardan ${RETRASO_PROCESAMIENTO} ms en reflejarse (simula la cola)`);
});
