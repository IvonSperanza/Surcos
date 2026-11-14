import type { HistoricoNdvi } from "../../api/ndvi";

export type ResumenNdvi = {
    pasadas: number;
    pasadasSueloDesnudo: number;
    ndviMaximo: number;
};

// Cuenta pasadas, no días: entre dos pasadas despejadas puede haber semanas
// sin dato y no se sabe qué pasó en el medio.
export function resumirNdvi({ serie, umbral_suelo_desnudo }: HistoricoNdvi): ResumenNdvi {
    return {
        pasadas: serie.length,
        pasadasSueloDesnudo: serie.filter((p) => p.ndvi < umbral_suelo_desnudo).length,
        ndviMaximo: Math.max(...serie.map((p) => p.ndvi))
    };
}
