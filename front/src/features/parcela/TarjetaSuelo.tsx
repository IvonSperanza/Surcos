import type { CapaSuelo, SueloParcela } from "../../api/suelo";
import { Card, Fuente } from "../../design-system";
import { formatearNumero } from "../../lib/numero";
import styles from "./parcela.module.css";

const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

const valor = (n: number | null, decimales = 0) => (n === null ? "—" : formatearNumero(n, decimales));

function FilaCapa({ capa }: { capa: CapaSuelo }) {
    return (
        <tr>
            <th scope="row" className="dato">{capa.profundidad.replace("cm", " cm")}</th>
            <td className="dato">{valor(capa.arcilla)} / {valor(capa.limo)} / {valor(capa.arena)}</td>
            <td className="dato">{valor(capa.carbono_organico, 1)}</td>
            <td className="dato">{valor(capa.ph, 1)}</td>
        </tr>
    );
}

export function TarjetaSuelo({ suelo }: { suelo: SueloParcela }) {
    return (
        <Card className={styles.tarjeta}>
            <h2 className="subtitulo">Suelo</h2>
            <div>
                <span className="etiqueta">Textura</span>
                <p className="titulo" style={{ margin: 0 }}>{conMayuscula(suelo.textura_superficial)}</p>
            </div>
            <table className={styles.tablaSuelo}>
                <thead>
                    <tr className="etiqueta">
                        <th scope="col">Profundidad</th>
                        <th scope="col">Arcilla / limo / arena %</th>
                        <th scope="col">Carbono g/kg</th>
                        <th scope="col">pH</th>
                    </tr>
                </thead>
                <tbody>
                    {suelo.capas.map((capa) => (
                        <FilaCapa key={capa.profundidad} capa={capa} />
                    ))}
                </tbody>
            </table>
            <Fuente>
                {suelo.fuente} · modelo a {suelo.resolucion}, no es una muestra
                {suelo.distancia_al_centro_m > 0 && ` · punto a ${suelo.distancia_al_centro_m} m del centro`}
            </Fuente>
        </Card>
    );
}
