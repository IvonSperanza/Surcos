import type { PoligonoGeoJson } from "./ndvi";

export type Parcela = {
    id: string;
    nombre: string;
    geometria: PoligonoGeoJson;
    creada: string; // ISO
};

export type ParcelaNueva = Pick<Parcela, "nombre" | "geometria">;

// Por ahora las parcelas viven en el navegador (decisión de la hackatón: el
// back todavía no tiene módulos). Estas funciones tienen la misma forma que
// tendría la API del back (async, devuelven la entidad), así que cuando
// existan los endpoints se cambia sólo este archivo.
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
    return [...todas()].sort((a, b) => b.creada.localeCompare(a.creada));
}

export async function obtenerParcela(id: string): Promise<Parcela | null> {
    return todas().find((p) => p.id === id) ?? null;
}

export async function crearParcela(nueva: ParcelaNueva): Promise<Parcela> {
    const parcela: Parcela = { ...nueva, id: crypto.randomUUID(), creada: new Date().toISOString() };
    guardarTodas([...todas(), parcela]);
    return parcela;
}

export async function eliminarParcela(id: string): Promise<void> {
    guardarTodas(todas().filter((p) => p.id !== id));
}

export async function eliminarTodasLasParcelas(): Promise<void> {
    guardarTodas([]);
}
