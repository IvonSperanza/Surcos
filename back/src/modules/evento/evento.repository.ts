import { asc, eq } from "drizzle-orm";
import type { Database, Tx } from "../../db/client";
import { eventosTable } from "./evento.schema";

export type EventoRow = typeof eventosTable.$inferSelect;
type EventoRowInsert = typeof eventosTable.$inferInsert;

const deLaParcela = (parcelaId?: string) => (parcelaId ? eq(eventosTable.parcelaId, parcelaId) : undefined);

export function createEventoRepository({ db }: { db: Database }) {
    return {
        // En orden cronológico; a igual fecha, en el orden en que se cargaron.
        findAll: (parcelaId?: string) =>
            db.select().from(eventosTable).where(deLaParcela(parcelaId)).orderBy(asc(eventosTable.fecha), asc(eventosTable.registrado)),
        findOne: async (id: string) => {
            const [evento] = await db.select().from(eventosTable).where(eq(eventosTable.id, id));
            return evento;
        },
        insert: async (data: EventoRowInsert, tx?: Tx) => {
            const [evento] = await (tx ?? db).insert(eventosTable).values(data).returning();
            return evento;
        },
        remove: async (id: string, tx?: Tx) => {
            await (tx ?? db).delete(eventosTable).where(eq(eventosTable.id, id));
        }
    };
}

export type EventoRepository = ReturnType<typeof createEventoRepository>;
