import type { Database } from "../../db/client";
import type { ParcelaService } from "../parcela";
import type { ProduccionService } from "../produccion";
import { createEventoController } from "./evento.controller";
import { createEventoRepository } from "./evento.repository";
import { createEventoRoutes } from "./evento.routes";
import { createEventoService } from "./evento.service";

export type { EventoService, EventoVista } from "./evento.service";
export type { EventoInsert } from "./evento.validator";

type Deps = { db: Database; parcelaService: ParcelaService; produccionService: ProduccionService };

export function createEventoModule({ db, parcelaService, produccionService }: Deps) {
    const repository = createEventoRepository({ db });
    const service = createEventoService({ db, repository, parcelaService, produccionService });
    const router = createEventoRoutes(createEventoController({ service }));
    return { service, repository, router };
}

export type EventoModule = ReturnType<typeof createEventoModule>;
