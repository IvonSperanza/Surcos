# Surco — Plan de implementación

Prioridad: que la idea se vea bien y sea implementable. No se publica en
producción, ni hace falta que todo funcione de punta a punta. Estructura y
reglas del código: `AGENTS.md`.

## Frentes

| Frente | Quién | Carpeta | Qué |
|---|---|---|---|
| **Datos** | Equipo de datos | `datos/` | Servicio Python en tiempo real: NASA POWER, NDVI (HLS/MODIS), suelo (SoilGrids), detección de ciclos y cobertura, índice de suelo, verificación |
| **Web y negocio** | Equipo web | `front/`, `back/` | Pantallas, mapa, gráficos, QR; módulos de productor, lote, campaña, pasaporte y producto |

Los dos frentes se encuentran en el contrato de `datos/` (sección "Datos" de
`AGENTS.md`). Mientras un endpoint no exista, el front usa fixtures con el
mismo tipo.

## Fases

### Fase 0 — Base · sáb hasta 16:00

| Datos | Web y negocio |
|---|---|
| Armar `datos/` (FastAPI) con `GET /salud` | Levantar Postgres, back y front locales |
| Cerrar el contrato de endpoints en `AGENTS.md` | Elegir el lote del cinturón verde y sus coordenadas, cargarlo como seed |

### Fase 1 — Primeros datos reales · sáb 16:00–18:00

| Datos | Web y negocio |
|---|---|
| `GET /clima` con NASA POWER | Módulos `productor` y `lote` en el back |
| `GET /suelo` con SoilGrids | Layout y componentes base: sello de estado, chip, tarjeta, línea de fuente |
| Investigar acceso en tiempo real a NDVI (HLS / MODIS) | Pantalla del lote en el mapa con fixtures |

### Fase 2 — Verificación · sáb 18:00–21:00

| Datos | Web y negocio |
|---|---|
| `GET /ndvi` y detección de ciclos, días de suelo desnudo, cobertura invernal | Módulos `campania` y `pasaporte` |
| `POST /verificacion` | Pantalla de verificación: semáforo por campaña y pasaporte con QR |

### Fase 3 — Escenarios y mercado · sáb 21:00–24:00

| Datos | Web y negocio |
|---|---|
| Índice de salud del suelo y riesgo hídrico, con citas | Comparador de escenarios: el gráfico "me conviene" |
| Márgenes por escenario con el premium | Módulo `producto` y pantalla de mercado |
| | Página pública del QR (`/p/:pasaporteId`) |

**Control a las 24:00:** el flujo completo se recorre de punta a punta, aunque
alguna parte siga con fixtures.

### Fase 4 — Completar · dom 9:00–12:00

| Datos | Web y negocio |
|---|---|
| Vid y frutal: cobertura invernal | Landing con el hero |
| README: qué datos de la NASA se usan y cómo | Conectar los fixtures que queden a los endpoints reales |
| Guion del pitch | Deck del pitch |

A las 12:00 no se agregan más funciones.

### Fase 5 — Congelar · dom 12:00–13:00

Sólo se arreglan errores. A las 13:00 se congela el código.

### Fase 6 — Entrega · dom 13:00–15:00, y hasta las 23:59

- Ensayar el pitch dos veces.
- Grabar un video corto del flujo, por si falla la conexión en la presentación.
- **15:00:** último push a GitHub.
- **Antes de 23:59:** formulario de Space Apps con el repo y el video.

## Si vamos atrasados

Se recorta de abajo hacia arriba:

1. **Imprescindible:** verificación con NASA (aunque sea un lote), semáforo,
   pasaporte con QR y página pública, mercado con un caso bueno y uno malo.
2. **Importante:** el gráfico "me conviene", la pantalla del lote en el mapa.
3. **Opcional:** landing animada, vino y fruta, detalles visuales.

## Parcelas y eventos de manejo

**Fase A · Parcelas (hecha).** Mapa con todas las parcelas, alta dibujando el
polígono, ficha con datos reales y el estado de generación de cada fuente.
Se guardan en el navegador (`front/src/api/parcelas.ts`) hasta que el back
tenga los módulos `lote` y `evento`.

**Fase B · Registro de eventos (hecha).** Formulario por parcela (tipo, fecha,
datos propios del tipo, notas), historia en la ficha y marcas sobre la curva de
NDVI. Siembra y cobertura usan el catálogo del INASE: especie oficial con su
familia botánica, y cultivar inscripto (con su número) o declarado. Pendiente:
foto del rótulo de la bolsa de semilla.

