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

// Combina el carrito con la info de producto actual (precio/stock/promos
// vigentes). Usa AyfaDatos.calcularLineaPrecio() para que el precio ya
// contemple: precio promocional plano (PrecioPromo) o promo de cantidad
// tipo "2x1"/"3x2" (columna Promo) — en ambos casos el pedido solo cobra
// el precio final correcto, y acá queda marcado qué línea es promo y
// cuántas unidades van sin cargo, para poder resaltarlo en el carrito y
// en el pedido que le llega al dueño.
function detalle(productos) {
return leer().map(i => {
const p = productos.find(x => x.id === i.id);
if (!p) return null;
const linea = AyfaDatos.calcularLineaPrecio(p, i.cantidad);
return {
id: p.id, sku: p.sku, proveedor: p.proveedor, nombre: p.nombre, marca: p.marca, presentacion: p.presentacion,
precioUnit: linea.precioUnitario, cantidad: i.cantidad, subtotal: linea.subtotal,
tipoPromo: linea.tipo, promoTexto: linea.promoTexto, unidadesGratis: linea.unidadesGratis, esPromo: linea.esPromo,
stock: p.stock, imagen: p.imagen
};
}).filter(Boolean);
}

function total(productos) {
return detalle(productos).reduce((acc, i) => acc + i.subtotal, 0);
}

return { leer, agregar, actualizarCantidad, quitar, vaciar, cantidadTotal, detalle, total };
})();
