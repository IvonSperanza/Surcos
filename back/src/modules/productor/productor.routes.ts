import express from "express";
import type { ProductorController } from "./productor.controller";

export function createProductorRoutes(controller: ProductorController) {
    const router = express.Router();
    router.get("/", controller.actual);
    router.patch("/", controller.actualizar);
    return router;
}
