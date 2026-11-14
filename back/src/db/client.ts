import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { env } from "../env";

const pool = new Pool({
    connectionString: env.DATABASE_URL
});

export const db = drizzle(pool, { schema });

// Tipo de `db` para que los módulos declaren "necesito una conexión a la
// base" sin importar el singleton de acá: lo reciben como parámetro de su
// factory (`createXModule({ db })`), armada una sola vez en `container.ts`.
export type Database = typeof db;

// Handle de transacción inferido de la firma de `db`, para no duplicarlo a
// mano ni depender de un tipo interno de bradb.
export type Tx = Parameters<typeof db.transaction>[0] extends (tx: infer T, ...args: unknown[]) => unknown ? T : never;

async function testDBConnection() {
    try {
        await db.execute(sql`select 1`);
    } catch (err) {
        console.error("Drizzle (Postgres) no está configurado correctamente", err);
        process.exit(1);
    }
}
testDBConnection();
