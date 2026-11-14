import type { Ciclo, CoberturaSinCultivo, HistoricoNdvi, PeriodoSinCultivo } from "../../api/ndvi";
import { Fuente } from "../../design-system";
import { formatearDuracion, formatearFecha, formatearVentana } from "../../lib/fecha";
import styles from "./parcela.module.css";

function resumen({ analisis, desde, hasta }: HistoricoNdvi): string {
    const cultivos = analisis.ciclos.filter((c) => c.tipo === "cultivo").length;
    const verdeos = analisis.ciclos.length - cultivos;

    const partes = [`Entre el ${formatearFecha(desde)} y el ${formatearFecha(hasta)} el satélite vio`];
    partes.push(cultivos === 1 ? "1 cultivo" : `${cultivos} cultivos`);
    if (verdeos > 0) partes.push(verdeos === 1 ? "y 1 verdeo leve" : `y ${verdeos} verdeos leves`);
    return `${partes.join(" ")}. ${resumenSinCultivo(analisis)}`;
}

function resumenSinCultivo({ dias_sin_cultivo, dias_suelo_desnudo, dias_con_rastrojo }: HistoricoNdvi["analisis"]): string {
    if (dias_sin_cultivo === 0) return "El suelo estuvo cubierto con cultivo en todas las pasadas.";
    const detalle = [
        dias_suelo_desnudo > 0 && `${formatearDuracion(dias_suelo_desnudo)} con el suelo desnudo`,
        dias_con_rastrojo > 0 && `${formatearDuracion(dias_con_rastrojo)} cubierto con rastrojo`
    ].filter(Boolean);
    const cuanto = `La parcela estuvo sin cultivo ${formatearDuracion(dias_sin_cultivo)} en total`;
    return detalle.length > 0 ? `${cuanto}: ${detalle.join(" y ")}.` : `${cuanto}.`;
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

            {analisis.sin_cultivo.length > 0 && (
                <div>
                    <h3 className="subtitulo">Sin cultivo</h3>
                    <p className="small">Dejar el rastrojo protege el suelo igual que una cobertura: no cuenta como suelo desnudo.</p>
                    <ul className={styles.listaSuelo}>
                        {analisis.sin_cultivo.map((p) => (
                            <ItemSinCultivo key={p.desde} periodo={p} />
                        ))}
                    </ul>
                </div>
            )}

            <Fuente>
                Las fechas son estimadas: muestran entre qué dos pasadas despejadas del satélite ocurrió cada cosa. La plantación pudo ser unos días
                antes, porque el cultivo recién se ve cuando asoma. El satélite confirma que hubo un cultivo, no cuál fue. El rastrojo se distingue
                con el índice NDTI, que también cambia con la humedad del suelo: cuando no alcanza para afirmar nada, lo decimos.
            </Fuente>
        </div>
    );
}
