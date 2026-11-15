import { Route, Routes } from "react-router-dom";
import { PanelLayout } from "./PanelLayout";
import { useAccionesProductor } from "./useAccionesProductor";
import { useEstadoProductor } from "./useEstadoProductor";
import { useToast } from "./useToast";
import { VistaLote } from "./VistaLote";
import { VistaPagos } from "./VistaPagos";
import { VistaPedidos } from "./VistaPedidos";
import { VistaProductos } from "./VistaProductos";
import { VistaResumen } from "./VistaResumen";

// Se monta en App.tsx como /productor/*. Las vistas cuelgan de una ruta de
// layout sin path: así los NavLink relativos ("lote", "pedidos") resuelven
// contra /productor y no contra el segmento comodín.
export function ProductorApp() {
    const { estado, setEstado, reiniciar, reinicios } = useEstadoProductor();
    const { mensaje, avisar } = useToast();
    const acciones = useAccionesProductor(estado, setEstado, avisar);

    const reiniciarDemo = () => {
        reiniciar();
        avisar("Demo reiniciada.");
    };

    return (
        <Routes>
            <Route element={<PanelLayout key={reinicios} estado={estado} acciones={acciones} mensajeToast={mensaje} onReiniciar={reiniciarDemo} />}>
                <Route index element={<VistaResumen estado={estado} />} />
                <Route path="lote" element={<VistaLote />} />
                <Route path="productos" element={<VistaProductos productos={estado.productos} onAgregar={acciones.agregarProducto} />} />
                <Route path="pedidos" element={<VistaPedidos pedidos={estado.pedidos} onAvanzar={acciones.avanzarPedido} />} />
                <Route path="pagos" element={<VistaPagos pagos={estado.pagos} />} />
            </Route>
        </Routes>
    );
}
