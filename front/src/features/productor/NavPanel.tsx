import { ClipboardList, CreditCard, LayoutGrid, MapPin, Package, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import styles from "./panel.module.css";

type Seccion = { ruta: string; nombre: string; Icono: LucideIcon };

const SECCIONES: Seccion[] = [
    { ruta: "", nombre: "Resumen", Icono: LayoutGrid },
    { ruta: "lote", nombre: "Mi lote", Icono: MapPin },
    { ruta: "productos", nombre: "Productos y QR", Icono: Package },
    { ruta: "pedidos", nombre: "Pedidos", Icono: ClipboardList },
    { ruta: "pagos", nombre: "Pagos", Icono: CreditCard }
];

const claseItem = ({ isActive }: { isActive: boolean }) => [styles.itemNav, isActive && styles.itemNavActivo].filter(Boolean).join(" ");

export function NavPanel({ pendientes }: { pendientes: number }) {
    return (
        <nav className={styles.nav} aria-label="Secciones del panel">
            {SECCIONES.map(({ ruta, nombre, Icono }) => (
                <NavLink key={nombre} to={ruta} end className={claseItem}>
                    <Icono size={20} strokeWidth={1.5} aria-hidden />
                    <span>{nombre}</span>
                    {ruta === "pedidos" && pendientes > 0 && (
                        <span className={`dato ${styles.insignia}`}>
                            {pendientes}
                            <span className={styles.soloLector}> pendientes</span>
                        </span>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
