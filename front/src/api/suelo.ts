import { datos, type Envelope } from "./client";
import type { PoligonoGeoJson } from "./ndvi";

export type CapaSuelo = {
    profundidad: string; // "0-5cm", "5-15cm", "15-30cm"
    arcilla: number | null; // %
    arena: number | null; // %
    limo: number | null; // %
    carbono_organico: number | null; // g/kg
    ph: number | null;
    nitrogeno: number | null; // g/kg
    densidad_aparente: number | null; // kg/dm³
    capacidad_intercambio: number | null; // cmol(c)/kg
};

export type SueloParcela = {
    fuente: string;
    resolucion: string;
    punto: { lat: number; lon: number };
    distancia_al_centro_m: number;
    textura_superficial: string;
    unidades: Record<string, string>;
    capas: CapaSuelo[];
};

export async function getSuelo(geometria: PoligonoGeoJson): Promise<SueloParcela> {
    const respuesta = await datos.post<Envelope<SueloParcela>>("/suelo", { geometria });
    return respuesta.data;
}
