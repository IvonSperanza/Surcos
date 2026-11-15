import { z } from "zod";

const insert = z.object({
    nombre: z.string().trim().min(1).max(120),
    localidad: z.string().trim().min(1).max(120),
    descripcion: z.string().max(2000).default(""),
    fotoUrl: z.string().max(500).nullable().default(null)
});
const update = insert.partial();

export type ProductorInsert = z.infer<typeof insert>;
export type ProductorUpdate = z.infer<typeof update>;

export const productorValidator = { insert, update };
