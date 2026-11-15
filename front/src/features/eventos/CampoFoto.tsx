import { useId, useState } from "react";
import { Camera, X } from "lucide-react";
import { achicarFoto } from "../../lib/imagen";
import styles from "./eventos.module.css";

type Props = { etiqueta: string; url: string | null; onCambiar: (url: string | null) => void };

// En el celular, `capture` abre directo la cámara trasera.
export function CampoFoto({ etiqueta, url, onCambiar }: Props) {
    const id = useId();
    const [procesando, setProcesando] = useState(false);

    const elegir = async (archivo: File | undefined) => {
        if (!archivo) return;
        setProcesando(true);
        onCambiar(await achicarFoto(archivo));
        setProcesando(false);
    };

    return (
        <div className={styles.campo}>
            <span className="etiqueta">{etiqueta}</span>
            {url ? (
                <div className={styles.fotoElegida}>
                    <img src={url} alt="Foto elegida para el evento" />
                    <button type="button" className={`small ${styles.quitarFoto}`} onClick={() => onCambiar(null)}>
                        <X size={16} strokeWidth={1.5} aria-hidden />
                        Quitar foto
                    </button>
                </div>
            ) : (
                <label htmlFor={id} className={`body ${styles.elegirFoto}`}>
                    <Camera size={20} strokeWidth={1.5} aria-hidden />
                    {procesando ? "Procesando…" : "Agregar foto"}
                    <input
                        id={id}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className={styles.soloLector}
                        onChange={(e) => void elegir(e.target.files?.[0])}
                    />
                </label>
            )}
        </div>
    );
}
