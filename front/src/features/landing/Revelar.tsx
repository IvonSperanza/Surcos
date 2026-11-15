import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import type { Tema } from "../../lib/tema";
import styles from "./landing.module.css";

type Props = {
    as?: ElementType;
    className?: string;
    // Posición entre sus hermanos: escalona la entrada de una grilla.
    orden?: number;
    // Para un bloque en otro tema que la página (ej. un panel Noche en la landing Día).
    tema?: Tema;
    children: ReactNode;
};

// Aparece al entrar en pantalla, una sola vez. Con movimiento reducido el CSS
// la muestra directamente en su estado final.
export function Revelar({ as: Etiqueta = "div", className, orden = 0, tema, children }: Props) {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const elemento = ref.current;
        if (!elemento) return;
        const observador = new IntersectionObserver(
            ([entrada]) => {
                if (entrada.isIntersecting) {
                    setVisible(true);
                    observador.disconnect();
                }
            },
            { rootMargin: "0px 0px -8% 0px" }
        );
        observador.observe(elemento);
        return () => observador.disconnect();
    }, []);

    const clases = [styles.revelar, visible && styles.visible, className].filter(Boolean).join(" ");
    return (
        <Etiqueta ref={ref} className={clases} data-theme={tema} style={{ transitionDelay: `${orden * 80}ms` }}>
            {children}
        </Etiqueta>
    );
}
