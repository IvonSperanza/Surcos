import express from "express";
import type { EventoController } from "./evento.controller";

export function createEventoRoutes(controller: EventoController) {
    const router = express.Router();
    router.get("/", controller.findAll); // ?parcelaId= para los de una parcela
    router.post("/", controller.create);
    router.delete("/:id", controller.remove);
    return router;
}
