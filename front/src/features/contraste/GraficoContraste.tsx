import { useRef, useState } from "react";
import { CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ContrasteEvento, ContrasteParcela } from "../../api/contraste";
import type { Evento } from "../../api/eventos";
import { formatearFecha, formatearMes } from "../../lib/fecha";
import { colorToken } from "../../lib/tokens";
import { detallesEvento, tituloEvento } from "../eventos/textoEvento";
import { SelloVeredicto } from "./SelloVeredicto";
import { MARCA_HUECA, VEREDICTOS } from "./veredictos";
import styles from "./contraste.module.css";

const ESTILO_DATO = { fontFamily: "var(--font-mono)", fontSize: 12 };
const DIA = 86_400_000;
// Margen a cada lado de los eventos, para ver la curva de antes y de después.
const MARGEN_DIAS = 30;
// Los eventos van en un carril arriba de la curva, para no taparla.
const CARRIL = 1.05;

type Props = {
    contraste: ContrasteParcela;
    eventos: Map<string, Evento>;
    seleccionado: string | null;
    onSeleccionar: (eventoId: string) => void;
};

// Un tick por mes: los automáticos de Recharts repiten el mes ("may 26 may 26").
function inicioDeCadaMes(desde: number, hasta: number): number[] {
    const ticks: number[] = [];
    const fecha = new Date(desde);
    let mes = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 1);
    while (mes <= hasta) {
        ticks.push(mes);
        const actual = new Date(mes);
        mes = Date.UTC(actual.getUTCFullYear(), actual.getUTCMonth() + 1, 1);
    }
    return ticks;
}

function rango(contraste: ContrasteParcela): [number, number] {
    const fechas = contraste.eventos.map((e) => Date.parse(e.fecha));
    const ultimaPasada = Date.parse(contraste.serie.at(-1)?.fecha ?? contraste.hasta);
    return [Math.min(...fechas) - MARGEN_DIAS * DIA, Math.min(Math.max(...fechas) + 2 * MARGEN_DIAS * DIA, ultimaPasada)];
}

type PropsMarca = {
    resultado: ContrasteEvento;
    nombre: string;
    seleccionado: boolean;
    onSeleccionar: () => void;
    onMostrar: (x: number, y: number) => void;
    onOcultar: () => void;
    cx?: number;
    cy?: number;
};

function MarcaEvento({ resultado, nombre, seleccionado, onSeleccionar, onMostrar, onOcultar, cx = 0, cy = 0 }: PropsMarca) {
    const { color, palabra } = VEREDICTOS[resultado.veredicto];
    const lleno = !MARCA_HUECA.has(resultado.veredicto);
    return (
        <g
            className={styles.marca}
            role="button"
            tabIndex={0}
            aria-label={`${formatearFecha(resultado.fecha)}, ${nombre}: ${palabra}`}
            onClick={onSeleccionar}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSeleccionar();
                }
            }}
            onMouseEnter={() => onMostrar(cx, cy)}
            onMouseLeave={onOcultar}
            onFocus={() => onMostrar(cx, cy)}
            onBlur={onOcultar}
        >
            {/* Área de puntería más grande que la marca. */}
            <circle cx={cx} cy={cy} r={12} fill="transparent" />
            <circle
                cx={cx}
                cy={cy}
                r={seleccionado ? 8 : 6}
                fill={lleno ? colorToken(color) : colorToken("surface-raised")}
                stroke={seleccionado ? colorToken("ink") : lleno ? colorToken("surface-raised") : colorToken(color === "line" ? "ink-muted" : color)}
                strokeWidth={seleccionado ? 2 : 1.5}
            />
        </g>
    );
}

const ANCHO_POPUP = 280;

// Lo que pasó ese día, sin salir del gráfico. Se abre debajo de la marca y no
// se sale del gráfico por los costados.
function PopupEvento({ evento, resultado, x, y, ancho }: { evento: Evento; resultado: ContrasteEvento; x: number; y: number; ancho: number }) {
    const izquierda = Math.min(Math.max(x - ANCHO_POPUP / 2, 0), Math.max(ancho - ANCHO_POPUP, 0));
    const detalles = detallesEvento(evento);
    return (
        <div className={styles.popup} style={{ left: izquierda, top: y + 16, width: ANCHO_POPUP }} role="tooltip">
            <p className={`dato small ${styles.secundario}`}>{formatearFecha(evento.fecha)}</p>
            <p className={styles.popupTitulo}>{tituloEvento(evento)}</p>
            {detalles && <p className="small">{detalles}</p>}
            {evento.foto && <img className={styles.popupFoto} src={evento.foto.url} alt="" />}
            <SelloVeredicto veredicto={resultado.veredicto} />
            <p className="small">{resultado.hallazgo}</p>
            <p className={`small ${styles.secundario}`}>Hacé clic para ver por qué.</p>
        </div>
    );
}

