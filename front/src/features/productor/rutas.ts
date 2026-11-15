// El panel se monta en App.tsx como `${RUTA_PANEL}/*` y adentro tiene sus
// propias <Routes>. Con ese comodín, react-router resuelve los enlaces
// relativos ("pedidos", "..") contra la URL completa y no contra el panel, así
// que se acumulan: /productor/pedidos/pedidos. Por eso todo enlace o
// navegación del panel usa estas rutas absolutas.
export const RUTA_PANEL = "/productor";

export const rutasPanel = {
    resumen: RUTA_PANEL,
    parcelas: `${RUTA_PANEL}/parcelas`,
    nuevaParcela: `${RUTA_PANEL}/parcelas/nueva`,
    parcela: (id: string) => `${RUTA_PANEL}/parcelas/${id}`,
    producciones: `${RUTA_PANEL}/producciones`,
    produccion: (id: string) => `${RUTA_PANEL}/producciones/${id}`,
    pedidos: `${RUTA_PANEL}/pedidos`,
    pagos: `${RUTA_PANEL}/pagos`
};
