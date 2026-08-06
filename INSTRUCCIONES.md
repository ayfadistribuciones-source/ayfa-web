<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Carrito — AY-FA Distribuciones</title>
<link rel="icon" href="assets/logo.png">
<link rel="stylesheet" href="css/estilos.css">
</head>
<body>

<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="logo-link"><img src="assets/logo.png" alt="AY-FA Distribuciones"></a>
    <nav class="main-nav" style="margin-left:auto;">
      <a href="index.html">Inicio</a>
      <a href="catalogo.html">Catálogo</a>
      <a href="ingresar.html" data-login-link>Ingresar</a>
      <a href="mi-cuenta.html" class="user-chip" data-user-chip style="display:none;"></a>
    </nav>
  </div>
</header>

<section class="container" style="padding: 30px 20px 80px;">
  <div class="section-title"><h2>Tu carrito</h2></div>

  <div class="carrito-layout">
    <div id="items-carrito"></div>

    <div class="resumen-card">
      <h3>Resumen del pedido</h3>
      <div id="resumen-lineas"></div>

      <h4 style="margin: 18px 0 6px; color:var(--navy); font-size:0.92rem;">¿Cómo lo recibís?</h4>
      <div class="entrega-opciones" id="entrega-opciones">
        <label class="entrega-opcion" data-opcion="envio">
          <input type="radio" name="entrega" value="Envío a domicilio">
          <div>
            <div class="titulo">🚚 Envío a domicilio</div>
            <div class="desc">Coordinamos el costo y horario según tu dirección.</div>
          </div>
        </label>
        <label class="entrega-opcion" data-opcion="retiro">
          <input type="radio" name="entrega" value="Retiro en depósito">
          <div>
            <div class="titulo">🏬 Retiro en depósito</div>
            <div class="desc" data-empresa-direccion>Sin costo adicional.</div>
          </div>
        </label>
        <label class="entrega-opcion" data-opcion="reparto">
          <input type="radio" name="entrega" value="Reparto local">
          <div style="width:100%;">
            <div class="titulo">📍 Reparto local por zona</div>
            <div class="desc">Reparto propio en el día según zona.</div>
            <select id="select-zona-reparto" style="width:100%; margin-top:8px; padding:7px; border:1px solid #d8dce3; border-radius:6px; display:none;"></select>
          </div>
        </label>
      </div>

      <div class="campo" id="campo-direccion-envio" style="display:none;">
        <label>Dirección de envío</label>
        <input type="text" id="input-direccion-envio" placeholder="Calle, número, localidad">
      </div>

      <button class="btn btn-primary btn-block" id="btn-confirmar" style="margin-top:16px;">Confirmar pedido</button>
      <p style="font-size:0.75rem; color:var(--gray); text-align:center; margin-top:10px;">El pago se coordina por WhatsApp o al recibir el pedido.</p>
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="container">
    <div class="footer-bottom">© <span data-anio></span> AY-FA Distribuciones. Todos los derechos reservados.</div>
  </div>
</footer>

