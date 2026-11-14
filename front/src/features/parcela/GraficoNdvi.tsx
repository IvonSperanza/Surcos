import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoricoNdvi } from "../../api/ndvi";
import { formatearFecha, formatearMes } from "../../lib/fecha";
import { colorToken } from "../../lib/tokens";

const ESTILO_DATO = { fontFamily: "var(--font-mono)", fontSize: 12 };

export function GraficoNdvi({ historico }: { historico: HistoricoNdvi }) {
    const datos = historico.serie.map((p) => ({ t: Date.parse(p.fecha), ndvi: Number(p.ndvi.toFixed(3)) }));
    const tintaSecundaria = colorToken("ink-muted");

    return (
        <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={colorToken("line")} vertical={false} />
                <ReferenceArea y1={0} y2={historico.umbral_suelo_desnudo} fill={colorToken("suelo-desnudo")} fillOpacity={0.22} />
                <XAxis
                    dataKey="t"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={formatearMes}
                    tick={{ ...ESTILO_DATO, fill: tintaSecundaria }}
                    stroke={tintaSecundaria}
                />
                <YAxis domain={[0, 1]} ticks={[0, 0.3, 0.6, 0.9]} tick={{ ...ESTILO_DATO, fill: tintaSecundaria }} stroke={tintaSecundaria} />
                <Tooltip
                    labelFormatter={(t) => formatearFecha(Number(t))}
                    formatter={(valor) => [valor, "NDVI"]}
                    contentStyle={{ ...ESTILO_DATO, borderRadius: 4, borderColor: colorToken("line") }}
                />
                <Area dataKey="ndvi" type="monotone" fill={colorToken("oliva-soft")} stroke="none" isAnimationActive={false} />
                <Line dataKey="ndvi" type="monotone" stroke={colorToken("oliva")} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                {historico.analisis.ciclos.map((ciclo) => (
                    <ReferenceDot
                        key={ciclo.numero}
                        x={Date.parse(ciclo.pico)}
                        y={ciclo.ndvi_pico}
                        r={9}
                        fill={colorToken("oliva-soft")}
                        stroke={colorToken("oliva")}
                        label={{ value: ciclo.numero, fill: colorToken("ink"), fontSize: 11, fontWeight: 600 }}
                    />
                ))}
            </ComposedChart>
        </ResponsiveContainer>
    );
}
