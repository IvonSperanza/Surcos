import type { ClimaParcela } from "../../api/clima";
import type { InsightsParcela } from "../../api/insights";
import type { HistoricoNdvi } from "../../api/ndvi";
import type { SueloParcela } from "../../api/suelo";
import { Card, Fuente } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import { GraficoAguaVigor } from "./GraficoAguaVigor";
import { GraficoCobertura } from "./GraficoCobertura";
import { GraficoNdvi, type MarcaEvento } from "./GraficoNdvi";
import { ReporteCiclos } from "./ReporteCiclos";
import { SegunEstado } from "./SegunEstado";
import { TarjetaClima } from "./TarjetaClima";
import { TarjetaSuelo } from "./TarjetaSuelo";
import type { EstadoConsulta } from "./useConsultaParcela";
import styles from "./parcela.module.css";

export type EstadosDatosParcela = {
    ndvi: EstadoConsulta<HistoricoNdvi>;
    clima: EstadoConsulta<ClimaParcela>;
    suelo: EstadoConsulta<SueloParcela>;
    insights: EstadoConsulta<InsightsParcela>;
};

// La lectura satelital completa de la parcela: curva, cobertura, agua y vigor, ciclos.
export function TarjetaSatelite({ historico, clima, marcas }: { historico: HistoricoNdvi; clima: ClimaParcela | null; marcas: MarcaEvento[] }) {
    return (
        <Card className={`${styles.tarjeta} grilla-datos`}>
            <h2 className="subtitulo">Verdor (NDVI)</h2>
            <p className={`small ${styles.leyenda}`}>Curva: verde del cultivo · franja: sin cultivo en pie · números: ciclos detectados</p>
            <GraficoNdvi historico={historico} marcas={marcas} />

            <h3 className="subtitulo">Cobertura del suelo</h3>
            <GraficoCobertura historico={historico} />

            <h3 className="subtitulo">Agua y clorofila</h3>
            <p className={`small ${styles.leyenda}`}>Sólo con cultivo en pie.</p>
            <GraficoAguaVigor historico={historico} />

            <ReporteCiclos historico={historico} clima={clima} />
            <Fuente>
                {historico.fuente} · {formatearFecha(historico.desde)} a {formatearFecha(historico.hasta)} · píxel de {historico.resolucion_m} m ·
                consultado {formatearFecha(historico.consultado)}
            </Fuente>
        </Card>
    );
}

type Props = Omit<EstadosDatosParcela, "insights"> & {
    // Con un panel que ya muestra la carga (ficha del panel), las tarjetas
    // sólo aparecen cuando tienen datos: no se dice dos veces "cargando".
    soloListos?: boolean;
    // Eventos declarados en la parcela: se marcan sobre la curva de NDVI.
    marcas?: MarcaEvento[];
};

// Las tarjetas de datos de una parcela, sea recién dibujada (/parcela) o una
// guardada (ficha del panel). Los insights van aparte: cada pantalla decide
// dónde ubicarlos.
export function DatosParcela({ ndvi, clima, suelo, soloListos = false, marcas = [] }: Props) {
    return (
        <>
            <SegunEstado
                estado={ndvi}
                soloListo={soloListos}
                titulo="Satélite"
                mensajeCargando="Consultando Sentinel-2. La primera vez tarda 1 a 2 min."
            >
                {(historico) => <TarjetaSatelite historico={historico} clima={clima.tipo === "listo" ? clima.datos : null} marcas={marcas} />}
            </SegunEstado>

            <div className={styles.grillaTarjetas}>
                <SegunEstado estado={clima} soloListo={soloListos} titulo="Clima" mensajeCargando="Consultando NASA POWER…">
                    {(datos) => <TarjetaClima clima={datos} />}
                </SegunEstado>
                <SegunEstado estado={suelo} soloListo={soloListos} titulo="Suelo" mensajeCargando="Consultando SoilGrids…">
                    {(datos) => <TarjetaSuelo suelo={datos} />}
                </SegunEstado>
            </div>
        </>
    );
}
