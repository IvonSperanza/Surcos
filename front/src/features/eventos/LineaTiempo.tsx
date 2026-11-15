import { Trash2 } from "lucide-react";
import type { Evento } from "../../api/eventos";
import { formatearFecha } from "../../lib/fecha";
import { CreditoFoto } from "./CreditoFoto";
import { tituloEvento } from "./textoEvento";
import { TIPOS_EVENTO } from "./tiposEvento";
import styles from "./eventos.module.css";

function detallesEvento(evento: Evento): string {
    const { campos } = TIPOS_EVENTO[evento.tipo];
    return campos
        .filter((c) => evento.detalles[c.clave])
        .map((c) => (c.tipo === "numero" ? `${c.etiqueta}: ${evento.detalles[c.clave]} ${c.unidad}` : evento.detalles[c.clave]))
        .join(" · ");
}

function OrigenCultivo({ evento }: { evento: Evento }) {
    if (!evento.cultivo) return null;
    const { numeroInase, nombreFamilia } = evento.cultivo;
    return (
        <p className={`small ${styles.ayuda}`}>
            {nombreFamilia ?? "Familia sin dato"} ·{" "}
            {numeroInase ? <span className="dato">INASE n.º {numeroInase}</span> : "no inscripto en el INASE"}
        </p>
    );
}

function ItemEvento({ evento, onEliminar }: { evento: Evento; onEliminar?: () => void }) {
    const { Icono } = TIPOS_EVENTO[evento.tipo];
    const detalles = detallesEvento(evento);
    return (
        <li className={styles.evento}>
            <p className={`dato ${styles.fechaEvento}`}>{formatearFecha(evento.fecha)}</p>
            <span className={styles.iconoEvento} aria-hidden>
                <Icono size={18} strokeWidth={1.5} />
            </span>
            <div className={styles.cuerpoEvento}>
                <h3 className="subtitulo">{tituloEvento(evento)}</h3>
                {detalles && <p className="body">{detalles}</p>}
                <OrigenCultivo evento={evento} />
                {evento.notas && <p className={`small ${styles.ayuda}`}>{evento.notas}</p>}
                {evento.foto && (
                    <figure className={styles.fotoEvento}>
                        <img src={evento.foto.url} alt={`Foto: ${tituloEvento(evento)}`} loading="lazy" />
                        <figcaption className={`small ${styles.ayuda}`}>
                            <CreditoFoto foto={evento.foto} />
                        </figcaption>
                    </figure>
                )}
            </div>
            {onEliminar && (
                <button type="button" className={styles.eliminar} onClick={onEliminar} aria-label={`Eliminar: ${tituloEvento(evento)}`}>
                    <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                </button>
            )}
        </li>
    );
}

// Eventos en orden, unidos por la línea del recorrido. Sin `onEliminar` es de
// sólo lectura (por ejemplo, dentro de una producción).
export function LineaTiempo({ eventos, onEliminar }: { eventos: Evento[]; onEliminar?: (evento: Evento) => void }) {
    return (
        <ol className={styles.lineaTiempo}>
            {eventos.map((e) => (
                <ItemEvento key={e.id} evento={e} onEliminar={onEliminar ? () => onEliminar(e) : undefined} />
            ))}
        </ol>
    );
}
