import type { ProduccionDeParcela } from "../features/producciones/useProducciones";
import { api, ApiError, type Envelope } from "./client";

// Sólo con back: sin él, las producciones se deducen de los eventos en el
// navegador (features/producciones/producciones.ts).

export type Productor = { nombre: string; localidad: string; descripcion: string; fotoUrl: string | null };

export type ProduccionPublica = ProduccionDeParcela & { productor?: Productor };

export async function listarProducciones(): Promise<ProduccionDeParcela[]> {
    return (await api.get<Envelope<ProduccionDeParcela[]>>("/producciones")).data;
}

// null si no hay ninguna con ese código.
export async function obtenerProduccionPublica(codigo: string): Promise<ProduccionPublica | null> {
    try {
        return (await api.get<Envelope<ProduccionPublica>>(`/publico/producciones/${encodeURIComponent(codigo)}`)).data;
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function reiniciarDemo(): Promise<void> {
    await api.post("/demo/reiniciar");
}
