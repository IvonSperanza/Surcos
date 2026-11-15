# 🌱 SURCO — Pasaporte de Suelo Vivo
## URL: https://surcos-staging.thorque.com.ar


> **NASA Space Apps Challenge 2026 — Desafíos AgTech para la Zona Núcleo (Rosario, Argentina)**
>
> **Desafío Global:** *Field Shift: Adapting Farms with NASA Data*
>
> **Eje AgTech Seleccionado:** **Eje 01 — Nutrientes y Trazabilidad** (*"Trazabilidad premium con datos confiables, certificación de prácticas sostenibles y cultivos de servicio"*).


## 1. Problema y Usuario Objetivo

En el cinturón hortícola de Rosario y la Pampa Húmeda, los pequeños y medianos productores enfrentan una crisis estructural que amenaza la producción local de alimentos frescos:

1. **Dilema económico y abandono de quintas:** Al vender a granel a intermediarios o al Mercado de Productores sin diferenciación, el margen neto es tan bajo que muchos productores optan por **arrendar su quinta para soja extensiva**, perdiendo la diversidad productiva local y degradando los suelos periurbanos.
2. **Suelos agotados por baja rotación:** La falta de acceso gratuito a analítica satelital lleva a repetir familias de cultivos sin descanso ni cultivos de servicio, reduciendo la materia orgánica y la densidad nutricional de frutas y hortalizas.
3. **Barrera de certificación y *greenwashing*:** Certificar buenas prácticas o producción orgánica de forma tradicional cuesta más de **USD 1.200 anuales**, dejando al pequeño productor fuera de los mercados selectos mientras abundan etiquetas informales sin respaldo verificable.

* **Usuario Primario (Oferta):** Pequeños y medianos productores hortícolas y frutícolas del cinturón verde de la Zona Núcleo.
* **Usuario Secundario (Demanda):** Mercados selectos, dietéticas, gastronomía y PyMEs alimenticias con logística propia, más consumidores finales que escanean el QR en góndola.

---

## 2. Solución, Encaje con *Field Shift* y Trazabilidad Satelital

**Surco** es una Progressive Web App (*offline-first*) que cruza observaciones terrestres de la NASA con una bitácora agronómica simple para emitir un **Pasaporte Digital con Código QR** verificable en punto de venta.

### Cómo respondemos al desafío *Field Shift*

* **Rotación por Familias Botánicas:** El sistema registra el historial de cada parcela y recomienda secuencias entre familias (ej. *Solanáceas* $\rightarrow$ *Leguminosas / Cultivos de servicio* $\rightarrow$ *Hortalizas de hoja*) para fijar nitrógeno natural y cortar ciclos de plagas.
* **Verificación Satelital en el Pasaporte QR:** A diferencia de una etiqueta declarativa, al escanear el QR el comprador y el consumidor visualizan la **curva temporal de NDVI (Landsat / Sentinel-2)** de esa parcela exacta con los hitos de **siembra, cobertura viva y cosecha** marcados, junto con el historial de rotación.
* **Semáforo Sanitario (LMR / GlobalG.A.P.):** Control automatizado de períodos de carencia entre la última aplicación fitosanitaria y la cosecha (`EN CARENCIA` $\rightarrow$ `APTO COSECHA`).
* **Conexión Logística Directa:** El catálogo B2B prioriza compradores y mercados que retiran la mercadería con **transporte propio en quinta**, eliminando el costo de flete para el productor.

---

## 3. Justificación Económica para el Productor (Comparativa Real)

Un horticultor del cinturón verde **no siembra soja** por escala; su dilema real es **seguir produciendo bajo el esquema tradicional**, **arrendar la tierra para soja extensiva** o **diferenciar su cosecha con trazabilidad en Surco**:

### Escenario A: Quinta Tradicional (Mercado Concentrador / Intermediario)
* **Ingreso neto:** Bajo. El intermediario captura entre el **40% y 50%** del precio final de góndola *(Fuente: relevamiento mayorista Rosario)*.
* **Suelo y rotación:** Desgaste continuo por repetición de cultivos de renta sin cobertura invernal (~40% días cubiertos/año).
* **Datos y logística:** Sin acceso a datos satelitales; producto anónimo a granel con flete y comisión de puesto a cargo del quintero.

### Escenario B: Arriendo para Soja (Abandono de la actividad hortícola)
* **Ingreso neto:** Renta fija mínima en quintales/ha, insuficiente para sostener una familia en superficies chicas de 5 a 15 ha *(Supuesto regional)*.
* **Suelo y rotación:** Monocultivo extractivo con pérdida de estructura de suelo hortícola y biodiversidad periurbana.
* **Datos y logística:** El productor pierde la gestión directa sobre su tierra.

