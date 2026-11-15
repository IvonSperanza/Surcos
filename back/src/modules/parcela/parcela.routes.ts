import express from "express";
import type { ParcelaController } from "./parcela.controller";

export function createParcelaRoutes(controller: ParcelaController) {
    const router = express.Router();
    router.get("/", controller.findAll);
    router.post("/", controller.create);
    router.get("/:id", controller.findOne);
    router.delete("/:id", controller.remove);
    return router;
}
