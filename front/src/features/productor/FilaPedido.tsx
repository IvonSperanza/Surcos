import type { EstadoPago, EstadoPedido, Pedido } from "../../api/fixtures/productor";
import { formatearFecha } from "../../lib/fecha";
import { formatearPesos } from "../../lib/moneda";
import { Chip } from "./Chip";
import { VISUAL_ESTADO_PAGO, VISUAL_ESTADO_PEDIDO } from "./estadosVisuales";
import styles from "./vistas.module.css";

export function ChipEstadoPedido({ estado }: { estado: EstadoPedido }) {
    const { palabra, tono, Icono } = VISUAL_ESTADO_PEDIDO[estado];
    return (
        <Chip tono={tono} Icono={Icono}>
            {palabra}
        </Chip>
    );
}

export function ChipEstadoPago({ estado }: { estado: EstadoPago }) {
    const { palabra, tono, Icono } = VISUAL_ESTADO_PAGO[estado];
    return (
        <Chip tono={tono} Icono={Icono}>
            {palabra}
        </Chip>
    );
}

export function FilaPedido({ pedido }: { pedido: Pedido }) {
    return (
        <li className={styles.fila}>
            <div className={styles.filaPrincipal}>
                <p className="body">
                    <strong>{pedido.comprador}</strong>
                </p>
                <p className={`small ${styles.textoSecundario}`}>
                    <span className="dato">{pedido.id}</span> · {pedido.detalle} · <span className="dato">{formatearFecha(pedido.fecha)}</span>
                </p>
            </div>
            <span className={`dato ${styles.monto}`}>{formatearPesos(pedido.total)}</span>
            <ChipEstadoPedido estado={pedido.estado} />
        </li>
    );
}
