import type { EstadoProductor } from "../../api/fixtures/productor";
import { avanzarPedido, hoyIso } from "./estadoProductor";
import { ETIQUETA_ESTADO_PEDIDO } from "./estadosVisuales";

// Las transiciones son funciones puras (estadoProductor.ts); acá se aplican
// sobre el estado actual y se avisa el resultado con el toast.
export function useAccionesProductor(estado: EstadoProductor, guardar: (estado: EstadoProductor) => void, avisar: (mensaje: string) => void) {
    return {
        avanzarPedido(id: string) {
            const resultado = avanzarPedido(estado, id, hoyIso());
            if (!resultado) return;
            guardar(resultado.estado);
            avisar(`Pedido ${resultado.pedido.id}: ${ETIQUETA_ESTADO_PEDIDO[resultado.pedido.estado].toLowerCase()}.`);
        }
    };
}

export type AccionesProductor = ReturnType<typeof useAccionesProductor>;
