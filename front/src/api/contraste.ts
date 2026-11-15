// Contraste de los eventos declarados con lo que vio el satélite (datos/,
// POST /contraste). Cada evento vuelve con un veredicto y la medición que lo
// respalda: el índice que tenía que cambiar, antes y después.
import { datos, type Envelope } from "./client";
import type { Evento } from "./eventos";
import type { Evidencia } from "./insights";
import type { PoligonoGeoJson } from "./ndvi";

export type Veredicto = "confirma" | "indicio" | "no_se_ve" | "sin_pasadas" | "declarado";

export type IndiceContraste = "ndvi" | "ndti" | "ndmi" | "ndre" | "bsi" | "temperatura_minima";

export type PuntoMedido = { fecha: string; valor: number; escena: string | null };

export type Medicion = {
    indice: IndiceContraste;
    nombre: string;
    antes: PuntoMedido | null;
    despues: PuntoMedido;
    cambio_esperado: number | null;
};

export type ContrasteEvento = {
    evento_id: string;
    tipo: Evento["tipo"];
    fecha: string;
    veredicto: Veredicto;
    titulo: string;
    hallazgo: string;
    senal_esperada: string;
    confianza: "alta" | "media" | "baja" | null;
    motivo_confianza: string | null;
    medicion: Medicion | null;
    evidencia: Evidencia[];
};

export type PasadaContraste = { fecha: string; ndvi: number; ndti: number; ndmi: number; ndre: number; bsi: number; escena: string };

export type CicloDetectado = {
    numero: number;
    tipo: "cultivo" | "verdeo_leve";
    siembra: { desde: string; hasta: string } | null;
    pico: string;
    ndvi_pico: number;
    cosecha: { desde: string; hasta: string } | null;
};

export type ContrasteParcela = {
    version_reglas: string;
    resumen: Record<Veredicto, number> & { contrastables: number };
    eventos: ContrasteEvento[];
    fuentes: { satelite: string; clima: string };
    desde: string;
    hasta: string;
    generado: string;
    serie: PasadaContraste[];
    ciclos: CicloDetectado[];
};

export async function contrastarEventos(geometria: PoligonoGeoJson, eventos: Evento[]): Promise<ContrasteParcela> {
    const declarados = eventos.map(({ id, tipo, fecha, detalles }) => ({ id, tipo, fecha, detalles }));
    const respuesta = await datos.post<Envelope<ContrasteParcela>>("/contraste", { geometria, eventos: declarados });
    return respuesta.data;
}
