import { date, doublePrecision, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { parcelasTable } from "../parcela/parcela.schema";

// Un cultivo en una parcela, de la siembra a la cosecha: lo que se vende y lo
// que cuenta el QR. La abre un evento de siembra y la cierra el de cosecha.
export const produccionesTable = pgTable("producciones", {
    id: uuid("id").primaryKey().defaultRandom(),
    // El del QR y la etiqueta: SUR-2026-0001.
    codigo: varchar("codigo", { length: 20 }).notNull().unique(),
    parcelaId: uuid("parcela_id")
        .notNull()
        .references(() => parcelasTable.id, { onDelete: "cascade" }),
    // El cultivo declarado, del Catálogo Nacional de Cultivares del INASE.
    especie: varchar("especie", { length: 120 }).notNull(),
    nombreCientifico: varchar("nombre_cientifico", { length: 160 }).notNull(),
    familia: varchar("familia", { length: 60 }),
    nombreFamilia: varchar("nombre_familia", { length: 80 }),
    cultivar: varchar("cultivar", { length: 160 }).notNull(),
    numeroInase: varchar("numero_inase", { length: 20 }),
    fechaSiembra: date("fecha_siembra", { mode: "string" }).notNull(),
    fechaCosecha: date("fecha_cosecha", { mode: "string" }), // null: en curso
    kgCosechados: doublePrecision("kg_cosechados"),
    creada: timestamp("creada", { withTimezone: true }).notNull().defaultNow()
});
