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
| `Categoria` | Sí | Categoría (se usa para el menú y los filtros) | `Golosinas` |
| `Marca` | No | Marca del producto | `Fantoche` |
| `Presentacion` | No | Formato/presentación, si no está ya en el nombre | `Caja x 24` |
| `Precio` | Sí | Precio normal, en pesos | `2050` o `2.050,00` |
| `Stock` | No | Cantidad disponible. Si la dejás vacía, la web muestra "Disponible" sin límite. Poné `0` a propósito si de verdad no hay stock | `15` |
| `Proveedor` | No | Si una pestaña mezcla productos de más de un proveedor. Si no la completás, se usa el nombre de la pestaña | `Ramseyer` |
| `Imagen` | No | URL pública de una foto del producto | `https://...jpg` |
| `Destacado` | No | Poné `SI` para que aparezca en "Productos destacados" del Inicio | `SI` |
| `Promo` | No | Texto corto para la cinta de oferta (si lo dejás vacío se muestra "OFERTA") | `2x1`, `20% OFF` |
| `PrecioPromo` | No | Precio promocional. **Tiene que ser menor a `Precio`** para que se active la oferta | `1750` |
| `PrecioBulto` | No (nueva) | Precio del bulto/caja cerrada, si querés mostrarlo aparte del precio unitario | `35000` |

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

## Otros datos del negocio

Se configuran en `js/config.js`, dentro de `EMPRESA`:

- `whatsapp`: número sin el `+` (ej. `5493482713000`)
- `email`
- `direccionRetiro`
- `horarios`

Y la lista de zonas de reparto local en `ZONAS_REPARTO_LOCAL`.
