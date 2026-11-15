import { LOTES, META_COBERTURA, RESERVA_ANTICIPADA, type EstadoPedido, type EstadoProductor, type Maduracion, type Pago, type Pedido, type Producto } from "../../api/fixtures/productor";

export type ProductoNuevo = Omit<Producto, "n">;

// Máquina de estados del pedido: cada estado tiene un único paso siguiente.
export const PASO_SIGUIENTE: Partial<Record<EstadoPedido, { accion: string; siguiente: EstadoPedido }>> = {
    pendiente: { accion: "Confirmar pedido", siguiente: "confirmado" },
    confirmado: { accion: "Marcar en preparación", siguiente: "preparando" },
    preparando: { accion: "Marcar entregado", siguiente: "entregado" },
    entregado: { accion: "Registrar pago", siguiente: "pagado" }
};

const ESTADOS_ABIERTOS: EstadoPedido[] = ["pendiente", "confirmado", "preparando"];

const rellenar = (numero: number, largo: number) => String(numero).padStart(largo, "0");

export const idPasaporte = (n: number) => `SUR-2026-${rellenar(n, 4)}`;

const idPago = (n: number) => `PAG-${rellenar(n, 3)}`;

export function hoyIso(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${rellenar(hoy.getMonth() + 1, 2)}-${rellenar(hoy.getDate(), 2)}`;
}

export function estadoQr(producto: Producto): "verificado" | "pendiente" {
    const lote = LOTES.find((l) => l.id === producto.lote);
    return lote && lote.cobertura >= META_COBERTURA ? "verificado" : "pendiente";
}

export function pedidosAbiertos(pedidos: Pedido[]): Pedido[] {
    return pedidos.filter((p) => ESTADOS_ABIERTOS.includes(p.estado));
}

export function contarPendientes(pedidos: Pedido[]): number {
    return pedidos.filter((p) => p.estado === "pendiente").length;
}

export function resumirPagos(pagos: Pago[]) {
    const acreditados = pagos.filter((p) => p.estado === "acreditado");
    const cobrado = acreditados.reduce((total, p) => total + p.monto, 0);
    const aCobrar = pagos.filter((p) => p.estado === "pendiente").reduce((total, p) => total + p.monto, 0);
    const promedio = acreditados.length ? Math.round(cobrado / acreditados.length) : 0;
    return { cobrado, aCobrar, promedio, acreditados: acreditados.length };
}

// Si el pedido ya tenía un cobro pendiente (pago al entregar), se acredita ese
// en vez de duplicarlo.
function registrarCobro(estado: EstadoProductor, pedido: Pedido, hoy: string): Pick<EstadoProductor, "pagos" | "proximoPago"> {
    const concepto = `Pedido ${pedido.id} · cobro al entregar`;
    const pendiente = estado.pagos.find((p) => p.pedido === pedido.id && p.estado === "pendiente");
    if (pendiente) {
        return {
            pagos: estado.pagos.map((p) => (p === pendiente ? { ...p, estado: "acreditado", fecha: hoy, concepto } : p)),
            proximoPago: estado.proximoPago
        };
    }
    const nuevo: Pago = { id: idPago(estado.proximoPago), fecha: hoy, concepto, pedido: pedido.id, medio: "Transferencia", monto: pedido.total, estado: "acreditado" };
    return { pagos: [nuevo, ...estado.pagos], proximoPago: estado.proximoPago + 1 };
}

export function avanzarPedido(estado: EstadoProductor, id: string, hoy: string): { estado: EstadoProductor; pedido: Pedido } | null {
    const pedido = estado.pedidos.find((p) => p.id === id);
    const paso = pedido && PASO_SIGUIENTE[pedido.estado];
    if (!pedido || !paso) return null;

    const avanzado: Pedido = { ...pedido, estado: paso.siguiente };
    const cobro = paso.siguiente === "pagado" ? registrarCobro(estado, pedido, hoy) : {};
    return {
        estado: { ...estado, ...cobro, pedidos: estado.pedidos.map((p) => (p.id === id ? avanzado : p)) },
        pedido: avanzado
    };
}

export function aceptarReserva(estado: EstadoProductor, hoy: string): { estado: EstadoProductor; pedido: Pedido } | null {
    if (estado.reservaAceptada) return null;

    const pedido: Pedido = {
        id: `PED-${estado.proximoPedido}`,
        comprador: RESERVA_ANTICIPADA.comprador,
        tipo: RESERVA_ANTICIPADA.tipo,
        detalle: RESERVA_ANTICIPADA.detalle,
        fecha: hoy,
        total: RESERVA_ANTICIPADA.total,
        estado: "confirmado"
    };
    const sena: Pago = {
        id: idPago(estado.proximoPago),
        fecha: hoy,
        concepto: "Seña 30% reserva anticipada",
        pedido: pedido.id,
        medio: RESERVA_ANTICIPADA.medioSena,
        monto: RESERVA_ANTICIPADA.sena,
        estado: "pendiente"
    };
    return {
        estado: {
            ...estado,
            reservaAceptada: true,
            proximoPedido: estado.proximoPedido + 1,
            proximoPago: estado.proximoPago + 1,
            pedidos: [pedido, ...estado.pedidos],
            pagos: [sena, ...estado.pagos]
        },
        pedido
    };
}

export function agregarProducto(estado: EstadoProductor, datos: ProductoNuevo): { estado: EstadoProductor; producto: Producto } {
    const producto: Producto = { ...datos, n: estado.proximoProducto };
    return {
        estado: { ...estado, proximoProducto: estado.proximoProducto + 1, productos: [producto, ...estado.productos] },
        producto
    };
}

export function actualizarMaduracion(estado: EstadoProductor, maduracion: Maduracion): EstadoProductor {
    return { ...estado, maduracion };
}

export function validarProducto(datos: ProductoNuevo): string | null {
    if (!datos.cultivo) return "Completá el nombre del cultivo o producto.";
    if (!datos.quimicos) return 'Indicá qué químicos se aplicaron. Si no hubo, escribí "Ninguno".';
    if (!datos.plantacion || !datos.cosecha || !datos.reparto) return "Completá las tres fechas: plantación, cosecha y reparto.";
    if (datos.cosecha < datos.plantacion) return "La cosecha no puede ser anterior a la plantación.";
    if (datos.reparto < datos.cosecha) return "El reparto no puede ser anterior a la cosecha.";
    return null;
}
