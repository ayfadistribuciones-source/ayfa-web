/*
  AY-FA Distribuciones — Backend (Google Apps Script)
  =====================================================
  Este script recibe los pedidos y registros de clientes desde la web y los
  guarda en dos hojas de este mismo Google Sheet: "Usuarios" y "Pedidos".
  Si esas hojas no existen todavía, las crea solas con los encabezados
  correctos la primera vez que se use cada función.

  Panel de administración (admin.html): permite ver todos los pedidos y
  cambiar su estado desde la web, sin entrar al Google Sheet. Al cambiar el
  estado, se le manda un mail automático al cliente avisándole.
*/

const HOJA_USUARIOS = "Usuarios";
const HOJA_PEDIDOS = "Pedidos";

// Contraseña de administrador (hash SHA-256). La contraseña en texto plano
// es: AyfaAdmin2026  — para cambiarla, generá el hash SHA-256 de la nueva
// contraseña y reemplazá el valor de acá abajo.
const ADMIN_PASSWORD_HASH = "3a26c6444ea3720196e1f4ffc1539056a4e2232bccd104e8d77fe119157c4952";

const COLUMNAS_USUARIOS = [
  "Fecha", "Nombre", "RazonSocial", "Documento", "CondicionIVA",
  "Email", "Telefono", "Direccion", "Localidad", "Zona", "PasswordHash"
];

const COLUMNAS_PEDIDOS = [
  "Numero", "Fecha", "Estado",
  "Nombre", "RazonSocial", "Documento", "CondicionIVA", "Email", "Telefono", "Direccion", "Localidad",
  "TipoEntrega", "DetalleEntrega", "Items", "Notas",
  "Subtotal", "CostoEntrega", "Total"
];

const ESTADOS_PEDIDO = [
  "Nuevo", "Confirmado", "En preparación", "Listo para entrega/retiro", "En camino", "Entregado", "Cancelado"
];

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respuesta({ ok: false, mensaje: "Solicitud inválida." });
  }
  try {
    switch (body.accion) {
      case "registrar": return respuesta(registrar(body.datos || {}));
      case "login": return respuesta(login(body.email, body.password));
      case "pedido": return respuesta(crearPedido(body.pedido || {}));
      case "misPedidos": return respuesta(misPedidos(body.email));
      case "loginAdmin": return respuesta(loginAdmin(body.password));
      case "todosPedidos": return respuesta(todosPedidos(body.adminPassword));
      case "actualizarEstado": return respuesta(actualizarEstado(body.adminPassword, body.numero, body.estado));
      default: return respuesta({ ok: false, mensaje: "Acción no reconocida." });
    }
  } catch (err) {
    return respuesta({ ok: false, mensaje: "Error del servidor: " + err.message });
  }
}

function doGet(e) {
  return ContentService.createTextOutput("AY-FA Distribuciones — backend activo.");
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Devuelve la hoja pedida, creándola con encabezados en negrita si todavía
// no existe (o si está vacía).
function hojaConEncabezados(nombre, columnas) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(nombre);
  if (!hoja) hoja = ss.insertSheet(nombre);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(columnas);
    hoja.getRange(1, 1, 1, columnas.length).setFontWeight("bold");
  }
  return hoja;
}

function buscarUsuarioPorEmail(hoja, email) {
  const datos = hoja.getDataRange().getValues();
  const idxEmail = COLUMNAS_USUARIOS.indexOf("Email");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][idxEmail]).trim().toLowerCase() === String(email).trim().toLowerCase()) {
      return { fila: i + 1, datos: datos[i] };
    }
  }
  return null;
}

function filaAUsuario(fila) {
  const obj = {};
  COLUMNAS_USUARIOS.forEach((col, i) => { obj[col] = fila[i]; });
  return {
    nombre: obj.Nombre || "",
    razonSocial: obj.RazonSocial || "",
    documento: obj.Documento || "",
    condicionIVA: obj.CondicionIVA || "",
    email: obj.Email || "",
    telefono: obj.Telefono || "",
    direccion: obj.Direccion || "",
    localidad: obj.Localidad || "",
    zona: obj.Zona || ""
  };
}

