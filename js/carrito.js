/*
  carrito.js — Manejo del carrito de compras en localStorage.
*/
const AyfaCarrito = (function () {
  const KEY = "ayfa_carrito";

  function leer() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function guardar(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("ayfa:carrito-actualizado"));
  }

  // "id" es el identificador único proveedor+SKU (p.id en datos.js), así no
  // se pisan productos con el mismo código de dos proveedores distintos.
  function agregar(id, cantidad) {
    const items = leer();
    const existente = items.find(i => i.id === id);
    if (existente) existente.cantidad += cantidad;
    else items.push({ id, cantidad });
    guardar(items);
  }

  function actualizarCantidad(id, cantidad) {
    let items = leer();
    if (cantidad <= 0) {
      items = items.filter(i => i.id !== id);
    } else {
      const it = items.find(i => i.id === id);
      if (it) it.cantidad = cantidad;
    }
    guardar(items);
  }

  function quitar(id) {
    guardar(leer().filter(i => i.id !== id));
  }

  function vaciar() {
    guardar([]);
  }

  function cantidadTotal() {
    return leer().reduce((acc, i) => acc + i.cantidad, 0);
  }

  // Combina el carrito con la info de producto actual (precio/stock/promos vigentes)
  function detalle(productos) {
    return leer().map(i => {
      const p = productos.find(x => x.id === i.id);
      if (!p) return null;
      const precioUnit = (p.precioPromo && p.precioPromo > 0) ? p.precioPromo : p.precio;
      return {
        id: p.id, sku: p.sku, proveedor: p.proveedor, nombre: p.nombre, marca: p.marca, presentacion: p.presentacion,
        precioUnit, cantidad: i.cantidad, subtotal: precioUnit * i.cantidad,
        stock: p.stock, imagen: p.imagen
      };
    }).filter(Boolean);
  }

  function total(productos) {
    return detalle(productos).reduce((acc, i) => acc + i.subtotal, 0);
  }

  return { leer, agregar, actualizarCantidad, quitar, vaciar, cantidadTotal, detalle, total };
})();
