import { Users } from "lucide-react";
import { Button, Card, Fuente } from "../../design-system";
import { Chip } from "./Chip";
import styles from "./widgets.module.css";

type Props = { reservaAceptada: boolean; onAceptar: () => void };

export function WidgetInteres({ reservaAceptada, onAceptar }: Props) {
    return (
        <Card className={styles.widget} aria-labelledby="widget-interes">
            <div className={styles.cabecera}>
                <span className={styles.icono} aria-hidden>
                    <Users size={18} strokeWidth={1.5} />
                </span>
                <h2 id="widget-interes" className="subtitulo">
                    Interés de compradores
                </h2>
            </div>
            <p className="small">
                <strong>3 PyMEs</strong> y <strong>2 mercados</strong> con transporte propio están siguiendo este lote.
            </p>
            <div className={styles.chips}>
                <Chip tono="oliva">3 PyMEs</Chip>
                <Chip tono="oliva">2 mercados</Chip>
            </div>
            <Button className={styles.botonAncho} onClick={onAceptar} disabled={reservaAceptada}>
                {reservaAceptada ? "Reserva aceptada" : "Aceptar reserva anticipada"}
            </Button>
            <p className={`small ${styles.textoSecundario}`}>
                {reservaAceptada
                    ? "Reserva de 200 kg de tomate confirmada. Seña del 30% a cobrar."
                    : "Reserva de 200 kg de tomate. Sin datos personales."}
            </p>
            <Fuente>Datos de demostración</Fuente>
        </Card>
    );
}