### Escenario C: Producción con SURCO (Trazabilidad NASA + Venta Directa)
* **Ingreso neto:** **+25% a +35% de margen neto**. El productor recibe el **94% del precio de venta** directa a mercados selectos *(Supuesto basado en diferencial de calidad verificada)*.
* **Suelo y rotación:** **>85% de días al año con suelo cubierto** mediante rotación guiada por familias botánicas y cultivos de servicio.
* **Datos y logística:** **100% Gratuito ($0)** en alertas climáticas, humedad y rotación NASA + **Pasaporte QR sin costo de certificadora** (evita USD 1.200/año) + **retiro en quinta** por compradores con flota propia.

> **Conclusión:** Surco vuelve rentable quedarse en la quinta produciendo alimentos sanos, superando ampliamente la renta del arriendo sojero sin exigir inversión inicial en certificadoras.

---

## 4. Métricas de Impacto frente a Línea de Base

Para evaluar el desempeño real del sistema frente al modelo hortícola convencional del cinturón verde de Rosario, definimos **7 métricas verificables**:

### 4.1. Eje Ambiental y Agronómico

1. **Días de suelo cubierto al año (Salud de Suelo / *Field Shift*)**
   * **Línea de base:** ~145 días/año (~40%) debido a barbechos desnudos entre ciclos.
   * **Meta con Surco:** **>310 días/año (>85%)** con cobertura vegetal viva.
   * **Medición:** $\text{Cobertura (\%)} = \left(\frac{\text{Días con } \text{NDVI} > 0.35}{365}\right) \times 100$ vía series **Landsat 8-9 / Sentinel-2** (12 meses previos vs. campaña activa).

2. **Eficiencia de riego por ciclo**
   * **Línea de base:** Riego por calendario fijo sin medición de humedad en raíz.
   * **Meta con Surco:** **-15% a -20% de consumo hídrico** evitando riegos innecesarios.
   * **Medición:** Cruce de humedad volumétrica **NASA SMAP** y estrés térmico **ECOSTRESS** con registros de riego en bitácora *(Supuesto técnico estimado)*.

3. **Reducción de aplicaciones de síntesis química**
   * **Línea de base:** Uso preventivo recurrente sin rotación de familias botánicas.
   * **Meta con Surco:** **-20% a -30% en aplicaciones químicas** por corte de ciclo de plagas.
   * **Medición:** Conteo de eventos `APLICACION_INSUMO` por hectárea/ciclo tras implementar rotación asistida *(Supuesto técnico en transición BPA)*.

### 4.2. Eje Sanitario y Comercial

4. **Cumplimiento de Carencia (LMR / GlobalG.A.P.)**
   * **Línea de base:** Falta de registro sistematizado de días libres de químicos previo a cosecha.
   * **Meta con Surco:** **100% de lotes verificados** (`0%` con carencia activa).
   * **Medición:** Bloqueo automático del QR en la aplicación hasta cumplir $\Delta t \ge \text{Días de Carencia SENASA}$ según principio activo declarado.

5. **Precio neto percibido por kg (Ingreso Productor)**
   * **Línea de base:** Precio base mayorista en Mercado de Productores (descontando intermediación).
   * **Meta con Surco:** **+25% a +35% por kg** vendido en canales selectos B2B.
   * **Medición:** $\Delta \text{Ingreso} = \frac{P_{\text{Surco}} \times 0.94 - P_{\text{Mercado}}}{P_{\text{Mercado}}}$ comparando pizarra del Mercado de Productores de Rosario vs. cierres en app *(Supuesto de piloto)*.

6. **Costo de certificación evitado**
   * **Línea de base:** USD 1.200 – 1.800 / año por auditoría privada externa.
   * **Meta con Surco:** **$0 para el productor** mediante auditoría satelital continua.
   * **Medición:** Comparativa directa contra aranceles vigentes de certificadoras privadas en Argentina para quintas (<15 ha).

7. **Costo de flete y merma post-cosecha**
   * **Línea de base:** 10%–15% del valor bruto en flete propio + merma por re-manipuleo.
   * **Meta con Surco:** **$0 de flete para el quintero** y **-40% de merma**.
   * **Medición:** Filtro de compradores con transporte propio que retiran directo en quinta sin doble descarga *(Supuesto operativo)*.

### 4.3. Protocolo de Validación en Campo (*Ground-Truthing*)

Para evitar sesgos de resolución espacial en parcelas hortícolas pequeñas (1 a 10 ha), cada métrica satelital se calibra mediante validación híbrida:

