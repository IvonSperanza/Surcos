import express, { type RequestHandler } from "express";
import multer from "multer";
import { created } from "../../lib/http/responses";
import { createFotoService } from "./foto.service";

// El front ya achica la foto a 1200 px antes de subirla.
const subida = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Sube una foto y devuelve su URL; el evento guarda sólo esa URL.
export function createFotoModule() {
    const service = createFotoService();
    const subir: RequestHandler = async (req, res) => {
        created(res, await service.guardar(req.file));
    };
    const router = express.Router();
    router.post("/", subida.single("foto"), subir);
    return { service, router };
}
