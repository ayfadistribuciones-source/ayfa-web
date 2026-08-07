/*
quickview.js — Modal "Ver detalle" (ícono de ojito) para tarjetas de
producto. Se usa tanto en catalogo.html como en index.html. Escucha
clicks delegados en document sobre cualquier botón [data-vermas="id"],
busca el producto en el catálogo (ya cacheado por AyfaDatos) y muestra
imagen, precio (si el cliente está registrado), código, categoría,
presentación/formato y un selector de cantidad para agregar al carrito.
*/
(function () {
  function iconoCaja() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path></svg>`;
  }

  function construirModal() {
    if (document.getElementById("qv-overlay")) return;
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="qv-overlay" id="qv-overlay">
        <div class="qv-modal">
          <button type="button" class="qv-cerrar" id="qv-cerrar" aria-label="Cerrar">&times;</button>
          <div class="qv-grid">
            <div class="qv-img" id="qv-img"></div>
            <div class="qv-info">
              <div class="qv-eyebrow">Producto</div>
              <h3 class="qv-nombre" id="qv-nombre"></h3>
              <div class="qv-precio" id="qv-precio"></div>
              <div class="qv-bulto" id="qv-bulto" style="display:none;"></div>
              <div class="qv-meta" id="qv-meta"></div>
              <div class="qv-cantidad">
                <label>Cantidad:</label>
                <input type="number" min="1" value="1" id="qv-qty">
              </div>
              <button type="button" class="btn btn-primary btn-block" id="qv-agregar">Agregar al carrito</button>
              <div class="qv-nota" id="qv-nota"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div.firstElementChild);

    const overlay = document.getElementById("qv-overlay");
    document.getElementById("qv-cerrar").addEventListener("click", cerrar);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrar(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
  }

  function cerrar() {
    const overlay = document.getElementById("qv-overlay");
    if (overlay) overlay.classList.remove("activo");
  }

  async function abrir(id) {
    construirModal();
    const productos = await AyfaDatos.obtenerProductos();
    const p = productos.find((x) => x.id === id);
    if (!p) return;

    const logueado = !!AyfaAuth.usuarioActual();
    const esPromoFlat = p.precioPromo && p.precioPromo > 0 && p.precioPromo < p.precio;
    const nxm = AyfaDatos.parsePromoNxM(p.promo);
    const stockInfo = AyfaDatos.estadoStock(p.stock);

    document.getElementById("qv-img").innerHTML = p.imagen
      ? `<img src="${p.imagen}" alt="${p.nombre}">`
      : iconoCaja();
    document.getElementById("qv-nombre").textContent = p.nombre;

    const precioBox = document.getElementById("qv-precio");
    if (!logueado) {
      precioBox.innerHTML = `<a href="ingresar.html" style="font-size:1rem; color:var(--maroon); text-decoration:underline;">Iniciá sesión para ver el precio</a>`;
    } else if (esPromoFlat) {
      precioBox.innerHTML = `<span class="tachado">${AyfaDatos.formatoPrecio(p.precio)}</span> ${AyfaDatos.formatoPrecio(p.precioPromo)}`;
    } else {
      precioBox.textContent = AyfaDatos.formatoPrecio(p.precio);
    }

    // Precio por bulto cerrado: solo aparece si se cargó la columna
    // "PrecioBulto" en la planilla (lo define el negocio, no se calcula).
    const bultoBox = document.getElementById("qv-bulto");
    if (logueado && p.precioBulto && p.precioBulto > 0) {
      bultoBox.style.display = "block";
      bultoBox.innerHTML = `<span class="qv-bulto-label">Precio por bulto cerrado</span><span class="qv-bulto-precio">${AyfaDatos.formatoPrecio(p.precioBulto)}</span>`;
    } else {
      bultoBox.style.display = "none";
      bultoBox.innerHTML = "";
    }

    const metaLineas = [
      p.sku ? `Código: ${p.sku}` : "",
      p.categoria ? `Categoría: ${p.categoria}` : "",
      p.marca ? `Marca: ${p.marca}` : "",
      p.presentacion ? `Presentación: ${p.presentacion}` : "",
      p.unidadesPorBulto ? `Contenido del bulto: ${p.unidadesPorBulto} unidades (según nombre/presentación)` : "",
    ].filter(Boolean);
    document.getElementById("qv-meta").innerHTML =
      metaLineas.map((l) => `<div>${l}</div>`).join("") +
      `<div class="stock-info ${stockInfo.clase}" style="margin-top:6px;">${stockInfo.texto}</div>`;

    const sinStock = p.stock !== null && p.stock !== undefined && p.stock <= 0;
    const qtyInput = document.getElementById("qv-qty");
    qtyInput.value = 1;
    qtyInput.disabled = sinStock || !logueado;
    if (p.stock !== null && p.stock !== undefined && p.stock > 0) qtyInput.max = p.stock;
    else qtyInput.removeAttribute("max");

    const btnAgregar = document.getElementById("qv-agregar");
    btnAgregar.disabled = sinStock || !logueado;
    btnAgregar.textContent = !logueado ? "Iniciá sesión para comprar" : (sinStock ? "Sin stock" : "Agregar al carrito");
    btnAgregar.onclick = () => {
      if (!logueado) { window.location.href = "ingresar.html"; return; }
      const cantidad = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      AyfaCarrito.agregar(p.id, cantidad);
      document.dispatchEvent(new Event("ayfa:carrito-actualizado"));
      if (typeof ayfaMostrarToast === "function") ayfaMostrarToast("Se agregó al carrito ✔");
      cerrar();
    };

    // Si la promo es de cantidad (2x1, 3x2...) avisamos acá cómo se va a
    // calcular el precio al agregarlo al carrito.
    document.getElementById("qv-nota").innerHTML =
      (logueado && nxm) ? `<div class="promo-aviso">🎁 Promo ${p.promo}: llevando ${nxm.lleva} pagás ${nxm.paga}. El precio se calcula solo al agregarlo al carrito.</div>` : "";

    document.getElementById("qv-overlay").classList.add("activo");
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-vermas]");
    if (btn) abrir(btn.getAttribute("data-vermas"));
  });
})();
