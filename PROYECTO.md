# Surco — Descripción del proyecto

> **Del satélite a tu mesa.**
> Marketplace de alimentos trazables donde cada producto está ligado al lote donde creció y las prácticas de suelo de ese lote se verifican con datos satelitales de la NASA.

- **Competencia:** NASA Space Apps Challenge 2026, sede Rosario (UCEL).
- **Desafío:** *Field Shift: Adapting Farms with NASA Data*. Pide una herramienta que cruce observaciones de la NASA con datos de suelo, cultivos y prioridades del productor para explorar rotaciones que fortalezcan el suelo.
- **Entregas:** repositorio en GitHub el domingo 15/11 a las 15:00; entrega final en la plataforma de Space Apps el 15/11 hasta las 23:59.

---

## 1. El problema

Los pequeños productores no degradan el suelo por desconocimiento. Lo hacen porque **la estructura de incentivos los obliga a priorizar el corto plazo**. Rotar cultivos, dejar cobertura entre ciclos o sembrar cobertura entre filas mejora el suelo en años, pero cuesta hoy. Un productor sin espalda financiera no puede esperar.

En el cinturón hortícola de Rosario esto es visible desde hace décadas: la soja compite por la tierra con las quintas. Al horticultor que no gana lo suficiente, arrendar su tierra para soja le conviene más que seguir produciendo alimentos.

Además, los mercados que pagan más por alimentos producidos de forma sustentable exigen **certificaciones caras** que la agricultura familiar no puede pagar.

**Conclusión:** una solución que apele solo a la conciencia ambiental va a fracasar. La pregunta correcta es *¿qué palanca económica hace que cuidar el suelo sea más rentable hoy?*

## 2. La solución

Surco convierte las buenas prácticas de suelo en un **valor que el consumidor puede ver y pagar**:

1. Ayuda al productor a **planificar** una rotación o cobertura y le muestra en plata que le conviene.
2. **Verifica** con datos satelitales abiertos que la práctica efectivamente ocurrió, sin certificadora central.
3. Emite un **pasaporte del lote** con QR.
4. Vende sus productos en un **marketplace** donde el sello de práctica verificada justifica un precio mejor.
5. El consumidor escanea el QR y ve la **trazabilidad completa** del alimento.

> **Frase del pitch:** "No le pedimos al productor que cuide el suelo por conciencia: le damos un mercado que le paga por hacerlo, y usamos satélites de la NASA para demostrar que lo hizo."

## 3. Usuarios

| Usuario | Qué necesita | Qué le da Surco |
|---|---|---|
| **Productor** (horticultor, fruticultor, viñatero, cooperativa) | Vender mejor sin pagar certificaciones caras | Planificador, pasaporte verificado, canal de venta con premium |
| **Consumidor / restaurante** | Saber de dónde viene lo que come y cómo se produjo | Marketplace con trazabilidad por QR |
| **Cooperativa** (fase 2) | Auditar y comercializar en conjunto | Panel de sus miembros y sus pasaportes |

## 4. Productos y qué se verifica en cada uno

El marketplace vende productos trazables: **hortalizas, frutas y vinos**. Las frutas y los vinos vienen de cultivos perennes, que no rotan, así que la práctica de suelo que se verifica cambia según el producto:

| Producto | Práctica de suelo | Señal satelital |
|---|---|---|
| Hortalizas | Rotación por familias, sin suelo desnudo entre ciclos | Cantidad de ciclos por año y días de suelo descubierto (NDVI) |
| Vino y frutales | Cultivo de cobertura entre las filas | En invierno la planta está sin hojas: si el NDVI sigue verde, hay cobertura |
| Todos | Origen y condiciones de la campaña | Ubicación del lote, clima de la temporada (NASA POWER), estrés hídrico (SMAP) |

**Límite honesto:** con 10 m de resolución (Sentinel-2) el satélite no distingue lechuga de tomate, y los invernaderos tapan la señal. Por eso el modelo es **declaración del productor + validación satelital**. El productor declara qué plantó y el satélite confirma que el lote tuvo ese patrón de ciclos y de cobertura.

