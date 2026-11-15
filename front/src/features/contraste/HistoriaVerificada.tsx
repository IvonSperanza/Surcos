import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { contrastarEventos, type ContrasteEvento, type ContrasteParcela } from "../../api/contraste";
import type { Evento } from "../../api/eventos";
import type { PoligonoGeoJson } from "../../api/ndvi";
import { Card, Fuente } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import { CuerpoEvento } from "../eventos/LineaTiempo";
import { tituloEvento } from "../eventos/textoEvento";
import { TIPOS_EVENTO } from "../eventos/tiposEvento";
import { GraficoContraste } from "./GraficoContraste";
import { MedicionEvento } from "./MedicionEvento";
import { SelloVeredicto } from "./SelloVeredicto";
import { useContraste } from "./useContraste";
import { CONFIANZA, ORDEN_VEREDICTOS, VEREDICTOS } from "./veredictos";
import styles from "./contraste.module.css";

export type GrupoEventos = { titulo: string; eventos: Evento[] };

type Props = { geometria: PoligonoGeoJson; grupos: GrupoEventos[] };

// Lo que no entra en la cuenta de confirmados, dicho en una oración.
function fueraDeLaCuenta(resumen: ContrasteParcela["resumen"]): string | null {
    const partes = [
        resumen.declarado > 0 && (resumen.declarado === 1 ? "otro queda como dato del productor: el satélite no lo puede ver" : `otros ${resumen.declarado} quedan como dato del productor: el satélite no los puede ver`),
        resumen.sin_pasadas > 0 && `${resumen.sin_pasadas === 1 ? "uno no se pudo comparar" : `${resumen.sin_pasadas} no se pudieron comparar`} por falta de imágenes sin nubes`
    ].filter(Boolean) as string[];
    if (partes.length === 0) return null;
    const oracion = partes.join("; ");
    return `${oracion.charAt(0).toLocaleUpperCase("es-AR")}${oracion.slice(1)}.`;
}

function Resumen({ contraste }: { contraste: ContrasteParcela }) {
    const { resumen } = contraste;
    const resto = fueraDeLaCuenta(resumen);
    return (
        <div className={styles.resumen}>
            <p className={styles.cifra}>
                <span className={`dato ${styles.numeroCifra}`}>
                    {resumen.confirma} de {resumen.contrastables}
                </span>
                <span className="body">eventos que se pueden ver desde el espacio, confirmados por el satélite.</span>
            </p>
            {resto && <p className={`small ${styles.secundario}`}>{resto}</p>}
        </div>
    );
}

// La leyenda explica los colores de las marcas y cuenta cuántas hay de cada uno.
function Leyenda({ contraste }: { contraste: ContrasteParcela }) {
    return (
        <figcaption className={styles.leyenda}>
            <span className={`small ${styles.claveLinea}`}>Verde de la parcela (NDVI)</span>
            <span className={`small ${styles.claveCiclo}`}>Ciclo de cultivo detectado</span>
            {ORDEN_VEREDICTOS.filter((v) => contraste.resumen[v] > 0).map((v) => (
                <span key={v} className={`small ${styles.claveMarca}`}>
                    <span className={`${styles.punto} ${styles[`punto_${v}`]}`} aria-hidden />
                    {VEREDICTOS[v].conteo(contraste.resumen[v])}
                </span>
            ))}
        </figcaption>
    );
}