* **Enmascaramiento Poligonal (`PostGIS`):** Recorte exacto del píxel satelital al perímetro `GeoJSON` dibujado por el productor, descartando bordes de caminos o galpones.
* **Evidencia Fotográfica Geolocalizada:** El productor sube al menos 2 fotos por ciclo desde el interior del lote (con coordenadas EXIF y *timestamp*) que respaldan la cobertura vegetal detectada por el satélite.
* **Auditoría de Cooperativa / Asesor:** Los técnicos agrónomos de cooperativas aliadas (ej. AFA) validan de forma muestral los lotes en la plataforma, otorgando doble respaldo institucional al Pasaporte QR.

---

## 5. Arquitectura Técnica y Datasets de la NASA

* **Frontend (PWA):** React / Next.js con Service Workers (*offline-first* para conectividad rural), **Leaflet** para cartografía interactiva y **Turf.js** para cálculo geométrico de hectáreas en cliente.
* **Backend & Base Espacial:** Python (**FastAPI**) + **PostgreSQL / PostGIS** para almacenamiento de polígonos `GeoJSON` y validación topológica.
* **Datasets NASA Utilizados:**
  * **Landsat 8-9 / MODIS (NDVI):** Auditoría de cobertura vegetal anual, detección de suelo desnudo y generación de la curva satelital visible en el Pasaporte QR.
  * **SMAP & ECOSTRESS:** Humedad del perfil de suelo y estrés térmico para recomendar rotaciones de ahorro hídrico.
  * **GPM & SRTM:** Pronóstico de precipitaciones intensas y modelo digital de elevación para alertar riesgo de erosión hídrica.
  * **NASA POWER:** Grados-día y agroclimatología para estimar ventanas de cosecha y coordinar retiros logísticos.
* **Uso de Inteligencia Artificial:** Se utilizaron LLMs como asistencia para el diseño de la arquitectura de datos, generación de polígonos de prueba en el cinturón verde de Rosario y síntesis documental. Los cálculos agronómicos y alertas climáticas operan mediante reglas determinísticas auditables sobre datos oficiales de la NASA.

---

## 6. Escalabilidad, Modelo de Ingresos y Alianzas

### Modelo de Negocio (SaaS + Marketplace B2B)

1. **Productor ($0 — Freemium):** Acceso gratuito al monitoreo satelital, recomendaciones de rotación *Field Shift* y emisión de Pasaporte QR.
2. **Comisión por Venta Cerrada (6%):** Aplicada únicamente sobre transacciones B2B concretadas en la plataforma (el productor conserva el **94%**).
3. **Suscripción B2B (Mercados y PyMEs):** Abono mensual para acceder al mapa de lotes en evaluación, alertas tempranas de cosecha y filtros por cercanía logística.
4. **Licencias Institucionales (Cooperativas):** Plan B2B2C por volumen de hectáreas/socios.

### Canal de Adopción y Alianzas Estratégicas

* **Cooperativas Agropecuarias (ej. AFA) y Asesores Agronómicos:** En lugar de captar productores uno por uno, Surco se integra como herramienta digital para los equipos técnicos de cooperativas y municipios de la Zona Núcleo, permitiéndoles monitorear la rotación de sus asociados y ofrecer trazabilidad verificada a compradores industriales.
* **Hoja de Ruta:**
  * *Hito 1 (Meses 1–3):* Piloto en 30 quintas del cinturón verde de Rosario/Pérez + 15 compradores gastronómicos con flota propia.
  * *Hito 2 (Meses 4–8):* Convenio institucional con cooperativas regionales y asesores técnicos para escalar la adopción.
  * *Hito 3 (Mes 9+):* API de trazabilidad para industria alimenticia y *scoring* ambiental para acceso a financiamiento verde.

---


##7. Mercado Potencial y Oportunidad en Argentina

Surco ataca una asimetría concreta en el mercado agroalimentario argentino: mientras existe una fuerte demanda urbana de alimentos saludables y con trazabilidad química, casi la totalidad de la producción certificada se exporta por los altos costos de auditoría.

* **Foco Inicial (Cinturón Hortícola de Rosario y Santa Fe):** Según el Censo Hortícola (UNR / INTA), solo en el Cinturón de Rosario operan **205 productores** sobre **~2.930 hectáreas** (y **595 productores en 7.000 ha** a nivel provincial). La mayoría produce en tierras arrendadas y busca canales directos para escapar de los márgenes bajos del mercado concentrador.
* **Brecha en el Mercado Interno Argentino:** De acuerdo con los reportes de *Alimentos Argentinos* (2025/2026), Argentina es potencia mundial en producción orgánica (más de 1.660 operadores), pero **el 98% del volumen certificado se exporta** y apenas el **1,5% abastece el mercado interno**.
* **Oportunidad para Sur
**Equipo de Desarrollo:** Estudiantes finales de **Ingeniería en Sistemas** (**UAI** y **UTN Rosario**), entusiastas del ecosistema **Linux** y el software abierto, en representación de la software factory rosarina **Thorque**.
