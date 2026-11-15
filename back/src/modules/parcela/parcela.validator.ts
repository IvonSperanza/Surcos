import { z } from "zod";

// [lon, lat], como GeoJSON y como lo dibuja el front.
const coordenada = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const geometria = z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(coordenada).min(4)).min(1)
});

const insert = z.object({
    nombre: z.string().trim().min(1).max(80),
    geometria
});
const pk = z.object({ id: z.uuid() });

export type PoligonoGeoJson = z.infer<typeof geometria>;
export type ParcelaInsert = z.infer<typeof insert> & { productorId: string };

export const parcelaValidator = { insert, pk };
