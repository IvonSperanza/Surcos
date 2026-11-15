import { ClipboardList, CreditCard, LayoutGrid, MapPin, RotateCcw, Wheat, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import styles from "./panel.module.css";
import { rutasPanel } from "./rutas";

type Seccion = { ruta: string; nombre: string; Icono: LucideIcon };

const SECCIONES: Seccion[] = [
    { ruta: rutasPanel.resumen, nombre: "Resumen", Icono: LayoutGrid },
    { ruta: rutasPanel.parcelas, nombre: "Mis parcelas", Icono: MapPin },
    { ruta: rutasPanel.producciones, nombre: "Producciones", Icono: Wheat },
    { ruta: rutasPanel.pedidos, nombre: "Pedidos", Icono: ClipboardList },
    { ruta: rutasPanel.pagos, nombre: "Pagos", Icono: CreditCard }
];

const claseItem = ({ isActive }: { isActive: boolean }) => [styles.itemNav, isActive && styles.itemNavActivo].filter(Boolean).join(" ");

export function NavPanel({ pendientes, onReiniciar }: { pendientes: number; onReiniciar: () => void }) {
    return (
        <nav className={styles.nav} aria-label="Secciones del panel">
            {SECCIONES.map(({ ruta, nombre, Icono }) => (
                // Sólo Resumen exige ruta exacta: "Mis parcelas" sigue marcada dentro de una ficha.
                <NavLink key={nombre} to={ruta} end={ruta === rutasPanel.resumen} className={claseItem}>
                    <Icono size={20} strokeWidth={1.5} aria-hidden />
                    <span>{nombre}</span>
                    {ruta === rutasPanel.pedidos && pendientes > 0 && (
                        <span className={`dato ${styles.insignia}`}>
                            {pendientes}
                            <span className={styles.soloLector}> pendientes</span>
                        </span>
                    )}
                </NavLink>
            ))}
            <button type="button" className={`small ${styles.reiniciar}`} onClick={onReiniciar}>
                <RotateCcw size={16} strokeWidth={1.5} aria-hidden />
                Reiniciar demo
            </button>
        </nav>
    );
}
