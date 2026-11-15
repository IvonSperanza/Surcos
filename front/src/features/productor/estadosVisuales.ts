import { Banknote, Check, Clock, Package, Truck, type LucideIcon } from "lucide-react";
import type { EstadoPago, EstadoPedido } from "../../api/fixtures/productor";

export type Tono = "sol" | "cielo" | "hoja" | "neutro";

type Visual = { palabra: string; tono: Tono; Icono: LucideIcon };

// Color + palabra + ícono, nunca sólo color (design-system/README.md). Sin rojo:
// lo que espera una acción va en sol, lo que ya se cumplió en cielo.
export const VISUAL_ESTADO_PEDIDO: Record<EstadoPedido, Visual> = {
    pendiente: { palabra: "Pendiente", tono: "sol", Icono: Clock },
    confirmado: { palabra: "Confirmado", tono: "cielo", Icono: Check },
    preparando: { palabra: "En preparación", tono: "hoja", Icono: Package },
    entregado: { palabra: "Entregado", tono: "neutro", Icono: Truck },
    pagado: { palabra: "Pagado", tono: "cielo", Icono: Banknote }
};

export const ETIQUETA_ESTADO_PEDIDO = Object.fromEntries(
    Object.entries(VISUAL_ESTADO_PEDIDO).map(([estado, visual]) => [estado, visual.palabra])
) as Record<EstadoPedido, string>;

export const VISUAL_ESTADO_PAGO: Record<EstadoPago, Visual> = {
    acreditado: { palabra: "Acreditado", tono: "cielo", Icono: Banknote },
    pendiente: { palabra: "Pendiente", tono: "sol", Icono: Clock }
};
