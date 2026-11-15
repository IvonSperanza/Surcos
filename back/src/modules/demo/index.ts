import express, { type RequestHandler } from "express";
import { success } from "../../lib/http/responses";
import type { EventoService } from "../evento";
import type { ParcelaService } from "../parcela";
import type { ProductorService } from "../productor";
import { createDemoService } from "./demo.service";

type Deps = { productorService: ProductorService; parcelaService: ParcelaService; eventoService: EventoService };

export function createDemoModule(deps: Deps) {
    const service = createDemoService(deps);
    const reiniciar: RequestHandler = async (_req, res) => {
        await service.reiniciar();
        success(res, 200, undefined, "Demo reiniciada");
    };
    const router = express.Router();
    router.post("/reiniciar", reiniciar);
    return { service, router };
}
