import { useRef, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Pestanas.module.css";

export type Pestana<Id extends string> = {
    id: Id;
    etiqueta: string;
    // Algo chico al lado del nombre: un ícono de carga, un contador.
    insignia?: ReactNode;
};

type Props<Id extends string> = {
    pestanas: Pestana<Id>[];
    activa: Id;
    onCambiar: (id: Id) => void;
    etiqueta: string; // nombre accesible del grupo
    idBase: string; // para enlazar cada pestaña con su panel (`${idBase}-panel-${id}`)
};

// Patrón de pestañas de WAI-ARIA: una sola pestaña en el orden de tabulación y
// las flechas se mueven entre ellas.
export function Pestanas<Id extends string>({ pestanas, activa, onCambiar, etiqueta, idBase }: Props<Id>) {
    const botones = useRef<(HTMLButtonElement | null)[]>([]);

    const mover = (e: KeyboardEvent, indice: number) => {
        const destino = { ArrowRight: indice + 1, ArrowLeft: indice - 1, Home: 0, End: pestanas.length - 1 }[e.key];
        if (destino === undefined) return;
        e.preventDefault();
        const siguiente = (destino + pestanas.length) % pestanas.length;
        onCambiar(pestanas[siguiente].id);
        botones.current[siguiente]?.focus();
    };

    return (
        <div className={styles.lista} role="tablist" aria-label={etiqueta}>
            {pestanas.map((p, i) => (
                <button
                    key={p.id}
                    ref={(el) => {
                        botones.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${idBase}-pestana-${p.id}`}
                    aria-selected={p.id === activa}
                    aria-controls={`${idBase}-panel-${p.id}`}
                    tabIndex={p.id === activa ? 0 : -1}
                    className={styles.pestana}
                    onClick={() => onCambiar(p.id)}
                    onKeyDown={(e) => mover(e, i)}
                >
                    {p.etiqueta}
                    {p.insignia}
                </button>
            ))}
        </div>
    );
}

export function PanelPestana({ idBase, id, children }: { idBase: string; id: string; children: ReactNode }) {
    return (
        <div role="tabpanel" id={`${idBase}-panel-${id}`} aria-labelledby={`${idBase}-pestana-${id}`} tabIndex={0} className={styles.panel}>
            {children}
        </div>
    );
}
