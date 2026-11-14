import { datos, type Envelope } from "./client";
import type { PoligonoGeoJson } from "./ndvi";

export type TipoInsight = "alerta" | "oportunidad" | "bien" | "planificar";

export type Evidencia = {
    dato: string;
    fuente: string;
    fecha: string | null; // "YYYY-MM-DD" o un rango "AAAA-MM-DD/AAAA-MM-DD"
    escena: string | null;
};

export type Insight = {
    id: string;
    tipo: TipoInsight;
    titulo: string;
    hallazgo: string;
    accion: string;
    confianza: "alta" | "media"; // "baja" nunca llega: se descarta
    motivo_confianza: string;
    evidencia: Evidencia[];
    version_regla: string;
};

export type Descartado = {
    id: string;
    motivo: string;
};

export type InsightsParcela = {
    version_reglas: string;
    generado: string;
    insights: Insight[];
    descartados: Descartado[];
};

export async function getInsights(geometria: PoligonoGeoJson): Promise<InsightsParcela> {
    const respuesta = await datos.post<Envelope<InsightsParcela>>("/insights", { geometria });
    return respuesta.data;
}
