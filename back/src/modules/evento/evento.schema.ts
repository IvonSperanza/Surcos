import { date, index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { parcelasTable } from "../parcela/parcela.schema";
import { produccionesTable } from "../produccion/produccion.schema";
import type { CreditoFoto, CultivoDeclarado } from "./evento.validator";

// Lo que el productor declara que hizo en una parcela. Los de un cultivo en
// pie llevan su producción; los de entre cultivos (labranza, cobertura) no.
export const eventosTable = pgTable(
    "eventos",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        parcelaId: uuid("parcela_id")
            .notNull()
            .references(() => parcelasTable.id, { onDelete: "cascade" }),
        produccionId: uuid("produccion_id").references(() => produccionesTable.id, { onDelete: "set null" }),
        tipo: varchar("tipo", { length: 30 }).notNull(),
        fecha: date("fecha", { mode: "string" }).notNull(),
        // La siembra (que también abre la producción) y la cobertura.
        cultivo: jsonb("cultivo").$type<CultivoDeclarado>(),
        detalles: jsonb("detalles").$type<Record<string, string>>().notNull().default({}),
        notas: text("notas").notNull().default(""),
        fotoUrl: varchar("foto_url", { length: 500 }),
        // Sólo las fotos de ejemplo, que son de Wikimedia Commons.
        fotoCredito: jsonb("foto_credito").$type<CreditoFoto>(),
        registrado: timestamp("registrado", { withTimezone: true }).notNull().defaultNow()
    },
    (t) => [index("eventos_parcela_idx").on(t.parcelaId), index("eventos_produccion_idx").on(t.produccionId)]
);
