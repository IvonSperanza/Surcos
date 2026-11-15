import { Sprout } from "lucide-react";
import { LOTES, META_COBERTURA, PRODUCTOR } from "../../api/fixtures/productor";
import { Card, Fuente, SelloVerificacion } from "../../design-system";
import { Barra, Chip } from "./Chip";
import styles from "./widgets.module.css";

export function WidgetPasaporteSuelo() {
    const cobertura = LOTES.find((l) => l.id === PRODUCTOR.lote)?.cobertura ?? 0;

    return (
        <Card className={styles.widget} aria-labelledby="widget-suelo">
            <div className={styles.cabecera}>
                <span className={styles.icono} aria-hidden>
                    <Sprout size={18} strokeWidth={1.5} />
                </span>
                <h2 id="widget-suelo" className="subtitulo">
                    Pasaporte de suelo vivo
                </h2>
            </div>
            <div className={styles.medidor}>
                <span className={`dato ${styles.valor}`}>{cobertura}%</span>
                <Chip tono="oliva">Meta &gt; {META_COBERTURA}%</Chip>
            </div>
            <Barra porcentaje={cobertura} />
            <Fuente>Cobertura vegetal anual · datos de demostración</Fuente>
            <div className={styles.fila}>
                <SelloVerificacion estado="verificado" palabra="QR emitido" />
                <span className="small">
                    Lote <span className="dato">{PRODUCTOR.lote}</span>
                </span>
            </div>
        </Card>
    );
}
