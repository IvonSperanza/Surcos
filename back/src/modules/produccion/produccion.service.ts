import { NotFound } from "bradb";
import type { Tx } from "../../db/client";
import type { ProduccionRepository } from "./produccion.repository";

export type CultivoDeclarado = {
    especie: string;
    nombreCientifico: string;
    familia: string | null;
    nombreFamilia: string | null;
    cultivar: string;
    numeroInase: string | null;
};

// Correlativo por año de siembra: SUR-2026-0001, SUR-2026-0002…
async function siguienteCodigo(repository: ProduccionRepository, fechaSiembra: string, tx?: Tx) {
    const prefijo = `SUR-${fechaSiembra.slice(0, 4)}-`;
    const ultimo = await repository.ultimoCodigo(prefijo, tx);
    const numero = ultimo ? Number(ultimo.slice(prefijo.length)) + 1 : 1;
    return `${prefijo}${String(numero).padStart(4, "0")}`;
}

export function createProduccionService({ repository }: { repository: ProduccionRepository }) {
    const findOne = async (id: string) => {
        const produccion = await repository.findOne(id);
        if (!produccion) throw new NotFound("No existe esa producción");
        return produccion;
    };

    const findByCodigo = async (codigo: string) => {
        const produccion = await repository.findByCodigo(codigo);
        if (!produccion) throw new NotFound(`No hay ninguna producción con el código ${codigo}`);
        return produccion;
    };

    const abrir = async (parcelaId: string, cultivo: CultivoDeclarado, fechaSiembra: string, tx?: Tx) =>
        repository.insert({ ...cultivo, parcelaId, fechaSiembra, codigo: await siguienteCodigo(repository, fechaSiembra, tx) }, tx);

    const cerrar = (id: string, fechaCosecha: string, kgCosechados: number | null, tx?: Tx) =>
        repository.update(id, { fechaCosecha, kgCosechados }, tx);

    // Al borrar su cosecha, el cultivo vuelve a estar en pie.
    const reabrir = (id: string, tx?: Tx) => repository.update(id, { fechaCosecha: null, kgCosechados: null }, tx);

    return {
        findAll: repository.findAll,
        findOne,
        findByCodigo,
        enCurso: repository.enCurso,
        abrir,
        cerrar,
        reabrir,
        remove: repository.remove
    };
}

export type ProduccionService = ReturnType<typeof createProduccionService>;
