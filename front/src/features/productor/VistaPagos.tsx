import type { Pago } from "../../api/fixtures/productor";
import { Card } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import { formatearPesos } from "../../lib/moneda";
import { CabeceraVista } from "./CabeceraVista";
import { Chip } from "./Chip";
import { resumirPagos } from "./estadoProductor";
import { ChipEstadoPago } from "./FilaPedido";
import styles from "./vistas.module.css";

function CifraPago({ etiqueta, monto }: { etiqueta: string; monto: number }) {
    return (
        <Card className={styles.cifra}>
            <p className={`etiqueta ${styles.etiquetaCifra}`}>{etiqueta}</p>
            <p className={`dato ${styles.valorCifra}`}>{formatearPesos(monto)}</p>
        </Card>
    );
}

export function VistaPagos({ pagos }: { pagos: Pago[] }) {
    const { cobrado, aCobrar, promedio, acreditados } = resumirPagos(pagos);

    return (
        <section className={styles.vista}>
            <CabeceraVista titulo="Pagos" />

            <div className={styles.grillaCifras}>
                <CifraPago etiqueta="Cobrado" monto={cobrado} />
                <CifraPago etiqueta="A cobrar" monto={aCobrar} />
                <CifraPago etiqueta="Ticket promedio" monto={promedio} />
            </div>

            <Card className={styles.panel} aria-labelledby="titulo-movimientos">
                <div className={styles.cabeceraPanel}>
                    <h2 id="titulo-movimientos" className="subtitulo">
                        Movimientos
                    </h2>
                    <Chip tono="cielo">
                        <span className="dato">{acreditados}</span> {acreditados === 1 ? "acreditado" : "acreditados"}
                    </Chip>
                </div>
                <div className={styles.contenedorTabla}>
                    <table className={`small ${styles.tabla}`}>
                        <thead>
                            <tr>
                                <th scope="col" className="etiqueta">Pago</th>
                                <th scope="col" className="etiqueta">Fecha</th>
                                <th scope="col" className="etiqueta">Concepto</th>
                                <th scope="col" className="etiqueta">Medio</th>
                                <th scope="col" className="etiqueta">Monto</th>
                                <th scope="col" className="etiqueta">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map((pago) => (
                                <tr key={pago.id}>
                                    <td className="dato">{pago.id}</td>
                                    <td className="dato">{formatearFecha(pago.fecha)}</td>
                                    <td>{pago.concepto}</td>
                                    <td>{pago.medio}</td>
                                    <td className={`dato ${styles.monto}`}>{formatearPesos(pago.monto)}</td>
                                    <td>
                                        <ChipEstadoPago estado={pago.estado} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </section>
    );
}
