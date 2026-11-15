import { useId } from "react";
import type { UsoCatalogo } from "../../api/catalogo";
import { aMayusculas, type BorradorCultivo } from "./cultivo";
import { useCultivares, useEspecies } from "./useCatalogo";
import styles from "./eventos.module.css";

type Props = {
    uso: UsoCatalogo;
    borrador: BorradorCultivo;
    onCambiar: (borrador: BorradorCultivo) => void;
};

// Especie siempre del catálogo oficial; cultivar del catálogo si está, y si no,
// declarado por el productor. Las dos cosas se ven antes de guardar.
export function CampoCultivo({ uso, borrador, onCambiar }: Props) {
    const idEspecies = useId();
    const idCultivares = useId();
    const { especies, error } = useEspecies(uso);
    const especie = especies.find((e) => e.especie === aMayusculas(borrador.especie.trim()));
    const sugerencias = useCultivares(especie?.especie ?? "", borrador.cultivar);
    const inscripto = sugerencias.find((c) => c.nombre === aMayusculas(borrador.cultivar.trim()));

    return (
        <div className={styles.grillaCampos}>
            <label className={styles.campo}>
                <span className="etiqueta">Especie</span>
                <input
                    className="body"
                    list={idEspecies}
                    value={borrador.especie}
                    placeholder={uso === "cultivo" ? "Ej.: TOMATE" : "Ej.: VICIA VILLOSA"}
                    onChange={(e) => onCambiar({ especie: e.target.value, cultivar: "" })}
                    aria-describedby={`${idEspecies}-ayuda`}
                />
                <datalist id={idEspecies}>
                    {especies.map((e) => (
                        <option key={e.especie} value={e.especie}>
                            {e.nombre_familia ?? ""}
                        </option>
                    ))}
                </datalist>
                <span id={`${idEspecies}-ayuda`} className={`small ${styles.ayuda}`}>
                    {error && "Catálogo del INASE no disponible."}
                    {!error && especie && `${especie.nombre_familia ?? "Familia sin dato"} · ${especie.cultivares} cultivares inscriptos`}
                    {!error && !especie && borrador.especie && "Elegí una especie de la lista del INASE."}
                </span>
            </label>

            <label className={styles.campo}>
                <span className="etiqueta">Cultivar o variedad</span>
                <input
                    className="body"
                    list={idCultivares}
                    value={borrador.cultivar}
                    disabled={!especie}
                    placeholder={especie ? "Buscar cultivar" : "Primero elegí la especie"}
                    onChange={(e) => onCambiar({ ...borrador, cultivar: e.target.value })}
                    aria-describedby={`${idCultivares}-ayuda`}
                />
                <datalist id={idCultivares}>
                    {sugerencias.map((c) => (
                        <option key={c.numero} value={c.nombre}>
                            {c.solicitante ?? ""}
                        </option>
                    ))}
                </datalist>
                <span id={`${idCultivares}-ayuda`} className={`small ${styles.ayuda}`}>
                    {inscripto && (
                        <>
                            Inscripto en el INASE · <span className="dato">n.º {inscripto.numero}</span>
                        </>
                    )}
                    {!inscripto && borrador.cultivar.trim() && "No inscripto en el INASE."}
                </span>
            </label>
        </div>
    );
}
