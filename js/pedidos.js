/*
  pedidos.js — Crear pedidos y consultar historial. Igual que auth.js: si hay
  APPS_SCRIPT_URL configurada, todo se guarda en el Google Sheet (hoja
  "Pedidos"). Si no, se guarda en el navegador (localStorage).
*/
const AyfaPedidos = (function () {
  const KEY_LOCAL = "ayfa_pedidos_local";

  function usarBackend() {
    return !!(AYFA_CONFIG.APPS_SCRIPT_URL && AYFA_CONFIG.APPS_SCRIPT_URL.trim());
  }

  async function llamarBackend(payload) {
    const res = await fetch(AYFA_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  function leerLocal() {
    try { return JSON.parse(localStorage.getItem(KEY_LOCAL) || "[]"); } catch (e) { return []; }
  }
  function guardarLocal(lista) { localStorage.setItem(KEY_LOCAL, JSON.stringify(lista)); }

  async function crearPedido(pedido) {
    pedido.numero = "AYFA-" + Date.now().toString().slice(-8);
    pedido.fecha = new Date().toISOString();
    pedido.estado = "Nuevo";

    if (usarBackend()) {
      const resp = await llamarBackend({ accion: "pedido", pedido });
      if (!resp.ok) throw new Error(resp.mensaje || "No se pudo enviar el pedido.");
      return pedido;
    } else {
      const lista = leerLocal();
      lista.unshift(pedido);
      guardarLocal(lista);
      return pedido;
    }
  }

  async function misPedidos(email) {
    if (usarBackend()) {
      const resp = await llamarBackend({ accion: "misPedidos", email });
      return resp.ok ? resp.pedidos : [];
    } else {
      return leerLocal().filter(p => p.cliente && p.cliente.email && p.cliente.email.toLowerCase() === email.toLowerCase());
    }
  }

  return { crearPedido, misPedidos };
})();
