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

## 3. Conectar tu Google Sheet real (precios y stock en vivo, con una hoja por proveedor)

Esto es lo que te permite que, cuando modificás un precio en la planilla, la web se actualice sola. Como tus proveedores no son el mismo y las listas te llegan en PDFs distintos, **cada proveedor tiene su propia pestaña**: pegás cada lista tal cual, sin tener que mezclarlas ni reordenarlas a mano. La web las junta sola para armar el catálogo completo.

1. Creá un Google Sheet nuevo (o usá el que ya tengas armado con tus productos).

2. Creá **una pestaña por proveedor**. Por ejemplo `Proveedor A` y `Proveedor B` (podés ponerles el nombre real de cada proveedor si preferís, ej. "Distribuidora Norte" y "Mayorista Sur" — solo tenés que usar esos mismos nombres en el paso 6). Si tenés 3 o más proveedores, agregás más pestañas siguiendo el mismo esquema.

3. En **cada** pestaña de proveedor, poné estas columnas exactas en la primera fila (respetando mayúsculas). Las dos primeras (`CostoProveedor` y `Margen%`) son opcionales pero muy útiles: te calculan solas el precio de venta.

   | SKU | Producto | Categoria | Marca | Presentacion | CostoProveedor | Margen% | Precio | Stock | Promo | PrecioPromo | Imagen | Destacado |
   |---|---|---|---|---|---|---|---|---|---|---|---|---|

   - **SKU**: código del producto (puede repetirse entre proveedores distintos sin problema, la web los distingue solos).
   - **CostoProveedor**: lo que vos pagás por el producto (lo sacás de la lista en PDF).
   - **Margen%**: tu ganancia en porcentaje, ej. `35` para 35%.
   - **Precio**: el precio final de venta. Poné acá una fórmula que lo calcule solo, por ejemplo si CostoProveedor está en la columna F y Margen% en la G, en la fila 2 sería `=F2*(1+G2/100)` y después arrastrás la fórmula para abajo. Si preferís escribir el precio a mano, también funciona.
   - **Stock**: cantidad disponible (si ponés 0, la web muestra "Sin stock").
   - **Promo**: texto corto opcional, ej. "3x2" u "Oferta".
   - **PrecioPromo**: si el producto está en oferta, poné acá el precio promocional (si no, dejalo vacío).
   - **Imagen**: opcional, un link a una foto del producto (podés subir fotos a Google Drive, Imgur, o similar y pegar el link "compartir públicamente").
   - **Destacado**: escribí `SI` para que aparezca en "Productos destacados" de la portada.

   Para pasar cada PDF: copiá la tabla del PDF (o escribila) directamente en la pestaña de ESE proveedor, y después acomodá/completá las columnas de Categoria, Marca, Presentacion, Margen%, etc. a mano la primera vez. Los próximos pedidos del mismo proveedor ya vas a tener la planilla armada, solo actualizás precios y stock.

4. Publicá la planilla para que la web pueda leerla:
   - Archivo → Compartir → Publicar en la Web.
   - Elegí "Todo el documento" (así se publican todas las pestañas de una vez), formato "Página web".
   - Hacé clic en "Publicar".
   - (Esto NO permite que la gente edite tu planilla, solo que la web pueda leer los precios).

5. Conseguí el **ID de tu Sheet**: es la parte larga de la URL, entre `/d/` y `/edit`. Por ejemplo, en:
   `https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit`
   el ID es `1AbCdEfGhIjKlMnOpQrStUvWxYz`.

6. Abrí el archivo `js/config.js` de tu sitio y completá:
   ```js
   SHEET_ID: "1AbCdEfGhIjKlMnOpQrStUvWxYz",
   SHEET_TABS_PRODUCTOS: ["Proveedor A", "Proveedor B"],
   ```
   Poné en la lista los nombres EXACTOS de las pestañas que creaste en el paso 2 (respetando mayúsculas/acentos). Si agregás un tercer proveedor más adelante, simplemente sumás su nombre a esta lista.

7. Volvé a subir el `config.js` actualizado a GitHub (Add file → Upload files, reemplazando el anterior). Listo: la web ya lee tus precios reales de las dos pestañas y las combina en un solo catálogo. Se actualiza cada vez que modificás la planilla (puede tardar hasta 3-5 minutos en reflejarse por el cacheo de Google).

   Nota: en el catálogo de la web vas a ver un filtro "Proveedor" en la barra lateral, para que vos (o tus clientes) puedan filtrar productos por proveedor si quieren.

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
