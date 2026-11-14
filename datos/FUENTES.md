# Fuentes de datos — análisis para Surco

Qué representa cada fuente que propone el desafío *Field Shift*, si sirve para
un lote del cinturón hortícola de Rosario y cómo se accede en tiempo real.

Las pruebas se hicieron el **sábado 14/11/2026** contra un punto rural de la
zona oeste de Rosario (`-33.02, -60.85`). "Último dato" es lo que devolvía
cada servicio ese día.

---

## 1. Resumen: qué usamos y para qué

| Necesidad de Surco | Fuente principal | Respaldo | Acceso |
|---|---|---|---|
| **Ciclos de cultivo y días de suelo desnudo** (hortalizas) | Sentinel-2 L2A (NDVI, 10 m) | HLS (NASA, 30 m) | Sin login / Earthdata |
| **Cobertura invernal entre filas** (vid, frutales) | Sentinel-2 L2A (NDVI, 10 m) | HLS | Sin login / Earthdata |
| **Clima de la campaña** | NASA POWER | IMERG (lluvia) | Sin login / Earthdata |
| **Estrés hídrico** | NASA POWER (`GWETROOT`, `GWETTOP`) | SMAP L3/L4 | Sin login / Earthdata |
| **Suelo del lote** | SoilGrids (ISRIC) | — | Sin login |
| **Pendiente y escurrimiento** | SRTM | — | Earthdata |
| **Calor y evapotranspiración a escala de lote** | ECOSTRESS | NASA POWER (`EVLAND`) | Earthdata |
| **Aptitud de cultivos por escenario** | FAO GAEZ | NASA POWER (`GDD*`, `FROST_DAYS`) | Descarga |

**Conclusión:** con tres servicios que no piden login (NASA POWER, Sentinel-2
vía Earth Search y SoilGrids) ya se puede armar la demo completa en tiempo
real. Las fuentes con Earthdata Login (HLS, SMAP, IMERG, ECOSTRESS, SRTM)
suman profundidad y más productos de la NASA para el pitch. Para usarlas hace
falta una cuenta gratuita en <https://urs.earthdata.nasa.gov>, que tiene que
crear alguien del equipo.

**Sobre "tiempo real":** importa en clima y humedad, que cambian día a día.
La verificación de prácticas mira campañas de meses, así que una demora de
dos semanas en una imagen no cambia el resultado.

---

## 2. La escala manda: tamaño del píxel contra el lote

Una quinta típica del cinturón tiene entre 1 y 5 ha. Con un lote de **2,5 ha**
(unos 160 × 160 m):

| Fuente | Píxel | Píxeles dentro del lote | Qué puede decir del lote |
|---|---|---|---|
| Sentinel-2 | 10 m | **~250** | El lote en sí, incluso parcelas internas |
| HLS / Landsat | 30 m | **~28** | El lote como unidad |
| SRTM | 30 m | ~28 | Pendiente del lote |
| ECOSTRESS | 70 m | ~5 | Temperatura del lote, con bordes mezclados |
| MODIS NDVI | 250 m (6,25 ha) | **menos de 1** | La zona, no el lote |
| SoilGrids | 250 m | menos de 1 | Suelo típico del lugar |
| VIIRS NDVI | 500 m | menos de 1 | La zona |
| IMERG | ~10 km | — | Lluvia de la zona |
| SMAP | 9 km | — | Humedad de la zona |
| NASA POWER | ~50 km | — | Clima regional |

**Esto define el modelo:** para verificar prácticas a nivel de lote sólo
sirven Sentinel-2, HLS y Landsat. Todo lo demás describe el **contexto** del
lote (clima, humedad, suelo de la zona), no al lote mismo. En la página del
QR esa diferencia tiene que quedar clara, por ejemplo "Clima de la zona ·
NASA POWER".

---

## 3. Fuentes de la NASA del desafío

### Landsat · MODIS · VIIRS: vegetación (NDVI)

- **Qué miden:** reflectancia de la superficie en el rojo y el infrarrojo
  cercano. De ahí sale el NDVI, que va de -1 a 1: una planta viva refleja
  mucho infrarrojo, así que NDVI alto significa vegetación verde y NDVI bajo
  (menos de 0,2–0,3) significa suelo desnudo.
