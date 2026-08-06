/*
  AY-FA DISTRIBUCIONES — Google Apps Script (backend gratuito)
  ================================================================
  Este script convierte tu Google Sheet en una mini base de datos para la
  web: guarda los clientes que se registran y los pedidos que hacen.

  CÓMO INSTALARLO (ver también INSTRUCCIONES.md):
  1. Abrí tu Google Sheet (el mismo donde tenés/vas a tener la hoja "Productos").
  2. Menú Extensiones → Apps Script.
  3. Borrá el contenido de Code.gs que aparece por defecto y pegá TODO este archivo.
  4. Guardá (ícono de disco).
  5. Arriba a la derecha: Implementar → Nueva implementación.
     - Tipo: "Aplicación web"
     - Ejecutar como: "Yo (tu cuenta)"
     - Quién tiene acceso: "Cualquier usuario"
  6. Autorizá los permisos que pida Google (es tu propia planilla).
  7. Copiá la URL que te da ("URL de la aplicación web") y pegala en
     js/config.js, en APPS_SCRIPT_URL.
  8. Cada vez que cambies el código, tenés que hacer "Nueva implementación"
     de nuevo (o "Gestionar implementaciones" → editar → nueva versión).

  Este script crea automáticamente, si no existen, las hojas "Usuarios" y
  "Pedidos" la primera vez que alguien se registra o hace un pedido.
*/

function doPost(e) {
  var resultado;
  try {
    var body = JSON.parse(e.postData.contents);
    var accion = body.accion;

    if (accion === "registrar") resultado = registrarCliente(body.cliente);
    else if (accion === "login") resultado = loginCliente(body.email, body.passwordHash);
    else if (accion === "pedido") resultado = crearPedido(body.pedido);
    else if (accion === "misPedidos") resultado = obtenerPedidos(body.email);
    else resultado = { ok: false, mensaje: "Acción no reconocida." };
  } catch (err) {
    resultado = { ok: false, mensaje: "Error en el servidor: " + err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(resultado)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, mensaje: "AY-FA backend activo." })).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Utilidades de hojas ----------

var ENCABEZADOS_USUARIOS = ["Fecha", "Nombre", "Apellido", "Email", "Telefono", "Direccion", "Localidad", "TipoCliente", "CuitDni", "Zona", "PasswordHash"];
var ENCABEZADOS_PEDIDOS = ["Numero", "Fecha", "Estado", "ClienteNombre", "ClienteApellido", "ClienteEmail", "ClienteTelefono", "TipoEntrega", "Zona", "DireccionEnvio", "Items", "Total"];

function obtenerHoja(nombre, encabezados) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
    hoja.appendRow(encabezados);
    hoja.getRange(1, 1, 1, encabezados.length).setFontWeight("bold");
  }
  return hoja;
}

function filasComoObjetos(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var objetos = [];
  for (var i = 1; i < datos.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = datos[i][j];
    obj._fila = i + 1;
    objetos.push(obj);
  }
  return objetos;
}

// ---------- Clientes ----------

function registrarCliente(cliente) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var hoja = obtenerHoja("Usuarios", ENCABEZADOS_USUARIOS);
    var existentes = filasComoObjetos(hoja);
    var yaExiste = existentes.some(function (u) {
      return String(u.Email).toLowerCase() === String(cliente.email).toLowerCase();
    });
    if (yaExiste) return { ok: false, mensaje: "Ya existe una cuenta registrada con ese email." };

    hoja.appendRow([
      new Date(), cliente.nombre || "", cliente.apellido || "", cliente.email || "",
      cliente.telefono || "", cliente.direccion || "", cliente.localidad || "",
      cliente.tipoCliente || "", cliente.cuitDni || "", cliente.zona || "", cliente.passwordHash || ""
    ]);

    var clienteSinPass = Object.assign({}, cliente);
    delete clienteSinPass.passwordHash;
    return { ok: true, cliente: clienteSinPass };
  } finally {
    lock.releaseLock();
  }
}

function loginCliente(email, passwordHash) {
  var hoja = obtenerHoja("Usuarios", ENCABEZADOS_USUARIOS);
  var usuarios = filasComoObjetos(hoja);
  var encontrado = usuarios.find(function (u) {
    return String(u.Email).toLowerCase() === String(email).toLowerCase() && String(u.PasswordHash) === String(passwordHash);
  });
  if (!encontrado) return { ok: false, mensaje: "Email o contraseña incorrectos." };

  return {
    ok: true,
    cliente: {
      nombre: encontrado.Nombre, apellido: encontrado.Apellido, email: encontrado.Email,
      telefono: encontrado.Telefono, direccion: encontrado.Direccion, localidad: encontrado.Localidad,
      tipoCliente: encontrado.TipoCliente, cuitDni: encontrado.CuitDni, zona: encontrado.Zona
    }
  };
}

// ---------- Pedidos ----------

function crearPedido(pedido) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var hoja = obtenerHoja("Pedidos", ENCABEZADOS_PEDIDOS);
    hoja.appendRow([
      pedido.numero, pedido.fecha, pedido.estado || "Nuevo",
      pedido.cliente.nombre || "", pedido.cliente.apellido || "", pedido.cliente.email || "", pedido.cliente.telefono || "",
      pedido.tipoEntrega || "", pedido.zona || "", pedido.direccionEnvio || "",
      JSON.stringify(pedido.items || []), pedido.total || 0
    ]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function obtenerPedidos(email) {
  var hoja = obtenerHoja("Pedidos", ENCABEZADOS_PEDIDOS);
  var filas = filasComoObjetos(hoja);
  var pedidos = filas
    .filter(function (p) { return String(p.ClienteEmail).toLowerCase() === String(email).toLowerCase(); })
    .map(function (p) {
      var items = [];
      try { items = JSON.parse(p.Items); } catch (e) {}
      return {
        numero: p.Numero, fecha: p.Fecha, estado: p.Estado, tipoEntrega: p.TipoEntrega,
        zona: p.Zona, direccionEnvio: p.DireccionEnvio, items: items, total: p.Total,
        cliente: { nombre: p.ClienteNombre, apellido: p.ClienteApellido, email: p.ClienteEmail, telefono: p.ClienteTelefono }
      };
    })
    .reverse();
  return { ok: true, pedidos: pedidos };
}
