import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const productoresTable = pgTable("productores", {
    id: uuid("id").primaryKey().defaultRandom(),
    nombre: varchar("nombre", { length: 120 }).notNull(),
    localidad: varchar("localidad", { length: 120 }).notNull(),
    descripcion: text("descripcion").notNull().default(""),
    fotoUrl: varchar("foto_url", { length: 500 }),
    creado: timestamp("creado", { withTimezone: true }).notNull().defaultNow()
});
