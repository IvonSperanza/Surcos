import { datos, type Envelope } from "./client";
import type { PoligonoGeoJson } from "./ndvi";

export type ValorConFecha = { valor: number; fecha: string };

export type ResumenClima = {
    lluvia_total_mm: number;
    dias_con_lluvia: number;
    dias_lluvia_intensa: number;
    lluvia_maxima_diaria: ValorConFecha | null;
    dias_con_helada: number;
    temperatura_media: number | null;
    temperatura_minima_absoluta: ValorConFecha | null;
    temperatura_maxima_absoluta: ValorConFecha | null;
    grados_dia_10: number;
    humedad_raiz_media: number | null; // 0 seco, 1 saturado
    ultimo_dato: string | null;
};

export type MesClima = {
    mes: string; // "YYYY-MM"
    lluvia_mm: number;
    temperatura_media: number | null;
    dias_con_helada: number;
    humedad_raiz_media: number | null;
    dias_con_dato: number;
};

export type DiaClima = {
    fecha: string;
    temperatura_media: number | null;
    temperatura_maxima: number | null;
    temperatura_minima: number | null;
    lluvia_mm: number | null;
    humedad_raiz: number | null;
    humedad_superficie: number | null;
    evaporacion_mm: number | null;
    helada: boolean | null;
    grados_dia_10: number | null;
};

export type ClimaParcela = {
    fuente: string;
    fuentes_originales: string[];
    resolucion: string;
    punto: { lat: number; lon: number };
    consultado: string;
    desde: string;
    hasta: string;
    resumen: ResumenClima;
    mensual: MesClima[];
    diario: DiaClima[];
};

export async function getClima(geometria: PoligonoGeoJson): Promise<ClimaParcela> {
    const respuesta = await datos.post<Envelope<ClimaParcela>>("/clima", { geometria });
    return respuesta.data;
}
