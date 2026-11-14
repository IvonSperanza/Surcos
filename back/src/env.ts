import "dotenv/config";
import { z } from "zod";

const NODE_ENVS = ["dev", "staging", "prod"] as const;

const schema = z
    .object({
        NODE_ENV: z.enum(NODE_ENVS).default("dev"),

        PORT: z.coerce.number().default(3000),

        // Ruta completa del host. En prod, ej: https://example.com/
        HOST: z.string().default("http://localhost:3000"),

        // Orígenes permitidos para CORS, separados por coma. Nunca abierto a
        // cualquier origen.
        CORS_ORIGIN: z.string().default("http://localhost:5173"),

        DB_HOST: z.string().default("localhost"),
        DB_USER: z.string(),
        DB_PASS: z.string(),
        DB_PORT: z.string().default("5432"),
        DB_NAME: z.string()
    })
    .transform((env) => ({
        ...env,
        DATABASE_URL: `postgres://${env.DB_USER}:${env.DB_PASS}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`
    }));

const formatIssues = (error: z.ZodError): string =>
    error.issues
        .map((issue) => `  - ${issue.path.join(".") || "(configuración)"}: ${issue.message}`)
        .join("\n");

const parseEnv = (source: NodeJS.ProcessEnv) => {
    const result = schema.safeParse(source);
    if (!result.success) {
        throw new Error(`Configuración inválida.\nVariables con problemas:\n${formatIssues(result.error)}`);
    }
    return result.data;
};

export const env = parseEnv(process.env);
