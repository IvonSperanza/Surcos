import { asc, eq } from "drizzle-orm";
import type { Database } from "../../db/client";
import { productoresTable } from "./productor.schema";
import type { ProductorInsert, ProductorUpdate } from "./productor.validator";

export function createProductorRepository({ db }: { db: Database }) {
    return {
        findFirst: async () => {
            const [productor] = await db.select().from(productoresTable).orderBy(asc(productoresTable.creado)).limit(1);
            return productor;
        },
        findOne: async (id: string) => {
            const [productor] = await db.select().from(productoresTable).where(eq(productoresTable.id, id));
            return productor;
        },
        insert: async (data: ProductorInsert) => {
            const [productor] = await db.insert(productoresTable).values(data).returning();
            return productor;
        },
        update: async (id: string, data: ProductorUpdate) => {
            const [productor] = await db.update(productoresTable).set(data).where(eq(productoresTable.id, id)).returning();
            return productor;
        },
        removeAll: async () => {
            await db.delete(productoresTable);
        }
    };
}

export type ProductorRepository = ReturnType<typeof createProductorRepository>;
