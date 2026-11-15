# 🌱 SURCO — Pasaporte de Suelo Vivo

> **NASA Space Apps Challenge 2026 — Desafíos AgTech para la Zona Núcleo (Rosario, Argentina)**
>
> **Desafío Global:** *Field Shift: Adapting Farms with NASA Data*
>
> **Eje AgTech Seleccionado:** **Eje 01 — Nutrientes y Trazabilidad** (*"Trazabilidad premium con datos confiables, certificación de prácticas sostenibles y cultivos de servicio"*).
>
> **Demo en vivo:** <https://surcos-staging.thorque.com.ar>
>
> **Ejemplo de Pasaporte QR Público:** <https://surcos-staging.thorque.com.ar/p/SUR-2026-0002>

---

## 1. Problema y Usuario Objetivo

En el cinturón hortícola de Rosario y la Pampa Húmeda, los pequeños y medianos productores enfrentan una crisis estructural que amenaza la producción local de alimentos frescos:

1. **Dilema económico y abandono de quintas:** Al vender a granel a intermediarios o al Mercado de Productores sin diferenciación, el margen neto es tan bajo que muchos productores optan por **arrendar su quinta para soja extensiva**, perdiendo la diversidad productiva local y degradando los suelos periurbanos.
2. **Suelos agotados por baja rotación:** La falta de acceso gratuito a analítica satelital lleva a repetir familias de cultivos sin descanso ni cultivos de servicio, reduciendo la materia orgánica y la densidad nutricional de frutas y hortalizas.
3. **Barrera de certificación y *greenwashing*:** Certificar buenas prácticas o producción orgánica de forma tradicional cuesta más de **USD 1.200 anuales** *(estimación del equipo, fuente pendiente)*, dejando al pequeño productor fuera de los mercados selectos mientras abundan etiquetas informales sin respaldo verificable.

* **Usuario Primario (Oferta):** Pequeños y medianos productores hortícolas y frutícolas del cinturón verde de la Zona Núcleo.
* **Usuario Secundario (Demanda):** Mercados selectos, dietéticas, gastronomía y PyMEs alimenticias con logística propia, más consumidores finales que escanean el QR en góndola.

---

## 2. Solución, Encaje con *Field Shift* y Trazabilidad Satelital

**Surco** es una aplicación web que cruza la bitácora del productor con imágenes satelitales y datos climáticos de la NASA para emitir un **Pasaporte Digital con Código QR** por producción: cada cultivo, de la siembra a la cosecha, con su código (`SUR-2026-0002`) y su etiqueta imprimible.

### Cómo respondemos al desafío *Field Shift*

* **Historia verificada por satélite (en el prototipo):** al escanear el QR, el comprador ve cada práctica declarada (labranza, siembra, cobertura, riego, fertilización, aplicaciones, daño por helada, cosecha) contrastada con la parcela vista desde el espacio. Cada evento vuelve con un veredicto: *lo confirma el satélite*, *hay un indicio*, *no se ve en los datos*, *sin imágenes cerca* o *dato del productor*. Cada veredicto muestra su porqué: el índice antes y después, lo que se esperaba ver, la escena de **Sentinel-2** y la fecha. Las heladas se cruzan con la temperatura mínima diaria de **NASA POWER**. Arriba se ve la curva de NDVI de la parcela con los ciclos de cultivo detectados y cada evento marcado.
* **Rotación por familias botánicas:** cada siembra y cada cobertura registran la especie y el cultivar del **Catálogo Nacional de Cultivares del INASE**, con su familia botánica, así que el historial de rotación de la parcela queda a la vista. *Próximo hito:* recomendar la secuencia siguiente (ej. *Solanáceas* → *Leguminosas / cultivos de servicio* → *Hortalizas de hoja*) para fijar nitrógeno y cortar ciclos de plagas.
* **Suelo cubierto entre ciclos (en el prototipo):** con la serie de Sentinel-2 el sistema detecta los períodos sin cultivo y, dentro de ellos, los días de suelo desnudo y con rastrojo. Con eso arma recomendaciones: una ventana para sembrar una cobertura o una tormenta fuerte que encontró el suelo desnudo.
* **Carencia de fitosanitarios:** hoy el productor registra producto, dosis y período de carencia, y quien escanea el QR lo ve. *Próximo hito:* un semáforo (`EN CARENCIA` → `APTO COSECHA`) que no deje emitir la etiqueta hasta cumplir la carencia SENASA del principio activo.
* **Conexión logística directa** *(próximo hito)*: un catálogo B2B que priorice compradores con **transporte propio que retiran en quinta**, sin costo de flete para el productor.

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
   * **Línea de base:** ~145 días/año (~40%) debido a barbechos desnudos entre ciclos *(supuesto, a medir en el piloto con los 12 meses previos de cada lote)*.
   * **Meta con Surco:** **>310 días/año (>85%)** con cobertura vegetal viva.
   * **Medición (implementada en el prototipo):** sobre cada imagen **Sentinel-2** sin nubes de los últimos 12 meses, el sistema clasifica la parcela en cultivo (NDVI), rastrojo o suelo desnudo (NDTI) y suma los días de cada estado entre ciclos. $\text{Cobertura (\%)} = 1 - \frac{\text{Días de suelo desnudo}}{365}$, comparando los 12 meses previos contra la campaña activa.