## 5. El flujo

```
PRODUCTOR                                   CONSUMIDOR
─────────                                   ──────────
1. Planificar      → compara escenarios
   y registrar       (margen + salud del suelo)
        │
2. Verificar       → declarado vs. satélite
        │            semáforo por campaña
        ▼
   Pasaporte del lote (QR) ─────────────►  3. Marketplace
                                               producto + sello
                                                    │
                                           4. Escanear QR
                                               mapa, historial,
                                               clima, cosecha
```

### Módulo 1 — Planificar y registrar
- El productor elige un lote en el mapa.
- Ve el historial detectado por satélite y el clima de la zona.
- Compara 3 escenarios a 5 años:
  - Hortalizas: monocultivo intensivo vs. rotación por familias vs. rotación con abono verde.
  - Vid: sin cobertura vs. con cobertura.
- Cada escenario muestra **margen** (con el premium de Surco incluido), **índice de salud del suelo** y **riesgo hídrico**.
- **El gráfico clave de la demo:** con el premium, la práctica sustentable iguala o supera al manejo convencional desde la campaña X.

### Módulo 2 — Verificar
- Cruza lo declarado por el productor con lo que detecta el satélite en cada campaña.
- Estados: **Verificado** · **Pendiente** · **Sin verificar**. "Sin verificar" es neutro: significa que el satélite no pudo confirmarlo, no una acusación.
- Si se cumple, emite el **pasaporte del lote**, con un ID y un QR.

### Módulo 3 — Marketplace
- Catálogo por categoría: Hortalizas, Frutas, Vinos.
- Cada producto está vinculado a su lote y lleva el sello de práctica verificada.
- Compra: maqueta, sin pagos reales.

### Módulo 4 — Trazabilidad (página pública del QR)
- Muestra el lote en el mapa, al productor, el historial de cultivos y de cobertura con la curva NDVI, el clima de la temporada y la fecha de cosecha.
- Todo dato lleva su fuente y su fecha: "Sentinel-2 · 12 oct 2026".

## 6. Alcance del MVP (demo del domingo)

**Entra:**
- El flujo completo con **un horticultor del cinturón verde de Rosario**: planificar → verificar → pasaporte → producto en el marketplace → página del QR.
- El marketplace con 2 o 3 productos más: un vino y una fruta, con su pasaporte de cobertura ya generado, para mostrar que el modelo escala.
- Un caso "bueno" (verificado) y uno "malo" (sin verificar), para mostrar el semáforo.

**No entra (queda como visión en el pitch):**
- Pagos y logística reales.
- Procesamiento satelital en vivo de cualquier lote.
- **Fase 2:** propiedad compartida o tokenización de la cosecha esperada, para que los productores financien su transición con el mismo sistema de verificación.

## 7. Datos

| Dato | Fuente en producción | En la demo |
|---|---|---|
| NDVI por lote | HLS (Harmonized Landsat Sentinel-2), MODIS MOD13Q1 | Series **simuladas** cada 16 días con la curva típica de cada cultivo |
| Clima | NASA POWER | **NASA POWER real** (API REST, por coordenadas del lote) |
| Humedad del suelo | SMAP | Simulada |
| Suelo | SoilGrids / INTA | Valores de referencia |
| Márgenes y precios | Mercados de la zona / productores | Valores de referencia, con su fuente citada |

### Series simuladas
- **Hortalizas:** 3–4 ciclos cortos por año.
  - Caso bueno: ciclos encadenados, sin suelo desnudo entre ellos.
  - Caso malo: largos períodos con NDVI bajo.
- **Viñedo:** curva anual de la vid (brotación en primavera, caída de hojas en otoño), más una base invernal alta si hay cobertura o baja si no hay.
- El **algoritmo de detección es real** aunque el dato sea simulado. Detecta ciclos por picos de NDVI, mide los días bajo un umbral de suelo desnudo y la cobertura invernal. Así, el día que se conecte a HLS funciona igual.

