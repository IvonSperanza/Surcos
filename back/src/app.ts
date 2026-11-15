import express, { Express } from "express";
import cors from 'cors';
import { Container } from "./container";
import { handleErrors } from "./lib/http/errors";
import { env } from "./env";
import { storageRoot } from "./lib/storage";

// Factory en vez de un `app` ya armado a nivel de módulo: quien levanta el
// proceso (`index.ts`) decide cuándo construirla y cuándo escuchar — así se
// puede importar sin efecto secundario (ej. en tests). El `container` entra
// por parámetro para poder armar la app con uno distinto (ej. uno de test).
export function createApp(container: Container): Express {
    const app = express();

    // Las fotos de los eventos viajan como data URL dentro del JSON.
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()) }));

    // Sin login en la demo (ver ARCHITECTURE.md): no hay middleware auth.
    app.get("/salud", (_req, res) => {
        res.json({ success: true, data: { estado: "ok" } });
    });
    app.use("/files", express.static(storageRoot, { maxAge: "7d" }));
    app.use("/productor", container.productor.router);
    app.use("/parcelas", container.parcela.router);
    app.use("/eventos", container.evento.router);
    app.use("/fotos", container.foto.router);
    app.use("/demo", container.demo.router);
    app.use("/", container.trazabilidad.router);

    app.use(handleErrors);

    app.use('/{*splat}', (_, res) => res.status(404).json({
        success: false,
        error: "Esta ruta no hace nada"
    }));

    return app;
}