- **Qué representan para Surco:** es **la** señal de verificación. Una serie
  de NDVI muestra cuándo hubo un cultivo en pie (picos), cuántos ciclos hubo
  en el año y cuánto tiempo quedó el suelo desnudo entre ciclos (valles
  largos). En la vid, un NDVI verde en invierno, cuando la planta no tiene
  hojas, indica cultivo de cobertura entre las filas.
- **Resolución:**
  - Landsat: 30 m, cada 16 días por satélite, 8 días combinando Landsat 8 y 9.
  - MODIS MOD13Q1: 250 m, compuesto de 16 días.
  - VIIRS VNP13A1: 500 m.
- **HLS (Harmonized Landsat Sentinel-2):** producto de la NASA que lleva
  Landsat y Sentinel-2 a una misma grilla de 30 m. Así se obtiene una pasada
  cada 2 o 3 días. Es la forma de decir "datos de la NASA" con la frecuencia
  que pide la verificación.
- **Acceso:**
  - HLS, Landsat y VIIRS: LP DAAC, con Earthdata Login, en formato COG
    (se puede leer sólo el recorte del lote).
  - MODIS: la API de subsets de ORNL (`modis.ornl.gov/rst`) devuelve la serie
    de un punto sin login.
- **Último dato al 14/11:**
  - HLS S30 (Sentinel): 01/11. HLS L30 (Landsat): 31/10.
  - MOD13Q1: 16/10. VNP13A1: 24/10.
  - En la API de ORNL, VIIRS se corta en mayo de 2024: para VIIRS hay que ir
    a LP DAAC.
- **Veredicto:** HLS es la fuente de la NASA para la verificación. MODIS sirve
  sólo como contexto regional, porque su píxel es más grande que el lote.

### NASA POWER: agroclima

- **Qué mide:** variables de meteorología y radiación solar derivadas de
  modelos y satélites. En la comunidad agrícola (AG) hay 152 parámetros
  diarios.
- **Qué representa para Surco:** el clima de la campaña de cada lote (lluvia,
  temperatura, heladas, grados-día), la humedad del suelo de la zona y la
  evapotranspiración. Es lo que se muestra en la página del QR y lo que
  alimenta el riesgo hídrico de cada escenario.
- **Resolución:** unos 50 km (grilla de 0,5° × 0,625°) y diaria. Fuentes
  según el encabezado de la respuesta: GEOS-IT, MERRA-2 y FLASHFlux.
- **Acceso:** API REST sin login: `power.larc.nasa.gov/api/temporal/daily/point`.
- **Último dato al 14/11:** 11/11 en meteorología, unos 3 días de demora.
  09/11 en radiación.
- **Veredicto:** fuente principal de clima. Detalle de parámetros en la
  sección 6.

### SMAP: humedad del suelo

- **Qué mide:** humedad superficial del suelo (primeros ~5 cm) por radiometría
  de microondas, y en el producto L4 también la zona de raíces (0–100 cm),
  completada con un modelo.
- **Qué representa:** si la zona está con sequía o con exceso de agua. Sirve
  para el riesgo hídrico de cada escenario y para mostrar condiciones de la
  campaña.
- **Resolución:** 9 km. L3 (`SPL3SMP_E`) es diario. L4 (`SPL4SMGP`) es cada
  3 horas, con zona de raíces.
- **Acceso:** NSIDC, con Earthdata Login.
- **Último dato al 14/11:** L3 del 12/11, L4 del 10/11.
- **Veredicto:** complemento. `GWETROOT` de POWER da una señal parecida sin
  login. SMAP agrega el sello "medido por satélite" para el pitch.

### GPM · IMERG: precipitación

- **Qué mide:** lluvia estimada combinando la constelación de satélites de
  GPM.
- **Qué representa:** cuánto llovió y con qué intensidad, el riesgo de
  erosión por tormentas fuertes y cuánta agua le entró al suelo.
- **Resolución:** 0,1° (~10 km), cada media hora o diaria. Versiones *Early*
  (horas de demora), *Late* y *Final* (meses de demora, la más precisa).
- **Acceso:** GES DISC, con Earthdata Login.
- **Último dato al 14/11:** 13/11 (Early y Late diarios).
- **En POWER:** el catálogo lista `IMERG_PRECTOT`, pero la API diaria no
  devolvió datos para Rosario entre 2024 y 2026.
- **Veredicto:** mejor que la lluvia de POWER (`PRECTOTCORR`, de modelo) para
  eventos puntuales. Es opcional para la demo.

### SRTM: relieve

