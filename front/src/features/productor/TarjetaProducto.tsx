import { QrCode } from "lucide-react";
import type { Producto } from "../../api/fixtures/productor";
import { Button, Card, ChipCategoria, SelloVerificacion } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import { formatearPesos } from "../../lib/moneda";
import { estadoQr, idPasaporte } from "./estadoProductor";
import styles from "./productos.module.css";

export function SelloQr({ producto }: { producto: Producto }) {
    const estado = estadoQr(producto);
    return <SelloVerificacion estado={estado} palabra={estado === "verificado" ? "QR emitido" : "QR pendiente"} />;
}

export function TarjetaProducto({ producto, onVerQr }: { producto: Producto; onVerQr: () => void }) {
    return (
        <Card className={styles.tarjeta}>
            <div className={styles.arriba}>
                <div className={styles.identidad}>
                    <ChipCategoria categoria={producto.rubro} />
                    <span className={`dato ${styles.textoSecundario}`}>{idPasaporte(producto.n)}</span>
                </div>
                <SelloQr producto={producto} />
            </div>

            <h3 className="subtitulo">{producto.cultivo}</h3>

            <dl className={`small ${styles.parametros}`}>
                <div>
                    <dt>Plantación</dt>
                    <dd className="dato">{formatearFecha(producto.plantacion)}</dd>
                </div>
                <div>
                    <dt>Químicos</dt>
                    <dd>{producto.quimicos}</dd>
                </div>
                <div>
                    <dt>Cosecha</dt>
                    <dd className="dato">{formatearFecha(producto.cosecha)}</dd>
                </div>
                <div>
                    <dt>Reparto</dt>
                    <dd>
                        <span className="dato">{formatearFecha(producto.reparto)}</span> · {producto.destino}
                    </dd>
                </div>
                <div>
                    <dt>Lote</dt>
                    <dd className="dato">{producto.lote}</dd>
                </div>
            </dl>

            <div className={styles.pie}>
                {producto.precio ? (
                    <span className={`dato ${styles.precio}`}>
                        {formatearPesos(producto.precio)}
                        {producto.unidad && <span className={`small ${styles.textoSecundario}`}> / {producto.unidad}</span>}
                    </span>
                ) : (
                    <span className={`small ${styles.textoSecundario}`}>Precio a definir</span>
                )}
                <Button onClick={onVerQr} className={styles.botonIcono} aria-label={`Ver QR de ${producto.cultivo}`}>
                    <QrCode size={18} strokeWidth={1.5} aria-hidden />
                    Ver QR
                </Button>
            </div>
        </Card>
    );
}
