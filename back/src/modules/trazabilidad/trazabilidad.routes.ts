import express from "express";
import type { TrazabilidadController } from "./trazabilidad.controller";

export function createTrazabilidadRoutes(controller: TrazabilidadController) {
    const router = express.Router();
    router.get("/producciones", controller.listar);
    router.get("/producciones/:id", controller.detalle);
    // La página del QR: sin login aunque el panel lo tenga algún día.
    router.get("/publico/producciones/:codigo", controller.publica);
    return router;
}
