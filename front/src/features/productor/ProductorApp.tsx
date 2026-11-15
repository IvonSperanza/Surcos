import { Route, Routes, useNavigate } from "react-router-dom";
import { reiniciarParcelas } from "../../api/fixtures/parcelasEjemplo";
import { olvidarDatos } from "../parcelas/almacenDatos";
import { rutasPanel } from "./rutas";
import { usePreferenciaTema } from "../../lib/tema";
import { PanelLayout } from "./PanelLayout";
import { useAccionesProductor } from "./useAccionesProductor";
import { useEstadoProductor } from "./useEstadoProductor";
import { useToast } from "./useToast";
import { FichaParcela } from "../parcelas/FichaParcela";
import { NuevaParcela } from "../parcelas/NuevaParcela";
import { VistaParcelas } from "../parcelas/VistaParcelas";
import { VistaPagos } from "./VistaPagos";
import { VistaPedidos } from "./VistaPedidos";
import { FichaProduccion } from "../producciones/FichaProduccion";
import { VistaProducciones } from "../producciones/VistaProducciones";
import { VistaResumen } from "./VistaResumen";

// Se monta en App.tsx como /productor/*. Las vistas cuelgan de una ruta de
// layout sin path. Los enlaces del panel son absolutos (ver rutas.ts).
export function ProductorApp() {
    const { tema, cambiar: cambiarTema } = usePreferenciaTema();
    const { estado, setEstado, reiniciar, reinicios } = useEstadoProductor();
    const { mensaje, avisar } = useToast();
    const acciones = useAccionesProductor(estado, setEstado, avisar);

    const navegar = useNavigate();

    const reiniciarDemo = async () => {
        if (!window.confirm("¿Reiniciar la demo? Se borran todas las parcelas con sus eventos, también las que dibujaste, y se cargan las tres de ejemplo. Pedidos y pagos vuelven al inicio.")) return;
        (await reiniciarParcelas()).forEach(olvidarDatos);
        // Después de cargar: el reinicio remonta las vistas y leen las parcelas nuevas.
        reiniciar();
        navegar(rutasPanel.parcelas);
        avisar("Demo reiniciada.");
    };

    return (
        <Routes>
            <Route element={<PanelLayout key={reinicios} estado={estado} mensajeToast={mensaje} onReiniciar={() => void reiniciarDemo()} tema={tema} onCambiarTema={cambiarTema} />}>
                <Route index element={<VistaResumen estado={estado} />} />
                <Route path="parcelas" element={<VistaParcelas />} />
                <Route path="parcelas/nueva" element={<NuevaParcela />} />
                <Route path="parcelas/:id" element={<FichaParcela />} />
                <Route path="producciones" element={<VistaProducciones />} />
                <Route path="producciones/:id" element={<FichaProduccion />} />
                <Route path="pedidos" element={<VistaPedidos pedidos={estado.pedidos} onAvanzar={acciones.avanzarPedido} />} />
                <Route path="pagos" element={<VistaPagos pagos={estado.pagos} />} />
            </Route>
        </Routes>
    );
}
