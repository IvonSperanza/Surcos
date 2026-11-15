import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import type { Coordenada, PoligonoGeoJson } from "../api/ndvi";

const RADIO_TIERRA_M = 6_371_008.8;
const RAD = Math.PI / 180;

// Misma proyección equirectangular local que datos/surco_datos/geometria.py:
// para parcelas de pocas hectáreas el error es despreciable.
function areaAnilloM2(anillo: Coordenada[]): number {
    const latMedia = (anillo.reduce((suma, [, lat]) => suma + lat, 0) / anillo.length) * RAD;
    const xy = anillo.map(([lon, lat]) => [lon * RAD * Math.cos(latMedia) * RADIO_TIERRA_M, lat * RAD * RADIO_TIERRA_M]);
    let doble = 0;
    for (let i = 0; i < xy.length; i++) {
        const [x1, y1] = xy[i];
        const [x2, y2] = xy[(i + 1) % xy.length];
        doble += x1 * y2 - x2 * y1;
    }
    return Math.abs(doble) / 2;
}

export function areaHa(geometria: PoligonoGeoJson): number {
    const [exterior, ...huecos] = geometria.coordinates;
    const m2 = areaAnilloM2(exterior) - huecos.reduce((suma, h) => suma + areaAnilloM2(h), 0);
    return m2 / 10_000;
}

// GeoJSON guarda [lon, lat]; Leaflet dibuja [lat, lon].
export const aLeaflet = ([lon, lat]: Coordenada): LatLngTuple => [lat, lon];

export function anilloLeaflet(geometria: PoligonoGeoJson): LatLngTuple[] {
    return geometria.coordinates[0].map(aLeaflet);
}

export function limites(geometrias: PoligonoGeoJson[]): LatLngBoundsExpression | null {
    const puntos = geometrias.flatMap(anilloLeaflet);
    return puntos.length > 0 ? puntos : null;
}
