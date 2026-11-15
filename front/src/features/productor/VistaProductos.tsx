import { Plus } from "lucide-react";
import { useState } from "react";
import type { Producto } from "../../api/fixtures/productor";
import { Button } from "../../design-system";
import { CabeceraVista } from "./CabeceraVista";
import { Chip } from "./Chip";
import type { ProductoNuevo } from "./estadoProductor";
import { FormularioProducto } from "./FormularioProducto";
import { ModalQr } from "./ModalQr";
import { TarjetaProducto } from "./TarjetaProducto";
import styles from "./productos.module.css";
import vistas from "./vistas.module.css";

type Props = { productos: Producto[]; onAgregar: (datos: ProductoNuevo) => void };

export function VistaProductos({ productos, onAgregar }: Props) {
    const [cargando, setCargando] = useState(false);
    const [conQr, setConQr] = useState<Producto | null>(null);

    const agregar = (datos: ProductoNuevo) => {
        onAgregar(datos);
        setCargando(false);
    };

    return (
        <section className={vistas.vista}>
            <CabeceraVista
                seccion="Productos y QR"
                titulo="Cargá tu cosecha y generá su QR"
                bajada="Cada producto lleva fecha de plantación, químicos, cosecha y reparto. El QR se emite según la cobertura del lote."
                fuente="Datos de demostración"
                acciones={
                    !cargando && (
                        <Button variante="primario" onClick={() => setCargando(true)} className={styles.botonIcono}>
                            <Plus size={18} strokeWidth={1.5} aria-hidden />
                            Nuevo producto
                        </Button>
                    )
                }
            />

            {cargando ? (
                <FormularioProducto onCargar={agregar} onCancelar={() => setCargando(false)} />
            ) : (
                <>
                    <div className={vistas.cabeceraPanel}>
                        <h2 className="subtitulo">Productos cargados</h2>
                        <Chip tono="oliva">
                            <span className="dato">{productos.length}</span> {productos.length === 1 ? "producto" : "productos"}
                        </Chip>
                    </div>
                    <div className={styles.lista}>
                        {productos.map((producto) => (
                            <TarjetaProducto key={producto.n} producto={producto} onVerQr={() => setConQr(producto)} />
                        ))}
                    </div>
                </>
            )}

            {conQr && <ModalQr producto={conQr} onCerrar={() => setConQr(null)} />}
        </section>
    );
}
