import type { RequestHandler } from "express";
import { ok, updated } from "../../lib/http/responses";
import type { ProductorService } from "./productor.service";
import { productorValidator } from "./productor.validator";

export function createProductorController({ service }: { service: ProductorService }) {
    const actual: RequestHandler = async (_req, res) => {
        ok(res, await service.actual());
    };

    const actualizar: RequestHandler = async (req, res) => {
        updated(res, await service.actualizar(productorValidator.update.parse(req.body)));
    };

    return { actual, actualizar };
}

export type ProductorController = ReturnType<typeof createProductorController>;
