/*
  auth.js — Registro, login y sesión de clientes.
  Si AYFA_CONFIG.APPS_SCRIPT_URL está configurado, los datos se guardan en tu
  Google Sheet (hoja "Usuarios") a través del Google Apps Script.
  Si no, funciona en modo demo guardando todo en el navegador (localStorage).
*/

const AyfaAuth = (function () {
  const SESION_KEY = "ayfa_sesion";
  const USUARIOS_LOCAL_KEY = "ayfa_usuarios_local";

  async function hashPassword(pass) {
    const enc = new TextEncoder().encode(pass);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function usarBackend() {
    return !!(AYFA_CONFIG.APPS_SCRIPT_URL && AYFA_CONFIG.APPS_SCRIPT_URL.trim());
  }

  function leerUsuariosLocal() {
    try { return JSON.parse(localStorage.getItem(USUARIOS_LOCAL_KEY) || "[]"); } catch (e) { return []; }
  }
  function guardarUsuariosLocal(lista) {
    localStorage.setItem(USUARIOS_LOCAL_KEY, JSON.stringify(lista));
  }

  async function llamarBackend(payload) {
    const res = await fetch(AYFA_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  // datos = {nombre, apellido, email, telefono, direccion, localidad, tipoCliente, cuitDni, password}
  async function registrar(datos) {
    const passwordHash = await hashPassword(datos.password);
    const registro = { ...datos, passwordHash };
    delete registro.password;

    if (usarBackend()) {
      const resp = await llamarBackend({ accion: "registrar", cliente: registro });
      if (!resp.ok) throw new Error(resp.mensaje || "No se pudo completar el registro.");
      iniciarSesion(resp.cliente || registro);
      return resp;
    } else {
      const usuarios = leerUsuariosLocal();
      if (usuarios.some(u => u.email.toLowerCase() === datos.email.toLowerCase())) {
        throw new Error("Ya existe una cuenta registrada con ese email.");
      }
      usuarios.push(registro);
      guardarUsuariosLocal(usuarios);
      iniciarSesion(registro);
      return { ok: true, cliente: registro };
    }
  }

  async function login(email, password) {
    const passwordHash = await hashPassword(password);

    if (usarBackend()) {
      const resp = await llamarBackend({ accion: "login", email, passwordHash });
      if (!resp.ok) throw new Error(resp.mensaje || "Email o contraseña incorrectos.");
      iniciarSesion(resp.cliente);
      return resp.cliente;
    } else {
      const usuarios = leerUsuariosLocal();
      const u = usuarios.find(x => x.email.toLowerCase() === email.toLowerCase() && x.passwordHash === passwordHash);
      if (!u) throw new Error("Email o contraseña incorrectos.");
      iniciarSesion(u);
      return u;
    }
  }

  function iniciarSesion(cliente) {
    const copia = { ...cliente };
    delete copia.passwordHash;
    localStorage.setItem(SESION_KEY, JSON.stringify(copia));
  }

  function cerrarSesion() {
    localStorage.removeItem(SESION_KEY);
  }

  function usuarioActual() {
    try { return JSON.parse(localStorage.getItem(SESION_KEY) || "null"); } catch (e) { return null; }
  }

  function requiereLogin(redirigirA) {
    if (!usuarioActual()) {
      window.location.href = "ingresar.html" + (redirigirA ? ("?volver=" + encodeURIComponent(redirigirA)) : "");
      return false;
    }
    return true;
  }

  return { registrar, login, cerrarSesion, usuarioActual, requiereLogin, usarBackend };
})();
