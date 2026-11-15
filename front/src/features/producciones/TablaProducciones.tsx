import { Link, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { formatearFecha } from "../../lib/fecha";
import { formatearNumero } from "../../lib/numero";
import { nombreEspecie } from "../eventos/textoEvento";
import { rutasPanel } from "../productor/rutas";
import { EstadoProduccion } from "./EstadoProduccion";
import { diasDeCultivo, fotoDeProduccion, type Produccion } from "./producciones";
import type { ProduccionDeParcela } from "./useProducciones";
import styles from "./producciones.module.css";

const SIN_DATO = <span className={styles.secundario}>—</span>;

function Miniatura({ produccion }: { produccion: Produccion }) {
    const conFoto = fotoDeProduccion(produccion);
    if (!conFoto) {
        return (
            <span className={`${styles.miniatura} ${styles.sinFoto}`} aria-hidden>
                <Sprout size={20} strokeWidth={1.5} />
            </span>
        );
    }
    return <img className={styles.miniatura} src={conFoto.foto.url} alt="" loading="lazy" />;
}

// Lo justo para ubicar cada producción; el resto, en su ficha.
export function TablaProducciones({ producciones, mostrarParcela = true }: { producciones: ProduccionDeParcela[]; mostrarParcela?: boolean }) {
    const navegar = useNavigate();
    return (
        <div className={styles.contenedorTabla}>
            <table className={styles.tabla}>
                <thead>
                    <tr className="etiqueta">
                        <th scope="col">Cultivo</th>
                        {mostrarParcela && <th scope="col">Parcela</th>}
                        <th scope="col">Siembra</th>
                        <th scope="col">Cosecha</th>
                        <th scope="col" className={styles.numero}>
                            Días de cultivo
                        </th>
                        <th scope="col" className={styles.numero}>
                            Cosechado
                        </th>
                        <th scope="col">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {producciones.map((p) => {
                        const ruta = rutasPanel.produccion(p.id);
                        const dias = diasDeCultivo(p);
                        return (
                            // La fila entera abre la ficha; el enlace del nombre es el camino accesible.
                            <tr key={p.id} className={styles.fila} onClick={() => navegar(ruta)}>
                                <td>
                                    <div className={styles.celdaCultivo}>
                                        <Miniatura produccion={p} />
                                        <div className={styles.nombreCultivo}>
                                            <Link to={ruta} className={styles.enlace} onClick={(e) => e.stopPropagation()}>
                                                {nombreEspecie(p.cultivo)}
                                            </Link>
                                            <span className={`small ${styles.secundario}`}>{p.cultivo.cultivar}</span>
                                        </div>
                                    </div>
                                </td>
                                {mostrarParcela && <td className="body">{p.parcela.nombre}</td>}
                                <td className={`dato ${styles.fecha}`}>{formatearFecha(p.siembra.fecha)}</td>
                                <td className={`dato ${styles.fecha}`}>{p.cosecha ? formatearFecha(p.cosecha.fecha) : SIN_DATO}</td>
                                <td className={`dato ${styles.numero}`}>{dias ?? SIN_DATO}</td>
                                <td className={`dato ${styles.numero}`}>{p.kg ? `${formatearNumero(p.kg)} kg` : SIN_DATO}</td>
                                <td>
                                    <EstadoProduccion produccion={p} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
