Surco es un marketplace de hortalizas, frutas y vinos trazables. Cada producto está ligado al lote donde creció, y las prácticas de suelo de ese lote (rotación, cobertura) se verifican con datos satelitales. La estética es **solarpunk tech**: tecnología al servicio de la naturaleza. Es luminosa, optimista y orgánica, y a la vez precisa como un panel de datos. Tagline: **Del satélite a tu mesa.**

## Voz

- Hablá de vos, en castellano rioplatense: "Escaneá el código", "Mirá dónde creció".
- Optimista y concreta: mostrá lo que ya funciona ("Este lote lleva 3 campañas sin suelo desnudo"), no lo que se pierde.
- Al consumidor, en palabras simples: "El suelo de este lote nunca quedó al descubierto", no "cobertura NDVI > 0.3".
- Al productor, en plata y en campañas: "Con el premium, rotar te deja $X más por hectárea desde la campaña 2".
- El dato siempre lleva su fuente y su fecha: "Sentinel-2 · 12 oct 2026". Nunca un número sin origen.
- Sin superlativos ni signos de exclamación, y sin emoji. No digas "100% orgánico": decí qué se verificó.
- Usá mayúscula solo al inicio de la oración: "Pasaporte del lote", no "Pasaporte Del Lote".

## Temas

- **Día** es el tema por defecto, para el marketplace y la página del QR: luminoso, como un campo al sol.
- **Noche** está pensado para los paneles del productor y la vista de datos satelitales, con aire de tablero de control.
- Los dos usan los mismos tokens. Cambiar de tema es cambiar `data-theme="dia"` por `data-theme="noche"`; no se elige ningún color a mano.

## Color

- La página va sobre `surface`. Tarjetas y paneles van en `surface-raised`, con borde `line` de 1px.
- El texto va en `ink`, y lo secundario en `ink-muted`.
- `hoja` es la marca y significa vida: el botón primario (una sola vez por vista), los enlaces, la curva NDVI y el cultivo en pie.
- Sobre un relleno `hoja`, `cielo`, `cobre` o `uva`, el texto va en `on-color`.
- `sol` es energía y atención: el sol de las ilustraciones, el estado Pendiente y el dato destacado de un gráfico. Nunca va como texto; encima lleva `on-sol`.
- `cielo` significa "lo vio el satélite": el estado Verificado, el sello del pasaporte, la serie de clima y los paneles solares en las ilustraciones.
- `cobre` es para cables, conexiones y la categoría Frutas.
- `uva` es para la categoría Vinos.
- `suelo-desnudo` se usa solo en gráficos.

## Categorías de producto

Cada categoría tiene un chip en estilo `etiqueta`, con texto `ink` y radio `radius-sm`:

| Categoría | Fondo del chip | Color de ilustración |
|---|---|---|
| Hortalizas | `hoja-soft` | `hoja` |
| Frutas | `cobre-soft` | `cobre` |
| Vinos | `uva-soft` | `uva` |

## Estados de verificación

Hay tres estados. Cada uno lleva **siempre** su palabra y su ícono, nunca solo el color:

| Estado | Fondo | Texto e ícono | Palabra |
|---|---|---|---|
| Verificado | `cielo-soft` | `cielo` + tilde | VERIFICADO |
| Pendiente | `sol` | `on-sol` + reloj | PENDIENTE |
| Sin verificar | `surface`, con borde `ink-muted` | `ink-muted` + guion | SIN VERIFICAR |

"Sin verificar" es neutro a propósito: significa que el satélite no lo pudo confirmar, no que el productor hizo algo mal. En el sistema no se usa rojo.

## Gráficos de datos

- **Curva NDVI:** línea `hoja` de 2px. Las áreas de suelo cubierto van en `hoja-soft` y los períodos de suelo desnudo en `suelo-desnudo`.
- **Clima (NASA POWER):** línea `cielo`.
- **Lo declarado por el productor:** barras con borde `ink-muted`, sin relleno.
- **Fondo de los paneles de datos:** grilla de puntos `line` a paso `space-6`. Es el gesto "tech" del sistema; no lo uses en el marketplace.
- **Valores y ejes:** en `dato` / `etiqueta` y `ink-muted`. Cada gráfico lleva una línea en `small` con la fuente y el período.
- Un solo color destacado por gráfico (`sol`). Sin degradés.

## Tipografía

- `display` y `titulo` van en Unbounded: ancha, redondeada, futurista y amable a la vez. Usá `display` una vez por pantalla.
- El texto corrido va en Instrument Sans: `subtitulo`, `body` y `small`.
- Lo técnico va en JetBrains Mono: `etiqueta` (sellos, chips, rótulos, en mayúsculas) y `dato` (NDVI, coordenadas, fechas de pasada, ID del pasaporte).
- Las tres familias se cargan desde Google Fonts.

## Espacio, forma y foco

- Escala de espaciado: `space-1` 4, `space-2` 8, `space-4` 16, `space-6` 24, `space-8` 40. Las tarjetas llevan padding `space-4`; entre secciones va `space-8`.
- Las formas son orgánicas y redondeadas:
  - `radius-md` en tarjetas, botones, mapas y gráficos.
  - `radius-lg` en paneles grandes y en el hero.
  - `radius-sm` en chips, sellos e inputs.
  - `radius-pill` en el sello circular del pasaporte, avatares y toggles.
- Usá bordes en lugar de sombras.
- El foco de teclado deja un espacio de 2px en `surface` y después un anillo sólido de 2px en `cielo`.

## Movimiento

- **Animación de marca:** es la portada de este sistema y sirve como hero de la landing y de la intro del pitch. Amanece el sol, los paneles agrovoltaicos se orientan hacia él, la energía baja por los postes, brota el cultivo y un satélite pasa y escanea el campo. Dura unos 5 s, se reproduce una vez al cargar y se repite con un clic.
- **Ilustraciones:** se construyen con formas planas de la paleta. Hay tres motivos: sol, paneles y brotes.
- **Movimiento en la interfaz:** que sea orgánico y corto. Las cosas crecen desde la base (`transform-origin` abajo) y la energía fluye en pulsos `sol`. Las transiciones de la interfaz duran entre 150 y 300 ms.
- **Sello Verificado:** al emitirse, aparece con un escaneo en `cielo`, nunca con confeti.
- **Movimiento reducido:** con `prefers-reduced-motion`, todo se muestra directamente en su estado final y no hay rotaciones continuas.

## Imágenes e íconos

- Fotos reales del productor y del lote, con luz natural y cálida. Nada de stock de verduras sobre fondo blanco.
- La vista satelital del lote es una imagen de primera clase: recortada a `radius-md` y con su fecha en `dato`.
- Íconos de trazo de 1.5px, en `currentColor`, con extremos redondeados. Recomendación: Lucide. Todavía no hay un set propio.
- Logo: todavía no existe. Escribí "Surco" en Unbounded 600, en `ink`.