2. **Eficiencia de riego por ciclo**
   * **Línea de base:** Riego por calendario fijo sin medición de humedad en raíz.
   * **Meta con Surco:** **-15% a -20% de consumo hídrico** evitando riegos innecesarios.
   * **Medición:** Cruce de la humedad en la zona de raíces de **NASA POWER** (`GWETROOT`, ya integrada) y del agua en la planta (NDMI de Sentinel-2) con los riegos registrados en la bitácora. *Próximo hito:* sumar **SMAP** y **ECOSTRESS** *(necesitan cuenta de Earthdata)*. *(Meta: supuesto técnico estimado.)*

3. **Reducción de aplicaciones de síntesis química**
   * **Línea de base:** Uso preventivo recurrente sin rotación de familias botánicas.
   * **Meta con Surco:** **-20% a -30% en aplicaciones químicas** por corte de ciclo de plagas.
   * **Medición:** Conteo de eventos de *aplicación fitosanitaria* registrados por hectárea y por ciclo, antes y después de la rotación asistida *(Supuesto técnico en transición BPA)*.

### 4.2. Eje Sanitario y Comercial

4. **Cumplimiento de Carencia (LMR / GlobalG.A.P.)**
   * **Línea de base:** Falta de registro sistematizado de días libres de químicos previo a cosecha.
   * **Meta con Surco:** **100% de lotes verificados** (`0%` con carencia activa).
   * **Medición:** Días entre la última aplicación registrada y la cosecha, contra la carencia declarada ($\Delta t \ge \text{Días de Carencia SENASA}$). Hoy queda a la vista en el QR; *próximo hito:* bloquear la etiqueta hasta que se cumpla.

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

* **Recorte al polígono del lote (en el prototipo):** los índices se calculan sólo con los píxeles de 10 m que caen dentro del polígono que dibujó el productor, descartando bordes de caminos o galpones, y sólo con imágenes donde al menos el 80% de la parcela está despejada.
* **Reglas que no afirman de más (en el prototipo):** si no hay imágenes sin nubes a menos de 20 días de un evento, el resultado es *sin imágenes cerca* y no se afirma nada. Lo que el satélite no puede ver (una aplicación, un desmalezado) queda como *dato del productor*, sin sello de verificación.
* **Evidencia fotográfica:** el productor ya puede subir fotos del cultivo y de la cosecha, que se ven en el QR con su fecha. *Próximo hito:* exigir al menos 2 fotos por ciclo desde el interior del lote, con coordenadas y hora.
* **Auditoría de cooperativa / asesor** *(propuesta)*: los técnicos agrónomos de cooperativas aliadas (ej. AFA) validan de forma muestral los lotes en la plataforma, otorgando doble respaldo institucional al Pasaporte QR.

---

## 5. Arquitectura Técnica y Datasets

* **Frontend:** React + Vite, **Leaflet** para dibujar las parcelas sobre la imagen satelital, **Recharts** para las curvas y **qrcode.react** para el QR y la etiqueta imprimible.
* **Backend de negocio:** Express + TypeScript + **PostgreSQL** (Drizzle): productor, parcelas (polígono `GeoJSON`), producciones, eventos y fotos.
* **Servicio de datos:** Python (**FastAPI**) con `pystac-client` y `rasterio`: busca las escenas, recorta cada una al polígono, calcula los índices, detecta los ciclos y aplica las reglas de verificación. Las respuestas se guardan en caché: la primera consulta de una parcela tarda uno o dos minutos.
* **Datos que usa el prototipo:**
  * **Sentinel-2 L2A** (ESA Copernicus, 10 m, vía Earth Search): NDVI (verde), NDTI (rastrojo), NDMI (agua en la planta), NDRE (clorofila) y BSI (suelo expuesto) de cada imagen sin nubes. Con ellos se detectan los ciclos de cultivo y el suelo desnudo, y se contrasta cada evento declarado.
  * **NASA POWER** (diario, comunidad agrícola): lluvia, temperaturas, heladas, humedad en superficie y en la zona de raíces, evaporación y grados-día de la parcela; calendario de heladas con los últimos 20 años.
  * **SoilGrids** (ISRIC): textura, carbono orgánico, pH, nitrógeno y capacidad de intercambio del suelo, por profundidad.
  * **Catálogo Nacional de Cultivares** (INASE): especies y cultivares inscriptos, con su número.
* **Datos de la NASA analizados para el próximo hito** (necesitan cuenta de Earthdata; detalle en `datos/FUENTES.md`): **HLS** (Landsat + Sentinel-2 armonizados, más pasadas por mes), **SMAP** (humedad del suelo), **ECOSTRESS** (estrés térmico a escala de lote), **IMERG** (lluvia) y **SRTM** (pendiente, para el riesgo de erosión).
* **Uso de Inteligencia Artificial:** usamos asistentes de IA para programar, revisar código y redactar documentación. La verificación no usa IA: son reglas deterministas y auditables sobre datos públicos, y cada resultado muestra la medición que lo respalda.

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
  * *Hito 0 (hecho en la hackatón):* parcelas, bitácora de eventos, producciones con QR y etiqueta, e historia verificada con Sentinel-2 y NASA POWER.
  * *Hito 1 (Meses 1–3):* Piloto en 30 quintas del cinturón verde de Rosario/Pérez + 15 compradores gastronómicos con flota propia.
  * *Hito 2 (Meses 4–8):* Convenio institucional con cooperativas regionales y asesores técnicos para escalar la adopción.
  * *Hito 3 (Mes 9+):* API de trazabilidad para industria alimenticia y *scoring* ambiental para acceso a financiamiento verde.

---

**Equipo de Desarrollo:** Estudiantes finales de **Ingeniería en Sistemas** (**UAI** y **UTN Rosario**), entusiastas del ecosistema **Linux** y el software abierto, en representación de la software factory rosarina **Thorque**.