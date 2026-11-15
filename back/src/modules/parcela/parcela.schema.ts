import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { productoresTable } from "../productor/productor.schema";
import type { PoligonoGeoJson } from "./parcela.validator";

export const parcelasTable = pgTable("parcelas", {
    id: uuid("id").primaryKey().defaultRandom(),
    productorId: uuid("productor_id")
        .notNull()
        .references(() => productoresTable.id, { onDelete: "cascade" }),
    nombre: varchar("nombre", { length: 80 }).notNull(),
    geometria: jsonb("geometria").$type<PoligonoGeoJson>().notNull(),
    creada: timestamp("creada", { withTimezone: true }).notNull().defaultNow()
});
