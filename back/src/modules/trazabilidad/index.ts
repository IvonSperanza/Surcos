import type { EventoService } from "../evento";
import type { ParcelaService } from "../parcela";
import type { ProduccionService } from "../produccion";
import type { ProductorService } from "../productor";
import { createTrazabilidadController } from "./trazabilidad.controller";
import { createTrazabilidadRoutes } from "./trazabilidad.routes";
import { createTrazabilidadService } from "./trazabilidad.service";

type Deps = { produccionService: ProduccionService; parcelaService: ParcelaService; eventoService: EventoService; productorService: ProductorService };

// Las producciones armadas con su parcela y sus eventos: el listado, la
// ficha del panel y la página pública del QR. Sin tabla propia.
export function createTrazabilidadModule(deps: Deps) {
    const service = createTrazabilidadService(deps);
    const router = createTrazabilidadRoutes(createTrazabilidadController({ service }));
    return { service, router };
}
