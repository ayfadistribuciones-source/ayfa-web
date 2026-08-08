/*
principal.js — Cosas comunes a todas las páginas: contador de carrito,
chip de usuario logueado, buscador del header, toasts y año del footer.
*/
function ayfaActualizarHeader() {
const cont = document.querySelectorAll("[data-cart-count]");
const total = AyfaCarrito.cantidadTotal();
cont.forEach(el => { el.textContent = total; el.style.display = total > 0 ? "inline-flex" : "none"; });

const user = AyfaAuth.usuarioActual();
const chip = document.querySelector("[data-user-chip]");
const loginLink = document.querySelector("[data-login-link]");
if (chip && loginLink) {
if (user) {
chip.style.display = "inline-flex";
chip.textContent = "Hola, " + (user.nombre || user.email);
loginLink.style.display = "none";
} else {
chip.style.display = "none";
loginLink.style.display = "inline-block";
}
}
}

function ayfaMostrarToast(msg) {
let toast = document.querySelector(".toast");
if (!toast) {
toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);
}
toast.textContent = msg;
toast.classList.add("show");
clearTimeout(toast._t);
toast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}

function ayfaSetupBuscador() {
const form = document.querySelector("[data-search-form]");
if (!form) return;
form.addEventListener("submit", (e) => {
e.preventDefault();
const q = form.querySelector("input").value.trim();
window.location.href = "catalogo.html" + (q ? ("?q=" + encodeURIComponent(q)) : "");
});
}

// Menú hamburguesa del header (solo aparece en pantallas chicas). Se abre y
// cierra al tocar el botón, se cierra solo al tocar un link del menú o al
// tocar afuera, y no interfiere en desktop (ahí el botón queda oculto por CSS).
function ayfaSetupNavToggle() {
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
if (!navToggle || !mainNav) return;

function cerrar() {
mainNav.classList.remove("abierto");
navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", (e) => {
e.stopPropagation();
const abierto = mainNav.classList.toggle("abierto");
navToggle.setAttribute("aria-expanded", abierto ? "true" : "false");
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", cerrar));
document.addEventListener("click", (e) => {
if (!mainNav.classList.contains("abierto")) return;
if (mainNav.contains(e.target) || navToggle.contains(e.target)) return;
cerrar();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
}

document.addEventListener("DOMContentLoaded", () => {
ayfaActualizarHeader();
ayfaSetupBuscador();
ayfaSetupNavToggle();
const anio = document.querySelector("[data-anio]");
if (anio) anio.textContent = new Date().getFullYear();

const logoutBtn = document.querySelector("[data-logout]");
if (logoutBtn) logoutBtn.addEventListener("click", (e) => {
e.preventDefault();
AyfaAuth.cerrarSesion();
window.location.href = "index.html";
});

// Activa TODOS los links de WhatsApp de la página (el botón flotante y
// cualquier otro, como el de la tarjeta de Contacto), no solo el primero.
document.querySelectorAll("[data-whatsapp]").forEach(wa => {
if (AYFA_CONFIG.EMPRESA.whatsapp) {
wa.href = "https://wa.me/" + AYFA_CONFIG.EMPRESA.whatsapp + "?text=" + encodeURIComponent("Hola AY-FA! Quiero hacer una consulta.");
}
});
// Si el elemento con el email es un link (ej. la tarjeta de Contacto),
// además de mostrar la dirección lo convertimos en mailto: clickeable.
document.querySelectorAll("[data-empresa-email]").forEach(el => {
el.textContent = AYFA_CONFIG.EMPRESA.email;
if (el.tagName === "A") el.href = "mailto:" + AYFA_CONFIG.EMPRESA.email;
});
document.querySelectorAll("[data-empresa-horarios]").forEach(el => el.textContent = AYFA_CONFIG.EMPRESA.horarios);
document.querySelectorAll("[data-empresa-direccion]").forEach(el => el.textContent = AYFA_CONFIG.EMPRESA.direccionRetiro);
});
document.addEventListener("ayfa:carrito-actualizado", ayfaActualizarHeader);
