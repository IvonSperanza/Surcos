import { datos, type Envelope } from "./client";

export type Coordenada = [lon: number, lat: number];

export type PoligonoGeoJson = {
    type: "Polygon";
    coordinates: Coordenada[][];
};

export type PasadaNdvi = {
    fecha: string;
    ndvi: number;
    fraccion_despejada: number;
    escena: string;
};

// El evento ocurrió entre estas dos pasadas despejadas (fechas "YYYY-MM-DD").
export type Ventana = {
    desde: string;
    hasta: string;
};

export type Ciclo = {
    numero: number;
    tipo: "cultivo" | "verdeo_leve";
    siembra: Ventana | null; // null: ya estaba en pie al empezar el período
    pico: string;
    ndvi_pico: number;
    cosecha: Ventana | null; // null: seguía en pie al terminar el período
    dias_estimados: number | null;
};

export type SueloDesnudo = {
    desde: string;
    hasta: string;
    dias_estimados: number;
};

export type AnalisisCiclos = {
    ciclos: Ciclo[];
    suelo_desnudo: SueloDesnudo[];
    dias_suelo_desnudo: number;
    pasadas_atipicas: string[];
};

export type HistoricoNdvi = {
    fuente: string;
    resolucion_m: number;
    consultado: string;
    desde: string;
    hasta: string;
    area_ha: number;
    umbral_suelo_desnudo: number;
    serie: PasadaNdvi[];
    analisis: AnalisisCiclos;
};

export async function getHistoricoNdvi(geometria: PoligonoGeoJson): Promise<HistoricoNdvi> {
    const respuesta = await datos.post<Envelope<HistoricoNdvi>>("/ndvi", { geometria });
    return respuesta.data;
}