function PorQue({ resultado, serie }: { resultado: ContrasteEvento; serie: ContrasteParcela["serie"] }) {
    return (
        <div className={styles.porQue}>
            <MedicionEvento evento={resultado} serie={serie} />
            <div className={styles.explicacion}>
                <p className="body">{resultado.hallazgo}</p>
                <dl className={styles.claves}>
                    <div>
                        <dt className="etiqueta">Qué se espera ver</dt>
                        <dd className="small">{resultado.senal_esperada}</dd>
                    </div>
                    {resultado.confianza && (
                        <div>
                            <dt className="etiqueta">{CONFIANZA[resultado.confianza]}</dt>
                            <dd className="small">{resultado.motivo_confianza}</dd>
                        </div>
                    )}
                </dl>
                {resultado.evidencia.length > 0 && (
                    <ul className={styles.evidencia}>
                        {resultado.evidencia.map((e) => (
                            <li key={`${e.fecha}-${e.dato}`}>
                                <Fuente>
                                    <span className="dato">{e.dato}</span> · {e.fuente}
                                    {e.fecha && ` · ${formatearFecha(e.fecha)}`}
                                    {e.escena && <span className={styles.escena}> · escena {e.escena}</span>}
                                </Fuente>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

type ItemProps = {
    evento: Evento;
    resultado: ContrasteEvento | undefined;
    cargando: boolean;
    abierto: boolean;
    onAlternar: () => void;
    serie: ContrasteParcela["serie"];
};

function ItemContrastado({ evento, resultado, cargando, abierto, onAlternar, serie }: ItemProps) {
    const { Icono } = TIPOS_EVENTO[evento.tipo];
    const veredicto = resultado?.veredicto;
    const idPanel = `por-que-${evento.id}`;
    return (
        <li id={`contraste-${evento.id}`} className={`${styles.item} ${abierto ? styles.itemAbierto : ""}`}>
            <p className={`dato ${styles.fecha}`}>{formatearFecha(evento.fecha)}</p>
            <span className={`${styles.icono} ${veredicto ? styles[`icono_${veredicto}`] : ""}`} aria-hidden>
                <Icono size={18} strokeWidth={1.5} />
            </span>
            <div className={styles.cuerpo}>
                <CuerpoEvento evento={evento} />
                <div className={styles.estado}>
                    {resultado ? (
                        <>
                            <SelloVeredicto veredicto={resultado.veredicto} />
                            <button type="button" className={styles.botonPorQue} aria-expanded={abierto} aria-controls={idPanel} aria-label={`Por qué: ${tituloEvento(evento)}`} onClick={onAlternar}>
                                Por qué
                                <ChevronDown size={16} strokeWidth={1.5} aria-hidden className={abierto ? styles.girado : undefined} />
                            </button>
                        </>
                    ) : (
                        cargando && <span className={`small ${styles.secundario}`}>Buscando imágenes…</span>
                    )}
                </div>
                {resultado && abierto && (
                    <div id={idPanel}>
                        <PorQue resultado={resultado} serie={serie} />
                    </div>
                )}
            </div>
        </li>
    );
}

// La historia de una producción contrastada con el satélite: arriba la curva
// con cada evento marcado, abajo cada evento con su veredicto y el porqué.
export function HistoriaVerificada({ geometria, grupos }: Props) {
    const todos = grupos.flatMap((g) => g.eventos);
    const estado = useContraste(contrastarEventos, geometria, todos);
    const [abierto, setAbierto] = useState<string | null>(null);

    const contraste = estado.estado === "listo" ? estado.contraste : null;
    const porEvento = new Map(contraste?.eventos.map((r) => [r.evento_id, r]));
    const eventosPorId = new Map(todos.map((e) => [e.id, e]));

    const alternar = (id: string) => setAbierto((actual) => (actual === id ? null : id));
    const elegirEnGrafico = (id: string) => {
        setAbierto(id);
        document.getElementById(`contraste-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };

    return (
        <Card className={styles.historia}>
            <header className={styles.cabecera}>
                <h2 className="subtitulo">Historia verificada</h2>
                <p className={`small ${styles.secundario}`}>Lo que declaró el productor, contrastado con lo que vio el satélite sobre la parcela.</p>
            </header>

            {estado.estado === "cargando" && (
                <p className={`body ${styles.aviso}`}>Buscando las imágenes de Sentinel-2 de la parcela. La primera vez tarda uno o dos minutos; mientras, abajo está lo que declaró el productor.</p>
            )}
            {estado.estado === "error" && (
                <p className={`body ${styles.aviso}`}>
                    No pudimos traer las imágenes del satélite ({estado.mensaje}). Abajo está lo que declaró el productor; probá recargar en unos minutos.
                </p>
            )}

            {contraste && (
                <>
                    <Resumen contraste={contraste} />
                    <figure className={styles.grafico}>
                        <GraficoContraste contraste={contraste} eventos={eventosPorId} seleccionado={abierto} onSeleccionar={elegirEnGrafico} />
                        <Leyenda contraste={contraste} />
                        <p className={`small ${styles.secundario}`}>Pasá el mouse o tocá un punto para ver qué pasó ese día.</p>
                        <Fuente>
                            {contraste.fuentes.satelite} · {contraste.fuentes.clima} · consultado {formatearFecha(contraste.generado)}
                        </Fuente>
                    </figure>
                </>
            )}

            {grupos
                .filter((g) => g.eventos.length > 0)
                .map((g) => (
                    <section key={g.titulo} className={styles.grupo} aria-label={g.titulo}>
                        <h3 className="etiqueta">{g.titulo}</h3>
                        <ol className={styles.lista}>
                            {g.eventos.map((e) => (
                                <ItemContrastado
                                    key={e.id}
                                    evento={e}
                                    resultado={porEvento.get(e.id)}
                                    cargando={estado.estado === "cargando"}
                                    abierto={abierto === e.id}
                                    onAlternar={() => alternar(e.id)}
                                    serie={contraste?.serie ?? []}
                                />
                            ))}
                        </ol>
                    </section>
                ))}
        </Card>
    );
}
