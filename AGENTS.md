# Surco — guía para agentes

Surco es un marketplace de alimentos trazables: cada producto está ligado al
lote donde creció, y las prácticas de suelo de ese lote (rotación, cobertura)
se verifican con datos satelitales de la NASA. Proyecto para NASA Space Apps
2026 (Rosario). Contexto completo del producto: `PROYECTO.md`. Fases y
horarios: `PLAN.md`.

**Prioridad de la hackatón:** que la idea se vea bien y sea implementable. No
se publica en producción. Preferí una pantalla que cuente bien la historia a
una funcionalidad completa que nadie ve en la demo.

## Arquitectura

```
                 ┌──────────────────────────┐
                 │  front/  React + Vite    │
                 └─────┬──────────────┬─────┘
       negocio (api)   │              │   datos satelitales y de suelo (datos)
                       ▼              ▼
   ┌────────────────────────┐   ┌──────────────────────────────┐
   │ back/  Express + TS    │──►│ datos/  Python (tiempo real)  │──► NASA POWER, HLS/MODIS,
   │ Postgres (Drizzle)     │   │                              │    SMAP, SoilGrids
   └────────────────────────┘   └──────────────────────────────┘
```

| Carpeta | Qué es | Dueño |
|---|---|---|
| `front/` | La web: productor (planificar, verificar) y consumidor (mercado, QR) | Web/back |
| `back/` | Lógica de negocio: productores, lotes, campañas declaradas, pasaportes, productos | Web/back |
| `datos/` | Servicio Python: consulta NASA y suelos en tiempo real, detecta ciclos y cobertura | Equipo de datos |
| `design-system/` | Tokens, manual de marca y animación del hero. Fuente de verdad visual | Compartido |

- El front llama a **dos** servicios: `api` (back) para todo lo de negocio y
  `datos` (Python) para series NDVI, clima y suelo de un lote.
- El back llama a `datos` sólo cuando una regla de negocio lo necesita (ej.
  verificar una campaña antes de emitir el pasaporte).
- **No edites `datos/`** si trabajás en front o back. Si te falta un dato o un
  endpoint, usá un fixture en el front (ver más abajo) y dejá anotado qué
  necesitás en la sección "Pedidos al equipo de datos" de `PLAN.md`.

## Puertos y variables

| Servicio | Puerto | Variables |
|---|---|---|
| front | 5173 | `front/.env`: `VITE_API_URL`, `VITE_DATOS_URL` (ver `front/.env.example`) |
| back | 3000 | `back/.env` (ver `back/.env.example`) |
| datos | 8000 | `datos/.env` |
| Postgres | 5432 | los de `back/.env` |

## Cómo levantar

```bash
# Postgres (una vez): cp back/.env.example back/.env && ln -s back/.env .env
docker compose up -d postgresdb

cd back && npm install && npm run dev        # http://localhost:3000
cd front && npm install && npm run dev       # http://localhost:5173
```

## Sobre de respuesta (back y datos)

Los dos servicios responden igual, así un solo cliente HTTP sirve para ambos
(`front/src/api/client.ts`):

```jsonc
{ "success": true, "message": "opcional", "data": { ... } }                 // 2xx
{ "success": false, "errors": [{ "code": "NotFound", "message": "..." }] } // 4xx/5xx
```

Helpers en el back: `back/src/lib/http/responses.ts` (`ok`, `created`,
`updated`, `deleted`, `list`) y errores en `back/src/lib/http/errors.ts`.

## Regla de oro de los datos

