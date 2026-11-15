# Pitch · 4 minutos

Guion de la presentación ante el jurado (domingo 15/11, 16:00). Cada bloque es una diapositiva de [`presentacion.pdf`](presentacion.pdf). La fuente de cada número está en [`fuentes.md`](fuentes.md).

| Tiempo | Diapositiva |
|---|---|
| 0:00 – 0:25 | 1 · Portada |
| 0:25 – 0:55 | 2 · Problema y mercado en Argentina |
| 0:55 – 1:35 | 3 · Solución y encaje con Field Shift |
| 1:35 – 2:05 | 4 · Justificación económica |
| 2:05 – 2:30 | 5 · Métricas de impacto |
| 2:30 – 2:55 | 6 · Escalabilidad y modelo de negocio |
| 2:55 – 3:15 | 7 · Cierre y equipo |

Quedan unos 45 segundos de margen: alcanzan para escanear en vivo el QR de una etiqueta y mostrar la historia verificada en el teléfono.

---

## [0:00 – 0:25] Portada

*"Surco. Comé con historia. Cuidá la tierra."*

"Hola a todos. Hoy cuando vamos a comprar frutas o verduras, compramos a ciegas: vemos carteles que dicen 'orgánico' o 'natural', pero no hay respaldo real.

Por eso creamos Surco, alineado al eje de Nutrientes y Trazabilidad: un marketplace donde cada cajón tiene un Pasaporte Digital QR con la historia de su lote, verificada desde el espacio con imágenes de Sentinel-2 y datos climáticos de la NASA."

## [0:25 – 0:55] Problema y mercado en Argentina

"En Argentina tenemos una brecha enorme. El 69% de los argentinos cree que los alimentos orgánicos son mejores para la salud, y sin embargo el 98% de la producción orgánica certificada se exporta: apenas el 1,5% llega al consumidor local.

En el medio quedan los 205 productores del Cinturón Hortícola de Rosario, sobre casi 3.000 hectáreas. Venden a granel, casi la mitad a través de consignatarios, y en frutas y verduras el precio de góndola es unas cinco veces y media lo que cobra el productor."

## [0:55 – 1:35] Solución y encaje con Field Shift

"Surco resuelve esto en cuatro pasos donde la trazabilidad no queda en una declaración: se contrasta con el satélite.

Primero, el productor dibuja el polígono de su lote y recibe gratis su clima de NASA POWER, su suelo y su historia de cultivos vista desde el espacio.

Segundo, registra lo que hace: la siembra, con el cultivar y la familia botánica del INASE, la cobertura, el riego, las aplicaciones y la cosecha. Así queda a la vista la rotación de cada lote.

Tercero, Surco contrasta cada práctica con Sentinel-2: si el verde subió después de la siembra, si cayó con la cosecha, si se fue el rastrojo con la labranza, si la helada que declaró el productor fue real según NASA POWER. Lo que el satélite no puede ver, como una aplicación, queda como dato del productor, con su producto y su carencia.

Y cuarto, cada cajón sale con su QR: quien lo escanea ve la curva del lote y cada práctica con su veredicto y su porqué."

## [1:35 – 2:05] Justificación económica

"¿Por qué le conviene al quintero usar Surco frente al Mercado Concentrador o alquilar su tierra para soja?

Hoy al productor le llega menos de una quinta parte de lo que paga el consumidor. Vendiendo directo en el marketplace de Surco, recibe el 94% de la venta. Lo orgánico se paga entre un 10 y un 50% más en mercados estructurados: con un diferencial así estimamos un 30% más de margen neto. Además mantiene su suelo cubierto, recibe los datos satelitales gratis y no paga una certificadora."

## [2:05 – 2:30] Métricas de impacto

"Medimos el impacto contra una línea de base, con el mismo satélite. La métrica central es el suelo cubierto: en los canteros de nuestra quinta de ejemplo, Sentinel-2 vio cinco ciclos de cultivo y sólo 23 días sin cultivo en el último año, un 94% del año cubierto; el lote extensivo de al lado estuvo 149 días sin cultivo. Nuestra meta es llevar cada quinta del piloto por encima del 85%, bajar un 25% el uso de agroquímicos con la rotación y subir un 30% el ingreso neto por kilo."

## [2:30 – 2:55] Escalabilidad y modelo de negocio

"Nuestro modelo es transparente: usar la app y los datos satelitales cuesta $0 para el productor. Surco cobra un 6% de comisión únicamente cuando se cierra una venta en el marketplace.

Arrancamos con un piloto en 30 quintas de Rosario y 15 compradores locales, para escalar a los 595 productores hortícolas de Santa Fe integrándonos con cooperativas como AFA, donde sus técnicos asesores validan lotes en campo."

## [2:55 – 3:15] Cierre y equipo

*"Datos del espacio para cuidar la tierra."*

"Somos Ivon Speranza y Lautaro Teta Musa, estudiantes finales de Ingeniería en Sistemas de la UAI y UTN Rosario, apasionados por Linux y el software libre, participando en representación de la software factory Thorque.

Con Surco usamos datos del espacio para cuidar la tierra que comemos. Muchas gracias."

---

## Cambios para las diapositivas

Lo que hay que tocar en `presentacion.pdf` para que coincida con este guion:

| Diapositiva | Hoy dice | Cambiar por |
|---|---|---|
| 1 · Portada | "verifica prácticas reales con satélites NASA" | "verifica prácticas reales con Sentinel-2 y NASA POWER" |
| 2 · Problema | "68% · Demanda agroecológica" | "69% · cree que lo orgánico es mejor para la salud (Fundación Colsecor 2022)" |
| 2 · Problema | "205 · 2.930 ha sin acceso a auditorías caras" | "205 productores · 2.928 ha (censo INTA–UNR 2021)" |
| 2 · Problema | — | Fuente al pie: "MAGyP 2026, datos SENASA 2025" para el 98% y el 1,5% |
| 3 · Solución | "Guía NDVI y SMAP" | "Familias del INASE + historial NDVI" |
| 3 · Solución | "03 / Sanidad · Semáforo LMR · Bloqueo automático en carencia SENASA" | "03 / Verificación · Cada práctica contrastada con Sentinel-2 y NASA POWER" |
| 3 · Solución | "PostGIS cruza hectáreas" | "Sentinel-2 recortado al polígono del lote" |
| 4 · Económica | "50% del valor final" | "≈18% del precio de góndola (CAME, IPOD 2026)" |
| 4 · Económica | "15% costo a su cargo" (flete) | "54% de los traslados vía consignatarios (BCR 2024)" |
| 5 · Métricas | ">85% suelo cubierto · Base: 40%" | "94% medido en los canteros de ejemplo · meta >85% en el piloto" |
| 5 · Métricas | "Ahorra USD 1.200/año auditoría" | sacar el número (no tiene fuente) |
