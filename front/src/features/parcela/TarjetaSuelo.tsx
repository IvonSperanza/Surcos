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
    const superficie = suelo.capas[0];

    return (
        <Card className={styles.tarjeta}>
            <h2 className="subtitulo">Suelo del lugar</h2>
            <div>
                <span className="etiqueta">Textura</span>
                <p className="titulo" style={{ margin: 0 }}>{conMayuscula(suelo.textura_superficial)}</p>
            </div>
            <p className="body">
                En los primeros 5 cm tiene <span className="dato">{valor(superficie.carbono_organico, 1)} g/kg</span> de carbono orgánico. Es la parte del
                suelo que más mejora con rotaciones y cobertura, y la que se pierde cuando queda desnudo.
            </p>
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
                {suelo.fuente} · estimación de un modelo con píxeles de {suelo.resolucion}, no una muestra de tu parcela
                {suelo.distancia_al_centro_m > 0 && ` · consultado a ${suelo.distancia_al_centro_m} m del centro, porque el punto exacto no tenía dato`}
            </Fuente>
        </Card>
    );
}
