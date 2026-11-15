import type { RequestHandler } from "express";
import { created, deleted, ok } from "../../lib/http/responses";
import type { EventoService } from "./evento.service";
import { eventoValidator } from "./evento.validator";

export function createEventoController({ service }: { service: EventoService }) {
    const findAll: RequestHandler = async (req, res) => {
        const { parcelaId } = eventoValidator.filtro.parse(req.query);
        ok(res, await service.findAll(parcelaId));
    };

    const create: RequestHandler = async (req, res) => {
        created(res, await service.create(eventoValidator.insert.parse(req.body)));
    };

    const remove: RequestHandler = async (req, res) => {
        const { id } = eventoValidator.pk.parse(req.params);
        await service.remove(id);
        deleted(res, "Evento eliminado");
    };

    return { findAll, create, remove };
}

export type EventoController = ReturnType<typeof createEventoController>;
