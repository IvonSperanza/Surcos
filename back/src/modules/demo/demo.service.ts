import type { EventoService } from "../evento";
import type { ParcelaService } from "../parcela";
import type { ProductorService } from "../productor";
import { PARCELAS_EJEMPLO, PRODUCTOR_EJEMPLO } from "./ejemplos";

type Deps = { productorService: ProductorService; parcelaService: ParcelaService; eventoService: EventoService };

// "Reiniciar demo": borra todo y carga la quinta de ejemplo. Los eventos se
// registran con las mismas reglas que los del panel, así que las producciones
// y sus códigos salen igual cada vez (SUR-2025-0001, SUR-2026-0001…) y las
// etiquetas impresas siguen andando.
export function createDemoService({ productorService, parcelaService, eventoService }: Deps) {
    const reiniciar = async () => {
        await productorService.removeAll(); // en cascada: parcelas, producciones y eventos
        await productorService.create(PRODUCTOR_EJEMPLO);
        for (const { historia, ...parcela } of PARCELAS_EJEMPLO) {
            const { id } = await parcelaService.create(parcela);
            for (const evento of historia) {
                await eventoService.create({ cultivo: null, detalles: {}, notas: "", foto: null, ...evento, parcelaId: id });
            }
        }
    };
    return { reiniciar };
}

export type DemoService = ReturnType<typeof createDemoService>;
