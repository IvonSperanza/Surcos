import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoricoNdvi } from "../../api/ndvi";
import { formatearFecha, formatearMes } from "../../lib/fecha";
import { colorToken } from "../../lib/tokens";

const ESTILO_DATO = { fontFamily: "var(--font-mono)", fontSize: 12 };

const SERIES = [
    { clave: "cultivo", nombre: "Cultivo", relleno: "oliva" },
    { clave: "rastrojo", nombre: "Rastrojo", relleno: "trigo" },
    { clave: "incierta", nombre: "Sin distinguir", relleno: "line" },
    { clave: "desnudo", nombre: "Suelo desnudo", relleno: "suelo-desnudo" }
] as const;

// Qué cubría la parcela en cada pasada, píxel por píxel: muestra lo que la
// mediana esconde (ej. media parcela plantada y media desnuda).
export function GraficoCobertura({ historico }: { historico: HistoricoNdvi }) {
    const datos = historico.serie.map((p) => ({
        t: Date.parse(p.fecha),
        cultivo: Math.round(p.fraccion_cultivo * 100),
        rastrojo: Math.round(p.fraccion_rastrojo * 100),
        incierta: Math.round(p.fraccion_incierta * 100),
        desnudo: Math.round(p.fraccion_desnudo * 100)
    }));
    const tintaSecundaria = colorToken("ink-muted");
    const eje = { tick: { ...ESTILO_DATO, fill: tintaSecundaria }, stroke: tintaSecundaria };

    return (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={colorToken("line")} vertical={false} />
                <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatearMes} {...eje} />
                <YAxis domain={[0, 100]} ticks={[0, 50, 100]} unit=" %" {...eje} />
                <Tooltip
                    labelFormatter={(t) => formatearFecha(Number(t))}
                    formatter={(valor, nombre) => [`${valor} %`, nombre]}
                    contentStyle={{ ...ESTILO_DATO, borderRadius: 4, borderColor: colorToken("line") }}
                />
                <Legend wrapperStyle={{ fontFamily: "var(--font-sans)", fontSize: 14 }} />
                {SERIES.map((s) => (
                    <Area
                        key={s.clave}
                        dataKey={s.clave}
                        name={s.nombre}
                        stackId="cobertura"
                        type="stepAfter"
                        fill={colorToken(s.relleno)}
                        stroke="none"
                        fillOpacity={0.85}
                        isAnimationActive={false}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}