// La curva de verde que vio el satélite, los ciclos que detectó y, arriba,
// cada evento declarado con el color de su veredicto.
export function GraficoContraste({ contraste, eventos, seleccionado, onSeleccionar }: Props) {
    const contenedor = useRef<HTMLDivElement>(null);
    // El ancho se mide al abrir el popup: leer el ref durante el render no se actualiza.
    const [sobre, setSobre] = useState<{ id: string; x: number; y: number; ancho: number } | null>(null);
    const [desde, hasta] = rango(contraste);
    const datos = contraste.serie.map((p) => ({ t: Date.parse(p.fecha), ndvi: Number(p.ndvi.toFixed(3)) })).filter((p) => p.t >= desde && p.t <= hasta);
    const tintaSecundaria = colorToken("ink-muted");
    const elegido = contraste.eventos.find((e) => e.evento_id === seleccionado);

    const resultadoSobre = sobre && contraste.eventos.find((e) => e.evento_id === sobre.id);
    const eventoSobre = sobre && eventos.get(sobre.id);

    return (
        <div ref={contenedor} className={styles.contenedorGrafico}>
            <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={datos} margin={{ top: 12, right: 12, bottom: 0, left: -16 }}>
                    <CartesianGrid stroke={colorToken("line")} vertical={false} />
                    {contraste.ciclos.map((c) => {
                        const inicio = Date.parse(c.siembra?.desde ?? c.pico);
                        const fin = Date.parse(c.cosecha?.hasta ?? contraste.hasta);
                        return (
                            <ReferenceArea
                                key={c.numero}
                                x1={Math.max(inicio, desde)}
                                x2={Math.min(fin, hasta)}
                                y1={0}
                                y2={1}
                                fill={colorToken("cielo-soft")}
                                fillOpacity={0.6}
                                ifOverflow="discard"
                            />
                        );
                    })}
                    <XAxis
                        dataKey="t"
                        type="number"
                        scale="time"
                        domain={[desde, hasta]}
                        allowDataOverflow
                        ticks={inicioDeCadaMes(desde, hasta)}
                        tickFormatter={formatearMes}
                        tick={{ ...ESTILO_DATO, fill: tintaSecundaria }}
                        stroke={tintaSecundaria}
                    />
                    <YAxis domain={[0, 1.12]} ticks={[0, 0.3, 0.6, 0.9]} tick={{ ...ESTILO_DATO, fill: tintaSecundaria }} stroke={tintaSecundaria} />
                    <Tooltip
                        // Sobre un evento manda su popup, no el valor de la curva.
                        active={sobre ? false : undefined}
                        labelFormatter={(t) => formatearFecha(Number(t))}
                        formatter={(valor) => [valor, "Verde (NDVI)"]}
                        contentStyle={{
                            ...ESTILO_DATO,
                            borderRadius: 6,
                            borderColor: colorToken("line"),
                            backgroundColor: colorToken("surface-raised"),
                            color: colorToken("ink")
                        }}
                    />
                    <Line dataKey="ndvi" type="monotone" stroke={colorToken("hoja")} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                    {elegido && <ReferenceLine x={Date.parse(elegido.fecha)} stroke={colorToken("ink")} strokeDasharray="3 4" />}
                    {contraste.eventos.map((r) => {
                        const evento = eventos.get(r.evento_id);
                        return (
                            <ReferenceDot
                                key={r.evento_id}
                                x={Date.parse(r.fecha)}
                                y={CARRIL}
                                ifOverflow="discard"
                                shape={(props: { cx?: number; cy?: number }) => (
                                    <MarcaEvento
                                        resultado={r}
                                        nombre={evento ? tituloEvento(evento) : ""}
                                        seleccionado={r.evento_id === seleccionado}
                                        onSeleccionar={() => onSeleccionar(r.evento_id)}
                                        onMostrar={(x, y) => setSobre({ id: r.evento_id, x, y, ancho: contenedor.current?.clientWidth ?? 0 })}
                                        onOcultar={() => setSobre((actual) => (actual?.id === r.evento_id ? null : actual))}
                                        cx={props.cx}
                                        cy={props.cy}
                                    />
                                )}
                            />
                        );
                    })}
                </ComposedChart>
            </ResponsiveContainer>
            {sobre && eventoSobre && resultadoSobre && (
                <PopupEvento evento={eventoSobre} resultado={resultadoSobre} x={sobre.x} y={sobre.y} ancho={sobre.ancho} />
            )}
        </div>
    );
}
