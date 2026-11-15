import { Download, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import type { Producto } from "../../api/fixtures/productor";
import { Button, Fuente } from "../../design-system";
import { colorToken } from "../../lib/tokens";
import { idPasaporte } from "./estadoProductor";
import { SelloQr } from "./TarjetaProducto";
import styles from "./ModalQr.module.css";

const TAMANIO_QR = 192;

const ENFOCABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function descargar(canvas: HTMLCanvasElement | null, nombre: string) {
    if (!canvas) return;
    const enlace = document.createElement("a");
    enlace.href = canvas.toDataURL("image/png");
    enlace.download = `${nombre}.png`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
}

// Mantiene el foco dentro del diálogo mientras está abierto (aria-modal sólo
// lo anuncia; no impide tabular hacia la página de atrás).
function atraparTab(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    const enfocables = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(ENFOCABLES));
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
    }
}

export function ModalQr({ producto, onCerrar }: { producto: Producto; onCerrar: () => void }) {
    const botonCerrar = useRef<HTMLButtonElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const id = idPasaporte(producto.n);
    const url = `${window.location.origin}/p/${id}`;

    // El cierre se lee desde una ref para que el efecto de apertura corra una
    // sola vez: si dependiera de onCerrar, cada render del padre devolvería el
    // foco y lo volvería a tomar.
    const cerrarActual = useRef(onCerrar);
    useEffect(() => {
        cerrarActual.current = onCerrar;
    });

    useEffect(() => {
        const focoPrevio = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const overflowPrevio = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        botonCerrar.current?.focus();

        const alPresionar = (e: globalThis.KeyboardEvent) => e.key === "Escape" && cerrarActual.current();
        document.addEventListener("keydown", alPresionar);
        return () => {
            document.removeEventListener("keydown", alPresionar);
            document.body.style.overflow = overflowPrevio;
            focoPrevio?.focus();
        };
    }, []);

    const alClicFondo = (e: MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && onCerrar();

    return (
        <div className={styles.fondo} onClick={alClicFondo}>
            <div className={styles.dialogo} role="dialog" aria-modal="true" aria-labelledby="titulo-qr" onKeyDown={atraparTab}>
                <button ref={botonCerrar} type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
                    <X size={20} strokeWidth={1.5} aria-hidden />
                </button>
                <p className={`etiqueta ${styles.secundario}`}>Pasaporte QR</p>
                <h2 id="titulo-qr" className="subtitulo">
                    {producto.cultivo}
                </h2>
                <p className="dato">{id}</p>
                <div className={styles.marcoQr}>
                    <QRCodeCanvas
                        ref={canvas}
                        value={url}
                        size={TAMANIO_QR}
                        level="M"
                        marginSize={2}
                        fgColor={colorToken("ink")}
                        bgColor={colorToken("surface-raised")}
                        title={`Código QR del pasaporte ${id}`}
                    />
                </div>
                <SelloQr producto={producto} />
                <p className={`dato ${styles.url}`}>{url}</p>
                <Fuente>Escaneá para ver el lote, el productor y la cosecha.</Fuente>
                <div className={styles.acciones}>
                    <Button onClick={() => descargar(canvas.current, id)} className={styles.botonIcono}>
                        <Download size={18} strokeWidth={1.5} aria-hidden />
                        Descargar QR
                    </Button>
                    <Button onClick={onCerrar}>Cerrar</Button>
                </div>
            </div>
        </div>
    );
}
