import express, { Express } from "express";
import cors from 'cors';
import { Container } from "./container";
import { handleErrors } from "./lib/http/errors";
import { env } from "./env";

// Factory en vez de un `app` ya armado a nivel de módulo: quien levanta el
// proceso (`index.ts`) decide cuándo construirla y cuándo escuchar — así se
// puede importar sin efecto secundario (ej. en tests). El `container` entra
// por parámetro para poder armar la app con uno distinto (ej. uno de test).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createApp(container: Container): Express {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()) }));

    // Montar acá cada módulo: app.use('/<prefijo>', container.<modulo>.router);

    app.use(handleErrors);

    app.use('/{*splat}', (_, res) => res.status(404).json({
        success: false,
        error: "Esta ruta no hace nada"
    }));

    return app;
}