**Producciones (hecha).** Lo vendible: un cultivo de su siembra a su cosecha.
Las producciones tienen su propia sección en el panel (reemplaza a "Productos y QR"): una tabla con filtros por estado, parcela y cultivo, y una ficha por producción con la parcela, el cultivar, lo que se le aplicó, el cultivo de la siembra a la cosecha y el historial previo de la parcela. Esa ficha (`DetalleProduccion`) no depende del panel: es la que va a mostrar la página pública del QR.

**Fotos (hecha).** Llevan foto la cosecha (optativa) y el evento "Foto del cultivo", que sirve para mostrar cómo viene creciendo un cultivo en pie; los eventos de manejo no llevan foto. El formulario abre la cámara en el celular y la achica a 1200 px antes de guardarla. La foto de una producción es la de su cosecha o, si sigue en pie, la foto del cultivo más reciente; se ve en la tabla, arriba de la ficha y en la línea de tiempo, siempre con su origen ("Foto del productor" o autor y licencia). Los datos de ejemplo usan fotos de huertas reales de Wikimedia Commons (`front/public/fotos-ejemplo/`, créditos en `front/src/api/fixtures/fotosEjemplo.json`). Pendiente: foto de referencia de la especie cuando la producción no tiene ninguna.
Una parcela tiene un cultivo a la vez y la cosecha es total; las producciones se
deducen de los eventos (`front/src/features/producciones/producciones.ts`). La
cosecha no pregunta qué se cosechó (es lo que se plantó), sólo los kg. Cada
producción muestra aparte el "Historial de la parcela" (lo que pasó desde la
cosecha anterior hasta la siembra) y "El cultivo". Siguiente: productos a la
venta creados desde cada cosecha.

**QR y etiqueta (hecha).** Cada producción tiene un código corto (`SUR-` y 8
caracteres de su id) y una página pública en `/p/:codigo`, sin el panel y en
tema Día, que muestra `DetalleProduccion`. Desde la ficha de una producción
cosechada se imprime la etiqueta del producto (90 × 50 mm, diez por hoja A4):
cultivo, cultivar con su n.º del INASE, cosecha, parcela, el QR y el código. El
QR apunta a `VITE_URL_PUBLICA` o, si falta, a la dirección del navegador.
Límite actual: las producciones viven en el navegador del productor, así que la
página pública sólo las encuentra ahí. Pedido al back: `GET /producciones/:codigo`
público, con la producción, su parcela y sus eventos.

**Fase C · Contraste con el satélite (hecha).** `POST /contraste` en `datos/`, con
reglas deterministas como las de `insights.py`: cada evento declarado vuelve
como "el satélite lo confirma", "no se ve en los datos", "no hay pasadas
cerca" o "dato declarado (no visible desde el satélite)", con su evidencia. En la ficha
de la producción (y en la página del QR) la "Historia verificada" muestra la
curva de NDVI con los ciclos detectados y cada evento marcado con su
veredicto; cada evento abre su porqué: la curva del índice alrededor de la
fecha, el antes y el después, lo que se esperaba y la escena de Sentinel-2.
Los eventos del ejemplo siguen lo que vio el satélite en los canteros; la
"Parcela verde del oeste" es a propósito el caso que no coincide (el satélite
la ve verde todo el año).

| Evento | Qué se registra | Señal esperada | ¿Se contrasta? |
|---|---|---|---|
| Siembra o trasplante | Cultivo, familia, directa o trasplante | NDVI sube en 2–6 semanas | Sí, con la ventana de plantación del ciclo detectado |
| Cosecha | Cultivo, total o parcial | NDVI cae de golpe | Sí, con la ventana de cosecha detectada |
| Labranza (arada, rastra, rotovator) | Tipo de labor | Baja el NDTI (se va el rastrojo), sube el BSI | Sí, confianza media (umbrales provisorios) |
| Siembra de cobertura o abono verde | Especie | NDVI sube en un período que si no quedaría sin cultivo | Sí: es la práctica que verifica Surco |
| Incorporación o rolado de cobertura | Método | NDVI baja; rastrojo o suelo trabajado | Sí |
| Riego | Método, lámina | Sube el NDMI con cultivo en pie | Parcial |
| Fertilización (química u orgánica) | Producto, dosis | Sube el NDRE en semanas | Débil: indicio, nunca confirmación |
| Aplicación fitosanitaria | Producto, dosis, carencia | Nada visible | No: dato declarado, valioso para el consumidor |
| Desmalezado, mulching | Manual o mecánico, plástico u orgánico | Poco o nada | No, o con aviso |
| Helada o granizo (daño) | Daño estimado | Mínima de NASA POWER | Sí, con el clima diario |

## Pedidos al equipo de datos

Anotá acá lo que el front o el back necesitan de `datos/` y todavía no existe.

- …