<script src="js/config.js"></script>
<script src="js/datos.js"></script>
<script src="js/auth.js"></script>
<script src="js/carrito.js"></script>
<script src="js/pedidos.js"></script>
<script src="js/principal.js"></script>
<script>
(async function () {
  const productos = await AyfaDatos.obtenerProductos();
  const itemsCont = document.getElementById("items-carrito");
  const resumenCont = document.getElementById("resumen-lineas");
  const btnConfirmar = document.getElementById("btn-confirmar");

  const selectZona = document.getElementById("select-zona-reparto");
  AYFA_CONFIG.ZONAS_REPARTO_LOCAL.forEach(z => {
    const opt = document.createElement("option");
    opt.value = z; opt.textContent = z;
    selectZona.appendChild(opt);
  });

  function renderCarrito() {
    const detalle = AyfaCarrito.detalle(productos);

    if (!detalle.length) {
      itemsCont.innerHTML = `<div class="vacio-msg"><div class="icono">🛒</div>Tu carrito está vacío.<br><a href="catalogo.html" class="btn btn-primary" style="margin-top:14px;">Ir al catálogo</a></div>`;
      resumenCont.innerHTML = "";
      btnConfirmar.disabled = true;
      return;
    }
    btnConfirmar.disabled = false;

    itemsCont.innerHTML = detalle.map(i => `
      <div class="carrito-item">
        <div class="producto-img">${i.imagen ? `<img src="${i.imagen}">` : "📦"}</div>
        <div class="carrito-item-info">
          <div class="nombre">${i.nombre}</div>
          <div class="precio-unit">${i.marca || ""} ${i.presentacion ? "· " + i.presentacion : ""}</div>
          <div class="precio-unit">${AyfaDatos.formatoPrecio(i.precioUnit)} c/u</div>
        </div>
        <div class="carrito-item-acciones">
          <input type="number" min="1" ${(i.stock !== null && i.stock !== undefined) ? `max="${i.stock}"` : ""} value="${i.cantidad}" class="qty-input" data-cambiar-cant="${i.id}">
          <strong>${AyfaDatos.formatoPrecio(i.subtotal)}</strong>
          <span class="quitar-item" data-quitar="${i.id}">Quitar</span>
        </div>
      </div>
    `).join("");

    const total = detalle.reduce((a, i) => a + i.subtotal, 0);
    resumenCont.innerHTML = `
      <div class="resumen-linea"><span>Subtotal</span><span>${AyfaDatos.formatoPrecio(total)}</span></div>
      <div class="resumen-total"><span>Total</span><span>${AyfaDatos.formatoPrecio(total)}</span></div>
    `;

    itemsCont.querySelectorAll("[data-cambiar-cant]").forEach(inp => {
      inp.addEventListener("change", () => {
        AyfaCarrito.actualizarCantidad(inp.getAttribute("data-cambiar-cant"), Math.max(1, parseInt(inp.value, 10) || 1));
        renderCarrito();
      });
    });
    itemsCont.querySelectorAll("[data-quitar]").forEach(el => {
      el.addEventListener("click", () => {
        AyfaCarrito.quitar(el.getAttribute("data-quitar"));
        renderCarrito();
      });
    });
  }

  document.querySelectorAll(".entrega-opcion").forEach(op => {
    op.addEventListener("click", () => {
      document.querySelectorAll(".entrega-opcion").forEach(o => o.classList.remove("selected"));
      op.classList.add("selected");
      op.querySelector('input[type="radio"]').checked = true;
      document.getElementById("campo-direccion-envio").style.display = op.dataset.opcion === "envio" ? "block" : "none";
      selectZona.style.display = op.dataset.opcion === "reparto" ? "block" : "none";
    });
  });

  btnConfirmar.addEventListener("click", async () => {
    if (!AyfaAuth.requiereLogin("carrito.html")) return;

    const entradaSel = document.querySelector('input[name="entrega"]:checked');
    if (!entradaSel) { ayfaMostrarToast("Elegí cómo querés recibir tu pedido."); return; }

    const opcion = document.querySelector(".entrega-opcion.selected").dataset.opcion;
    if (opcion === "envio" && !document.getElementById("input-direccion-envio").value.trim()) {
      ayfaMostrarToast("Ingresá la dirección de envío.");
      return;
    }

    const detalle = AyfaCarrito.detalle(productos);
    const u = AyfaAuth.usuarioActual();
    const pedido = {
      cliente: { nombre: u.nombre, apellido: u.apellido, email: u.email, telefono: u.telefono },
      items: detalle.map(i => ({ sku: i.sku, proveedor: i.proveedor, nombre: i.nombre, cantidad: i.cantidad, precioUnit: i.precioUnit, subtotal: i.subtotal })),
      total: detalle.reduce((a, i) => a + i.subtotal, 0),
      tipoEntrega: entradaSel.value,
      zona: opcion === "reparto" ? selectZona.value : "",
      direccionEnvio: opcion === "envio" ? document.getElementById("input-direccion-envio").value.trim() : ""
    };

    btnConfirmar.disabled = true; btnConfirmar.textContent = "Enviando pedido…";
    try {
      const guardado = await AyfaPedidos.crearPedido(pedido);
      AyfaCarrito.vaciar();
      itemsCont.innerHTML = `
        <div class="vacio-msg">
          <div class="icono">✅</div>
          <h3 style="color:var(--navy);">¡Pedido confirmado!</h3>
          <p>Tu número de pedido es <strong>${guardado.numero}</strong>.<br>Te contactaremos para coordinar el pago y la entrega.</p>
          <a href="mi-cuenta.html" class="btn btn-primary" style="margin-top:14px;">Ver mis pedidos</a>
        </div>`;
      resumenCont.innerHTML = "";
      document.getElementById("entrega-opciones").style.display = "none";
      btnConfirmar.style.display = "none";
    } catch (err) {
      ayfaMostrarToast(err.message || "No se pudo enviar el pedido.");
      btnConfirmar.disabled = false; btnConfirmar.textContent = "Confirmar pedido";
    }
  });

  renderCarrito();
})();
</script>
</body>
</html>
