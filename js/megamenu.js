/*
megamenu.js — Botón "Categorías" con panel desplegable (mega-menú), usado
en todas las páginas. Arma la lista de categorías a partir de los datos
reales de la planilla (agrupando subcategorías como "Perfumería - Cabello"
bajo su categoría madre "Perfumería").
*/
(function () {
  document.addEventListener("DOMContentLoaded", async () => {
    const btn = document.getElementById("mega-menu-btn");
    const panel = document.getElementById("mega-menu-panel");
    if (!btn || !panel) return;

    function cerrar() {
      panel.classList.remove("abierto");
      btn.classList.remove("abierto");
    }
    function alternar(e) {
      e.stopPropagation();
      const abierto = panel.classList.toggle("abierto");
      btn.classList.toggle("abierto", abierto);
    }
    btn.addEventListener("click", alternar);
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && e.target !== btn) cerrar();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrar();
    });

    try {
      const productos = await AyfaDatos.obtenerProductos();
      const raices = new Set();
      productos.forEach((p) => {
        const c = (p.categoria || "").split(" - ")[0].trim();
        if (c) raices.add(c);
      });
      const ordenadas = [...raices].sort((a, b) => a.localeCompare(b, "es"));
      panel.innerHTML =
        `<div class="mega-menu-grid">` +
        ordenadas
          .map((c) => `<a href="catalogo.html?cat=${encodeURIComponent(c)}">${c}</a>`)
          .join("") +
        `</div>`;
    } catch (e) {
      panel.innerHTML = `<div class="mega-menu-grid"><a href="catalogo.html">Ver catálogo completo</a></div>`;
    }
  });
})();
