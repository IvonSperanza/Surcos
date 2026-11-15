import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { EstadoProductor } from "../../api/fixtures/productor";
import { Encabezado } from "./Encabezado";
import { contarPendientes } from "./estadoProductor";
import { NavPanel } from "./NavPanel";
import { Toast } from "./Toast";
import type { AccionesProductor } from "./useAccionesProductor";
import { WidgetInteres } from "./WidgetInteres";
import { WidgetMaduracion } from "./WidgetMaduracion";
import { WidgetPagos } from "./WidgetPagos";
import { WidgetPasaporteSuelo } from "./WidgetPasaporteSuelo";
import styles from "./panel.module.css";

type Props = {
    estado: EstadoProductor;
    acciones: AccionesProductor;
    mensajeToast: string;
    onReiniciar: () => void;
};

export function PanelLayout({ estado, acciones, mensajeToast, onReiniciar }: Props) {
    const navegar = useNavigate();
    const { pathname } = useLocation();

    // Al cambiar de vista se arranca desde arriba, como en una página nueva.
    useEffect(() => window.scrollTo(0, 0), [pathname]);

    const reiniciar = () => {
        if (!window.confirm("¿Reiniciar la demo con los datos iniciales?")) return;
        onReiniciar();
        navegar("");
    };

    return (
        <div className={styles.app}>
            <Encabezado />
            <div className={styles.shell}>
                <NavPanel pendientes={contarPendientes(estado.pedidos)} />

                <div className={styles.escenario}>
                    <main className={styles.main}>
                        <Outlet />
                    </main>
                    <footer className={`small ${styles.pie}`}>
                        <p>Surco · demo de productor · NASA Space Apps Challenge 2026 · Sede Rosario (UCEL).</p>
                        <p>
                            Mi lote usa datos reales: NDVI e índices de Sentinel-2 L2A, clima y agua en las raíces de NASA POWER, suelo de SoilGrids.
                            Pedidos, productos, pagos y el pasaporte de suelo vivo son datos de demostración.
                        </p>
                    </footer>
                </div>

                <aside className={styles.lateral} aria-label="Estado del lote y cobros">
                    <WidgetPasaporteSuelo />
                    <WidgetMaduracion maduracion={estado.maduracion} onGuardar={acciones.guardarMaduracion} />
                    <WidgetInteres reservaAceptada={estado.reservaAceptada} onAceptar={acciones.aceptarReserva} />
                    <WidgetPagos pagos={estado.pagos} />
                    <button type="button" className={`small ${styles.reiniciar}`} onClick={reiniciar}>
                        <RotateCcw size={16} strokeWidth={1.5} aria-hidden />
                        Reiniciar demo
                    </button>
                </aside>
            </div>
            <Toast mensaje={mensajeToast} />
        </div>
    );
}
