import { and, desc, eq, isNull, like } from "drizzle-orm";
import type { Database, Tx } from "../../db/client";
import { produccionesTable } from "./produccion.schema";

export type ProduccionRow = typeof produccionesTable.$inferSelect;
export type ProduccionInsert = typeof produccionesTable.$inferInsert;

export function createProduccionRepository({ db }: { db: Database }) {
    return {
        findAll: () => db.select().from(produccionesTable).orderBy(desc(produccionesTable.fechaSiembra)),
        findOne: async (id: string, tx?: Tx) => {
            const [produccion] = await (tx ?? db).select().from(produccionesTable).where(eq(produccionesTable.id, id));
            return produccion;
        },
        findByCodigo: async (codigo: string) => {
            const [produccion] = await db.select().from(produccionesTable).where(eq(produccionesTable.codigo, codigo));
            return produccion;
        },
        enCurso: async (parcelaId: string, tx?: Tx) => {
            const [produccion] = await (tx ?? db)
                .select()
                .from(produccionesTable)
                .where(and(eq(produccionesTable.parcelaId, parcelaId), isNull(produccionesTable.fechaCosecha)));
            return produccion;
        },
        ultimoCodigo: async (prefijo: string, tx?: Tx) => {
            const [ultimo] = await (tx ?? db)
                .select({ codigo: produccionesTable.codigo })
                .from(produccionesTable)
                .where(like(produccionesTable.codigo, `${prefijo}%`))
                .orderBy(desc(produccionesTable.codigo))
                .limit(1);
            return ultimo?.codigo;
        },
        insert: async (data: ProduccionInsert, tx?: Tx) => {
            const [produccion] = await (tx ?? db).insert(produccionesTable).values(data).returning();
            return produccion;
        },
        update: async (id: string, data: Partial<ProduccionInsert>, tx?: Tx) => {
            await (tx ?? db).update(produccionesTable).set(data).where(eq(produccionesTable.id, id));
        },
        remove: async (id: string, tx?: Tx) => {
            await (tx ?? db).delete(produccionesTable).where(eq(produccionesTable.id, id));
        }
    };
}

export type ProduccionRepository = ReturnType<typeof createProduccionRepository>;
