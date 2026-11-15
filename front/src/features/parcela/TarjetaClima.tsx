import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ClimaParcela } from "../../api/clima";
import { Card, Fuente } from "../../design-system";
import { formatearFecha, formatearMes } from "../../lib/fecha";
import { formatearNumero } from "../../lib/numero";
import { colorToken } from "../../lib/tokens";
import styles from "./parcela.module.css";

const ESTILO_DATO = { fontFamily: "var(--font-mono)", fontSize: 12 };

function Cifra({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: string }) {
    return (
        <div className={styles.cifra}>
            <span className="etiqueta">{etiqueta}</span>
            <span className={`dato ${styles.valorCifra}`}>{valor}</span>
            {detalle && <span className="small">{detalle}</span>}
        </div>
    );
}

function GraficoMensual({ clima }: { clima: ClimaParcela }) {
    const datos = clima.mensual.map((m) => ({ t: Date.parse(`${m.mes}-15`), lluvia: m.lluvia_mm, temperatura: m.temperatura_media }));
    const tintaSecundaria = colorToken("ink-muted");
    const eje = { tick: { ...ESTILO_DATO, fill: tintaSecundaria }, stroke: tintaSecundaria };

    return (
        <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={datos} margin={{ top: 8, right: 0, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={colorToken("line")} vertical={false} />
                <XAxis dataKey="t" type="number" scale="time" domain={["dataMin - 1296000000", "dataMax + 1296000000"]} tickFormatter={formatearMes} {...eje} />
                <YAxis yAxisId="lluvia" unit=" mm" {...eje} />
                <YAxis yAxisId="temperatura" orientation="right" unit=" °C" {...eje} />
                <Tooltip
                    labelFormatter={(t) => formatearMes(Number(t))}
                    formatter={(valor, nombre) => (nombre === "lluvia" ? [`${valor} mm`, "Lluvia"] : [`${valor} °C`, "Temperatura media"])}
                    contentStyle={{ ...ESTILO_DATO, borderRadius: 6, borderColor: colorToken("line"), backgroundColor: colorToken("surface-raised"), color: colorToken("ink") }}
                />
                <Bar yAxisId="lluvia" dataKey="lluvia" fill={colorToken("cielo-soft")} stroke={colorToken("cielo")} isAnimationActive={false} />
                <Line yAxisId="temperatura" dataKey="temperatura" stroke={colorToken("cielo")} strokeWidth={2} dot={false} isAnimationActive={false} />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

export function TarjetaClima({ clima }: { clima: ClimaParcela }) {
    const r = clima.resumen;

    return (
        <Card className={`${styles.tarjeta} grilla-datos`}>
            <h2 className="subtitulo">Clima</h2>
            <div className={styles.cifras}>
                <Cifra
                    etiqueta="Lluvia"
                    valor={`${formatearNumero(r.lluvia_total_mm)} mm`}
                    detalle={`en ${r.dias_con_lluvia} días${r.lluvia_maxima_diaria ? ` · máx. ${formatearNumero(r.lluvia_maxima_diaria.valor)} mm el ${formatearFecha(r.lluvia_maxima_diaria.fecha)}` : ""}`}
                />
                <Cifra
                    etiqueta="Heladas"
                    valor={`${r.dias_con_helada} días`}
                    detalle={r.temperatura_minima_absoluta ? `mínima ${formatearNumero(r.temperatura_minima_absoluta.valor, 1)} °C el ${formatearFecha(r.temperatura_minima_absoluta.fecha)}` : undefined}
                />
                <Cifra
                    etiqueta="Temperatura media"
                    valor={r.temperatura_media === null ? "sin dato" : `${formatearNumero(r.temperatura_media, 1)} °C`}
                    detalle={r.temperatura_maxima_absoluta ? `máxima ${formatearNumero(r.temperatura_maxima_absoluta.valor, 1)} °C el ${formatearFecha(r.temperatura_maxima_absoluta.fecha)}` : undefined}
                />
                <Cifra
                    etiqueta="Agua en las raíces"
                    valor={r.humedad_raiz_media === null ? "sin dato" : `${formatearNumero(r.humedad_raiz_media * 100)} %`}
                    detalle="primer metro · 0 % seco, 100 % saturado"
                />
            </div>
            <GraficoMensual clima={clima} />
            <Fuente>
                NASA POWER · celda de ~50 km · hasta el {r.ultimo_dato ? formatearFecha(r.ultimo_dato) : "—"}
            </Fuente>
        </Card>
    );
}
