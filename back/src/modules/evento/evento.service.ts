import { NotFound } from "bradb";
import type { Database, Tx } from "../../db/client";
import { Conflict, ValidationError } from "../../lib/http/errors";
import type { ParcelaService } from "../parcela";
import type { ProduccionService } from "../produccion";
import type { EventoRepository, EventoRow } from "./evento.repository";
import type { EventoInsert } from "./evento.validator";

type Deps = { db: Database; repository: EventoRepository; parcelaService: ParcelaService; produccionService: ProduccionService };

// La forma que usa el front (front/src/api/eventos.ts): la foto va junta.
export function aVista({ fotoUrl, fotoCredito, ...evento }: EventoRow) {
    return { ...evento, foto: fotoUrl ? { url: fotoUrl, credito: fotoCredito } : null };
}

export type EventoVista = ReturnType<typeof aVista>;

export function createEventoService({ db, repository, parcelaService, produccionService }: Deps) {
    // A qué producción va el evento. La siembra abre una y la cosecha cierra la
    // que está en pie: una parcela tiene un cultivo a la vez y la cosecha es total.
    const produccionDelEvento = async (data: EventoInsert, tx: Tx) => {
        const enCurso = await produccionService.enCurso(data.parcelaId, tx);
        if (data.tipo === "siembra") {
            if (enCurso) throw new Conflict(`${enCurso.especie} ${enCurso.cultivar} sigue en pie. Registrá su cosecha primero.`);
            if (!data.cultivo) throw new ValidationError("La siembra lleva el cultivo");
            return (await produccionService.abrir(data.parcelaId, data.cultivo, data.fecha, tx)).id;
        }
        if (data.tipo === "cosecha" || data.tipo === "foto") {
            if (!enCurso) throw new Conflict("No hay cultivo en pie. Registrá una siembra primero.");
            if (data.tipo === "cosecha") await produccionService.cerrar(enCurso.id, data.fecha, Number(data.detalles.cantidad) || null, tx);
        }
        return enCurso?.id ?? null;
    };

    const create = async ({ foto, ...data }: EventoInsert) => {
        await parcelaService.findOne(data.parcelaId);
        const evento = await db.transaction(async (tx) => {
            const produccionId = await produccionDelEvento({ foto, ...data }, tx);
            return repository.insert({ ...data, produccionId, fotoUrl: foto?.url ?? null, fotoCredito: foto?.credito ?? null }, tx);
        });
        return aVista(evento);
    };

    // Borrar la siembra borra su producción; borrar la cosecha la deja en pie.
    const remove = async (id: string) => {
        const evento = await repository.findOne(id);
        if (!evento) throw new NotFound("No existe ese evento");
        await db.transaction(async (tx) => {
            if (evento.produccionId && evento.tipo === "siembra") await produccionService.remove(evento.produccionId, tx);
            if (evento.produccionId && evento.tipo === "cosecha") await produccionService.reabrir(evento.produccionId, tx);
            await repository.remove(id, tx);
        });
    };

    const findAll = async (parcelaId?: string) => (await repository.findAll(parcelaId)).map(aVista);

    return { findAll, create, remove };
}

export type EventoService = ReturnType<typeof createEventoService>;
