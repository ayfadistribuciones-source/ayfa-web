/*
  catalogo.js — Lógica de la página de catálogo: filtros, búsqueda, orden
  y renderizado de la grilla de productos.
*/
(function () {
  let TODOS = [];
  let filtroCategorias = new Set();
  let filtroProveedores = new Set();
  let filtroSoloOferta = false;
  let filtroSoloStock = false;
  let texto = "";
  let orden = "relevancia";

  const grid = document.getElementById("productos-grid");
  const catList = document.getElementById("filtro-categorias");
  const provList = document.getElementById("filtro-proveedores");
  const contador = document.getElementById("contador-resultados");

  function renderFiltros() {
    const categorias = [...new Set(TODOS.map(p => p.categoria))].sort();
    catList.innerHTML = categorias.map(c => `
      <label>
        <input type="checkbox" value="${c}" ${filtroCategorias.has(c) ? "checked" : ""}>
        ${c}
      </label>
    `).join("");
    catList.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("change", () => {
        if (inp.checked) filtroCategorias.add(inp.value);
        else filtroCategorias.delete(inp.value);
        render();
      });
    });

    if (provList) {
      const proveedores = [...new Set(TODOS.map(p => p.proveedor))].sort();
      if (proveedores.length <= 1) {
        provList.closest(".grupo").style.display = "none";
      } else {
        provList.closest(".grupo").style.display = "";
        provList.innerHTML = proveedores.map(pr => `
          <label>
            <input type="checkbox" value="${pr}" ${filtroProveedores.has(pr) ? "checked" : ""}>
            ${pr}
          </label>
        `).join("");
        provList.querySelectorAll("input").forEach(inp => {
          inp.addEventListener("change", () => {
            if (inp.checked) filtroProveedores.add(inp.value);
            else filtroProveedores.delete(inp.value);
            render();
          });
        });
      }
    }
  }

  function productoCardHTML(p) {
    const stockInfo = AyfaDatos.estadoStock(p.stock);
    const sinStock = p.stock !== null && p.stock !== undefined && p.stock <= 0;
    const maxAttr = (p.stock !== null && p.stock !== undefined && p.stock > 0) ? `max="${p.stock}"` : "";
    const tienePromo = p.precioPromo && p.precioPromo > 0 && p.precioPromo < p.precio;
    const precioMostrar = tienePromo ? p.precioPromo : p.precio;
    const badge = tienePromo ? (p.promo || "Oferta") : (p.destacado ? "Destacado" : "");
    return `
      <div class="producto-card">
        ${badge ? `<span class="producto-badge">${badge}</span>` : ""}
        <div class="producto-img">${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}">` : "📦"}</div>
        <div class="producto-marca">${p.marca || ""}</div>
        <div class="producto-nombre">${p.nombre}</div>
        <div class="producto-presentacion">${p.presentacion || ""}</div>
        <div class="stock-info ${stockInfo.clase}">${stockInfo.texto}</div>
        <div class="producto-precio-row">
          ${tienePromo ? `<span class="precio-tachado">${AyfaDatos.formatoPrecio(p.precio)}</span>` : ""}
          <span class="precio">${AyfaDatos.formatoPrecio(precioMostrar)}</span>
        </div>
        <div class="add-cart-row" style="margin-top:10px;">
          <input type="number" min="1" value="1" ${maxAttr} class="qty-input" data-qty="${p.id}" ${sinStock ? "disabled" : ""}>
          <button class="btn btn-primary btn-sm" data-agregar="${p.id}" ${sinStock ? "disabled" : ""} style="flex:1;">
            ${sinStock ? "Sin stock" : "Agregar"}
          </button>
        </div>
      </div>
    `;
  }

  function render() {
    let lista = TODOS.slice();

    if (texto) {
      const t = texto.toLowerCase();
      lista = lista.filter(p =>
        p.nombre.toLowerCase().includes(t) ||
        (p.marca || "").toLowerCase().includes(t) ||
        (p.categoria || "").toLowerCase().includes(t)
      );
    }
    if (filtroCategorias.size) lista = lista.filter(p => filtroCategorias.has(p.categoria));
    if (filtroProveedores.size) lista = lista.filter(p => filtroProveedores.has(p.proveedor));
    if (filtroSoloOferta) lista = lista.filter(p => p.precioPromo && p.precioPromo > 0);
    if (filtroSoloStock) lista = lista.filter(p => p.stock === null || p.stock === undefined || p.stock > 0);

    if (orden === "precio-asc") lista.sort((a, b) => (a.precioPromo || a.precio) - (b.precioPromo || b.precio));
    else if (orden === "precio-desc") lista.sort((a, b) => (b.precioPromo || b.precio) - (a.precioPromo || a.precio));
    else if (orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));

    contador.textContent = `${lista.length} producto${lista.length === 1 ? "" : "s"} encontrado${lista.length === 1 ? "" : "s"}`;

    if (!lista.length) {
      grid.innerHTML = `<div class="vacio-msg" style="grid-column:1/-1;"><div class="icono">🔍</div>No encontramos productos con esos filtros.</div>`;
      return;
    }
    grid.innerHTML = lista.map(productoCardHTML).join("");

    grid.querySelectorAll("[data-agregar]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-agregar");
        const qtyInput = grid.querySelector(`[data-qty="${CSS.escape(id)}"]`);
        const cantidad = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        AyfaCarrito.agregar(id, cantidad);
        ayfaMostrarToast("Se agregó al carrito ✔");
      });
    });
  }

  async function init() {
    grid.innerHTML = `<div class="vacio-msg" style="grid-column:1/-1;">Cargando catálogo…</div>`;
    TODOS = await AyfaDatos.obtenerProductos();

    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      texto = params.get("q");
      document.getElementById("input-buscar").value = texto;
    }
    if (params.get("cat")) {
    // El menú de categorías arriba de la página linkea a categorías "madre"
    // (ej. "Perfumería"), que en los datos reales pueden estar divididas en
    // varias subcategorías (ej. "Perfumería - Cabello"). Matcheamos por
    // coincidencia exacta o por prefijo para que el link funcione con todas.
    const catParam = params.get("cat");
    const categoriasReales = [...new Set(TODOS.map(p => p.categoria))];
    const coincidencias = categoriasReales.filter(c => c === catParam || c.startsWith(catParam + " - "));
    (coincidencias.length ? coincidencias : [catParam]).forEach(c => filtroCategorias.add(c));
  }

    renderFiltros();
    render();

    document.getElementById("input-buscar").addEventListener("input", (e) => { texto = e.target.value; render(); });
    document.getElementById("chk-oferta").addEventListener("change", (e) => { filtroSoloOferta = e.target.checked; render(); });
    document.getElementById("chk-stock").addEventListener("change", (e) => { filtroSoloStock = e.target.checked; render(); });
    document.getElementById("select-orden").addEventListener("change", (e) => { orden = e.target.value; render(); });
    document.getElementById("btn-limpiar-filtros").addEventListener("click", () => {
      filtroCategorias.clear(); filtroProveedores.clear(); filtroSoloOferta = false; filtroSoloStock = false; texto = "";
      document.getElementById("input-buscar").value = "";
      document.getElementById("chk-oferta").checked = false;
      document.getElementById("chk-stock").checked = false;
      renderFiltros(); render();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
