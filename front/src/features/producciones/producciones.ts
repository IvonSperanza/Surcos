import type { CultivoDeclarado, Evento, FotoEvento } from "../../api/eventos";

// Una producción es un cultivo en una parcela: de su siembra a su cosecha. Es
// lo que se vende. Por ahora una parcela tiene un solo cultivo a la vez y la
// cosecha es total, así que las producciones se deducen de los eventos sin
// cargar nada aparte: cada siembra abre una y la cosecha siguiente la cierra.
export type Produccion = {
    id: string; // el de su evento de siembra
    parcelaId: string;
    cultivo: CultivoDeclarado;
    siembra: Evento;
    cosecha: Evento | null; // null: el cultivo sigue en pie
    kg: number | null;
    // Lo que pasó en la parcela desde la cosecha anterior hasta esta siembra:
    // el "Historial de la parcela" que ve el comprador, separado del cultivo.
    antes: Evento[];
    // Del día siguiente a la siembra hasta la cosecha (sin incluirlas).
    durante: Evento[];
};

const cronologico = (a: Evento, b: Evento) => a.fecha.localeCompare(b.fecha) || a.registrado.localeCompare(b.registrado);

export function derivarProducciones(eventos: Evento[]): Produccion[] {
    const ordenados = [...eventos].sort(cronologico);
    const producciones: Produccion[] = [];
    let previos: Evento[] = [];
    let abierta: Produccion | null = null;

    for (const evento of ordenados) {
        if (evento.tipo === "siembra" && evento.cultivo && !abierta) {
            abierta = { id: evento.id, parcelaId: evento.parcelaId, cultivo: evento.cultivo, siembra: evento, cosecha: null, kg: null, antes: previos, durante: [] };
            producciones.push(abierta);
            previos = [];
        } else if (evento.tipo === "cosecha" && abierta) {
            abierta.cosecha = evento;
            abierta.kg = Number(evento.detalles.cantidad) || null;
            abierta = null;
        } else if (abierta) {
            abierta.durante.push(evento);
        } else {
            previos.push(evento);
        }
    }
    // De la más reciente a la más vieja, como la historia de la parcela.
    return producciones.reverse();
}

export function produccionAbierta(eventos: Evento[]): Produccion | null {
    const [ultima] = derivarProducciones(eventos);
    return ultima && !ultima.cosecha ? ultima : null;
}

export function diasDeCultivo(produccion: Produccion): number | null {
    if (!produccion.cosecha) return null;
    return Math.round((Date.parse(produccion.cosecha.fecha) - Date.parse(produccion.siembra.fecha)) / 86_400_000);
}

// La de la cosecha si la hay; si no, la más reciente del cultivo en pie.
export function fotoDeProduccion(produccion: Produccion): { foto: FotoEvento; evento: Evento } | null {
    const delCultivo = [produccion.cosecha, ...[...produccion.durante].reverse(), produccion.siembra];
    const evento = delCultivo.find((e) => e?.foto);
    return evento?.foto ? { foto: evento.foto, evento } : null;
}
