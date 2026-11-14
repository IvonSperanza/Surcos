import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoricoNdvi } from "../../api/ndvi";
import { formatearFecha, formatearMes } from "../../lib/fecha";
import { colorToken } from "../../lib/tokens";

const ESTILO_DATO = { fontFamily: "var(--font-mono)", fontSize: 12 };

// Sobre suelo desnudo o rastrojo, NDMI y NDRE miden el suelo y no la planta:
// sólo se grafican las pasadas con cultivo en pie (el resto queda como hueco).
export function GraficoAguaVigor({ historico }: { historico: HistoricoNdvi }) {
    const conCultivo = (p: HistoricoNdvi["serie"][number]) => p.ndvi >= historico.umbral_suelo_desnudo;
    const datos = historico.serie.map((p) => ({
        t: Date.parse(p.fecha),
        agua: conCultivo(p) ? Number(p.ndmi.toFixed(2)) : null,
        vigor: conCultivo(p) ? Number(p.ndre.toFixed(2)) : null
    }));
    const tintaSecundaria = colorToken("ink-muted");
    const eje = { tick: { ...ESTILO_DATO, fill: tintaSecundaria }, stroke: tintaSecundaria };

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={colorToken("line")} vertical={false} />
                <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatearMes} {...eje} />
                <YAxis domain={[-0.2, 0.8]} ticks={[0, 0.4, 0.8]} {...eje} />
                <Tooltip
                    labelFormatter={(t) => formatearFecha(Number(t))}
                    contentStyle={{ ...ESTILO_DATO, borderRadius: 4, borderColor: colorToken("line") }}
                />
                <Legend wrapperStyle={{ fontFamily: "var(--font-sans)", fontSize: 14 }} />
                <Line dataKey="agua" name="Agua en la planta (NDMI)" stroke={colorToken("cielo")} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} isAnimationActive={false} />
                <Line dataKey="vigor" name="Clorofila (NDRE)" stroke={colorToken("oliva")} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
