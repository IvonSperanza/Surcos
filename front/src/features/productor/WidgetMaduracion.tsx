import { Wheat } from "lucide-react";
import { useState } from "react";
import type { Maduracion, Rubro } from "../../api/fixtures/productor";
import { Button, Card, Fuente } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import formulario from "./formulario.module.css";
import styles from "./widgets.module.css";

type Borrador = Omit<Maduracion, "actualizado">;

const RUBROS: { valor: Rubro; nombre: string }[] = [
    { valor: "frutas", nombre: "Frutas" },
    { valor: "vinos", nombre: "Vinos" },
    { valor: "hortalizas", nombre: "Hortalizas" },
    { valor: "granos", nombre: "Granos" }
];

// Qué se mide para decidir la cosecha depende del rubro: azúcar en uva y
// fruta, firmeza en fruta y hortaliza, humedad en el grano.
const MIDE_BRIX: Rubro[] = ["frutas", "vinos"];
const MIDE_FIRMEZA: Rubro[] = ["frutas", "hortalizas"];

type Props = { maduracion: Maduracion; onGuardar: (borrador: Borrador) => void };

export function WidgetMaduracion({ maduracion, onGuardar }: Props) {
    const [borrador, setBorrador] = useState<Borrador>(maduracion);
    const cambiar = (campo: keyof Borrador) => (e: { target: { value: string } }) => setBorrador((b) => ({ ...b, [campo]: e.target.value }));

    return (
        <Card className={styles.widget} aria-labelledby="widget-maduracion">
            <div className={styles.cabecera}>
                <span className={styles.icono} aria-hidden>
                    <Wheat size={18} strokeWidth={1.5} />
                </span>
                <h2 id="widget-maduracion" className="subtitulo">
                    Maduración y cosecha
                </h2>
            </div>

            <label className={formulario.campo}>
                <span className={`small ${formulario.nombreCampo}`}>Rubro</span>
                <select value={borrador.rubro} onChange={(e) => setBorrador((b) => ({ ...b, rubro: e.target.value as Rubro }))}>
                    {RUBROS.map((r) => (
                        <option key={r.valor} value={r.valor}>
                            {r.nombre}
                        </option>
                    ))}
                </select>
            </label>

            {MIDE_BRIX.includes(borrador.rubro) && (
                <label className={formulario.campo}>
                    <span className={`small ${formulario.nombreCampo}`}>Grados Brix</span>
                    <input className="dato" type="number" step="0.1" min="0" max="40" value={borrador.brix} onChange={cambiar("brix")} />
                </label>
            )}
            {MIDE_FIRMEZA.includes(borrador.rubro) && (
                <label className={formulario.campo}>
                    <span className={`small ${formulario.nombreCampo}`}>Firmeza / calibre</span>
                    <input type="text" maxLength={40} value={borrador.firmeza} onChange={cambiar("firmeza")} />
                </label>
            )}
            {borrador.rubro === "granos" && (
                <label className={formulario.campo}>
                    <span className={`small ${formulario.nombreCampo}`}>Humedad del grano (%)</span>
                    <input className="dato" type="number" step="0.1" min="0" max="40" value={borrador.humedad} onChange={cambiar("humedad")} />
                </label>
            )}
            <label className={formulario.campo}>
                <span className={`small ${formulario.nombreCampo}`}>Ventana estimada de recolección</span>
                <input type="text" maxLength={40} value={borrador.ventana} onChange={cambiar("ventana")} />
            </label>

            <Button className={styles.botonAncho} onClick={() => onGuardar(borrador)}>
                Actualizar parámetros
            </Button>
            <Fuente>
                Medición en campo · <span className="dato">{formatearFecha(maduracion.actualizado)}</span>
            </Fuente>
        </Card>
    );
}
