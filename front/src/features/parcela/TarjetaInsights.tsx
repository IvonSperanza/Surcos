import { CalendarDays, Check, Sprout, TriangleAlert, type LucideIcon } from "lucide-react";
import type { Evidencia, Insight, InsightsParcela, TipoInsight } from "../../api/insights";
import { Card, Fuente } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import styles from "./parcela.module.css";

// Cada tipo lleva color, ícono y palabra: nunca sólo el color. Sin rojo: una
// alerta usa trigo, el color de lo que pide atención.
const TIPOS: Record<TipoInsight, { palabra: string; Icono: LucideIcon; clase: string }> = {
    alerta: { palabra: "Atención", Icono: TriangleAlert, clase: styles.chipAlerta },
    oportunidad: { palabra: "Oportunidad", Icono: Sprout, clase: styles.chipOportunidad },
    bien: { palabra: "Bien hecho", Icono: Check, clase: styles.chipBien },
    planificar: { palabra: "Para planificar", Icono: CalendarDays, clase: styles.chipPlanificar }
};

function fechaDeEvidencia(fecha: string | null): string {
    if (!fecha) return "";
    const [desde, hasta] = fecha.split("/");
    return hasta ? `${desde.slice(0, 4)}–${hasta.slice(0, 4)}` : formatearFecha(desde);
}

function ItemEvidencia({ evidencia }: { evidencia: Evidencia }) {
    return (
        <li className="small">
            <span className="dato">{evidencia.dato}</span> · {evidencia.fuente}
            {evidencia.fecha && ` · ${fechaDeEvidencia(evidencia.fecha)}`}
            {evidencia.escena && <span className={styles.escena}> · escena {evidencia.escena}</span>}
        </li>
    );
}

function ItemInsight({ insight }: { insight: Insight }) {
    const { palabra, Icono, clase } = TIPOS[insight.tipo];

    return (
        <li className={styles.insight}>
            <span className={`etiqueta ${styles.chipInsight} ${clase}`}>
                <Icono size={14} strokeWidth={1.5} aria-hidden />
                {palabra}
            </span>
            <h3 className="subtitulo">{insight.titulo}</h3>
            <p className="body">{insight.hallazgo}</p>
            <p className="body">
                <span className="etiqueta">Qué hacer · </span>
                {insight.accion}
            </p>
            <p className="small" style={{ color: "var(--ink-muted)" }}>
                Confianza {insight.confianza}: {insight.motivo_confianza}.
            </p>
            <details>
                <summary className="small">Ver en qué datos se apoya ({insight.evidencia.length})</summary>
                <ul className={styles.listaEvidencia}>
                    {insight.evidencia.map((e, i) => (
                        <ItemEvidencia key={`${e.fecha}-${i}`} evidencia={e} />
                    ))}
                </ul>
            </details>
        </li>
    );
}

export function TarjetaInsights({ datos }: { datos: InsightsParcela }) {
    return (
        <Card className={styles.tarjeta}>
            <h2 className="subtitulo">Qué podés hacer</h2>
            {datos.insights.length === 0 ? (
                <p className="body">Con los datos de este período no encontramos nada para señalar.</p>
            ) : (
                <ul className={styles.listaInsights}>
                    {datos.insights.map((insight) => (
                        <ItemInsight key={insight.id} insight={insight} />
                    ))}
                </ul>
            )}

            {datos.descartados.length > 0 && (
                <details>
                    <summary className="small">Lo que no pudimos afirmar ({datos.descartados.length})</summary>
                    <ul className={styles.listaEvidencia}>
                        {datos.descartados.map((d) => (
                            <li key={d.id} className="small">
                                {d.motivo}
                            </li>
                        ))}
                    </ul>
                </details>
            )}

            <Fuente>
                Reglas de Surco v{datos.version_reglas} · generado el {formatearFecha(datos.generado)} · cada recomendación muestra los datos en que se
                apoya; cuando los datos no alcanzan, no afirmamos nada.
            </Fuente>
        </Card>
    );
}
