import { useParams } from "react-router-dom";
import { Card, EnlaceBoton } from "../../design-system";
import { nombreCultivo } from "../eventos/textoEvento";
import { CabeceraVista } from "../productor/CabeceraVista";
import { rutasPanel } from "../productor/rutas";
import vistas from "../productor/vistas.module.css";
import { rutaPublica } from "../trazabilidad/rutas";
import { DetalleProduccion } from "./DetalleProduccion";
import { EstadoProduccion } from "./EstadoProduccion";
import { useProducciones } from "./useProducciones";
import styles from "./producciones.module.css";

export function FichaProduccion() {
    const { id = "" } = useParams();
    const producciones = useProducciones();
    const produccion = producciones?.find((p) => p.id === id);

    if (producciones === null) return <p className="body">Cargando…</p>;
    if (!produccion) {
        return (
            <Card>
                <h1 className="subtitulo">Producción no encontrada</h1>
                <EnlaceBoton to={rutasPanel.producciones}>Ver producciones</EnlaceBoton>
            </Card>
        );
    }

    return (
        <section className={vistas.vista} aria-label={nombreCultivo(produccion.cultivo)}>
            <CabeceraVista
                titulo={nombreCultivo(produccion.cultivo)}
                volver={{ to: rutasPanel.producciones, etiqueta: "Producciones" }}
                acciones={
                    <div className={styles.accionesFicha}>
                        <EstadoProduccion produccion={produccion} />
                        <EnlaceBoton to={rutaPublica(produccion.codigo)}>Página pública</EnlaceBoton>
                        {produccion.cosecha && <EnlaceBoton to={rutasPanel.etiqueta(produccion.id)}>Etiqueta</EnlaceBoton>}
                    </div>
                }
            />
            <DetalleProduccion produccion={produccion} enlaceParcela={rutasPanel.parcela(produccion.parcela.id)} />
        </section>
    );
}
