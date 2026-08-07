/*
  AY-FA Distribuciones — Autenticación de clientes
  =================================================
  Habla directo con el backend (Google Apps Script). No guarda usuarios
  en localStorage: solo guarda la sesión activa (el cliente ya logueado)
  para no tener que pedir usuario y contraseña en cada página.
*/

const AyfaAuth = (function () {
  const SESION_KEY = "ayfaSesion";

  async function hashPassword(password) {
    const datos = new TextEncoder().encode(String(password));
    const buffer = await crypto.subtle.digest("SHA-256", datos);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function llamarBackend(payload) {
    const resp = await fetch(AYFA_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return await resp.json();
  }

  function guardarSesion(cliente) {
    localStorage.setItem(SESION_KEY, JSON.stringify(cliente));
  }

  async function registrar(datos) {
    const passwordHash = await hashPassword(datos.password);
    const payload = {
      accion: "registrar",
      datos: {
        nombre: datos.nombre || "",
        razonSocial: datos.razonSocial || "",
        documento: datos.documento || "",
        condicionIVA: datos.condicionIVA || "",
        email: datos.email || "",
        telefono: datos.telefono || "",
        direccion: datos.direccion || "",
        localidad: datos.localidad || "",
        zona: datos.zona || "",
        password: passwordHash,
      },
    };
    const resp = await llamarBackend(payload);
    if (resp && resp.ok && resp.cliente) {
      guardarSesion(resp.cliente);
    }
    return resp;
  }

  async function login(email, password) {
    const passwordHash = await hashPassword(password);
    const resp = await llamarBackend({
      accion: "login",
      email: email,
      password: passwordHash,
    });
    if (resp && resp.ok && resp.cliente) {
      guardarSesion(resp.cliente);
    }
    return resp;
  }

  function cerrarSesion() {
    localStorage.removeItem(SESION_KEY);
  }

  function usuarioActual() {
    try {
      const raw = localStorage.getItem(SESION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function requiereLogin(redirectUrl) {
    if (!usuarioActual()) {
      const volver = encodeURIComponent(window.location.pathname.split("/").pop());
      window.location.href = redirectUrl + "?volver=" + volver;
      return false;
    }
    return true;
  }

  return { registrar, login, cerrarSesion, usuarioActual, requiereLogin };
})();
