import type { Database } from "../../db/client";
import { createProductorController } from "./productor.controller";
import { createProductorRepository } from "./productor.repository";
import { createProductorRoutes } from "./productor.routes";
import { createProductorService } from "./productor.service";

export type { ProductorService } from "./productor.service";
export type { ProductorInsert } from "./productor.validator";

export function createProductorModule({ db }: { db: Database }) {
    const repository = createProductorRepository({ db });
    const service = createProductorService({ repository });
    const router = createProductorRoutes(createProductorController({ service }));
    return { service, repository, router };
}

export type ProductorModule = ReturnType<typeof createProductorModule>;
