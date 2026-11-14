import type { ClimaParcela, DiaClima } from "../../api/clima";
import type { Ciclo, Ventana } from "../../api/ndvi";

export type ClimaDeCiclo = {
    desde: string;
    hasta: string;
    lluvia_mm: number;
    dias_lluvia_intensa: number;
    heladas: number;
    temperatura_minima: number | null;
    grados_dia: number;
    agua_raices_minima: number | null; // 0 seco, 1 saturado
    dias_con_dato: number;
};

const LLUVIA_INTENSA_MM = 50;

// Mismo criterio que la duración del ciclo en datos/ciclos.py: cada evento se
// ubica en la mitad de su ventana entre pasadas.
function medio({ desde, hasta }: Ventana): string {
    const t = (Date.parse(desde) + Date.parse(hasta)) / 2;
    return new Date(t).toISOString().slice(0, 10);
}

const valores = (dias: DiaClima[], campo: keyof DiaClima) =>
    dias.map((d) => d[campo]).filter((v): v is number => typeof v === "number");

const sumar = (lista: number[]) => lista.reduce((a, b) => a + b, 0);

export function climaDeCiclo(ciclo: Ciclo, clima: ClimaParcela): ClimaDeCiclo | null {
    // Sin siembra o sin cosecha, el ciclo arranca o termina fuera del período:
    // se toma el borde del período (comparando "YYYY-MM-DD" como texto).
    const desde = ciclo.siembra ? medio(ciclo.siembra) : clima.desde;
    const hasta = ciclo.cosecha ? medio(ciclo.cosecha) : clima.hasta;
    const dias = clima.diario.filter((d) => d.fecha >= desde && d.fecha <= hasta);
    if (dias.length === 0) return null;

    const minimas = valores(dias, "temperatura_minima");
    const agua = valores(dias, "humedad_raiz");
    return {
        desde,
        hasta,
        lluvia_mm: Math.round(sumar(valores(dias, "lluvia_mm"))),
        dias_lluvia_intensa: valores(dias, "lluvia_mm").filter((v) => v >= LLUVIA_INTENSA_MM).length,
        heladas: dias.filter((d) => d.helada).length,
        temperatura_minima: minimas.length > 0 ? Math.min(...minimas) : null,
        grados_dia: Math.round(sumar(valores(dias, "grados_dia_10"))),
        agua_raices_minima: agua.length > 0 ? Math.min(...agua) : null,
        dias_con_dato: dias.length
    };
}
