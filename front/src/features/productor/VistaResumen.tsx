import { ArrowRight, Check, Clock, CreditCard, MapPin, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DEMANDA_B2B, PASOS_PASAPORTE, type EstadoProductor } from "../../api/fixtures/productor";
import { Card, SelloVerificacion } from "../../design-system";
import { formatearPesos } from "../../lib/moneda";
import { CabeceraVista } from "./CabeceraVista";
import { Barra, Chip } from "./Chip";
import { pedidosAbiertos, resumirPagos } from "./estadoProductor";
import { useParcelas } from "../parcelas/useParcelas";
import { FilaPedido } from "./FilaPedido";
import styles from "./vistas.module.css";
import { rutasPanel } from "./rutas";

type PropsCifra = { Icono: LucideIcon; etiqueta: string; valor: string; pie?: string; children?: ReactNode };

function TarjetaCifra({ Icono, etiqueta, valor, pie, children }: PropsCifra) {
    return (
        <Card className={styles.cifra}>
            <span className={styles.iconoCifra} aria-hidden>
                <Icono size={20} strokeWidth={1.5} />
            </span>
            <p className={`etiqueta ${styles.etiquetaCifra}`}>{etiqueta}</p>
            <p className={`dato ${styles.valorCifra}`}>{valor}</p>
            {children}
            {pie && <p className={`small ${styles.pieCifra}`}>{pie}</p>}
        </Card>
    );
}

function ProgresoPasaporte() {
    return (
        <Card className={styles.panel} aria-labelledby="titulo-progreso">
            <div className={styles.cabeceraPanel}>
                <h2 id="titulo-progreso" className="subtitulo">
                    Pasaporte QR
                </h2>
                <SelloVerificacion estado="verificado" palabra="QR habilitado" />
            </div>
            <ul className={styles.filas}>
                {PASOS_PASAPORTE.map(({ paso, valor, completo }) => (
                    <li key={paso} className={styles.paso}>
                        {completo ? (
                            <Check size={18} strokeWidth={1.5} className={styles.pasoCompleto} role="img" aria-label="Completo" />
                        ) : (
                            <Clock size={18} strokeWidth={1.5} className={styles.pasoParcial} role="img" aria-label="En curso" />
                        )}
                        <span className="body">{paso}</span>
                        <span className="dato">{valor}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

function DemandaB2B() {
    const total = DEMANDA_B2B.reduce((suma, d) => suma + d.cantidad, 0);
    return (
        <Card className={styles.panel} aria-labelledby="titulo-demanda">
            <div className={styles.cabeceraPanel}>
                <h2 id="titulo-demanda" className="subtitulo">
                    Demanda B2B
                </h2>
                <Chip tono="hoja">
                    <span className="dato">{total}</span> interesados
                </Chip>
            </div>
            {DEMANDA_B2B.map(({ segmento, cantidad }) => (
                <div key={segmento} className={styles.demanda}>
                    <span className="small">{segmento}</span>
                    <Barra porcentaje={(cantidad / total) * 100} />
                    <span className="dato">{cantidad}</span>
                </div>
            ))}
        </Card>
    );
}

// La única cifra con datos reales del Resumen: el resto del panel es demostración.
function CifraParcelas() {
    const { parcelas } = useParcelas();
    const total = parcelas?.length ?? 0;
    return (
        <Link to={rutasPanel.parcelas} className={styles.enlaceCifra}>
            <TarjetaCifra
                Icono={MapPin}
                etiqueta="Mis parcelas"
                valor={parcelas === null ? "—" : String(total)}
                pie={total === 0 ? "Ninguna dibujada" : undefined}
            />
        </Link>
    );
}

export function VistaResumen({ estado }: { estado: EstadoProductor }) {
    const { cobrado, aCobrar } = resumirPagos(estado.pagos);
    const abiertos = pedidosAbiertos(estado.pedidos).slice(0, 3);

    return (
        <section className={styles.vista}>
            <CabeceraVista titulo="Resumen" />

            <div className={styles.grillaCifras}>
                <CifraParcelas />
                <TarjetaCifra Icono={CreditCard} etiqueta="Cobrado en la campaña" valor={formatearPesos(cobrado)} pie={`A cobrar ${formatearPesos(aCobrar)}`} />
            </div>

            <div className={styles.grillaPaneles}>
                <ProgresoPasaporte />
                <DemandaB2B />
            </div>

            <Card className={styles.panel} aria-labelledby="titulo-abiertos">
                <div className={styles.cabeceraPanel}>
                    <h2 id="titulo-abiertos" className="subtitulo">
                        Pedidos abiertos
                    </h2>
                    <Link to={rutasPanel.pedidos} className={`small ${styles.enlace}`}>
                        Ver todos
                        <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
                    </Link>
                </div>
                {abiertos.length ? (
                    <ul className={styles.filas}>
                        {abiertos.map((pedido) => (
                            <FilaPedido key={pedido.id} pedido={pedido} />
                        ))}
                    </ul>
                ) : (
                    <p className={`body ${styles.vacio}`}>Sin pedidos abiertos.</p>
                )}
            </Card>
        </section>
    );
}
