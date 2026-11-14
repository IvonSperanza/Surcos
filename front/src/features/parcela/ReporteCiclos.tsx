import type { Ciclo, HistoricoNdvi, SueloDesnudo } from "../../api/ndvi";
import { Fuente } from "../../design-system";
import { formatearDuracion, formatearFecha, formatearVentana } from "../../lib/fecha";
import styles from "./parcela.module.css";

function resumen({ analisis, desde, hasta }: HistoricoNdvi): string {
    const cultivos = analisis.ciclos.filter((c) => c.tipo === "cultivo").length;
    const verdeos = analisis.ciclos.length - cultivos;

    const partes = [`Entre el ${formatearFecha(desde)} y el ${formatearFecha(hasta)} el satélite vio`];
    partes.push(cultivos === 1 ? "1 cultivo" : `${cultivos} cultivos`);
    if (verdeos > 0) partes.push(verdeos === 1 ? "y 1 verdeo leve" : `y ${verdeos} verdeos leves`);
    const suelo =
        analisis.dias_suelo_desnudo > 0
            ? `El suelo quedó desnudo ${formatearDuracion(analisis.dias_suelo_desnudo)} en total.`
            : "El suelo no se vio desnudo en ninguna pasada.";
    return `${partes.join(" ")}. ${suelo}`;
}

function ItemCiclo({ ciclo }: { ciclo: Ciclo }) {
    const titulo = `Ciclo ${ciclo.numero}: ${ciclo.tipo === "cultivo" ? "cultivo" : "verdeo leve"}`;

    return (
        <li className={styles.ciclo}>
            <span className={`etiqueta ${styles.numeroCiclo}`}>{ciclo.numero}</span>
            <div>
                <h3 className="subtitulo">{titulo}</h3>
                {ciclo.tipo === "verdeo_leve" && (
                    <p className="small">No llegó a ser un cultivo pleno: puede ser maleza, un rebrote o una cobertura rala.</p>
                )}
                <dl className={styles.datosCiclo}>
                    <dt className="etiqueta">Plantación</dt>
                    <dd className="body">
                        {ciclo.siembra ? formatearVentana(ciclo.siembra.desde, ciclo.siembra.hasta) : "ya estaba en pie al empezar el período"}
                    </dd>
                    <dt className="etiqueta">Máximo verdor</dt>
                    <dd className="body">
                        {formatearFecha(ciclo.pico)} · <span className="dato">NDVI {ciclo.ndvi_pico.toFixed(2)}</span>
                    </dd>
                    <dt className="etiqueta">Cosecha</dt>
                    <dd className="body">
                        {ciclo.cosecha ? formatearVentana(ciclo.cosecha.desde, ciclo.cosecha.hasta) : "sigue en pie"}
                    </dd>
                    {ciclo.dias_estimados !== null && (
                        <>
                            <dt className="etiqueta">En pie</dt>
                            <dd className="body">{formatearDuracion(ciclo.dias_estimados)}</dd>
                        </>
                    )}
                </dl>
            </div>
        </li>
    );
}

function ItemSueloDesnudo({ periodo }: { periodo: SueloDesnudo }) {
    const cuando = periodo.desde === periodo.hasta ? `alrededor del ${formatearFecha(periodo.desde)}` : `del ${formatearFecha(periodo.desde)} al ${formatearFecha(periodo.hasta)}`;
    return (
        <li className="body">
            {cuando} · {formatearDuracion(periodo.dias_estimados)}
        </li>
    );
}

export function ReporteCiclos({ historico }: { historico: HistoricoNdvi }) {
    const { analisis } = historico;

    return (
        <div className={styles.reporte}>
            <h2 className="subtitulo">Qué pasó en tu parcela</h2>
            <p className="body">{resumen(historico)}</p>

            {analisis.ciclos.length > 0 && (
                <ol className={styles.listaCiclos}>
                    {analisis.ciclos.map((ciclo) => (
                        <ItemCiclo key={ciclo.numero} ciclo={ciclo} />
                    ))}
                </ol>
            )}

            {analisis.suelo_desnudo.length > 0 && (
                <div>
                    <h3 className="subtitulo">Suelo desnudo</h3>
                    <ul className={styles.listaSuelo}>
                        {analisis.suelo_desnudo.map((p) => (
                            <ItemSueloDesnudo key={p.desde} periodo={p} />
                        ))}
                    </ul>
                </div>
            )}

            <Fuente>
                Las fechas son estimadas: muestran entre qué dos pasadas despejadas del satélite ocurrió cada cosa. La plantación pudo ser unos días
                antes, porque el cultivo recién se ve cuando asoma. El satélite confirma que hubo un cultivo, no cuál fue.
            </Fuente>
        </div>
    );
}
