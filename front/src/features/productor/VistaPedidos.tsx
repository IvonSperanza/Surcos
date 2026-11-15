import { useState } from "react";
import type { EstadoPedido, Pedido } from "../../api/fixtures/productor";
import { Button, Card } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import { formatearPesos } from "../../lib/moneda";
import { CabeceraVista } from "./CabeceraVista";
import { Chip } from "./Chip";
import { PASO_SIGUIENTE } from "./estadoProductor";
import { ChipEstadoPedido } from "./FilaPedido";
import styles from "./pedidos.module.css";
import vistas from "./vistas.module.css";

type Filtro = "todos" | EstadoPedido;

const FILTROS: { valor: Filtro; nombre: string }[] = [
    { valor: "todos", nombre: "Todos" },
    { valor: "pendiente", nombre: "Pendientes" },
    { valor: "confirmado", nombre: "Confirmados" },
    { valor: "preparando", nombre: "En preparación" },
    { valor: "entregado", nombre: "Entregados" },
    { valor: "pagado", nombre: "Pagados" }
];

function contar(pedidos: Pedido[], filtro: Filtro): number {
    return filtro === "todos" ? pedidos.length : pedidos.filter((p) => p.estado === filtro).length;
}

function TarjetaPedido({ pedido, onAvanzar }: { pedido: Pedido; onAvanzar: (id: string) => void }) {
    const paso = PASO_SIGUIENTE[pedido.estado];
    return (
        <Card className={styles.tarjeta}>
            <div className={styles.arriba}>
                <span className={`dato ${vistas.textoSecundario}`}>{pedido.id}</span>
                <ChipEstadoPedido estado={pedido.estado} />
            </div>
            <div>
                <h2 className="subtitulo">{pedido.comprador}</h2>
                <p className="body">{pedido.detalle}</p>
            </div>
            <p className={`dato ${styles.total}`}>{formatearPesos(pedido.total)}</p>
            <div className={`small ${styles.meta}`}>
                <span className="dato">{formatearFecha(pedido.fecha)}</span>
                <Chip>{pedido.tipo}</Chip>
                {pedido.tipo === "Mercado" && <span>transporte propio</span>}
            </div>
            <div className={styles.accion}>
                {paso ? (
                    <Button onClick={() => onAvanzar(pedido.id)}>{paso.accion}</Button>
                ) : (
                    <span className={`small ${vistas.textoSecundario}`}>Cobrado y cerrado</span>
                )}
            </div>
        </Card>
    );
}

export function VistaPedidos({ pedidos, onAvanzar }: { pedidos: Pedido[]; onAvanzar: (id: string) => void }) {
    const [filtro, setFiltro] = useState<Filtro>("todos");
    const visibles = filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);

    return (
        <section className={vistas.vista}>
            <CabeceraVista
                seccion="Pedidos"
                titulo="Historial de pedidos"
                bajada="Todos los pedidos que llegaron al lote, con su estado y el próximo paso."
                fuente={
                    <>
                        Datos de demostración · <span className="dato">{pedidos.length}</span> pedidos
                    </>
                }
            />

            <div className={styles.filtros} role="group" aria-label="Filtrar pedidos por estado">
                {FILTROS.map(({ valor, nombre }) => (
                    <button
                        key={valor}
                        type="button"
                        className={`small ${styles.filtro}`}
                        aria-pressed={filtro === valor}
                        onClick={() => setFiltro(valor)}
                    >
                        {nombre} <span className="dato">{contar(pedidos, valor)}</span>
                    </button>
                ))}
            </div>

            {visibles.length ? (
                <div className={styles.lista}>
                    {visibles.map((pedido) => (
                        <TarjetaPedido key={pedido.id} pedido={pedido} onAvanzar={onAvanzar} />
                    ))}
                </div>
            ) : (
                <p className={`body ${vistas.vacio}`}>No hay pedidos en este estado.</p>
            )}
        </section>
    );
}
