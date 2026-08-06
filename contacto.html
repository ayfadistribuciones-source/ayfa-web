/*
  datos.js — Obtiene el catálogo de productos.
  Si AYFA_CONFIG.SHEET_ID está configurado, lee en vivo desde el Google Sheet
  publicado (vía el endpoint gviz, que no requiere API key). Si no, usa el
  archivo /data/productos.json de ejemplo.
*/

const AyfaDatos = (function () {
  const CACHE_KEY = "ayfa_productos_cache_v1";
  const CACHE_MS = 3 * 60 * 1000; // 3 minutos

  function parseCSV(texto) {
    // Parser CSV simple que soporta comas dentro de comillas.
    const filas = [];
    let fila = [], campo = "", enComillas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (enComillas) {
        if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') { enComillas = false; }
        else { campo += c; }
      } else {
        if (c === '"') enComillas = true;
        else if (c === ',') { fila.push(campo); campo = ""; }
        else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
        else if (c === '\r') { /* ignorar */ }
        else { campo += c; }
      }
    }
    if (campo.length || fila.length) { fila.push(campo); filas.push(fila); }
    return filas.filter(f => f.some(x => x !== ""));
  }

  // nombreProveedor = nombre de la pestaña de donde salió esta lista (se usa
  // como proveedor si la fila no tiene su propia columna "Proveedor").
  function normalizarFilas(filas, nombreProveedor) {
    if (!filas.length) return [];
    const headers = filas[0].map(h => h.trim());
    const idx = (nombre) => headers.findIndex(h => h.toLowerCase() === nombre.toLowerCase());
    const iSKU = idx("SKU"), iProd = idx("Producto"), iCat = idx("Categoria"),
      iMarca = idx("Marca"), iPres = idx("Presentacion"), iPrecio = idx("Precio"),
      iStock = idx("Stock"), iPromo = idx("Promo"), iPrecioPromo = idx("PrecioPromo"),
      iImg = idx("Imagen"), iDest = idx("Destacado"), iProv = idx("Proveedor");

    const productos = [];
    for (let r = 1; r < filas.length; r++) {
      const f = filas[r];
      if (!f[iProd]) continue;
      const precio = parseFloat(String(f[iPrecio] || "0").replace(/[^0-9.,-]/g, "").replace(",", "."));
      // Stock vacío/sin columna = "no lo estamos controlando puntualmente" (se
      // muestra "Disponible" en vez de "Sin stock"). Solo si ponen 0 a propósito
      // se muestra "Sin stock".
      const stockTexto = (iStock >= 0 ? f[iStock] : "");
      const stock = (stockTexto === undefined || stockTexto === null || String(stockTexto).trim() === "")
        ? null
        : (parseInt(String(stockTexto).replace(/[^0-9-]/g, ""), 10) || 0);
      const precioPromo = f[iPrecioPromo] ? parseFloat(String(f[iPrecioPromo]).replace(/[^0-9.,-]/g, "").replace(",", ".")) : null;
      const sku = (f[iSKU] || "").trim();
      const proveedor = (iProv >= 0 && f[iProv]) ? f[iProv].trim() : nombreProveedor;
      productos.push({
        id: proveedor + "::" + (sku || ("fila" + r)),
        sku, proveedor,
        nombre: (f[iProd] || "").trim(),
        categoria: (f[iCat] || "Otros").trim(),
        marca: (f[iMarca] || "").trim(),
        presentacion: (f[iPres] || "").trim(),
        precio: isNaN(precio) ? 0 : precio,
        stock,
        promo: (f[iPromo] || "").trim(),
        precioPromo: precioPromo && !isNaN(precioPromo) ? precioPromo : null,
        imagen: (f[iImg] || "").trim(),
        destacado: (f[iDest] || "").trim().toUpperCase() === "SI"
      });
    }
    return productos;
  }

  function normalizarJSON(json) {
    return (json.productos || []).map((p, i) => {
      const sku = String(p.SKU || "").trim();
      const proveedor = p.Proveedor || "Catálogo de ejemplo";
      return {
        id: proveedor + "::" + (sku || ("fila" + i)),
        sku, proveedor,
        nombre: p.Producto || "",
        categoria: p.Categoria || "Otros",
        marca: p.Marca || "",
        presentacion: p.Presentacion || "",
        precio: Number(p.Precio) || 0,
        stock: (p.Stock === "" || p.Stock === undefined || p.Stock === null) ? null : (Number(p.Stock) || 0),
        promo: p.Promo || "",
        precioPromo: p.PrecioPromo ? Number(p.PrecioPromo) : null,
        imagen: p.Imagen || "",
        destacado: String(p.Destacado || "").toUpperCase() === "SI"
      };
    });
  }

  async function obtenerDeUnaHoja(nombreHoja) {
    const url = `https://docs.google.com/spreadsheets/d/${AYFA_CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombreHoja)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`No se pudo leer la hoja "${nombreHoja}" del Google Sheet`);
    const texto = await res.text();
    return normalizarFilas(parseCSV(texto), nombreHoja);
  }

  // Lee TODAS las pestañas listadas en SHEET_TABS_PRODUCTOS y las combina en
  // un solo catálogo. Si alguna pestaña falla (ej. todavía no la creaste),
  // se ignora esa y se sigue con las demás en vez de romper todo el sitio.
  async function obtenerDesdeSheet() {
    const tabs = AYFA_CONFIG.SHEET_TABS_PRODUCTOS && AYFA_CONFIG.SHEET_TABS_PRODUCTOS.length
      ? AYFA_CONFIG.SHEET_TABS_PRODUCTOS
      : ["Productos"];
    const resultados = await Promise.allSettled(tabs.map(obtenerDeUnaHoja));
    let productos = [];
    let algunaOk = false;
    resultados.forEach((r, i) => {
      if (r.status === "fulfilled") { productos = productos.concat(r.value); algunaOk = true; }
      else console.warn(`No se pudo leer la pestaña "${tabs[i]}":`, r.reason);
    });
    if (!algunaOk) throw new Error("No se pudo leer ninguna pestaña de productos del Google Sheet");
    return productos;
  }

  async function obtenerDesdeJSON() {
    const res = await fetch("data/productos.json", { cache: "no-store" });
    const json = await res.json();
    return normalizarJSON(json);
  }

  async function obtenerProductos({ forzar = false } = {}) {
    if (!forzar) {
      try {
        const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
        if (cache && Date.now() - cache.t < CACHE_MS) return cache.data;
      } catch (e) { /* sin cache */ }
    }
    let productos = [];
    try {
      if (AYFA_CONFIG.SHEET_ID) {
        productos = await obtenerDesdeSheet();
      } else {
        productos = await obtenerDesdeJSON();
      }
    } catch (e) {
      console.warn("Fallo al leer Google Sheet, usando catálogo de ejemplo.", e);
      productos = await obtenerDesdeJSON();
    }
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: productos })); } catch (e) {}
    return productos;
  }

  function porId(productos, id) {
    return productos.find(p => p.id === id);
  }

  // stock === null significa "no tenemos el dato exacto" (ej. la lista del
  // proveedor no trae columna de stock): se muestra como disponible, sin
  // limitar la cantidad a comprar.
  function estadoStock(stock) {
    if (stock === null || stock === undefined) return { texto: "Disponible", clase: "stock-ok" };
    if (stock <= 0) return { texto: "Sin stock", clase: "stock-sin" };
    if (stock <= 10) return { texto: `Stock bajo (${stock})`, clase: "stock-bajo" };
    return { texto: `En stock (${stock})`, clase: "stock-ok" };
  }

  function formatoPrecio(n) {
    return "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  return { obtenerProductos, porId, estadoStock, formatoPrecio };
})();
