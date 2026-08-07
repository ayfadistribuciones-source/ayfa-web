# AY-FA Distribuciones — Cómo cargar la planilla de productos

Este documento reemplaza al `INSTRUCCIONES.md` anterior, que había quedado
con contenido mezclado por error (tenía código de `carrito.html` en vez de
instrucciones). Acá están las columnas actuales que usa la web para leer
la planilla de Google Sheets en vivo.

## Dónde se cargan los productos

La web lee directamente de tu Google Sheet (`AYFA_CONFIG.SHEET_ID` en
`js/config.js`). Cada pestaña listada en `SHEET_TABS_PRODUCTOS` (hoy:
`AyFa` y `Ramseyer`) se lee como una lista de productos de ese proveedor.
Los cambios que hagas en la planilla se ven en la web en unos minutos
(hay una caché de 3 minutos en el navegador del cliente).

## Columnas de la planilla

La primera fila de cada pestaña tiene que tener estos encabezados
exactos (no importa el orden de las columnas, pero sí el texto del
encabezado). Las columnas marcadas **obligatorias** tienen que estar
siempre completas; el resto son opcionales y podés dejarlas vacías.

| Columna | Obligatoria | Qué va | Ejemplo |
|---|---|---|---|
| `SKU` | Sí | Código interno del producto | `2914` |
| `Producto` | Sí | Nombre del producto tal como se muestra en la web | `LHERITIER CHUPETONCITO 8 UNI. X 35 GR` |
| `Categoria` | Sí | Categoría madre (se usa para el menú y los filtros) | `Golosinas` |
| `Subcategoria` | No | Subcategoría, si la usás. Se combina con `Categoria` (queda "Categoria - Subcategoria" en la web) | `Chupetines` |
| `Marca` | No | Marca del producto | `Fantoche` |
| `Presentacion` | No | Formato/presentación, si no está ya en el nombre | `Caja x 24` |
| `CostoProveedor` | — | Interna, solo para vos. El sitio nunca la lee ni la muestra | `1200` |
| `Margen%` | — | Interna, solo para vos. El sitio nunca la lee ni la muestra | `35` |
| `Precio` | Sí | Precio de venta final, en pesos (el que ve el cliente) | `2050` o `2.050,00` |
| `Stock` | No | Cantidad disponible. Si la dejás vacía, la web muestra "Disponible" sin límite. Poné `0` a propósito si de verdad no hay stock | `15` |
| `Promo` | No | Texto corto para la cinta de oferta (si lo dejás vacío se muestra "OFERTA") | `2x1`, `20% OFF` |
| `PrecioPromo` | No | Precio promocional. **Tiene que ser menor a `Precio`** para que se active la oferta | `1750` |
| `Imagen` | No | URL pública de una foto del producto | `https://...jpg` |
| `Destacado` | No | Poné `SI` para que aparezca en "Productos destacados" del Inicio | `SI` |
| `Proveedor` | No (no la tenés hoy) | Solo hace falta si una misma pestaña mezcla productos de más de un proveedor. Si no existe la columna, se usa el nombre de la pestaña (AyFa / Ramseyer) | `Ramseyer` |
| `PrecioBulto` | No (nueva, no la tenés hoy) | Precio del bulto/caja cerrada, si querés mostrarlo aparte del precio unitario | `35000` |

Tus columnas actuales (`SKU, Producto, Categoria, Subcategoria, Marca,
Presentacion, CostoProveedor, Margen%, Precio, Stock, Promo, PrecioPromo,
Imagen, Destacado`) ya cubren todo lo obligatorio. `Proveedor` y
`PrecioBulto` son las dos únicas que no tenés y son opcionales — sumalas
solo si querés usar esas funciones.

## Cómo funciona "Ofertas" (la cinta roja/naranja)

Apenas un producto tiene `PrecioPromo` cargado y ese valor es menor que
`Precio`, automáticamente:

- Aparece con una **cinta diagonal "OFERTA"** (o el texto que pongas en
  `Promo`, ej. "2x1") en la esquina de su tarjeta, en Catálogo e Inicio.
- Se muestra el precio normal tachado y el precio promocional al lado.
- Entra en la sección **"Aprovechá nuestras ofertas"** del Inicio (esa
  sección se muestra sola cuando hay al menos un producto en oferta; si
  no hay ninguno, queda oculta).
- Aparece al filtrar por "Solo ofertas" en el Catálogo.

No hace falta tocar nada del sitio: cargar `PrecioPromo` en la planilla
alcanza para que todo esto se actualice solo.

### Promos de cantidad (2x1, 3x2...)

Si escribís en `Promo` un texto con el patrón "NxM" (ej. `2x1`, `3x2`,
`4x3`), el sitio calcula solo el precio final en el carrito y en el
pedido: cobra las unidades "pagas" de cada grupo completo y deja el
resto sin cargo (ej. "2x1" y el cliente pide 5 → paga 3, se lleva 2
gratis). No hace falta cargar `PrecioPromo` para este caso — dejalo
vacío si el precio unitario no cambia, solo cambia la cantidad que se
cobra. El pedido que te llega (por mail y en el panel de administración
`admin.html`) marca claramente qué líneas son promo y cuántas unidades
van sin cargo.

## Cómo funciona "Precio por bulto cerrado"

Si cargás `PrecioBulto` en un producto, ese precio aparece en la ficha
de detalle rápido (el ícono del ojito 👁 en cada tarjeta), debajo del
precio unitario, con la etiqueta "Precio por bulto cerrado". Si la
dejás vacía, esa línea no se muestra.

Además, la ficha de detalle intenta reconocer sola cuántas unidades
trae el bulto a partir del nombre o la presentación (por ejemplo,
"24x150Gr" o "8 UNI. X 35 GR"). Es solo una ayuda visual — si querés
que sea exacto, lo mejor es escribirlo siempre igual en el nombre o la
presentación (ej. "24x150Gr").

## Precios visibles solo para clientes registrados

Los precios (en Catálogo, Inicio y la ficha de detalle) solo se
muestran a quien inició sesión. A un visitante sin cuenta se le muestra
"Precio para clientes registrados" con un link para iniciar sesión, en
vez del precio y el botón de agregar al carrito.

## Mail automático por cada pedido nuevo

Cada vez que un cliente confirma un pedido, ahora te llega un mail a tu
cuenta de Google (la misma con la que instalaste el Apps Script) con el
detalle completo: cliente, forma de entrega, cada producto con su
precio, y bien marcado si algún producto va con promo o con unidades
sin cargo. Esto es además de la fila que se guarda en la hoja "Pedidos"
y de lo que ves en `admin.html`.

Como este mail lo manda `Code.gs`, tenés que volver a hacer "Nueva
implementación" en el Apps Script (Extensiones → Apps Script →
Implementar → Nueva implementación) después de pegar la versión
actualizada del código, si no el mail no va a salir.

## Otros datos del negocio

Se configuran en `js/config.js`, dentro de `EMPRESA`:

- `whatsapp`: número sin el `+` (ej. `5493482713000`)
- `email`
- `direccionRetiro`
- `horarios`

Y la lista de zonas de reparto local en `ZONAS_REPARTO_LOCAL`.
