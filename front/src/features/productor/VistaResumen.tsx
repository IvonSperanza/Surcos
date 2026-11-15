import { ArrowRight, Check, ClipboardList, Clock, CreditCard, Sprout, TrendingUp, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DEMANDA_B2B, FECHA_DEMO, LOTES, META_COBERTURA, PASOS_PASAPORTE, PRODUCTOR, type EstadoProductor } from "../../api/fixtures/productor";
import { Card, Fuente, SelloVerificacion } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import { formatearPesos } from "../../lib/moneda";
import { CabeceraVista } from "./CabeceraVista";
import { Barra, Chip } from "./Chip";
import { contarPendientes, pedidosAbiertos, resumirPagos } from "./estadoProductor";
import { FilaPedido } from "./FilaPedido";
import styles from "./vistas.module.css";

type PropsCifra = { Icono: LucideIcon; etiqueta: string; valor: string; pie: string; children?: ReactNode };

function TarjetaCifra({ Icono, etiqueta, valor, pie, children }: PropsCifra) {
    return (
        <Card className={styles.cifra}>
            <span className={styles.iconoCifra} aria-hidden>
                <Icono size={20} strokeWidth={1.5} />
            </span>
            <p className={`etiqueta ${styles.etiquetaCifra}`}>{etiqueta}</p>
            <p className={`dato ${styles.valorCifra}`}>{valor}</p>
            {children}
            <p className={`small ${styles.pieCifra}`}>{pie}</p>
        </Card>
    );
}

function ProgresoPasaporte() {
    return (
        <Card className={styles.panel} aria-labelledby="titulo-progreso">
            <div className={styles.cabeceraPanel}>
                <h2 id="titulo-progreso" className="subtitulo">
                    Progreso del pasaporte QR
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
            <Fuente>Datos de demostración. Lo que vio el satélite en tu parcela está en Mi lote.</Fuente>
        </Card>
    );
}

function DemandaB2B() {
    const total = DEMANDA_B2B.reduce((suma, d) => suma + d.cantidad, 0);
    return (
        <Card className={styles.panel} aria-labelledby="titulo-demanda">
            <div className={styles.cabeceraPanel}>
                <h2 id="titulo-demanda" className="subtitulo">
                    Demanda de mercados B2B
                </h2>
                <Chip tono="oliva">
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
            <p className={`small ${styles.textoSecundario}`}>
                3 PyMEs y 2 mercados con transporte propio están siguiendo este lote. Podés aceptar una reserva anticipada desde el panel.
            </p>
            <Fuente>Datos de demostración</Fuente>
        </Card>
    );
}

export function VistaResumen({ estado }: { estado: EstadoProductor }) {
    const pendientes = contarPendientes(estado.pedidos);
    const { cobrado, aCobrar } = resumirPagos(estado.pagos);
    const cobertura = LOTES.find((l) => l.id === PRODUCTOR.lote)?.cobertura ?? 0;
    const abiertos = pedidosAbiertos(estado.pedidos).slice(0, 3);
    const interesados = DEMANDA_B2B.reduce((suma, d) => suma + d.cantidad, 0);

    return (
        <section className={styles.vista}>
            <CabeceraVista
                seccion="Resumen"
                titulo={`Buen día, ${PRODUCTOR.nombre}`}
                bajada={`${PRODUCTOR.campania} · ${PRODUCTOR.zona}`}
                fuente={
                    <>
                        Datos de demostración · <span className="dato">{formatearFecha(FECHA_DEMO)}</span>
                    </>
                }
            />

            <div className={styles.grillaCifras}>
                <TarjetaCifra
                    Icono={Sprout}
                    etiqueta="Pasaporte de suelo vivo"
                    valor={`${cobertura}%`}
                    pie={cobertura >= META_COBERTURA ? `Meta > ${META_COBERTURA}% · cumplida` : `Meta > ${META_COBERTURA}%`}
                >
                    <Barra porcentaje={cobertura} />
                </TarjetaCifra>
                <TarjetaCifra
                    Icono={ClipboardList}
                    etiqueta="Pedidos pendientes"
                    valor={String(pendientes)}
                    pie={pendientes === 0 ? "Sin pedidos nuevos" : "Esperando confirmación"}
                />
                <TarjetaCifra Icono={TrendingUp} etiqueta="Demanda B2B" valor={String(interesados)} pie="3 PyMEs · 2 mercados" />
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
                    <Link to="pedidos" className={`small ${styles.enlace}`}>
                        Ver historial completo
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
                    <p className={`body ${styles.vacio}`}>No hay pedidos abiertos. Todo entregado y cobrado.</p>
                )}
            </Card>
        </section>
    );
}