- **Qué mide:** elevación del terreno (misión de radar del año 2000).
- **Qué representa:** pendiente, escurrimiento y riesgo de erosión hídrica.
- **Resolución:** 30 m, dato estático.
- **Acceso:** LP DAAC, con Earthdata Login.
- **Veredicto:** el cinturón hortícola de Rosario es casi plano, así que el
  aporte es chico. Sirve para descartar riesgo de erosión o para un lote en
  pendiente. Prioridad baja.

### ECOSTRESS: temperatura y evapotranspiración

- **Qué mide:** temperatura de la superficie (LST) y evapotranspiración (ET)
  desde la Estación Espacial Internacional.
- **Qué representa:** estrés por calor y demanda de agua del cultivo, a una
  escala cercana al lote.
- **Resolución:** 70 m. La revisita es irregular y a horas distintas del día,
  por la órbita de la Estación Espacial.
- **Acceso:** LP DAAC, con Earthdata Login.
- **Último dato al 14/11:** LST del 04/11, ET (`ECO_L3T_JET`) del 01/10.
- **Veredicto:** interesante para una versión futura ("tu lote se calienta
  más que el del vecino"). No es necesario para la verificación.

### NLDAS / GLDAS: asimilación de datos de superficie

- **Qué mide:** modelos de superficie terrestre alimentados con satélites y
  estaciones: humedad del suelo por capas, evapotranspiración, temperatura y
  radiación.
- **Alcance:** NLDAS cubre sólo América del Norte. GLDAS es global, a 0,25°.
- **Acceso:** GES DISC, con Earthdata Login.
- **Último dato al 14/11:** la búsqueda de `GLDAS_NOAH025_3H` no devolvió
  gránulos desde agosto. Puede ser la demora habitual del producto o un
  nombre distinto; está pendiente de verificar.
- **Veredicto:** POWER ya trae variables equivalentes con menos fricción.
  Queda descartado para la demo.

### GEDI: estructura de la vegetación

- **Qué mide:** altura del dosel y biomasa con láser.
- **Veredicto:** pensado para bosques y vegetación alta. No aplica a
  hortalizas. Descartado.

---

## 4. Fuentes de agencias socias

### Copernicus Sentinel-2 (ESA)

- **Qué mide:** imágenes multiespectrales con bandas pensadas para vegetación:
  rojo, infrarrojo cercano, red-edge y SWIR.
- **Qué representa:** NDVI y EVI a nivel de lote, con la mejor resolución
  disponible.
- **Resolución:** 10 m en rojo e infrarrojo, cada ~5 días.
- **Acceso:** catálogo STAC de Earth Search
  (`earth-search.aws.element84.com/v1`, colección `sentinel-2-l2a`). Sin
  login. Las imágenes son COG públicas en AWS, así que se lee sólo la ventana
  del lote. Trae la banda `scl`, la clasificación de escena, para descartar
  nubes y sombras.
- **Último dato al 14/11:** 11/11, con 3 % de nubes. En 45 días hubo 20
  escenas: casi la mitad con más de 70 % de nubes, así que el filtro de nubes
  es obligatorio.
- **Veredicto:** es la fuente principal para detectar ciclos y suelo desnudo
  en tiempo real. En el pitch se presenta junto con HLS: "la NASA armoniza
  Landsat y Sentinel-2".

### ERA5 (ECMWF)

- **Qué mide:** reanálisis climático horario: temperatura, lluvia, viento,
  humedad, temperatura y humedad del suelo, radiación.
- **Resolución:** 0,25°. La versión ERA5-Land llega a 0,1° (~9 km).
- **Acceso:** Copernicus Climate Data Store, con cuenta y clave de API.
- **Veredicto:** reemplazo de PRISM fuera de EE. UU. Para la demo, POWER ya
  cubre lo mismo sin login. Respaldo.

---

## 5. Fuentes que sólo cubren EE. UU.

Más de la mitad de la lista son bases de datos de EE. UU. que **no tienen
datos para Rosario**. Para cada una, lo que la reemplaza:

| Fuente del desafío | Qué es | Reemplazo para Rosario |
|---|---|---|
| Web Soil Survey, SSURGO/STATSGO2 | Suelos de EE. UU. | **SoilGrids** (global, 250 m). Cartas de suelo de INTA (GeoINTA), pendiente de verificar |
| PRISM | Clima de EE. UU. con efecto de la topografía | NASA POWER, ERA5-Land |
| NLDAS | Superficie terrestre de América del Norte | GLDAS, NASA POWER |
| Cropland Data Layer | Tipo de cultivo por píxel en EE. UU. | No hay equivalente con este detalle. Por eso Surco usa declaración del productor más validación satelital |
| NAIP | Fotos aéreas de 1 m en EE. UU. | Sentinel-2 (10 m) |
| NLCD | Cobertura del suelo de EE. UU. | MapBiomas Argentina, pendiente de verificar |
| CoCoRaHS | Pluviómetros comunitarios de América del Norte | IMERG. Estaciones locales (SMN, redes provinciales), pendiente de verificar |
| NWIS | Agua subterránea y ríos de EE. UU. | No aplica a la demo |
| OpenET | Evapotranspiración del oeste de EE. UU. | ECOSTRESS, NASA POWER (`EVLAND`) |
| LANDFIRE | Vegetación y combustibles de EE. UU. | No aplica |
| USDA AMS Market News | Precios de mercado de EE. UU. | Precios de mercados frutihortícolas locales, pendiente de definir y citar |
| USDA NASS QuickStats | Estadísticas agrícolas de EE. UU. | Estadísticas nacionales y provinciales, pendiente de definir |
| USDA Ag Data Commons | Datos agrícolas abiertos de EE. UU. | Referencias de INTA para los coeficientes del índice de suelo |

**Para el pitch:** que Surco funcione fuera de EE. UU. con fuentes globales es
un punto a favor. Las herramientas que dependen de SSURGO o CDL no se pueden
llevar a Argentina.

### FAO GAEZ: aptitud agroecológica

- **Qué es:** capas globales de aptitud por cultivo, restricciones de suelo y
  rindes potenciales.
- **Qué representa:** si un cultivo de la rotación propuesta es apto para el
  clima y el suelo del lote.
- **Acceso:** portal de FAO, descarga de capas, sin API simple.
- **Veredicto:** útil para justificar los escenarios del comparador con una
  fuente citable. Prioridad media: se puede consultar una vez y dejar los
  valores como referencia.

---

## 6. NASA POWER en detalle

El catálogo completo de la comunidad AG en resolución diaria está en
[`referencias/power_parametros_ag_diario.json`](referencias/power_parametros_ag_diario.json):
152 parámetros con unidad, fuente y definición. Lo devuelve
`GET https://power.larc.nasa.gov/api/system/manager/parameters?community=AG&temporal=daily`.

Los parámetros que sirven para Surco, todos probados con datos hasta el 11/11:

| Parámetro | Unidad | Qué representa | Uso en Surco |
|---|---|---|---|
| `T2M`, `T2M_MAX`, `T2M_MIN` | °C | Temperatura a 2 m: media, máxima y mínima | Clima de la campaña |
| `PRECTOTCORR` | mm/día | Lluvia (MERRA-2 con corrección de sesgo) | Clima, riesgo hídrico |
| `RH2M` | % | Humedad relativa a 2 m | Clima, riesgo de enfermedades |
| `ALLSKY_SFC_SW_DWN` | MJ/m²/día | Radiación solar en superficie | Contexto de crecimiento |
| `ALLSKY_SFC_PAR_TOT` | MJ/m²/día | Radiación fotosintéticamente activa | Contexto de crecimiento |
| `GWETTOP` | 0–1 | Humedad del suelo, primeros 5 cm (0 seco, 1 saturado) | Estrés hídrico superficial |
| `GWETROOT` | 0–1 | Humedad en la zona de raíces (~1 m) | **Riesgo hídrico** del escenario |
| `GWETPROF` | 0–1 | Humedad de todo el perfil | Reserva de agua |
| `EVLAND` | mm/día | Evaporación sobre tierra | Demanda de agua |
| `EVPTRNS` | MJ/m²/día | Evapotranspiración, como flujo de energía | Demanda de agua |
| `TSOIL1` | °C | Temperatura del suelo a 2–10 cm | Fecha de siembra, actividad biológica |
| `FROST_DAYS` | días | Días con helada | Riesgo para hortalizas |
| `GDD10` y otras bases | °C·día | Grados-día acumulados sobre 10 °C (o 4,4 / 7,2 / 13,3 / 15,6) | Ritmo de crecimiento por cultivo |
| `WS2M` | m/s | Viento a 2 m | Contexto (erosión eólica, pulverizaciones) |

**Listados en el catálogo, pero sin datos para Rosario** en la API diaria
(probado entre 2024 y 2026): `IMERG_PRECTOT`, `SFMC`, `RZMC`, `RZMC_PRCNTL`,
`GWM_HEIGHT` y `GWM_HEIGHT_ANOMALY` (nivel de agua subterránea). Puede que
estén sólo en otras resoluciones temporales o regiones. No contar con ellos.

**Valores faltantes:** POWER devuelve `-999` en los últimos días todavía no
procesados. Hay que tratarlos como dato faltante, nunca como un número.

---

## 7. Índices de Sentinel-2 que calcula Surco

Todos salen de la misma lectura por pasada (8 bandas, recortadas a la
parcela). Implementación: `surco_datos/sentinel2.py`.

| Índice | Bandas | Qué mide | Uso |
|---|---|---|---|
| NDVI | B08, B04 (10 m) | Vegetación verde | Ciclos de cultivo |
| NDTI | B11, B12 (20 m) | Residuos secos sobre el suelo | Rastrojo o suelo desnudo |
| BSI | B11, B04, B08, B02 | Suelo expuesto | Sólo informativo: no separó bien los casos |
| NDMI | B8A, B11 (20 m) | Agua en la vegetación | Estrés hídrico con cultivo en pie |
| NDRE | B8A, B05 (20 m) | Clorofila | Vigor donde el NDVI se satura |

**Calibración del NDTI (14/11/2026)**, con seis lotes de prueba del oeste de
Rosario y en las pasadas con NDVI < 0,3:

- Justo después de una cosecha (rastrojo fresco): NDTI de 0,13 a 0,21.
- Suelo trabajado, antes de sembrar o meses después de cosechar: NDTI de 0,00 a 0,08.
- Umbrales adoptados: rastrojo ≥ 0,12; desnudo ≤ 0,08; en el medio, "no se
  distingue". La humedad del suelo también baja el NDTI, así que la franja
  gris es real. Son valores provisorios, a ajustar con lotes conocidos.

## 8. Fuente fuera de la lista: SoilGrids (ISRIC)

No está en la lista del desafío, pero es la fuente global de suelo que
reemplaza a SSURGO.

- **Qué mide:** propiedades del suelo estimadas con aprendizaje automático a
  partir de perfiles reales: arcilla, arena, limo, carbono orgánico (SOC), pH,
  nitrógeno, densidad aparente. Se informa por profundidad (0–5, 5–15,
  15–30 cm, etc.).
- **Qué representa para Surco:** la línea de base del suelo del lote para el
  índice de salud. El **carbono orgánico** es el indicador que mejora con
  rotaciones y cobertura.
- **Resolución:** 250 m, dato estático. No muestra cambios de manejo: sirve
  como punto de partida, no para verificar.
- **Acceso:** `rest.isric.org/soilgrids/v2.0/properties/query`, sin login.
- **Probado al 14/11** (0–5 cm, cuatro puntos rurales del oeste de Rosario):
  - Arcilla: 27–28 %.
  - pH: 6,1–6,4.
  - Carbono orgánico: 24–30 g/kg.
- **Ojo:** en zonas que el modelo considera urbanas devuelve valores nulos (pasó
  con `-32.99, -60.78`). El servicio tiene que probar puntos vecinos o avisar
  que no hay dato.
- **Unidades:** vienen escaladas. Arcilla en g/kg (÷10 = %), pH ×10, SOC en
  dg/kg (÷10 = g/kg). Hay que convertirlas antes de mostrarlas.

---

## 9. Próximos pasos

1. **Crear una cuenta de Earthdata Login** (gratuita) para HLS, SMAP, IMERG,
   ECOSTRESS y SRTM. Guardar el token en `datos/.env` como `EARTHDATA_TOKEN`.
   Nunca se commitea.
2. Empezar por las fuentes sin login: NASA POWER (`/clima`), SoilGrids
   (`/suelo`) y Sentinel-2 (`/ndvi`).
3. Librerías previstas:
   - `requests` para POWER y SoilGrids.
   - `pystac-client` y `rasterio` para leer sólo la ventana del lote de cada
     COG.
   - `earthaccess` para los productos de Earthdata.
   - `scipy` para detectar picos de NDVI.
4. Cachear cada respuesta por lote y por fecha. Las fuentes son lentas (POWER
   tarda varios segundos) y la demo no puede depender de la red del lugar.
5. Todo dato que devuelva el servicio lleva `fuente` y `fecha`, como pide
   `AGENTS.md`.
