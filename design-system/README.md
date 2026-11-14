Surco es un marketplace de hortalizas, frutas y vinos trazables. Cada producto está ligado al lote donde creció, y las prácticas de suelo de ese lote (rotación, cobertura) se verifican con datos satelitales. La marca combina la tierra y el dato: calidez de suelo y de quinta, con la precisión de una medición. Tagline: **Del satélite a tu mesa.**

## Voz

- Hablá de vos, en castellano rioplatense: "Escaneá el código", "Mirá dónde creció".
- Al consumidor, en palabras simples: "Este lote nunca quedó con el suelo desnudo", no "cobertura NDVI > 0.3".
- Al productor, en plata y en campañas: "Con el premium, rotar te deja $X más por hectárea desde la campaña 2".
- El dato siempre lleva su fuente y su fecha: "Sentinel-2 · 12 oct 2026". Nunca un número sin origen.
- Sin superlativos ni signos de exclamación, y sin emoji. No digas "100% orgánico": decí qué se verificó.
- Usá mayúscula solo al inicio de la oración: "Pasaporte del lote", no "Pasaporte Del Lote".

## Color

La paleta sale de la quinta, la tierra y la mesa: lino, arcilla, tierra húmeda, malbec, oliva, trigo y cielo de campo.

- Fondo `surface`; tarjetas y paneles en `surface-raised` con borde `line` de 1px.
- El texto va en `ink`, y lo secundario en `ink-muted`.
- `arcilla` es la marca: botón primario una sola vez por vista, precios y enlaces.
- Sobre cualquier relleno oscuro (`arcilla`, `malbec`, `oliva`, `tierra`, `cielo`), el texto va en `on-color`.
- `tierra` es el suelo: franjas de tierra en ilustraciones y footer.
- `oliva` significa vegetación viva: la curva NDVI, un cultivo en pie, suelo cubierto, brotes.
- `cielo` significa "lo vio el satélite": el estado Verificado, el sello del pasaporte y la serie de clima.
- `trigo` marca lo pendiente y el dato destacado. Nunca como texto: siempre lleva `ink` encima.
- `suelo-desnudo` se usa solo en gráficos.

## Categorías de producto

Cada categoría tiene su chip, en estilo `etiqueta` con texto `ink` y radio `radius-sm`:

| Categoría | Fondo del chip | Color de ilustración |
|---|---|---|
| Hortalizas | `oliva-soft` | `oliva` |
| Frutas | `arcilla-soft` | `arcilla` |
| Vinos | `malbec-soft` | `malbec` |

## Estados de verificación

Hay tres estados. Cada uno lleva **siempre** su palabra y su ícono, nunca solo el color:

| Estado | Fondo | Texto e ícono | Palabra |
|---|---|---|---|
| Verificado | `cielo-soft` | `cielo` + tilde | VERIFICADO |
| Pendiente | `trigo` | `ink` + reloj | PENDIENTE |
| Sin verificar | `surface` con borde `ink-muted` | `ink-muted` + guion | SIN VERIFICAR |

"Sin verificar" es neutro a propósito: significa que el satélite no lo pudo confirmar, no que el productor hizo algo mal. No se usa rojo en ninguna parte del sistema.

## Gráficos de datos

- Curva NDVI: línea `oliva` de 2px. Las áreas de suelo cubierto van en `oliva-soft` y los períodos de suelo desnudo en `suelo-desnudo`.
- Clima de NASA POWER: línea `cielo`. Lo declarado por el productor: barras con borde `ink-muted` y sin relleno.
- Los valores y los ejes van en estilo `dato` y en `ink-muted`. Cada gráfico lleva una línea en `small` con la fuente y el período.
- Usá un solo color destacado por gráfico (`trigo`). Sin degradés.

## Tipografía

- `display` y `titulo` van en Young Serif: una serif robusta, de etiqueta de almacén y de vino. Tiene un solo peso (400), así que no le pongas negrita. Usá `display` una vez por pantalla.
- El texto de interfaz va en Karla, una sans humana y amigable: `subtitulo` (600), `body` y `small` (400), y `etiqueta` (600, en mayúsculas).
- Todo número medido (NDVI, coordenadas, fechas de pasada, ID del pasaporte) va en IBM Plex Mono, estilo `dato`, para que se lea como medición.
- Las tres familias se cargan desde Google Fonts.

## Espacio, forma y foco

- La escala de espaciado es `space-1` 4, `space-2` 8, `space-4` 16, `space-6` 24 y `space-8` 40. El padding de las tarjetas es `space-4` y la separación entre secciones es `space-8`.
- Tarjetas, botones, mapas y gráficos usan `radius-md`. Chips, sellos e inputs usan `radius-sm`. `radius-pill` queda solo para el sello circular del pasaporte y los avatares de productor.
- Bordes en lugar de sombras: sin sombras.
- El foco de teclado lleva primero un espacio de 2px en `surface` y después un anillo sólido de 2px en `cielo`.

## Movimiento

- **La animación de marca** es la portada de este sistema y sirve como hero de la landing y de la intro del pitch. La botella se vuelca sobre un cajón, el vino se derrama en la tierra y las uvas ruedan hasta quedar bajo "Surco". Mientras tanto, un satélite pasa y escanea el campo, y al final brotan los plantines. Se reproduce una vez al cargar (unos 5 s) y con un clic se repite.
- **Ilustraciones:** se construyen con formas planas de la paleta, sin degradés ni sombras.
- **Movimiento en la interfaz:** que sea físico y corto: una caída con rebote suave, cosas que crecen desde la base (`transform-origin` abajo). Las transiciones de la UI duran entre 150 y 300 ms.
- **El sello Verificado:** al emitirse, aparece con un escaneo en `cielo`, nunca con confeti.
- **Movimiento reducido:** con `prefers-reduced-motion`, todo se muestra directamente en su estado final.

## Imágenes e íconos

- Usá fotos reales del productor y del lote, con luz natural. No uses imágenes de stock de verduras sobre fondo blanco.
- La vista satelital del lote es una imagen de primera clase: va recortada a `radius-md` y con su fecha en `dato`.
- Los íconos son de trazo de 1.5px, en `currentColor`. Recomendación: Lucide. Todavía no hay un set propio.
- Logo: todavía no existe. Escribí "Surco" en Young Serif en `ink`.
