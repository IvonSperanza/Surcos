import type { RequestHandler } from "express";
import { z } from "zod";
import { ok } from "../../lib/http/responses";
import type { TrazabilidadService } from "./trazabilidad.service";

const porId = z.object({ id: z.uuid() });
const porCodigo = z.object({ codigo: z.string().trim().toUpperCase().regex(/^SUR-\d{4}-\d{4}$/, "Código inválido") });

export function createTrazabilidadController({ service }: { service: TrazabilidadService }) {
    const listar: RequestHandler = async (_req, res) => {
        ok(res, await service.listar());
    };

    const detalle: RequestHandler = async (req, res) => {
        ok(res, await service.detalle(porId.parse(req.params).id));
    };

    const publica: RequestHandler = async (req, res) => {
        ok(res, await service.publica(porCodigo.parse(req.params).codigo));
    };

    return { listar, detalle, publica };
}

export type TrazabilidadController = ReturnType<typeof createTrazabilidadController>;
