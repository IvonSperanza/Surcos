import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import type { EstadoProductor } from "../../api/fixtures/productor";
import type { Tema } from "../../lib/tema";
import { Encabezado } from "./Encabezado";
import { contarPendientes } from "./estadoProductor";
import { NavPanel } from "./NavPanel";
import { Toast } from "./Toast";
import styles from "./panel.module.css";

type Props = {
    estado: EstadoProductor;
    mensajeToast: string;
    onReiniciar: () => void;
    tema: Tema;
    onCambiarTema: (tema: Tema) => void;
};

export function PanelLayout({ estado, mensajeToast, onReiniciar, tema, onCambiarTema }: Props) {
    const { pathname } = useLocation();

    // Al cambiar de vista se arranca desde arriba, como en una página nueva.
    useEffect(() => window.scrollTo(0, 0), [pathname]);

    return (
        <div className={styles.app}>
            <Encabezado tema={tema} onCambiarTema={onCambiarTema} />
            <div className={styles.shell}>
                <NavPanel pendientes={contarPendientes(estado.pedidos)} onReiniciar={onReiniciar} />

                <div className={styles.escenario}>
                    <main className={styles.main}>
                        <Outlet />
                    </main>
                </div>
            </div>
            <Toast mensaje={mensajeToast} />
        </div>
    );
}