### Índices (a definir con el perfil agro del equipo)
- **Índice de salud del suelo:** simplificado, basado en los días de suelo cubierto, la diversidad de familias y el aporte de rastrojo. Los coeficientes tienen que salir de referencias de INTA, y hay que citarlas.
- **Margen por escenario:** rinde × precio + premium de Surco − costos. Cada valor con su fuente.

## 8. Pantallas

1. **Lote en el mapa:** selección del lote, historial detectado y clima.
2. **Comparador de escenarios:** el gráfico de "me conviene".
3. **Verificación y pasaporte:** semáforo por campaña y pasaporte con QR.
4. **Marketplace:** catálogo con chips de categoría y sellos.
5. **Página pública del QR:** la trazabilidad para el consumidor.
6. **Hero / landing:** animación de marca (`design-system/hero/surco-hero.html`).

## 9. Identidad

- **Nombre:** Surco. **Tagline:** "Del satélite a tu mesa."
- **Sistema de diseño:** en `design-system/`.
  - Paleta: tierra, arcilla, malbec, oliva, trigo y cielo de campo.
  - Tipografía: Young Serif para titulares, Karla para el texto, IBM Plex Mono para los datos.
  - Estados de verificación con color, palabra e ícono.
- **Voz:** de vos, en rioplatense, clara. El dato siempre lleva su fuente. Sin superlativos.

## 10. Equipo y roles

| Perfil | Responsabilidad |
|---|---|
| Backend / datos (Python) | Generador de series simuladas, detección de ciclos y de cobertura, índice de suelo, márgenes, integración NASA POWER, salida en JSON |
| Frontend / web | Pantallas 1–5 conectadas a los JSON, mapa, QR |
| Diseño / UX | Flujo en Figma, pasaporte, pantallas, deck del pitch |
| Agro / negocio | Coeficientes, precios y premium con fuentes, casos de los productores, guion y ensayo del pitch |

## 11. Cronograma

| Cuándo | Qué |
|---|---|
| Sáb hasta 18:00 | Datos simulados y modelo de escenarios definidos; wireframes |
| Sáb hasta 24:00 | Pantallas conectadas a los JSON; primera versión del gráfico "me conviene" |
| Dom 9:00–13:00 | QR y página pública, NASA POWER, README, pitch |
| Dom 13:00–15:00 | Congelar el código, ensayar, subir a GitHub (**cierre 15:00**) |
| Dom hasta 23:59 | Entrega final en Space Apps |

## 12. Preguntas que el jurado probablemente haga

- **¿El satélite distingue qué hortaliza es?** No. Por eso el modelo combina declaración y validación: el satélite confirma el patrón de ciclos y de cobertura, no la especie.
- **¿Y los invernaderos?** El NDVI no sirve bajo plástico. En una versión real se verifican con otros datos (registro del productor, auditoría de la cooperativa) y el pasaporte lo indica.
- **¿Quién paga el premium?** El consumidor y los restaurantes que compran en Surco por la trazabilidad. Hay que mostrar un precio de referencia con su fuente.
- **¿Por qué no una certificación orgánica?** Es cara y centralizada. Surco usa datos abiertos, cualquiera puede verificarlos y el pasaporte es del productor.
- **¿Qué datos de la NASA usan?** NASA POWER en vivo en la demo. HLS, MODIS y SMAP en el diseño de producción.

## 13. Pendientes de definir

- [ ] Stack (propuesta: Python para los datos + React/Vite + Leaflet + librería de QR).
- [ ] Lote y productor de ejemplo del cinturón verde, con coordenadas.
- [ ] Coeficientes del índice de suelo y valores de margen y premium, con sus fuentes.
- [ ] Productos de ejemplo del marketplace (hortaliza, fruta y vino).
- [ ] Logo (por ahora, el nombre escrito en Young Serif).