function registrar(datos) {
  if (!datos.email || !datos.password) {
    return { ok: false, mensaje: "Faltan datos obligatorios." };
  }
  const hoja = hojaConEncabezados(HOJA_USUARIOS, COLUMNAS_USUARIOS);
  if (buscarUsuarioPorEmail(hoja, datos.email)) {
    return { ok: false, mensaje: "Ya existe una cuenta creada con ese email." };
  }
  hoja.appendRow([
    new Date(),
    datos.nombre || "",
    datos.razonSocial || "",
    datos.documento || "",
    datos.condicionIVA || "",
    datos.email,
    datos.telefono || "",
    datos.direccion || "",
    datos.localidad || "",
    datos.zona || "",
    datos.password
  ]);
  return {
    ok: true,
    cliente: {
      nombre: datos.nombre || "", razonSocial: datos.razonSocial || "", documento: datos.documento || "",
      condicionIVA: datos.condicionIVA || "", email: datos.email, telefono: datos.telefono || "",
      direccion: datos.direccion || "", localidad: datos.localidad || "", zona: datos.zona || ""
    }
  };
}

function login(email, passwordHash) {
  if (!email || !passwordHash) {
    return { ok: false, mensaje: "Completá email y contraseña." };
  }
  const hoja = hojaConEncabezados(HOJA_USUARIOS, COLUMNAS_USUARIOS);
  const encontrado = buscarUsuarioPorEmail(hoja, email);
  if (!encontrado) {
    return { ok: false, mensaje: "Email o contraseña incorrectos." };
  }
  const idxPass = COLUMNAS_USUARIOS.indexOf("PasswordHash");
  if (String(encontrado.datos[idxPass]) !== String(passwordHash)) {
    return { ok: false, mensaje: "Email o contraseña incorrectos." };
  }
  return { ok: true, cliente: filaAUsuario(encontrado.datos) };
}

function crearPedido(pedido) {
  const hoja = hojaConEncabezados(HOJA_PEDIDOS, COLUMNAS_PEDIDOS);
  const c = pedido.cliente || {};
  const entrega = pedido.entrega || {};
  const detalleEntrega =
    entrega.tipo === "envio" ? (entrega.direccion || "") :
    entrega.tipo === "reparto" ? (entrega.zona || "") : "";

  const items = construirDetalleItemsTexto(pedido.items);

  hoja.appendRow([
    pedido.numero || "",
    pedido.fecha || new Date().toISOString(),
    pedido.estado || "Nuevo",
    c.nombre || "", c.razonSocial || "", c.documento || "", c.condicionIVA || "",
    c.email || "", c.telefono || "", c.direccion || "", c.localidad || "",
    entrega.tipo || "", detalleEntrega, items, pedido.notas || "",
    pedido.subtotal || 0, pedido.costoEntrega || 0, pedido.total || 0
  ]);

  // El pedido ya quedó guardado en la planilla. Si el mail al dueño falla
  // por lo que sea (permisos, cuota, etc.) no queremos que el pedido del
  // cliente falle por eso — solo lo intentamos, sin cortar el flujo.
  try {
    notificarPedidoAlDuenio(pedido);
  } catch (errMail) {
    // Silencioso a propósito.
  }

  return { ok: true };
}

// Arma el texto de cada línea de producto para la hoja "Pedidos" y para el
// mail al dueño, resaltando cuando la línea es una promoción (precio
// promocional plano) o una promo de cantidad tipo "2x1"/"3x2" (en ese caso
// muestra cuántas unidades se pagan y cuántas van sin cargo).
function construirDetalleItemsTexto(items) {
  return (items || []).map(function (it) {
    let promoSufijo = "";
    if (it.tipoPromo === "nxm") {
      const pagadas = it.cantidad - (it.unidadesGratis || 0);
      promoSufijo = " — 🎁 PROMO " + (it.promoTexto || "") + ": paga " + pagadas + " de " + it.cantidad +
        (it.unidadesGratis ? " (" + it.unidadesGratis + " SIN CARGO)" : "");
    } else if (it.esPromo) {
      promoSufijo = " — 🏷️ PRECIO PROMOCIONAL";
    }
    return it.cantidad + "x " + it.nombre + " (SKU " + (it.sku || "-") + ", " + (it.proveedor || "") + ")" +
      " — c/u $" + it.precioUnit + " — subtotal $" + it.subtotal + promoSufijo;
  }).join("\n");
}

