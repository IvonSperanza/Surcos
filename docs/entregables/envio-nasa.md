# Envío en spaceappschallenge.org

Lo que se carga en la página del proyecto del equipo. Según el PDF de la organización local, la página tiene que tener **una demo** (hasta 7 diapositivas o un video de hasta 30 segundos) y **un enlace público al proyecto final**. Los textos van en inglés porque la página global la evalúa la NASA; el jurado local ve la presentación en castellano.

| Campo | Valor |
|---|---|
| Desafío | Field Shift: Adapting Farms with NASA Data |
| Evento local | Rosario, Argentina (UCEL) |
| Demo | `presentacion.pdf` (7 diapositivas) o el video de 30 s |
| Proyecto final | <https://github.com/IvonSperanza/Surcos> |
| Prototipo en vivo | <https://surcos-staging.thorque.com.ar> |

---

## Project name

Surco

## High-level summary

Surco is a marketplace for traceable produce from small vegetable farms in Rosario's horticultural belt (Argentina). Every crop, from sowing to harvest, gets a QR passport with the history of the plot where it grew. Each practice the farmer logs (tillage, sowing, cover crops, irrigation, frost damage, harvest) is checked against what the satellite saw over that exact plot: Sentinel-2 vegetation, residue and moisture indices, and NASA POWER daily weather. Anyone who scans the QR sees each practice with a verdict ("the satellite confirms it", "not visible in the data", "farmer's record") and the measurement behind it. It gives farmers free satellite data and a way to prove how they treat their soil, and gives buyers a reason to pay for it.

## Detailed description

**The problem.** Rosario's horticultural belt has 205 farmers on 2,928 ha (INTA–UNR census 2021); 96% of plots are open field. Nearly half of their sales go through consignees, and for fruits and vegetables the retail price is about 5.5 times what the farmer gets (CAME, 2026). Meanwhile 98% of Argentina's certified organic production is exported and only 1.5% reaches local consumers (MAGyP/SENASA, 2025). Buyers cannot tell a carefully grown vegetable from any other, and private certification is out of reach for a 12 ha farm.

**What Surco does.**
1. The farmer draws each plot on the satellite map and gets its weather (NASA POWER), soil (SoilGrids) and the Sentinel-2 greenness curve with detected crop cycles and bare-soil periods.
2. The farmer logs what they do on each plot. Species and cultivars come from Argentina's national cultivar registry (INASE), with their botanical family, so crop rotation is visible.
3. Each crop from sowing to harvest becomes a production with its own code and a printable QR label.
4. The QR opens the verified history: each logged practice contrasted with the satellite through deterministic rules. Sowing must be followed by rising NDVI, harvest by a drop, tillage by lower residue (NDTI) and more exposed soil (BSI); a frost is checked against NASA POWER minimum temperature. If there are no cloud-free images near the date, nothing is claimed. What a satellite cannot see (a pesticide application) is shown as the farmer's record.
5. Harvested productions are sold through the marketplace to B2B buyers (restaurants, specialty stores) who pick up at the farm. Surco charges 6% only on closed sales; the app and the data are free for farmers.

**Impact.** The core metric is days of covered soil per year, measured with Sentinel-2 against each farm's own previous 12 months. In the prototype, over the last 12 months (37 cloud-free images), the example vegetable plot had 5 crop cycles and only 23 days without a crop (94% of the year covered), while the neighbouring extensive plot had 149 days without a crop. Pilot targets: above 85% covered soil, 25% fewer agrochemical applications through rotation, and 30% more net income per kg.

**Scaling.** Pilot with 30 farms in Rosario and 15 local buyers, then the 595 vegetable farmers of Santa Fe province through cooperatives such as AFA, whose agronomists can validate plots in the field.

## NASA data

- **NASA POWER** (daily, agroclimatology community): precipitation, minimum, mean and maximum temperature, root-zone and surface soil wetness (GWETROOT, GWETTOP), evaporation and growing degree days for each plot. Used for the plot's weather, a 20-year frost calendar, and to verify declared frost damage and separate irrigation from rain.
- Analyzed for the next milestone (need an Earthdata account): HLS (Harmonized Landsat Sentinel-2, more cloud-free passes per month), SMAP (soil moisture), ECOSTRESS (field-scale heat stress), GPM IMERG (rainfall) and SRTM (slope, erosion risk). Our analysis of each source is in `datos/FUENTES.md` in the repository.

## Space agency partner and other data

- **Sentinel-2 L2A** (ESA Copernicus, 10 m), accessed through Element 84 Earth Search: NDVI, NDTI, NDMI, NDRE and BSI computed per cloud-free pass inside the plot polygon.
- **SoilGrids** (ISRIC): soil texture, organic carbon, pH and nutrients by depth.
- **INASE National Cultivar Catalogue** (Argentina): registered species and cultivars.
- Market figures: MAGyP *Información clave sobre producción orgánica 2026*; BCR *El Cinturón Hortícola del centro-sur de la provincia de Santa Fe* (2024); CAME IPOD (2026); Fundación Colsecor (2022). Full list with links: `docs/entregables/fuentes.md`.

## Use of artificial intelligence

We used AI coding assistants to write and review code and to draft documentation. The verification itself does not use AI: it is a set of deterministic, auditable rules over public data, and every verdict shows the measurement behind it (index before and after, expected change, Sentinel-2 scene and date).

## Tags

agriculture, traceability, soil-health, cover-crops, sentinel-2, nasa-power, marketplace, argentina
