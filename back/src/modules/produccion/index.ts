import type { Database } from "../../db/client";
import { createProduccionRepository } from "./produccion.repository";
import { createProduccionService } from "./produccion.service";

export type { ProduccionService, CultivoDeclarado } from "./produccion.service";
export type { ProduccionRow } from "./produccion.repository";

// Sin rutas propias: las producciones se abren y cierran con los eventos
// (módulo evento) y se leen armadas con sus eventos (módulo trazabilidad).
export function createProduccionModule({ db }: { db: Database }) {
    const repository = createProduccionRepository({ db });
    const service = createProduccionService({ repository });
    return { service, repository };
}

export type ProduccionModule = ReturnType<typeof createProduccionModule>;
