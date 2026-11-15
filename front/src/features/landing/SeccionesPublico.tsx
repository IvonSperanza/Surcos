import type { CSSProperties } from "react";
import { DollarSign, MapPin, ShieldCheck, Sprout, UserRound } from "lucide-react";
import { EnlaceBoton, SelloVerificacion } from "../../design-system";
import { Revelar } from "./Revelar";
import styles from "./landing.module.css";

const PRODUCTOS_TICKER = "Tomate de la quinta · Lechuga fresca · Acelga · Frutillas del día · Malbec con cobertura · Del productor a tu mesa · ";

export function Ticker() {
    const partes = PRODUCTOS_TICKER.split(" · ").filter(Boolean);
    const linea = (
        <span>
            {partes.map((p) => (
                <span key={p}>
                    {p} <i>·</i>{" "}
                </span>
            ))}
        </span>
    );
    // Dos copias seguidas: la marquesina se desplaza la mitad y empalma sin salto.
    return (
        <div className={styles.ticker} aria-hidden="true">
            <div className={styles.tickerPista}>
                {linea}
                {linea}
            </div>
        </div>
    );
}

const relleno = (token: string) => ({ fill: `var(--${token})` });

const PASOS = [
    {
        clase: styles.pasoOliva,
        titulo: "El productor cuida la tierra",
        texto: "Rota cultivos, deja cobertura o rastrojo entre ciclos y evita que el suelo quede desnudo.",
        arte: (
            <svg viewBox="0 0 120 100">
                <rect x="0" y="76" width="120" height="24" style={relleno("tierra")} />
                <rect x="0" y="82" width="120" height="3" style={{ ...relleno("arcilla"), opacity: 0.6 }} />
                <rect x="0" y="90" width="120" height="3" style={{ ...relleno("arcilla"), opacity: 0.6 }} />
                <path d="M60 76V38" style={{ stroke: "var(--oliva)", strokeWidth: 5, strokeLinecap: "round" }} />
                <ellipse cx="44" cy="44" rx="18" ry="9" style={relleno("oliva")} transform="rotate(-30 44 44)" />
                <ellipse cx="76" cy="32" rx="20" ry="10" style={relleno("oliva")} transform="rotate(30 76 32)" />
            </svg>
        )
    },
    {
        clase: styles.pasoCielo,
        titulo: "El satélite lo comprueba",
        texto: "Mira el campo desde arriba cada pocos días y confirma que la práctica pasó de verdad, campaña por campaña.",
        arte: (
            <svg viewBox="0 0 120 100">
                <circle cx="60" cy="46" r="30" style={relleno("surface-raised")} />
                <path d="M36 34l10-6 10 6-10 6zM74 34l10-6 10 6-10 6z" style={relleno("cielo")} />
                <rect x="52" y="34" width="16" height="10" rx="2" style={relleno("cielo")} />
                <path d="M60 74l22 12H38z" style={{ ...relleno("cielo"), opacity: 0.18 }} />
            </svg>
        )
    },
    {
        clase: styles.pasoArcilla,
        titulo: "Vos escaneás y ves todo",
        texto: "Abrís el código del producto y mirás el campo, el productor y la cosecha.",
        arte: (
            <svg viewBox="0 0 120 100">
                <rect x="34" y="10" width="52" height="84" rx="8" style={relleno("ink")} />
                <rect x="40" y="18" width="40" height="68" rx="4" style={relleno("surface-raised")} />
                <rect x="46" y="26" width="16" height="16" rx="2" style={relleno("ink")} />
                <rect x="66" y="26" width="8" height="8" style={relleno("ink")} />
                <rect x="46" y="48" width="28" height="4" rx="2" style={relleno("ink-muted")} />
                <rect x="46" y="56" width="22" height="4" rx="2" style={relleno("ink-muted")} />
                <rect x="46" y="70" width="28" height="8" rx="2" style={relleno("arcilla")} />
            </svg>
        )
    }
];

