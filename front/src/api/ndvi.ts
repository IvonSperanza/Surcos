import { datos, type Envelope } from "./client";

export type Coordenada = [lon: number, lat: number];

export type PoligonoGeoJson = {
    type: "Polygon";
    coordinates: Coordenada[][];
};

// Una pasada despejada sobre la parcela: mediana de cada índice en sus píxeles.
export type PasadaNdvi = {
    fecha: string;
    ndvi: number; // vegetación verde
    ndmi: number; // agua en la vegetación
    ndre: number; // clorofila; sigue diferenciando donde el NDVI se satura
    ndti: number; // residuos secos (rastrojo) sobre el suelo
    bsi: number; // suelo expuesto
    // Qué cubría cada píxel despejado (suman 1).
    fraccion_cultivo: number;
    fraccion_rastrojo: number;
    fraccion_desnudo: number;
    fraccion_incierta: number;
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

export type CoberturaSinCultivo = "rastrojo" | "desnudo" | "incierta" | "mixta";

export type PeriodoSinCultivo = {
    desde: string;
    hasta: string;
    dias_estimados: number;
    cobertura: CoberturaSinCultivo;
    dias_rastrojo: number;
    dias_desnudo: number;
    dias_inciertos: number;
};

export type AnalisisCiclos = {
    ciclos: Ciclo[];
    sin_cultivo: PeriodoSinCultivo[];
    dias_sin_cultivo: number;
    dias_suelo_desnudo: number;
    dias_con_rastrojo: number;
    dias_inciertos: number;
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
