import { z } from "zod";

// Los mismos tipos que front/src/api/eventos.ts.
const TIPOS = ["siembra", "cosecha", "labranza", "cobertura", "incorporacion", "riego", "fertilizacion", "fitosanitario", "desmalezado", "dano_climatico", "foto"] as const;

const cultivo = z.object({
    especie: z.string().min(1),
    nombreCientifico: z.string(),
    familia: z.string().nullable(),
    nombreFamilia: z.string().nullable(),
    cultivar: z.string().min(1),
    numeroInase: z.string().nullable()
});

const credito = z.object({ autor: z.string(), licencia: z.string(), pagina: z.string() });

// La foto se sube antes con POST /fotos: acá llega sólo su URL.
const foto = z.object({ url: z.string().min(1).max(500), credito: credito.nullable().default(null) });

const insert = z.object({
    parcelaId: z.uuid(),
    tipo: z.enum(TIPOS),
    fecha: z.iso.date(),
    cultivo: cultivo.nullable().default(null),
    detalles: z.record(z.string(), z.string()).default({}),
    notas: z.string().max(2000).default(""),
    foto: foto.nullable().default(null)
});
const filtro = z.object({ parcelaId: z.uuid().optional() });
const pk = z.object({ id: z.uuid() });

export type CultivoDeclarado = z.infer<typeof cultivo>;
export type CreditoFoto = z.infer<typeof credito>;
export type EventoInsert = z.infer<typeof insert>;

export const eventoValidator = { insert, filtro, pk };
