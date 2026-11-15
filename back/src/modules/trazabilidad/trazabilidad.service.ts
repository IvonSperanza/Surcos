import type { EventoService, EventoVista } from "../evento";
import type { ParcelaService } from "../parcela";
import type { ProduccionRow, ProduccionService } from "../produccion";
import type { ProductorService } from "../productor";

type Deps = { produccionService: ProduccionService; parcelaService: ParcelaService; eventoService: EventoService; productorService: ProductorService };
type Parcela = Awaited<ReturnType<ParcelaService["findOne"]>>;

// Lo que pasó en la parcela entre la cosecha anterior y esta siembra: el
// "Antes de la siembra" que ve quien compra.
function eventosAntes(produccion: ProduccionRow, eventos: EventoVista[], deLaParcela: ProduccionRow[]) {
    const cosechaAnterior = deLaParcela
        .map((p) => p.fechaCosecha)
        .filter((f): f is string => f !== null && f <= produccion.fechaSiembra)
        .sort()
        .at(-1);
    return eventos.filter((e) => !e.produccionId && e.fecha <= produccion.fechaSiembra && (!cosechaAnterior || e.fecha > cosechaAnterior));
}

// Una producción con todo lo que muestran su ficha y el QR, con la forma de
// front/src/features/producciones/producciones.ts.
function armar(produccion: ProduccionRow, parcela: Parcela, eventos: EventoVista[], deLaParcela: ProduccionRow[]) {
    const propios = eventos.filter((e) => e.produccionId === produccion.id);
    const { id, codigo, parcelaId, especie, nombreCientifico, familia, nombreFamilia, cultivar, numeroInase, kgCosechados } = produccion;
    return {
        id,
        codigo,
        parcelaId,
        parcela,
        cultivo: { especie, nombreCientifico, familia, nombreFamilia, cultivar, numeroInase },
        siembra: propios.find((e) => e.tipo === "siembra") ?? null,
        cosecha: propios.find((e) => e.tipo === "cosecha") ?? null,
        kg: kgCosechados,
        durante: propios.filter((e) => e.tipo !== "siembra" && e.tipo !== "cosecha"),
        antes: eventosAntes(produccion, eventos, deLaParcela)
    };
}

export function createTrazabilidadService({ produccionService, parcelaService, eventoService, productorService }: Deps) {
    const deUnaParcela = async (produccion: ProduccionRow) => {
        const [parcela, eventos, todas] = await Promise.all([
            parcelaService.findOne(produccion.parcelaId),
            eventoService.findAll(produccion.parcelaId),
            produccionService.findAll()
        ]);
        return armar(produccion, parcela, eventos, todas.filter((p) => p.parcelaId === parcela.id));
    };

    // Todas con una consulta por tabla: alcanza para el listado de la demo.
    const listar = async () => {
        const [producciones, parcelas, eventos] = await Promise.all([produccionService.findAll(), parcelaService.findAll(), eventoService.findAll()]);
        return producciones.flatMap((p) => {
            const parcela = parcelas.find((x) => x.id === p.parcelaId);
            if (!parcela) return [];
            const deLaParcela = producciones.filter((x) => x.parcelaId === p.parcelaId);
            return [armar(p, parcela, eventos.filter((e) => e.parcelaId === p.parcelaId), deLaParcela)];
        });
    };

    const detalle = async (id: string) => deUnaParcela(await produccionService.findOne(id));

    // Lo que ve quien escanea el QR: la producción y quién la hizo.
    const publica = async (codigo: string) => {
        const produccion = await deUnaParcela(await produccionService.findByCodigo(codigo));
        const { nombre, localidad, descripcion, fotoUrl } = await productorService.findOne(produccion.parcela.productorId);
        return { ...produccion, productor: { nombre, localidad, descripcion, fotoUrl } };
    };

    return { listar, detalle, publica };
}

export type TrazabilidadService = ReturnType<typeof createTrazabilidadService>;
