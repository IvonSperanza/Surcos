import { NotFound } from "bradb";
import type { ProductorRepository } from "./productor.repository";
import type { ProductorUpdate } from "./productor.validator";

// Sin login en la demo: hay un solo productor, el primero que se cargó. Con
// login, sale del token.
export function createProductorService({ repository }: { repository: ProductorRepository }) {
    const actual = async () => {
        const productor = await repository.findFirst();
        if (!productor) throw new NotFound("Todavía no hay un productor cargado. Reiniciá la demo.");
        return productor;
    };

    const findOne = async (id: string) => {
        const productor = await repository.findOne(id);
        if (!productor) throw new NotFound("No existe ese productor");
        return productor;
    };

    const actualizar = async (data: ProductorUpdate) => {
        const { id } = await actual();
        return repository.update(id, data);
    };

    return { actual, findOne, actualizar, create: repository.insert, removeAll: repository.removeAll };
}

export type ProductorService = ReturnType<typeof createProductorService>;