// Le manda un mail detallado al dueño (la cuenta con la que se implementó
// este Apps Script) cada vez que entra un pedido nuevo, resaltando si hay
// productos en promoción o con unidades sin cargo (2x1, 3x2, etc.) para
// que no se le pase por alto al armar el pedido.
function notificarPedidoAlDuenio(pedido) {
  const destinatario = Session.getEffectiveUser().getEmail();
  if (!destinatario) return;

  const c = pedido.cliente || {};
  const entrega = pedido.entrega || {};
  const items = pedido.items || [];
  const tieneAlgunaPromo = items.some(function (it) { return it.esPromo || it.tipoPromo === "nxm"; });

  let entregaTexto = "Retiro en depósito";
  if (entrega.tipo === "envio") entregaTexto = "Envío a domicilio — " + (entrega.direccion || "(sin dirección)");
  else if (entrega.tipo === "reparto") entregaTexto = "Reparto local — Zona: " + (entrega.zona || "(sin zona)");

  const cuerpo = [
    "Nuevo pedido: " + (pedido.numero || ""),
    tieneAlgunaPromo ? "\n⚠️ Este pedido tiene productos EN PROMOCIÓN — revisá el detalle abajo.\n" : "",
    "CLIENTE",
    (c.nombre || "") + (c.razonSocial ? " — " + c.razonSocial : ""),
    [c.documento, c.condicionIVA].filter(Boolean).join(" · "),
    c.email || "",
    c.telefono || "",
    [c.direccion, c.localidad].filter(Boolean).join(", "),
    "",
    "ENTREGA",
    entregaTexto,
    "",
    "PRODUCTOS",
    construirDetalleItemsTexto(items),
    "",
    "Subtotal: $" + (pedido.subtotal || 0),
    "Entrega: " + (pedido.costoEntrega ? ("$" + pedido.costoEntrega) : "A coordinar"),
    "TOTAL: $" + (pedido.total || 0),
    pedido.notas ? ("\nNotas del cliente: " + pedido.notas) : ""
  ].join("\n");

  MailApp.sendEmail({
    to: destinatario,
    subject: (tieneAlgunaPromo ? "🎁 " : "🛒 ") + "Nuevo pedido " + (pedido.numero || "") + " — " + (c.nombre || "Cliente"),
    body: cuerpo
  });
}

function misPedidos(email) {
  if (!email) return { ok: false, mensaje: "Falta email." };
  const hoja = hojaConEncabezados(HOJA_PEDIDOS, COLUMNAS_PEDIDOS);
  const datos = hoja.getDataRange().getValues();
  const idxEmail = COLUMNAS_PEDIDOS.indexOf("Email");
  const pedidos = [];
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][idxEmail]).trim().toLowerCase() === String(email).trim().toLowerCase()) {
      const fila = datos[i];
      pedidos.push({
        numero: fila[COLUMNAS_PEDIDOS.indexOf("Numero")],
        fecha: fila[COLUMNAS_PEDIDOS.indexOf("Fecha")],
        estado: fila[COLUMNAS_PEDIDOS.indexOf("Estado")],
        total: fila[COLUMNAS_PEDIDOS.indexOf("Total")],
        items: parseItemsTexto(fila[COLUMNAS_PEDIDOS.indexOf("Items")])
      });
    }
  }
  pedidos.reverse(); // los más recientes primero
  return { ok: true, pedidos };
}

// Interpreta las líneas guardadas por construirDetalleItemsTexto() para
// mostrarlas en "Mis pedidos" y en el panel de admin. Reconoce el formato
// completo (con SKU, precio y, si corresponde, el aviso de promoción) y
// si no matchea (pedidos viejos guardados con un formato anterior) devuelve
// al menos cantidad + nombre para no romper la vista.
function parseItemsTexto(texto) {
  if (!texto) return [];
  const RE_COMPLETA = /^(\d+)x (.+?) \(SKU ([^,]*), ([^)]*)\) — c\/u \$([\d.,]+) — subtotal \$([\d.,]+)(.*)$/;
  return String(texto).split("\n").filter(Boolean).map(linea => {
    const m = linea.match(RE_COMPLETA);
    if (m) {
      return {
        cantidad: Number(m[1]), nombre: m[2], sku: m[3], proveedor: m[4],
        precioUnit: m[5], subtotal: m[6], promo: (m[7] || "").trim()
      };
    }
    const mSimple = linea.match(/^(\d+)x (.+?) \(SKU/);
    return { cantidad: mSimple ? Number(mSimple[1]) : "", nombre: mSimple ? mSimple[2] : linea, promo: "" };
  });
}

