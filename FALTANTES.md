# Acá está todo lo que falta por hacer para entregar el proyecto.
Te lo dejo por escrito xq me estoy x dormir xd.

- [ ] Análisis del mercado de consumo 'conciente' o productos orgánicos en Argentina.
esto es clave para poder vender que hay un mercado al que le interesa comprar
productos sabiendo de dónde salen.

- [ ] Justificación de que a los productores les convenga vender através de Surco.
Acá yo investigaria y armaría un informe/ppt donde se vea la comparacion entre
un productor vendiendo Soja de modo tradicional vs vendiendo productos através
de Surco. Si no logramos justificar que el productor venda por acá no tiene
mucho sentido.

- [ ] PPT 
acá yo armaría una ppt que sea como para venderle el sistema al productor,
explicar por qué le conviene usar el sistema, está conectado con lo de arriba
(por el precio) pero además podriamos poner que le brinda gratis toda la
informacion satelital de cómo llevar las cosechas.

- [ ] Cómo gana plata Surco, no sé, no sé si le darán mucha importancia.
comisión x venta?
cobrar abono a los productores?
...

- [ ] Revisar bien los entregables en la pagina.

- [ ] Video, video explicando todo, lo haria cuando ya tengamos todo lo otro.

- [ ] Preparar presentación final de 4m

- [ ] Logo. (opcional)

## En la demo

- [ ] Vista Resumen dice cualqueir cosa
- [ ] Servir los QR's
- [ ] Adaptar Pedidos a las producciones
- [ ] Pensar como se hace la venta y como se va descontando la cantidad vendida de la producida

---

## Entregables (PDF "Desafíos AgTech para la Zona Núcleo", Rosario 2026)

Horarios del domingo 15/11:
- 15:00: subida del repo a GitHub y control de materiales. Lo que no esté a esa hora no cuenta.
- 16:00: presentación ante el jurado (industria y AFA). Hay que presentar y defender el proyecto.
- 23:59: entrega final en la página del proyecto en spaceappschallenge.org.

En la página del proyecto van dos cosas:
- **Una demo:** hasta 7 diapositivas **o** un video de **hasta 30 segundos**.
  No es un video largo que explique todo.
- **Un enlace público al proyecto:** el repo o un sitio.

Entregables mínimos, lo que la propuesta tiene que mostrar:
| Entregable | Qué piden |
|---|---|
| Problema y usuario | Problema, segmento objetivo, contexto de uso |
| Solución | Funcionamiento, componentes, diferenciación, tecnología habilitadora |
| Prototipo | App, mockup o demo funcional (la tenemos) |
| Impacto | **Métrica de beneficio frente a una línea de base, y método de medición** |
| Escalabilidad | Plan de implementación, alianzas, **modelo de ingresos**, próximos hitos |

Criterios de evaluación:
- **Problema y usuario:** comprensión del usuario, originalidad, adecuación a la Pampa Húmeda.
- **Solución:** factibilidad y calidad del prototipo.
- **Impacto:** magnitud, beneficio cuantificable contra una línea de base, reducción verificable de costos, pérdidas, emisiones o insumos.
- **Escala:** escalabilidad comercial e integración con asesores, cooperativas, acopios y proveedores.

Eje AgTech: hay que elegir uno. El 01 (Nutrientes) nombra textual "trazabilidad
premium con datos confiables", certificar prácticas sostenibles y cultivos de
servicio. El 05 (Innovación abierta) nombra marketplaces y trazabilidad.

No pude leer spaceappschallenge.org (falla el certificado desde acá). Hay que
mirar a mano qué otros campos pide el formulario de envío: resumen, datos de
la NASA usados, uso de IA.

## Lo que agregaría

- [ ] **Commitear y pushear antes de las 15:00.** La página pública y la etiqueta
      todavía no están commiteadas. Antes del corte, limpiar la raíz del repo:
      productor.html/js/css, index.html, script.js, styles.css, surco.zip y los
      c2_*.png. El repo tiene que ser público.
- [ ] **README para el jurado:** qué es, cómo se levanta, qué datos de la NASA usa
      y de dónde sale cada dato. El enlace público del envío lleva ahí.
- [ ] **Métrica de impacto con línea de base.** Es criterio explícito y no está
      en la lista. Candidatas:
      - precio por kg vendiendo por Surco contra el del Mercado de Productores de
        Rosario;
      - costo de la certificación evitada;
      - días de suelo cubierto por año, medidos con Sentinel-2 antes y después.
      Cada número con fuente. Los que no tengan, van marcados como supuestos.
- [ ] **Ojo con la comparación contra la soja.** El horticultor del cinturón no
      siembra soja. El dilema real es arrendar la quinta para soja o seguir
      produciendo (PROYECTO.md). La comparación que convence es la quinta
      vendiendo a intermediarios o al mercado concentrador contra la quinta
      vendiendo con trazabilidad por Surco, y las dos contra el arriendo.
- [ ] **El modelo de ingresos se evalúa** (Escalabilidad). Hay que definirlo
      aunque sea simple: comisión por venta, abono del productor o de la
      cooperativa.
- [ ] **Alianzas:** el jurado es AFA, una cooperativa, y el criterio premia
      "integración con cooperativas y asesores". La cooperativa ya está en
      PROYECTO.md como fase 2: conviene llevarla al pitch como canal de adopción.
- [ ] **Encaje con Field Shift.** El desafío de la NASA pide explorar rotaciones
      que fortalezcan el suelo. La demo es fuerte en trazabilidad y débil en
      rotación. Mínimo: mostrar la rotación por familia de la parcela y la
      cobertura detectada, y decirlo en el pitch.
- [ ] **El satélite en la página del QR.** Hoy el QR muestra sólo lo declarado. La
      promesa de Surco es "verificado con datos de la NASA". Mínimo: la curva
      NDVI de la parcela con la siembra y la cosecha marcadas.
- [ ] **Un QR que abra desde un teléfono en la demo.** Hacen falta dos cosas:
      el front publicado (Vercel o Netlify) e ids fijos para las parcelas de
      ejemplo, para que la página pública las encuentre en cualquier
      navegador.
- [ ] **El pitch de 4 minutos y la demo de 7 diapositivas son lo mismo
      resumido.** Conviene armar primero las 7 diapositivas siguiendo la tabla
      de entregables y usarlas para el jurado.
- [ ] **Usar la mentoría de las 11:30** para validar la métrica de impacto y el
      modelo de ingresos.
