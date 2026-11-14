# Surco

**Del satélite a tu mesa.** Marketplace de hortalizas, frutas y vinos trazables. Cada producto está ligado al lote donde creció, y las prácticas de suelo de ese lote (rotación, cobertura) se verifican con datos satelitales.

Proyecto para NASA Space Apps Challenge 2026 — desafío *Field Shift: Adapting Farms with NASA Data*. Sede Rosario (UCEL), 14 y 15 de noviembre de 2026.

## El problema

El pequeño productor no deja de cuidar el suelo por desconocimiento: lo deja porque a corto plazo no le conviene. En el cinturón hortícola de Rosario, la soja compite por la tierra desde hace décadas. Surco no le pide al productor que cuide el suelo por conciencia: le abre un mercado que le paga por hacerlo y usa datos satelitales para demostrarlo.

## El flujo

1. **Planificar y registrar** (productor). Planificador de rotación por familias (hortalizas) o de cobertura entre filas (vid y frutales). Compara escenarios por margen —con el premium de Surco incluido— y por salud del suelo. El productor registra lo que plantó en cada lote.
2. **Verificar → pasaporte del lote.** Se cruza lo declarado con la señal satelital (ciclos de cultivo, días de suelo desnudo, cobertura invernal) y se emite un pasaporte por lote y campaña.
3. **Marketplace.** Cada producto (bolsón de verduras, cajón de frutas, botella de vino) está vinculado a su lote y lleva el sello de práctica verificada.
4. **QR del producto → trazabilidad.** El consumidor ve el lote en el mapa, al productor, el historial de cultivos y de cobertura, el clima de la temporada y la fecha de cosecha.

**Alcance de la demo:** flujo completo con un horticultor del cinturón verde de Rosario. El vino y la fruta aparecen en el marketplace con su pasaporte ya generado.

## Datos

| Dato | Fuente en producción | En la demo |
|---|---|---|
| NDVI por lote | HLS (Harmonized Landsat Sentinel-2), MODIS MOD13Q1 | Series simuladas con la curva típica de cada cultivo |
| Clima | NASA POWER | NASA POWER real, por coordenadas del lote |
| Humedad del suelo | SMAP | Simulada |
| Suelo | SoilGrids / INTA | Valores de referencia |

**Límite honesto:** con 10 m de resolución el satélite no distingue lechuga de tomate, y los invernaderos tapan la señal. Por eso el modelo es *declaración del productor + validación satelital*.

## Estructura

```
design-system/
  README.md        manual de marca: voz, color, estados, gráficos, tipografía, movimiento
  tokens.json      fuente de verdad de los tokens
  tokens.css       variables CSS y clases de tipografía, listas para importar
  hero/
    surco-hero.html  animación de portada (botella, uvas, satélite), sin dependencias
```

## Cómo usar el sistema de diseño

```html
<link rel="stylesheet" href="design-system/tokens.css">
<h1 class="display">Del satélite a tu mesa</h1>
<p class="body" style="color: var(--ink-muted)">Mirá dónde creció.</p>
<span class="dato">NDVI 0.72</span>
```

- Colores: `var(--arcilla)`, `var(--oliva)`, `var(--malbec)`, `var(--cielo)`… (ver `design-system/README.md` para qué significa cada uno).
- Tipografía: clases `.display`, `.titulo`, `.subtitulo`, `.body`, `.small`, `.etiqueta`, `.dato`.
- Si cambian un token, edítenlo en `tokens.json` y regeneren `tokens.css`.
- Hero: abrí `design-system/hero/surco-hero.html`. Se adapta al ancho de la ventana; se repite con un clic.

## Entregas

- Domingo 15/11, 15:00 — repositorio en GitHub.
- Domingo 15/11, 23:59 — entrega final en la plataforma de NASA Space Apps.