// ---------------- Panel de administración ----------------

function loginAdmin(passwordHash) {
  if (!passwordHash || String(passwordHash) !== ADMIN_PASSWORD_HASH) {
    return { ok: false, mensaje: "Contraseña incorrecta." };
  }
  return { ok: true };
}

function todosPedidos(adminPasswordHash) {
  const auth = loginAdmin(adminPasswordHash);
  if (!auth.ok) return auth;

  const hoja = hojaConEncabezados(HOJA_PEDIDOS, COLUMNAS_PEDIDOS);
  const datos = hoja.getDataRange().getValues();
  const pedidos = [];
  for (let i = 1; i < datos.length; i++) {
    const fila = datos[i];
    if (!fila[COLUMNAS_PEDIDOS.indexOf("Numero")]) continue;
    const obj = {};
    COLUMNAS_PEDIDOS.forEach((col, idx) => { obj[col] = fila[idx]; });
    pedidos.push({
      numero: obj.Numero,
      fecha: obj.Fecha,
      estado: obj.Estado,
      nombre: obj.Nombre,
      razonSocial: obj.RazonSocial,
      documento: obj.Documento,
      condicionIVA: obj.CondicionIVA,
      email: obj.Email,
      telefono: obj.Telefono,
      direccion: obj.Direccion,
      localidad: obj.Localidad,
      tipoEntrega: obj.TipoEntrega,
      detalleEntrega: obj.DetalleEntrega,
      items: parseItemsTexto(obj.Items),
      notas: obj.Notas,
      subtotal: obj.Subtotal,
      costoEntrega: obj.CostoEntrega,
      total: obj.Total
    });
  }
  pedidos.reverse();
  return { ok: true, pedidos, estados: ESTADOS_PEDIDO };
}

function actualizarEstado(adminPasswordHash, numero, estado) {
  const auth = loginAdmin(adminPasswordHash);
  if (!auth.ok) return auth;
  if (!numero || !estado) return { ok: false, mensaje: "Faltan datos." };

  const hoja = hojaConEncabezados(HOJA_PEDIDOS, COLUMNAS_PEDIDOS);
  const datos = hoja.getDataRange().getValues();
  const idxNumero = COLUMNAS_PEDIDOS.indexOf("Numero");
  const idxEstado = COLUMNAS_PEDIDOS.indexOf("Estado");
  const idxEmail = COLUMNAS_PEDIDOS.indexOf("Email");
  const idxNombre = COLUMNAS_PEDIDOS.indexOf("Nombre");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][idxNumero]) === String(numero)) {
      const filaSheet = i + 1;
      hoja.getRange(filaSheet, idxEstado + 1).setValue(estado);
      const email = datos[i][idxEmail];
      const nombre = datos[i][idxNombre];
      if (email) {
        try {
          notificarCliente(email, nombre, numero, estado);
        } catch (errMail) {
          // Si falla el envío del mail, igual dejamos el estado actualizado.
        }
      }
      return { ok: true };
    }
  }
  return { ok: false, mensaje: "No se encontró el pedido " + numero + "." };
}

function notificarCliente(email, nombre, numero, estado) {
  const asunto = "Tu pedido " + numero + " — AY-FA Distribuciones";
  const cuerpo =
    "Hola " + (nombre || "") + ",\n\n" +
    "Tu pedido " + numero + " cambió de estado a: " + estado + ".\n\n" +
    "Podés ver el detalle completo entrando a \"Mis pedidos\" en la web de AY-FA Distribuciones.\n\n" +
    "Gracias por tu compra.\nAY-FA Distribuciones";
  MailApp.sendEmail(email, asunto, cuerpo);
}
