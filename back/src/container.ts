import { db } from "./db/client";
import { createDemoModule } from "./modules/demo";
import { createEventoModule } from "./modules/evento";
import { createFotoModule } from "./modules/foto";
import { createParcelaModule } from "./modules/parcela";
import { createProduccionModule } from "./modules/produccion";
import { createProductorModule } from "./modules/productor";
import { createTrazabilidadModule } from "./modules/trazabilidad";

// Composition root: arma todos los módulos e inyecta sus dependencias.
// Cada módulo nuevo se crea acá con `createXModule({ db, ... })` y se
// devuelve en el objeto para que `app.ts` monte su router.
export function createContainer() {
    const productor = createProductorModule({ db });
    const parcela = createParcelaModule({ db, productorService: productor.service });
    const produccion = createProduccionModule({ db });
    const evento = createEventoModule({ db, parcelaService: parcela.service, produccionService: produccion.service });
    const servicios = {
        productorService: productor.service,
        parcelaService: parcela.service,
        produccionService: produccion.service,
        eventoService: evento.service
    };
    const trazabilidad = createTrazabilidadModule(servicios);
    const demo = createDemoModule(servicios);
    const foto = createFotoModule();
    return { productor, parcela, produccion, evento, trazabilidad, demo, foto };
}

export type Container = ReturnType<typeof createContainer>;

export const container = createContainer();
