/*
  CONFIGURACIÓN CENTRAL DE AY-FA DISTRIBUCIONES
  ================================================
  Acá se conecta la web con tu Google Sheet (precios/stock en vivo) y con el
  Google Apps Script (que guarda registros de clientes y pedidos).

  Mientras SHEET_ID esté vacío, la web usa el catálogo de ejemplo en
  /data/productos.json. En cuanto completes los datos de abajo, la web
  empieza a leer tu planilla real automáticamente. Ver INSTRUCCIONES.md.
*/

const AYFA_CONFIG = {
  // 1) ID de tu Google Sheet (lo sacás de la URL de la planilla, la parte
  //    larga entre /d/ y /edit). Dejalo vacío ("") para usar datos de ejemplo.
  SHEET_ID: "1ScLpisoteStd_VdAJi4RHxK-lEZ4Bsh93IHbh5xZ0bE",

  // 2) Nombres exactos de las hojas/pestañas con productos. Usá una pestaña
  //    por proveedor así pegás cada lista de PDF por separado, sin mezclarlas
  //    ni reformatearlas a mano — la web las junta solas para armar el
  //    catálogo. Agregá o sacá nombres de esta lista según cuántos
  //    proveedores tengas (podés tener 2, 3, o los que necesites).
  SHEET_TABS_PRODUCTOS: ["AyFa", "Ramseyer"],

  // 3) URL del Google Apps Script publicado como "Aplicación web" (ver
  //    INSTRUCCIONES.md). Se usa para guardar registros de clientes y pedidos.
  //    Dejalo vacío ("") para que el sitio guarde todo localmente en el
  //    navegador (modo demo, sin backend).
  APPS_SCRIPT_URL: "",

  // 4) Datos de contacto y de la empresa
  EMPRESA: {
    nombre: "AY-FA Distribuciones",
    whatsapp: "5493400000000", // reemplazar por el número real, con código de país sin +
    email: "pedidos@ayfadistribuciones.com.ar",
    direccionRetiro: "Depósito AY-FA — Dirección a confirmar",
    horarios: "Lunes a Viernes 8 a 18 hs · Sábados 8 a 13 hs"
  },

  // 5) Zonas donde ofrecen reparto local propio (aparecen como opción en el checkout)
  ZONAS_REPARTO_LOCAL: [
    "Centro",
    "Zona Norte",
    "Zona Sur",
    "Zona Oeste"
  ],

  // 6) Costo de envío (se puede dejar en 0 y coordinar el costo por WhatsApp)
  COSTO_ENVIO: 0,
  COSTO_REPARTO_LOCAL: 0,

  // 7) Monto de compra mínima (0 = sin mínimo)
  COMPRA_MINIMA: 0
};
