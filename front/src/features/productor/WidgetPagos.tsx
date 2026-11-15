import { ArrowRight, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import type { Pago } from "../../api/fixtures/productor";
import { Card, Fuente } from "../../design-system";
import { formatearPesos } from "../../lib/moneda";
import { resumirPagos } from "./estadoProductor";
import styles from "./widgets.module.css";

export function WidgetPagos({ pagos }: { pagos: Pago[] }) {
    const { cobrado, aCobrar } = resumirPagos(pagos);

    return (
        <Card className={styles.widget} aria-labelledby="widget-pagos">
            <div className={styles.cabecera}>
                <span className={styles.icono} aria-hidden>
                    <CreditCard size={18} strokeWidth={1.5} />
                </span>
                <h2 id="widget-pagos" className="subtitulo">
                    Pagos
                </h2>
            </div>
            <dl className={styles.cobros}>
                <div>
                    <dt className="small">Cobrado</dt>
                    <dd className="dato">{formatearPesos(cobrado)}</dd>
                </div>
                <div>
                    <dt className="small">A cobrar</dt>
                    <dd className="dato">{formatearPesos(aCobrar)}</dd>
                </div>
            </dl>
            <Link to="pagos" className={`small ${styles.enlace}`}>
                Ver historial de pagos
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </Link>
            <Fuente>Datos de demostración</Fuente>
        </Card>
    );
}
