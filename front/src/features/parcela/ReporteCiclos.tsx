import type { ClimaParcela } from "../../api/clima";
import type { Ciclo, CoberturaSinCultivo, HistoricoNdvi, PeriodoSinCultivo } from "../../api/ndvi";
import { formatearDuracion, formatearFecha, formatearVentana } from "../../lib/fecha";
import { formatearNumero } from "../../lib/numero";
import { climaDeCiclo, type ClimaDeCiclo } from "./climaDeCiclo";
import styles from "./parcela.module.css";

function textoClima(c: ClimaDeCiclo): string {
    const partes = [`llovió ${formatearNumero(c.lluvia_mm)} mm`];
    if (c.dias_lluvia_intensa > 0) partes.push(c.dias_lluvia_intensa === 1 ? "con 1 tormenta fuerte" : `con ${c.dias_lluvia_intensa} tormentas fuertes`);
    partes.push(c.heladas === 0 ? "sin heladas" : c.heladas === 1 ? "1 helada" : `${c.heladas} heladas`);
    if (c.heladas > 0 && c.temperatura_minima !== null) partes.push(`mínima de ${formatearNumero(c.temperatura_minima, 1)} °C`);
    partes.push(`${formatearNumero(c.grados_dia)} grados-día`);
    return partes.join(" · ");
}

function ItemCiclo({ ciclo, clima }: { ciclo: Ciclo; clima: ClimaParcela | null }) {
    const climaCiclo = clima ? climaDeCiclo(ciclo, clima) : null;
    const titulo = `Ciclo ${ciclo.numero}: ${ciclo.tipo === "cultivo" ? "cultivo" : "verdeo leve"}`;

    return (
        <li className={styles.ciclo}>
            <span className={`etiqueta ${styles.numeroCiclo}`}>{ciclo.numero}</span>
            <div>
                <h3 className="subtitulo">{titulo}</h3>
                {ciclo.tipo === "verdeo_leve" && (
                    <p className="small">Verdor bajo: maleza, rebrote o cobertura rala.</p>
                )}
                <dl className={styles.datosCiclo}>
                    <dt className="etiqueta">Plantación</dt>
                    <dd className="body">
                        {ciclo.siembra ? formatearVentana(ciclo.siembra.desde, ciclo.siembra.hasta) : "antes del período"}
                    </dd>
                    <dt className="etiqueta">Máximo verdor</dt>
                    <dd className="body">
                        {formatearFecha(ciclo.pico)} · <span className="dato">NDVI {ciclo.ndvi_pico.toFixed(2)}</span>
                    </dd>
                    <dt className="etiqueta">Cosecha</dt>
                    <dd className="body">
                        {ciclo.cosecha ? formatearVentana(ciclo.cosecha.desde, ciclo.cosecha.hasta) : "en pie"}
                    </dd>
                    {ciclo.dias_estimados !== null && (
                        <>
                            <dt className="etiqueta">En pie</dt>
                            <dd className="body">{formatearDuracion(ciclo.dias_estimados)}</dd>
                        </>
                    )}
                    {climaCiclo && (
                        <>
                            <dt className="etiqueta">Clima</dt>
                            <dd className="body">{textoClima(climaCiclo)}</dd>
                            {climaCiclo.agua_raices_minima !== null && (
                                <>
                                    <dt className="etiqueta">Agua en raíces</dt>
                                    <dd className="body">
                                        mínimo <span className="dato">{formatearNumero(climaCiclo.agua_raices_minima * 100)} %</span>
                                    </dd>
                                </>
                            )}
                        </>
                    )}
                </dl>
            </div>
        </li>
    );
}

const DESCRIPCION_COBERTURA: Record<CoberturaSinCultivo, string> = {
    rastrojo: "cubierto con rastrojo",
    desnudo: "suelo desnudo",
    incierta: "no se pudo distinguir si había rastrojo",
    mixta: "en parte con rastrojo y en parte desnudo"
};

function ItemSinCultivo({ periodo }: { periodo: PeriodoSinCultivo }) {
    const cuando =
        periodo.desde === periodo.hasta
            ? `Alrededor del ${formatearFecha(periodo.desde)}`
            : `Del ${formatearFecha(periodo.desde)} al ${formatearFecha(periodo.hasta)}`;
    return (
        <li className="body">
            {cuando} · {formatearDuracion(periodo.dias_estimados)} · {DESCRIPCION_COBERTURA[periodo.cobertura]}
        </li>
    );
}

// `clima` llega por su propia consulta: si todavía no está (o falló), el
// reporte se muestra igual, sin el clima de cada ciclo.
export function ReporteCiclos({ historico, clima }: { historico: HistoricoNdvi; clima: ClimaParcela | null }) {
    const { analisis } = historico;

    return (
        <div className={styles.reporte}>
            <h2 className="subtitulo">Ciclos detectados</h2>

            {analisis.ciclos.length > 0 && (
                <ol className={styles.listaCiclos}>
                    {analisis.ciclos.map((ciclo) => (
                        <ItemCiclo key={ciclo.numero} ciclo={ciclo} clima={clima} />
                    ))}
                </ol>
            )}

            {analisis.sin_cultivo.length > 0 && (
                <div>
                    <h3 className="subtitulo">Sin cultivo</h3>
                    <ul className={styles.listaSuelo}>
                        {analisis.sin_cultivo.map((p) => (
                            <ItemSinCultivo key={p.desde} periodo={p} />
                        ))}
                    </ul>
                </div>
            )}

            <p className={`small ${styles.leyenda}`}>
                Fechas estimadas entre pasadas despejadas. El satélite no identifica el cultivo.
            </p>
        </div>
    );
}
