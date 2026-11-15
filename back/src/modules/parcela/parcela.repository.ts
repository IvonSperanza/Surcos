import { desc, eq } from "drizzle-orm";
import type { Database } from "../../db/client";
import { parcelasTable } from "./parcela.schema";
import type { ParcelaInsert } from "./parcela.validator";

export function createParcelaRepository({ db }: { db: Database }) {
    return {
        findAll: () => db.select().from(parcelasTable).orderBy(desc(parcelasTable.creada)),
        findOne: async (id: string) => {
            const [parcela] = await db.select().from(parcelasTable).where(eq(parcelasTable.id, id));
            return parcela;
        },
        insert: async (data: ParcelaInsert) => {
            const [parcela] = await db.insert(parcelasTable).values(data).returning();
            return parcela;
        },
        // Producciones y eventos se van con la parcela (on delete cascade).
        remove: async (id: string) => {
            await db.delete(parcelasTable).where(eq(parcelasTable.id, id));
        }
    };
}

export type ParcelaRepository = ReturnType<typeof createParcelaRepository>;
