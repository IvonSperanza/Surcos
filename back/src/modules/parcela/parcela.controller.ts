import type { RequestHandler } from "express";
import { created, deleted, ok } from "../../lib/http/responses";
import type { ParcelaService } from "./parcela.service";
import { parcelaValidator } from "./parcela.validator";

export function createParcelaController({ service }: { service: ParcelaService }) {
    const findAll: RequestHandler = async (_req, res) => {
        ok(res, await service.findAll());
    };

    const findOne: RequestHandler = async (req, res) => {
        const { id } = parcelaValidator.pk.parse(req.params);
        ok(res, await service.findOne(id));
    };

    const create: RequestHandler = async (req, res) => {
        created(res, await service.create(parcelaValidator.insert.parse(req.body)));
    };

    const remove: RequestHandler = async (req, res) => {
        const { id } = parcelaValidator.pk.parse(req.params);
        await service.remove(id);
        deleted(res, "Parcela eliminada");
    };

    return { findAll, findOne, create, remove };
}

export type ParcelaController = ReturnType<typeof createParcelaController>;
