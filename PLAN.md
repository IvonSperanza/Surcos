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

## Pedidos al equipo de datos

Anotá acá lo que el front o el back necesitan de `datos/` y todavía no existe.

- …
