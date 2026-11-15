import type { Database } from "../../db/client";
import type { ProductorService } from "../productor";
import { createParcelaController } from "./parcela.controller";
import { createParcelaRepository } from "./parcela.repository";
import { createParcelaRoutes } from "./parcela.routes";
import { createParcelaService } from "./parcela.service";

export type { ParcelaService } from "./parcela.service";
export type { PoligonoGeoJson } from "./parcela.validator";

export function createParcelaModule({ db, productorService }: { db: Database; productorService: ProductorService }) {
    const repository = createParcelaRepository({ db });
    const service = createParcelaService({ repository, productorService });
    const router = createParcelaRoutes(createParcelaController({ service }));
    return { service, repository, router };
}

export type ParcelaModule = ReturnType<typeof createParcelaModule>;
