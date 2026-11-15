import { datos, toQueryString, type Envelope } from "./client";

// Catálogo Nacional de Cultivares del INASE, servido por datos/.
export type FuenteCatalogo = {
    fuente: string;
    pagina: string;
    descargado: string;
};

export type Especie = {
    especie: string;
    nombre_cientifico: string;
    familia: string | null;
    nombre_familia: string | null;
    grupo: string;
    cultivares: number;
};

export type Cultivar = {
    numero: string; // número de inscripción en el INASE
    nombre: string;
    especie: string;
    nombre_cientifico: string;
    grupo: string;
    familia: string | null;
    inscripcion: string | null;
    solicitante: string | null;
};

export type UsoCatalogo = "cultivo" | "cobertura";

// Las especies no cambian durante la sesión: se piden una vez por uso.
const especiesPorUso = new Map<UsoCatalogo, Promise<FuenteCatalogo & { especies: Especie[] }>>();

export function getEspecies(uso: UsoCatalogo): Promise<FuenteCatalogo & { especies: Especie[] }> {
    let pedido = especiesPorUso.get(uso);
    if (!pedido) {
        pedido = datos.get<Envelope<FuenteCatalogo & { especies: Especie[] }>>(`/catalogo/especies${toQueryString({ uso })}`).then((r) => r.data);
        especiesPorUso.set(uso, pedido);
    }
    return pedido;
}

export async function buscarCultivares(especie: string, texto: string): Promise<Cultivar[]> {
    const respuesta = await datos.get<Envelope<FuenteCatalogo & { cultivares: Cultivar[] }>>(
        `/catalogo/cultivares${toQueryString({ especie, q: texto, limite: 15 })}`
    );
    return respuesta.data.cultivares;
}