export function ComoFunciona() {
    return (
        <section className={styles.seccion} id="como-funciona">
            <div className={styles.contenedor}>
                <Revelar className={styles.cabeceraSeccion}>
                    <p className={`etiqueta ${styles.antetitulo}`}>Cómo funciona</p>
                    <h2 className={styles.tituloSeccion}>Tres pasos. Sin letra chica.</h2>
                    <p className={styles.subtituloSeccion}>
                        No hace falta ser experto en nada. El productor hace lo suyo, el satélite mira el campo y vos ves la historia en el celular.
                    </p>
                </Revelar>
                <div className={styles.pasos}>
                    {PASOS.map((paso, i) => (
                        <Revelar as="article" key={paso.titulo} orden={i} className={`${styles.paso} ${paso.clase}`}>
                            <div className={styles.pasoArte} aria-hidden="true">
                                {paso.arte}
                            </div>
                            <span className={`etiqueta ${styles.insignia}`}>Paso {i + 1}</span>
                            <h3 className="subtitulo">{paso.titulo}</h3>
                            <p className="body">{paso.texto}</p>
                        </Revelar>
                    ))}
                </div>
            </div>
        </section>
    );
}

const BENEFICIOS = [
    { Icono: DollarSign, titulo: "Mejor precio por tu cosecha", texto: "El sello de suelo cuidado se ve en el producto y justifica un precio más alto." },
    { Icono: ShieldCheck, titulo: "Sin trámites caros", texto: "No necesitás una certificadora. El satélite y lo que declarás alcanzan." },
    { Icono: Sprout, titulo: "Tu lote, tu prueba", texto: "La ficha de tu lote es tuya y cualquiera puede verificarla con el QR." }
];

function FilaBarra({ etiqueta, ancho, clase }: { etiqueta: string; ancho: string; clase: string }) {
    return (
        <div className={styles.filaBarra}>
            <span className="small" style={{ color: "var(--ink-muted)" }}>
                {etiqueta}
            </span>
            <span className={styles.barra}>
                <i className={`${styles.relleno} ${clase}`} style={{ "--ancho": ancho } as CSSProperties} />
            </span>
        </div>
    );
}

