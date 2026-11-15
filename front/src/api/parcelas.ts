import { api, conBack, type Envelope } from "./client";
import type { PoligonoGeoJson } from "./ndvi";

export type Parcela = {
    id: string;
    nombre: string;
    geometria: PoligonoGeoJson;
    creada: string; // ISO
};

export type ParcelaNueva = Pick<Parcela, "nombre" | "geometria">;

// Con back (VITE_API_URL), las parcelas viven en el servidor; sin él, en el
// navegador, con las mismas funciones. Lo de abajo es el modo navegador.
const CLAVE = "surco-parcelas-v1";

function leer(): Parcela[] {
    try {
        const guardado: unknown = JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
        return Array.isArray(guardado) ? (guardado as Parcela[]) : [];
    } catch {
        return [];
    }
}

function escribir(parcelas: Parcela[]): void {
    try {
        window.localStorage.setItem(CLAVE, JSON.stringify(parcelas));
    } catch {
        // Sin almacenamiento: las parcelas duran hasta recargar la página.
    }
}

let enMemoria: Parcela[] | null = null;

function todas(): Parcela[] {
    enMemoria ??= leer();
    return enMemoria;
}

function guardarTodas(parcelas: Parcela[]): void {
    enMemoria = parcelas;
    escribir(parcelas);
}

export async function listarParcelas(): Promise<Parcela[]> {
    if (conBack) return (await api.get<Envelope<Parcela[]>>("/parcelas")).data;
    return [...todas()].sort((a, b) => b.creada.localeCompare(a.creada));
}

export async function obtenerParcela(id: string): Promise<Parcela | null> {
    if (conBack) return (await listarParcelas()).find((p) => p.id === id) ?? null;
    return todas().find((p) => p.id === id) ?? null;
}

export async function crearParcela(nueva: ParcelaNueva): Promise<Parcela> {
    if (conBack) return (await api.post<Envelope<Parcela>>("/parcelas", nueva)).data;
    const parcela: Parcela = { ...nueva, id: crypto.randomUUID(), creada: new Date().toISOString() };
    guardarTodas([...todas(), parcela]);
    return parcela;
}

// Para las que ya traen id, como las de ejemplo.
export async function agregarParcelas(parcelas: Parcela[]): Promise<void> {
    guardarTodas([...todas(), ...parcelas]);
}

export async function eliminarParcela(id: string): Promise<void> {
    if (conBack) {
        await api.del(`/parcelas/${id}`);
        return;
    }
    guardarTodas(todas().filter((p) => p.id !== id));
}

export async function eliminarTodasLasParcelas(): Promise<void> {
    guardarTodas([]);
}
