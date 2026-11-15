import type { EstadoProductor, Maduracion } from "../../api/fixtures/productor";
import { aceptarReserva, actualizarMaduracion, agregarProducto, avanzarPedido, estadoQr, hoyIso, type ProductoNuevo } from "./estadoProductor";
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
        },
        aceptarReserva() {
            const resultado = aceptarReserva(estado, hoyIso());
            if (!resultado) return;
            guardar(resultado.estado);
            avisar(`Reserva aceptada. Se creó el pedido ${resultado.pedido.id}.`);
        },
        agregarProducto(datos: ProductoNuevo) {
            const resultado = agregarProducto(estado, datos);
            guardar(resultado.estado);
            const qr = estadoQr(resultado.producto) === "verificado" ? "emitido" : "en revisión";
            avisar(`Producto agregado a la lista. QR ${qr}.`);
        },
        guardarMaduracion(maduracion: Omit<Maduracion, "actualizado">) {
            guardar(actualizarMaduracion(estado, { ...maduracion, actualizado: hoyIso() }));
            avisar("Parámetros de maduración actualizados.");
        }
    };
}

export type AccionesProductor = ReturnType<typeof useAccionesProductor>;
