import { ArrowRight } from "lucide-react";
import { Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { ContrasteEvento, Medicion, PasadaContraste } from "../../api/contraste";
import { formatearFecha } from "../../lib/fecha";
import { formatearNumero } from "../../lib/numero";
import { colorToken } from "../../lib/tokens";
import { VEREDICTOS } from "./veredictos";
import styles from "./contraste.module.css";

const DIA = 86_400_000;
const MARGEN_DIAS = 35;
const ESTILO_DATO = { fontFamily: "var(--font-mono)", fontSize: 11 };

const conSigno = (valor: number) => `${valor > 0 ? "+" : ""}${formatearNumero(valor, 2)}`;

// La curva del índice alrededor del evento: se ve el antes, el día declarado y el después.
function CurvaDelIndice({ evento, medicion, serie }: { evento: ContrasteEvento; medicion: Medicion; serie: PasadaContraste[] }) {
    const indice = medicion.indice as Exclude<Medicion["indice"], "temperatura_minima">;
    const desde = Date.parse(medicion.antes?.fecha ?? evento.fecha) - MARGEN_DIAS * DIA;
    const hasta = Date.parse(medicion.despues.fecha) + MARGEN_DIAS * DIA;
    const datos = serie.map((p) => ({ t: Date.parse(p.fecha), v: p[indice] })).filter((p) => p.t >= desde && p.t <= hasta);
    const color = colorToken(VEREDICTOS[evento.veredicto].color === "line" ? "ink-muted" : VEREDICTOS[evento.veredicto].color);
    const tinta = colorToken("ink-muted");

    return (
        <ResponsiveContainer width="100%" height={140}>
            <LineChart data={datos} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="t" type="number" scale="time" domain={[desde, hasta]} hide />
                <YAxis domain={["auto", "auto"]} tickCount={3} tick={{ ...ESTILO_DATO, fill: tinta }} stroke={tinta} tickFormatter={(v: number) => formatearNumero(v, 2)} width={40} />
                <ReferenceLine x={Date.parse(evento.fecha)} stroke={tinta} strokeDasharray="3 4" label={{ value: "día declarado", position: "top", fill: tinta, fontSize: 11 }} />
                <Line dataKey="v" type="monotone" stroke={colorToken("hoja")} strokeWidth={1.5} dot={{ r: 1.5 }} isAnimationActive={false} />
                {medicion.antes && <ReferenceDot x={Date.parse(medicion.antes.fecha)} y={medicion.antes.valor} r={5} fill={colorToken("surface-raised")} stroke={color} strokeWidth={2} />}
                <ReferenceDot x={Date.parse(medicion.despues.fecha)} y={medicion.despues.valor} r={5} fill={color} stroke={color} />
            </LineChart>
        </ResponsiveContainer>
    );
}

// El dato que decide el veredicto: cuánto cambió el índice y cuánto se esperaba.
export function MedicionEvento({ evento, serie }: { evento: ContrasteEvento; serie: PasadaContraste[] }) {
    const { medicion } = evento;
    if (!medicion) return null;

    if (medicion.indice === "temperatura_minima") {
        return (
            <div className={styles.medicion}>
                <p className="etiqueta">{medicion.nombre}</p>
                <p className={`dato ${styles.valorGrande}`}>{formatearNumero(medicion.despues.valor, 1)} °C</p>
                <p className={`small ${styles.secundario}`}>
                    {formatearFecha(medicion.despues.fecha)} · hiela con {formatearNumero(medicion.cambio_esperado ?? 0, 0)} °C o menos
                </p>
            </div>
        );
    }

    const cambio = medicion.antes ? medicion.despues.valor - medicion.antes.valor : null;
    return (
        <div className={styles.medicion}>
            <p className="etiqueta">{medicion.nombre}</p>
            <CurvaDelIndice evento={evento} medicion={medicion} serie={serie} />
            {medicion.antes && cambio !== null && (
                <div className={styles.antesDespues}>
                    <span>
                        <span className="dato">{formatearNumero(medicion.antes.valor, 2)}</span>
                        <span className={`small ${styles.secundario}`}>{formatearFecha(medicion.antes.fecha)}</span>
                    </span>
                    <ArrowRight size={16} strokeWidth={1.5} aria-label="pasó a" />
                    <span>
                        <span className="dato">{formatearNumero(medicion.despues.valor, 2)}</span>
                        <span className={`small ${styles.secundario}`}>{formatearFecha(medicion.despues.fecha)}</span>
                    </span>
                    <span className={styles.cambio}>
                        <span className="dato">{conSigno(cambio)}</span>
                        {medicion.cambio_esperado !== null && <span className={`small ${styles.secundario}`}>se esperaba {conSigno(medicion.cambio_esperado)}</span>}
                    </span>
                </div>
            )}
        </div>
    );
}
