# AY-FA Distribuciones — Cómo poner en marcha la web

Esta carpeta es tu sitio web completo, listo para publicar gratis en **GitHub Pages**. Ahora mismo funciona con datos de ejemplo. Seguí estos pasos para dejarlo 100% operativo con tus precios reales.

---

## 1. Probar el sitio en tu computadora (opcional)

Abrí la carpeta `ay-fa-web` y hacé doble clic en `index.html`. Se abre en el navegador y podés navegar todo el sitio con el catálogo de ejemplo. El registro, login y pedidos van a funcionar guardando todo en el navegador (modo demo), hasta que conectes el Google Sheet (paso 3).

## 2. Publicar la web gratis en GitHub Pages

1. Creá una cuenta en [github.com](https://github.com) si no tenés.
2. Creá un repositorio nuevo, por ejemplo `ayfa-web` (puede ser público).
3. Subí **todo el contenido** de la carpeta `ay-fa-web` (no la carpeta en sí, sino lo que está adentro: `index.html`, `css/`, `js/`, etc.) a ese repositorio. Se puede hacer arrastrando los archivos desde la web de GitHub ("Add file" → "Upload files").
4. Andá a **Settings → Pages** del repositorio.
5. En "Source" elegí la rama `main` y la carpeta `/ (root)`. Guardá.
6. En un par de minutos tu web va a estar online en una dirección como:
   `https://tu-usuario.github.io/ayfa-web/`
7. (Opcional) Si comprás un dominio propio (ej. `ayfadistribuciones.com.ar`), en GitHub Pages podés configurarlo en la misma sección "Settings → Pages → Custom domain".

## 3. Conectar tu Google Sheet real (precios y stock en vivo)

Esto es lo que te permite que, cuando modificás un precio en la planilla, la web se actualice sola.

1. Creá un Google Sheet nuevo (o usá el que ya tengas armado con tus productos).
2. En la primera hoja/pestaña, llamala **"Productos"** y poné estas columnas exactas en la primera fila (respetando mayúsculas):

   | SKU | Producto | Categoria | Marca | Presentacion | Precio | Stock | Promo | PrecioPromo | Imagen | Destacado |
   |---|---|---|---|---|---|---|---|---|---|---|

   - **SKU**: código único del producto.
   - **Precio**: el precio final que ponés vos (con tu ganancia ya incluida).
   - **Stock**: cantidad disponible (si ponés 0, la web muestra "Sin stock").
   - **Promo**: texto corto opcional, ej. "3x2" o "Oferta".
   - **PrecioPromo**: si el producto está en oferta, poné acá el precio promocional (si no, dejalo vacío).
   - **Imagen**: opcional, un link a una foto del producto (podés subir fotos a Google Drive, Imgur, o similar y pegar el link "compartir públicamente").
   - **Destacado**: escribí `SI` para que aparezca en "Productos destacados" de la portada.

   Podés copiar y pegar tu Excel actual acá, reordenando/renombrando columnas para que coincidan con esta lista.

3. Publicá la planilla para que la web pueda leerla:
   - Archivo → Compartir → Publicar en la Web.
   - Elegí "Toda la hoja de cálculo" (o la pestaña "Productos"), formato "Página web" o "Valores separados por comas".
   - Hacé clic en "Publicar".
   - (Esto NO permite que la gente edite tu planilla, solo que la web pueda leer los precios).

4. Conseguí el **ID de tu Sheet**: es la parte larga de la URL, entre `/d/` y `/edit`. Por ejemplo, en:
   `https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit`
   el ID es `1AbCdEfGhIjKlMnOpQrStUvWxYz`.

5. Abrí el archivo `js/config.js` de tu sitio y completá:
   ```js
   SHEET_ID: "1AbCdEfGhIjKlMnOpQrStUvWxYz",
   SHEET_TAB_PRODUCTOS: "Productos",
   ```
6. Volvé a subir el `config.js` actualizado a GitHub (Add file → Upload files, reemplazando el anterior). Listo: la web ya lee tus precios reales, y se actualiza cada vez que modificás la planilla (puede tardar hasta 3-5 minutos en reflejarse por el cacheo de Google).

## 4. Activar el registro de clientes y los pedidos (Google Apps Script)

Esto convierte tu misma planilla en la base de datos donde se guardan los clientes que se registran y los pedidos que hacen.

1. En el mismo Google Sheet del paso 3, andá a **Extensiones → Apps Script**.
2. Borrá el código de ejemplo y pegá todo el contenido del archivo `google-apps-script/Code.gs` que está en esta carpeta.
3. Guardá el proyecto (ícono de disco, o Ctrl+S).
4. Arriba a la derecha, hacé clic en **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **tu cuenta de Google**.
   - Quién tiene acceso: **Cualquier usuario**.
5. Al confirmar, Google te va a pedir autorizar permisos (es tu propia planilla, es seguro aceptar).
6. Copiá la **URL de la aplicación web** que te da (termina en `/exec`).
7. Pegala en `js/config.js`:
   ```js
   APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```
8. Subí de nuevo `config.js` a GitHub. Listo: ahora los registros de clientes y los pedidos se guardan automáticamente en dos hojas nuevas de tu planilla, **"Usuarios"** y **"Pedidos"**, que el script crea solo la primera vez que alguien se registra o hace un pedido.

   Nota: cada vez que edites el código del Apps Script, tenés que volver a "Implementar" (Gestionar implementaciones → editar → nueva versión) para que los cambios se apliquen.

## 5. Datos de tu empresa

En `js/config.js` también podés completar:
- `EMPRESA.whatsapp`: tu número de WhatsApp (con código de país, sin el +, ej `5493471234567`).
- `EMPRESA.email`: tu email de pedidos.
- `EMPRESA.direccionRetiro`: dirección del depósito para el retiro.
- `EMPRESA.horarios`: horario de atención.
- `ZONAS_REPARTO_LOCAL`: lista de zonas donde hacés reparto propio.

## 6. Qué falta para que sea 100% producción

El sitio ya es completamente funcional (catálogo con precios/stock en vivo, registro, login, carrito, pedidos con envío/retiro/reparto). Cosas a tener en cuenta:

- **Seguridad de contraseñas**: las contraseñas se guardan "hasheadas" (no en texto plano) en tu planilla, pero este esquema es para un comercio chico/mediano, no tiene el nivel de un banco. No reutilices contraseñas críticas.
- **Pagos**: hoy el flujo es "pedido + coordinación de pago" (efectivo, transferencia, etc. por WhatsApp). Si más adelante querés cobrar online, se puede sumar Mercado Pago.
- **Dominio propio**: GitHub Pages te da una URL gratuita; si querés `www.ayfadistribuciones.com.ar`, hay que comprar el dominio (en NIC.ar o similar) y apuntarlo a GitHub Pages.
- **Fotos de productos**: agregando links de imágenes en la columna "Imagen" del Sheet, el catálogo se ve mucho más profesional.

## 7. Estructura de archivos

```
ay-fa-web/
├── index.html            → Página de inicio
├── catalogo.html          → Catálogo con filtros y búsqueda
├── registro.html          → Alta de cuenta de cliente
├── ingresar.html           → Login
├── mi-cuenta.html         → Datos del cliente + historial de pedidos
├── carrito.html           → Carrito y checkout (envío/retiro/reparto)
├── contacto.html          → Datos de contacto
├── css/estilos.css        → Estilos de toda la web
├── js/config.js           → ACÁ SE CONECTA TODO (Sheet, Apps Script, datos de la empresa)
├── js/datos.js            → Lectura de productos (Sheet o JSON de ejemplo)
├── js/auth.js             → Registro y login
├── js/carrito.js          → Lógica del carrito
├── js/pedidos.js          → Creación y consulta de pedidos
├── js/catalogo.js         → Filtros y grilla del catálogo
├── js/principal.js        → Cosas comunes (header, toasts, etc.)
├── data/productos.json    → Catálogo de EJEMPLO (se deja de usar al conectar el Sheet)
├── google-apps-script/Code.gs → Script para pegar en Google Apps Script
└── assets/                → Logo de AY-FA
```
