# Surco

**Comé con historia. Cuidá la tierra.** Cada producto de la quinta lleva un QR con la historia del lote donde creció: qué se sembró, qué se le aplicó y cuándo se cosechó. Cada práctica declarada se contrasta con lo que vio el satélite sobre esa parcela.

NASA Space Apps Challenge 2026 · Rosario (UCEL) · desafío *Field Shift: Adapting Farms with NASA Data* · eje AgTech **01, Nutrientes y Trazabilidad**.

| | |
|---|---|
| **Demo en vivo** | <https://surcos-staging.thorque.com.ar> (panel del productor en `/productor`) |
| **Página del QR, ejemplo** | <https://surcos-staging.thorque.com.ar/p/SUR-2026-0002>: lechuga con todas sus prácticas confirmadas por el satélite |
| **Caso que no coincide** | <https://surcos-staging.thorque.com.ar/p/SUR-2026-0004>: lo declarado no se ve en los datos |
| **Presentación y pitch** | [`docs/entregables/`](docs/entregables/) |
| **Propuesta completa** | [`docs/entregables/propuesta.md`](docs/entregables/propuesta.md) |

## El problema

En el cinturón hortícola de Rosario, vender a granel al mercado concentrador deja poco margen y muchas quintas terminan arrendadas para soja. Quien compra no puede distinguir una verdura cuidada de una que no, y certificar prácticas con una auditoría privada es caro para una quinta chica. Surco le da al productor una forma gratis de demostrar cómo trabaja su suelo y un canal de venta que se lo reconoce.

## Qué hace el prototipo

1. **El productor dibuja sus parcelas** sobre la imagen satelital. Cada parcela trae sola su clima (NASA POWER), su suelo (SoilGrids) y la curva de verde de Sentinel-2, con los ciclos de cultivo y los períodos de suelo desnudo detectados.
2. **Registra lo que hace en cada parcela:** labranza, siembra, cobertura, riego, fertilización, aplicaciones, daño por clima, fotos y cosecha. La especie y el cultivar salen del Catálogo Nacional de Cultivares del INASE, con su número de inscripción.
3. **Cada cultivo, de la siembra a la cosecha, es una producción** con su código (`SUR-2026-0002`). Desde la producción cosechada se imprime la etiqueta del producto, con el QR.
4. **El QR abre la historia verificada.** Cada evento declarado se contrasta con el satélite y vuelve con un veredicto: *lo confirma el satélite*, *hay un indicio*, *no se ve en los datos*, *sin imágenes cerca* o *dato del productor* (lo que no se ve desde el espacio, como una aplicación). Cada veredicto muestra por qué: el índice antes y después, lo que se esperaba ver, la escena de Sentinel-2 y su fecha.

**Cómo se verifica.** Son reglas deterministas en [`datos/surco_datos/contraste.py`](datos/surco_datos/contraste.py), sin aprendizaje automático: cada una dice qué índice tiene que cambiar y cuánto. Por ejemplo, después de una siembra el verde (NDVI) sube en las semanas siguientes; después de una labranza se va el rastrojo (NDTI) y queda suelo expuesto (BSI); una helada se cruza con la temperatura mínima diaria de NASA POWER. Si no hay imágenes sin nubes cerca de la fecha, no se afirma nada.

## Datos

Todo dato que se muestra lleva su fuente y su fecha.

| Dato | Fuente | Cómo se usa |
|---|---|---|
| Verde, rastrojo, agua y clorofila de la parcela (NDVI, NDTI, NDMI, NDRE, BSI) | **Sentinel-2 L2A** (ESA Copernicus, 10 m), vía Earth Search | Ciclos de cultivo, suelo desnudo y el contraste de cada evento |
| Lluvia, temperaturas, heladas, humedad del suelo, grados-día | **NASA POWER** (diario, comunidad agrícola) | Clima de la parcela, calendario de heladas, contraste de daños por helada y del riego |
| Textura, carbono orgánico, pH y nutrientes del suelo | **SoilGrids** (ISRIC) | Ficha de suelo de la parcela |
| Especies y cultivares | **Catálogo Nacional de Cultivares** (INASE) | Qué se sembró, con su número de inscripción |

El análisis de cada fuente del desafío (incluidas HLS, SMAP, ECOSTRESS y SRTM, que necesitan cuenta de Earthdata) está en [`datos/FUENTES.md`](datos/FUENTES.md).

**Límites.** Con 10 m de resolución el satélite no distingue una lechuga de un tomate, y un invernadero tapa la señal. Por eso el modelo es *declaración del productor + contraste satelital*: el satélite confirma que hubo una siembra, una cosecha o una cobertura en esa fecha, no qué especie fue. Los datos de la quinta de ejemplo (eventos y kilos) son de demostración; los datos satelitales y climáticos de sus parcelas son reales.

## Arquitectura

```
front/          React + Vite: landing, panel del productor y página pública del QR
back/           Express + TypeScript + Postgres (Drizzle): productor, parcelas, producciones, eventos, fotos
datos/          Python (FastAPI): Sentinel-2, NASA POWER, SoilGrids, INASE y las reglas de verificación
design-system/  tokens y manual de marca
infra/          deploy en staging (Docker Compose)
docs/           entregables y documentación del proyecto
```

El front llama al back para todo lo de negocio y a `datos/` para las series satelitales, el clima, el suelo y el contraste. Detalle de endpoints y reglas: [`AGENTS.md`](AGENTS.md).

## Cómo levantarlo

Cada servicio en su terminal, desde la raíz del repo:

```bash
# Postgres
cp back/.env.example back/.env && ln -s back/.env .env
docker compose up -d postgresdb

# back · http://localhost:3000
cd back && npm install && npm run dev

# datos · http://localhost:8000
cd datos && python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn surco_datos.api:app --port 8000

# front · http://localhost:5173
cd front && cp .env.example .env && npm install && npm run dev
```

Para cargar la quinta de ejemplo: `curl -X POST http://localhost:3000/demo/reiniciar`.

La primera consulta satelital de una parcela tarda uno o dos minutos; después sale de la caché.

## Uso de inteligencia artificial

Usamos asistentes de IA para programar, revisar código y redactar documentación. La verificación no usa IA: son reglas deterministas y auditables sobre datos públicos, y cada resultado muestra la medición que lo respalda.

## Equipo

Ivon Speranza y Lautaro Teta Musa, estudiantes de Ingeniería en Sistemas (UAI y UTN Rosario), en representación de la software factory Thorque.
