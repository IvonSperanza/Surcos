import { NotFound } from "bradb";
import type { ProductorService } from "../productor";
import type { ParcelaRepository } from "./parcela.repository";
import type { ParcelaInsert } from "./parcela.validator";

type Deps = { repository: ParcelaRepository; productorService: ProductorService };

export function createParcelaService({ repository, productorService }: Deps) {
    const findOne = async (id: string) => {
        const parcela = await repository.findOne(id);
        if (!parcela) throw new NotFound("No existe esa parcela");
        return parcela;
    };

    // Sin login: la parcela es del productor de la demo.
    const create = async (data: Omit<ParcelaInsert, "productorId">) => {
        const productor = await productorService.actual();
        return repository.insert({ ...data, productorId: productor.id });
    };

    return { findAll: repository.findAll, findOne, create, remove: repository.remove };
}

export type ParcelaService = ReturnType<typeof createParcelaService>;
