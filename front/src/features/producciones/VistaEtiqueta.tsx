import { useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { Button, Card, EnlaceBoton } from "../../design-system";
import { nombreCultivo } from "../eventos/textoEvento";
import { CabeceraVista } from "../productor/CabeceraVista";
import { rutasPanel } from "../productor/rutas";
import vistas from "../productor/vistas.module.css";
import { apuntaALocal, urlPublica } from "../trazabilidad/rutas";
import { EtiquetaProduccion } from "./EtiquetaProduccion";
import { useProducciones } from "./useProducciones";
import styles from "./etiqueta.module.css";

const POR_HOJA = 10;
const MAXIMO = 100;

export function VistaEtiqueta() {
    const { id = "" } = useParams();
    const producciones = useProducciones();
    const produccion = producciones?.find((p) => p.id === id);
    const [copias, setCopias] = useState(POR_HOJA);

    if (producciones === null) return <p className="body">Cargando…</p>;
    if (!produccion) {
        return (
            <Card>
                <h1 className="subtitulo">Producción no encontrada</h1>
                <EnlaceBoton to={rutasPanel.producciones}>Ver producciones</EnlaceBoton>
            </Card>
        );
    }

    const volver = { to: rutasPanel.produccion(produccion.id), etiqueta: nombreCultivo(produccion.cultivo) };
    if (!produccion.cosecha) {
        return (
            <section className={vistas.vista} aria-label="Etiqueta">
                <CabeceraVista titulo="Etiqueta" volver={volver} />
                <Card>
                    <p className="body">La etiqueta se imprime después de registrar la cosecha.</p>
                </Card>
            </section>
        );
    }

    const url = urlPublica(produccion.codigo);
    const etiqueta = <EtiquetaProduccion produccion={produccion} url={url} />;

    return (
        <section className={vistas.vista} aria-label="Etiqueta">
            <CabeceraVista
                titulo="Etiqueta"
                volver={volver}
                acciones={
                    <div className={styles.opciones}>
                        <label className={`small ${styles.copias}`}>
                            Copias
                            <input
                                type="number"
                                min={1}
                                max={MAXIMO}
                                value={copias}
                                onChange={(e) => setCopias(Math.min(MAXIMO, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
                            />
                        </label>
                        <Button variante="primario" onClick={() => window.print()}>
                            <Printer size={16} strokeWidth={1.5} aria-hidden />
                            Imprimir
                        </Button>
                    </div>
                }
            />

            <div className={styles.vistaPrevia}>
                {etiqueta}
                <p className={`small ${styles.secundario}`}>
                    90 × 50 mm · {POR_HOJA} por hoja A4 · el QR abre <span className={`dato ${styles.url}`}>{url}</span>
                </p>
                {apuntaALocal(url) && (
                    <p className={`small ${styles.secundario}`}>Esa dirección no abre desde un teléfono. Para imprimir las de verdad, configurá VITE_URL_PUBLICA.</p>
                )}
            </div>

            {createPortal(
                <div className={styles.hoja}>
                    {Array.from({ length: copias }, (_, i) => (
                        <EtiquetaProduccion key={i} produccion={produccion} url={url} />
                    ))}
                </div>,
                document.body
            )}
        </section>
    );
}