export function Productores() {
    return (
        <section className={styles.seccion} id="productores">
            <div className={styles.contenedor}>
                <Revelar className={styles.panelProductores}>
                    <div className={styles.copiaProductores}>
                        <p className={`etiqueta ${styles.antetitulo} ${styles.antetituloClaro}`}>Para productores</p>
                        <h2 className={`${styles.tituloSeccion} ${styles.tituloClaro}`}>Cuidar la tierra también puede pagar mejor.</h2>
                        <p className={styles.bajadaProductores}>
                            No te pedimos que cuides el suelo por conciencia. Te damos una forma de demostrarlo con datos y de vender tu cosecha a mejor
                            precio, sin certificaciones caras.
                        </p>
                        <ul className={styles.beneficios}>
                            {BENEFICIOS.map(({ Icono, titulo, texto }) => (
                                <li key={titulo}>
                                    <span className={`${styles.icono} ${styles.iconoTrigo}`}>
                                        <Icono size={20} strokeWidth={1.5} aria-hidden />
                                    </span>
                                    <div className="small">
                                        <strong className="body">{titulo}</strong>
                                        {texto}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <EnlaceBoton to="/productor" variante="contorno" grande>
                            Quiero sumar mi quinta
                        </EnlaceBoton>
                    </div>

                    <div className={styles.tarjetaBolsillo}>
                        <p className="subtitulo" style={{ marginBottom: "var(--space-4)" }}>
                            Lo que cambia en el bolsillo
                        </p>
                        <FilaBarra etiqueta="Venta común" ancho="48%" clase={styles.rellenoDesnudo} />
                        <FilaBarra etiqueta="Con Surco" ancho="82%" clase={styles.rellenoOliva} />
                        <p className="small" style={{ color: "var(--ink-muted)", marginTop: "var(--space-4)" }}>
                            Ejemplo de demostración, no un cálculo: la idea es que, con el sello, la práctica sustentable iguale o supere al manejo de siempre
                            en pocas campañas.
                        </p>
                        <div className={styles.pieBolsillo}>
                            <SelloVerificacion estado="verificado" />
                            <span className="dato small" style={{ color: "var(--ink-muted)" }}>
                                Datos con fecha y fuente
                            </span>
                        </div>
                    </div>
                </Revelar>
            </div>
        </section>
    );
}

const QR_EJEMPLO = (
    <svg viewBox="0 0 80 80" width="80" height="80" role="img" aria-label="Código QR de ejemplo">
        <rect width="80" height="80" rx="6" style={relleno("surface-raised")} />
        <g style={relleno("ink")}>
            <path d="M8 8h22v22H8zM13 13v12h12V13z" fillRule="evenodd" />
            <rect x="17" y="17" width="8" height="8" />
            <path d="M50 8h22v22H50zM55 13v12h12V13z" fillRule="evenodd" />
            <rect x="59" y="17" width="8" height="8" />
            <path d="M8 50h22v22H8zM13 55v12h12V55z" fillRule="evenodd" />
            <rect x="17" y="59" width="8" height="8" />
            {[
                [36, 8], [36, 20], [42, 14], [36, 36], [46, 36], [56, 36], [66, 36], [36, 46], [52, 46], [62, 46],
                [40, 56], [50, 56], [68, 56], [36, 66], [46, 66], [60, 66]
            ].map(([x, y]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" />
            ))}
        </g>
    </svg>
);

export function Consumidores() {
    return (
        <section className={`${styles.seccion} ${styles.seccionConsumidores}`} id="consumidores">
            <div className={`${styles.contenedor} ${styles.grillaConsumidores}`}>
                <Revelar>
                    <p className={`etiqueta ${styles.antetitulo}`}>Para consumidores</p>
                    <h2 className={styles.tituloSeccion}>Sabé qué estás comiendo.</h2>
                    <p className={styles.subtituloSeccion}>
                        Escaneá el código del producto y mirá el campo donde creció, quién lo produjo y cuándo se cosechó. Sin promesas vacías: datos con
                        fecha y fuente.
                    </p>
                    <ul className={styles.listaConsumidor}>
                        <li>
                            <span className={`${styles.icono} ${styles.iconoCielo}`}>
                                <MapPin size={18} strokeWidth={1.5} aria-hidden />
                            </span>
                            Dónde creció
                        </li>
                        <li>
                            <span className={`${styles.icono} ${styles.iconoArcilla}`}>
                                <UserRound size={18} strokeWidth={1.5} aria-hidden />
                            </span>
                            Quién lo hizo
                        </li>
                        <li>
                            <span className={`${styles.icono} ${styles.iconoOliva}`}>
                                <Sprout size={18} strokeWidth={1.5} aria-hidden />
                            </span>
                            Cómo se cuidó la tierra
                        </li>
                    </ul>
                    <EnlaceBoton to="#feria" variante="secundario" grande>
                        Ir a la feria
                    </EnlaceBoton>
                </Revelar>

                <Revelar orden={1} className={styles.envolturaTelefono}>
                    <div className={`${styles.flotante} ${styles.flotante1}`} aria-hidden="true">
                        <span className={`${styles.punto} ${styles.puntoOliva}`} /> Suelo cubierto
                    </div>
                    <div className={`${styles.flotante} ${styles.flotante2}`} aria-hidden="true">
                        <span className={`${styles.punto} ${styles.puntoCieloFuerte}`} /> 3 campañas verificadas
                    </div>
                    <div className={styles.telefono} aria-hidden="true">
                        <div className={styles.muesca} />
                        <div className={styles.pantalla}>
                            <div className={styles.pantallaArte}>
                                <svg viewBox="0 0 220 120">
                                    <rect x="0" y="94" width="220" height="26" style={relleno("tierra")} />
                                    <circle cx="72" cy="60" r="24" style={relleno("oliva")} />
                                    <circle cx="104" cy="52" r="27" style={relleno("oliva")} />
                                    <circle cx="136" cy="62" r="23" style={relleno("oliva")} />
                                    <circle cx="90" cy="58" r="15" style={relleno("arcilla")} />
                                    <circle cx="122" cy="56" r="14" style={relleno("trigo")} />
                                    <circle cx="150" cy="58" r="13" style={relleno("arcilla")} />
                                </svg>
                            </div>
                            <p className="etiqueta" style={{ color: "var(--ink-muted)" }}>
                                Bolsón de estación
                            </p>
                            <p className={styles.pantallaTitulo}>Quinta de ejemplo</p>
                            <div className={styles.pantallaFila}>
                                <span>Pasaporte</span>
                                <span className="dato">SUR-2026-0001</span>
                            </div>
                            <div className={styles.pantallaFila}>
                                <span>Cosecha</span>
                                <span className="dato">12 oct 2026</span>
                            </div>
                            <div className={styles.pantallaFila}>
                                <span>Suelo</span>
                                <span className="dato">Cubierto 3 años</span>
                            </div>
                            <div style={{ marginTop: 14 }}>
                                <SelloVerificacion estado="verificado" />
                            </div>
                        </div>
                    </div>
                    <div className={styles.qrEjemplo}>
                        {QR_EJEMPLO}
                        <span className="small" style={{ display: "block", marginTop: 4, color: "var(--ink-muted)" }}>
                            QR de ejemplo
                        </span>
                    </div>
                </Revelar>
            </div>
        </section>
    );
}