**Todo dato que se muestra lleva su fuente y su fecha** ("Sentinel-2 · 12 oct
2026", "NASA POWER · consultado 14 nov 2026"). Ningún número sin origen. Si un
valor es de referencia o simulado, se dice. No se inventan citas: si no hay
fuente todavía, el valor lleva `"cita": "PENDIENTE"`.

---

## Back (`back/`)

Express 5 + TypeScript + Drizzle (Postgres) + bradb + zod. Es el template de
Thorque. **Leé `back/ARCHITECTURE.md` antes de tocar nada**: ahí están las
capas, un ejemplo completo de módulo y los pasos para crear uno.

```
back/src/
  modules/<nombre>/   un módulo por entidad de negocio
  lib/http/           sobre de respuesta y errores
  db/                 client de Drizzle (db, Tx) y barrel de schemas
  container.ts        composition root: arma los módulos e inyecta dependencias
  app.ts              monta cada module.router bajo su prefijo
  index.ts            entrypoint
```

Un módulo = `schema` → `validator` → `filter` → `repository` (sólo queries) →
`service` (reglas de negocio, transacciones) → `controller` (adapter HTTP) →
`routes` → `index.ts` (`createXModule`). Desde afuera sólo se importa
`index.ts` o `*.schema.ts`.

Módulos previstos (ninguno creado todavía):

| Módulo | Qué guarda |
|---|---|
| `productor` | Nombre, localidad, desde cuándo produce, foto |
| `lote` | Productor, tipo (`hortalizas` · `vid` · `frutales`), centro y polígono, superficie |
| `campania` | Lo que el productor declara por campaña: cultivos, familia, siembra, cosecha |
| `pasaporte` | Lote + campaña + estado (`verificado` · `pendiente` · `sin_verificar`) + prácticas verificadas. ID tipo `SUR-2026-0001` |
| `producto` | Catálogo del mercado: categoría, precio, precio de referencia, unidad, lote, pasaporte, cosecha |

Sin login ni usuarios en la demo: no hay middleware `auth` ni PK compuesta
`(id, user)` todavía (ver nota al inicio de `ARCHITECTURE.md`).

**Antes de dar una tarea por terminada:**

```bash
cd back
npx tsc --noEmit -p tsconfig.json
npx eslint src/
npx madge --circular --extensions ts src
```

## Front (`front/`)

React 19 + Vite + TypeScript, react-router, Recharts (gráficos),
react-leaflet (mapa), qrcode.react (QR), lucide-react (íconos).

```
front/src/
  api/client.ts       cliente HTTP único; exporta `api` (back) y `datos` (Python)
  api/<recurso>.ts    funciones tipadas por recurso: getLote(id), getNdvi(lat, lon)...
  api/fixtures/       respuestas de ejemplo mientras un endpoint no existe
  features/<nombre>/  una carpeta por pantalla: Page + hooks + componentes propios
  design-system/      componentes de UI reutilizables + barrel index.ts + styles.css
  layout/             encabezado, navegación, contenedor de página
  lib/                helpers sin UI (fechas, moneda, errores)
```

### Pantallas y rutas

| Ruta | Pantalla | Usuario |
|---|---|---|
| `/` | Landing con el hero (`design-system/hero/surco-hero.html`) | Todos |
| `/lote/:id` | Lote en el mapa: historial detectado y clima | Productor |
| `/lote/:id/escenarios` | Comparador de escenarios: el gráfico "me conviene" | Productor |
| `/lote/:id/verificacion` | Semáforo por campaña y pasaporte con QR | Productor |
| `/mercado` | Catálogo con chips de categoría y sellos | Consumidor |
| `/p/:pasaporteId` | Página pública del QR: trazabilidad del producto | Consumidor |

### Sistema de diseño de Surco

El **único** sistema de diseño de este proyecto es el de `/design-system/`
(raíz del repo). Leé `design-system/README.md` antes de escribir UI.

- **No uses** Tailwind, shadcn/ui, MUI, Chakra, Bootstrap ni ningún kit de
  componentes externo. Tampoco el sistema de diseño de otro proyecto de
  Thorque (Epublit, Mango, etc.): los nombres de tokens no coinciden y rompen
  la marca.
- `front/src/design-system/styles.css` importa `/design-system/tokens.css`.
  Si cambia un token, se edita `tokens.json` y se regenera `tokens.css`; nunca
  se pisa en el front.

| Tipo | Tokens (`var(--…)`) |
|---|---|
| Superficies y texto | `surface`, `surface-raised`, `line`, `ink`, `ink-muted`, `on-color` |
| Marca y significado | `arcilla` (marca, primario, precios), `oliva` (vegetación, NDVI), `cielo` (lo vio el satélite, Verificado), `trigo` (pendiente, dato destacado), `malbec` (vinos), `tierra` (suelo, footer), `suelo-desnudo` (sólo gráficos) |
| Suaves (fondos de chips/sellos) | `oliva-soft`, `arcilla-soft`, `malbec-soft`, `cielo-soft` |
| Tipografía | `font-display` (Young Serif), `font-sans` (Karla), `font-mono` (IBM Plex Mono) |
| Espacio | `space-1` 4 · `space-2` 8 · `space-4` 16 · `space-6` 24 · `space-8` 40 |
| Radio | `radius-sm` (chips, sellos, inputs) · `radius-md` (tarjetas, botones, mapas, gráficos) · `radius-pill` (sólo sello del pasaporte y avatares) |

Clases de texto (definidas en `tokens.css`): `.display`, `.titulo`,
`.subtitulo`, `.body`, `.small`, `.etiqueta`, `.dato`.

Componentes que hay que construir primero en `src/design-system/components/`
(siguiendo las tablas de `design-system/README.md`):

| Componente | Spec en el README |
|---|---|
| `SelloVerificacion` | "Estados de verificación": Verificado / Pendiente / Sin verificar, con ícono y palabra |
| `ChipCategoria` | "Categorías de producto": Hortalizas / Frutas / Vinos |
| `Fuente` | "Voz": línea `small` con fuente y fecha del dato |
| `Card`, `Button` | "Color" y "Espacio, forma y foco" |
| `GraficoNdvi` | "Gráficos de datos": línea `oliva`, áreas cubierto / desnudo |

### Reglas del front

- **Sistema de diseño primero.** Los tokens se importan desde
  `/design-system/tokens.css` (vía `src/design-system/styles.css`), nunca se
  copian ni se hardcodean colores, tipografías o espaciados. Los componentes
  reutilizables (botón, tarjeta, chip de categoría, sello de verificación,
  línea de fuente) viven en `src/design-system/components/` y se importan
  siempre del barrel `src/design-system`. Antes de crear un componente, leé
  `design-system/README.md`: define colores por significado, los tres estados
  de verificación, los gráficos y la voz.
- **Composición > herencia.** Sólo componentes función y hooks. Un hook recibe
  sus dependencias por parámetro (el cliente, un id) en vez de importar un
  singleton. Context sólo para estado realmente transversal.
- **Un componente/hook, una responsabilidad.** Fetch y lógica en un hook
  (`useLote`, `useNdvi`); render en un componente de presentación puro.
- **Errores** se manejan donde se pueden mostrar, con `lib/errors.ts`
  (`getErrorMessage`), no con try/catch disperso.
- **Fixtures:** si un endpoint de `datos/` o del back todavía no existe, la
  función de `api/<recurso>.ts` devuelve el fixture de `api/fixtures/` con el
  mismo tipo. Cuando el endpoint aparece, se cambia sólo esa función.
- Sin `any`, salvo en el borde con una librería sin tipos.

### Reglas de marca que más se olvidan

- Voz de vos, rioplatense. Sin superlativos, sin signos de exclamación, sin
  emoji. Mayúscula sólo al inicio de la oración.
- No se usa rojo en ninguna parte. "Sin verificar" es neutro, no un error.
- Cada estado de verificación lleva color + palabra + ícono, nunca sólo color.
- Bordes en lugar de sombras. Sin degradés.
- `display` (Young Serif) una vez por pantalla. Números medidos en `.dato`
  (IBM Plex Mono).

**Antes de dar una tarea por terminada:**

```bash
cd front
npx tsc -b
npx oxlint
```

## Datos (`datos/`) — referencia para front y back

Servicio Python (FastAPI) a cargo del equipo de datos. **El contrato todavía
es un borrador**: usalo para tipar los fixtures, pero puede cambiar.

| Endpoint | Devuelve |
|---|---|
| `GET /salud` | Que el servicio está vivo |
| `GET /clima?lat&lon&desde&hasta` | Temperatura y precipitación de NASA POWER |
| `GET /suelo?lat&lon` | Textura, carbono orgánico y pH (SoilGrids) |
| `GET /ndvi?lat&lon&desde&hasta` | Serie NDVI con fecha y fuente por punto |
| `POST /verificacion` | Recibe lote + campaña declarada; devuelve lo detectado (ciclos, días de suelo desnudo, cobertura invernal) y el estado |

---

## Reglas de estilo (todo el repo)

### Inyección de dependencias
Inyección de dependencias > herencia. Preferir funciones/objetos que reciban
sus dependencias como parámetros antes que jerarquías de clases con lógica
compartida por herencia.

### DRY
No duplicar lógica. Si algo se repite, se extrae a una función/helper
compartido.

### Comentarios y documentación
Sólo explican el *por qué*, nunca el *qué*. Lo que hace una función tiene que
quedar claro con su nombre (y el de sus parámetros/variables). Si hace falta un
comentario para entender qué hace el código, el problema es el nombre o la
estructura, no la falta de comentario.

### Una función, una responsabilidad
Si una función hace más de una cosa, se separa en funciones más chicas, cada
una con un nombre que refleje su responsabilidad. No crear wrappers/indirección
que no agreguen lógica (ej.: no envolver `builder.update()` en una función
`update` que sólo lo reenvía).

### Evitar try/catch
Evitar el uso de try/catch innecesario.

### Git
Commits chicos, en castellano, y `git pull --rebase` antes de cada push. No se
commitean `.env`, `node_modules/`, `dist/` ni `postgres/`.
