// Datos de demostración del panel del productor. Todavía no hay módulos de
// pedidos, productos ni pagos en el back: cuando existan, se reemplaza este
// fixture por funciones en api/<recurso>.ts con los mismos tipos.

export type Rubro = "hortalizas" | "frutas" | "vinos" | "granos";

export type EstadoPedido = "pendiente" | "confirmado" | "preparando" | "entregado" | "pagado";

export type EstadoPago = "pendiente" | "acreditado";

export type TipoComprador = "Mercado" | "PyME" | "Súper" | "Consumidor final";

export type LoteDemo = { id: string; nombre: string; cobertura: number };

export type Producto = {
    n: number;
    rubro: Rubro;
    cultivo: string;
    lote: string;
    plantacion: string;
    cosecha: string;
    reparto: string;
    quimicos: string;
    destino: TipoComprador;
    precio: number;
    unidad: string;
};

export type Pedido = {
    id: string;
    comprador: string;
    tipo: TipoComprador;
    detalle: string;
    fecha: string;
    total: number;
    estado: EstadoPedido;
};

export type Pago = {
    id: string;
    fecha: string;
    concepto: string;
    pedido: string;
    medio: string;
    monto: number;
    estado: EstadoPago;
};

export type Maduracion = {
    rubro: Rubro;
    brix: string;
    firmeza: string;
    humedad: string;
    ventana: string;
    actualizado: string;
};

export type EstadoProductor = {
    version: 2;
    proximoProducto: number;
    proximoPedido: number;
    proximoPago: number;
    reservaAceptada: boolean;
    maduracion: Maduracion;
    productos: Producto[];
    pedidos: Pedido[];
    pagos: Pago[];
};

export const FECHA_DEMO = "2026-11-14";

export const PRODUCTOR = {
    nombre: "La Arboleda",
    lote: "SC-2026-0417",
    zona: "cinturón verde, Rosario",
    campania: "Campaña 2026"
} as const;

// Cobertura vegetal anual de demostración: la real sale de Sentinel-2 en "Mi lote".
export const LOTES: LoteDemo[] = [
    { id: "SC-2026-0417", nombre: "La Arboleda", cobertura: 87 },
    { id: "SC-2026-0418", nombre: "La Cañada", cobertura: 78 },
    { id: "SC-2026-0419", nombre: "El Sauce", cobertura: 92 }
];

export const META_COBERTURA = 85;

export const DEMANDA_B2B = [
    { segmento: "PyMEs", cantidad: 3 },
    { segmento: "Mercados", cantidad: 2 },
    { segmento: "Súper", cantidad: 1 }
] as const;

export const PASOS_PASAPORTE = [
    { paso: "Datos de campaña", valor: "100%", completo: true },
    { paso: "Verificación satelital", valor: "100%", completo: true },
    { paso: "Cobertura vegetal anual", valor: "87%", completo: false },
    { paso: "Emisión del QR", valor: "Listo", completo: true }
] as const;

export const RESERVA_ANTICIPADA = {
    comprador: "Mercado del Puerto",
    tipo: "Mercado",
    detalle: "Reserva anticipada · 200 kg de tomate",
    total: 240000,
    sena: 72000,
    medioSena: "Mercado Pago"
} as const;

export const TIPOS_COMPRADOR: TipoComprador[] = ["Consumidor final", "Súper", "Mercado", "PyME"];

export function estadoInicialProductor(): EstadoProductor {
    return {
        version: 2,
        proximoProducto: 5,
        proximoPedido: 1043,
        proximoPago: 90,
        reservaAceptada: false,
        maduracion: {
            rubro: "frutas",
            brix: "23.5",
            firmeza: "Media · 22 mm",
            humedad: "13.8",
            ventana: "15–30 abr 2027",
            actualizado: FECHA_DEMO
        },
        productos: [
            { n: 1, rubro: "hortalizas", cultivo: "Bolsón de estación", lote: "SC-2026-0417", plantacion: "2026-08-12", cosecha: "2026-10-12", reparto: "2026-10-13", quimicos: "Ninguno", destino: "Consumidor final", precio: 4800, unidad: "bolsón" },
            { n: 2, rubro: "frutas", cultivo: "Cajón de frutillas", lote: "SC-2026-0417", plantacion: "2026-07-20", cosecha: "2026-10-10", reparto: "2026-10-11", quimicos: "Cobre (1 aplicación)", destino: "Súper", precio: 6200, unidad: "cajón" },
            { n: 3, rubro: "vinos", cultivo: "Malbec de La Arboleda", lote: "SC-2026-0419", plantacion: "2019-09-15", cosecha: "2026-03-22", reparto: "2026-04-05", quimicos: "Azufre y cobre", destino: "Mercado", precio: 9500, unidad: "botella" },
            { n: 4, rubro: "hortalizas", cultivo: "Acelga de la quinta", lote: "SC-2026-0418", plantacion: "2026-09-05", cosecha: "2026-11-08", reparto: "2026-11-09", quimicos: "Ninguno", destino: "PyME", precio: 2100, unidad: "atado" }
        ],
        pedidos: [
            { id: "PED-1042", comprador: "Mercado del Puerto", tipo: "Mercado", detalle: "40 bolsones + 10 cajones", fecha: "2026-10-14", total: 254000, estado: "pendiente" },
            { id: "PED-1041", comprador: "Verde Cerca", tipo: "PyME", detalle: "24 botellas de Malbec", fecha: "2026-10-12", total: 228000, estado: "confirmado" },
            { id: "PED-1040", comprador: "La Huerta", tipo: "Súper", detalle: "18 cajones de frutillas", fecha: "2026-10-10", total: 111600, estado: "preparando" },
            { id: "PED-1039", comprador: "Grupo de vecinos", tipo: "Consumidor final", detalle: "12 bolsones de estación", fecha: "2026-10-07", total: 57600, estado: "entregado" },
            { id: "PED-1038", comprador: "Mercado Central", tipo: "Mercado", detalle: "30 kg de acelga", fecha: "2026-10-02", total: 45000, estado: "pagado" },
            { id: "PED-1037", comprador: "Bodega Sur", tipo: "PyME", detalle: "12 botellas de Malbec", fecha: "2026-09-28", total: 114000, estado: "pagado" }
        ],
        pagos: [
            { id: "PAG-089", fecha: "2026-10-11", concepto: "Pedido PED-1040 · al entregar", pedido: "PED-1040", medio: "Transferencia", monto: 111600, estado: "pendiente" },
            { id: "PAG-088", fecha: "2026-10-09", concepto: "Pedido PED-1038 · acelga", pedido: "PED-1038", medio: "Transferencia", monto: 45000, estado: "acreditado" },
            { id: "PAG-087", fecha: "2026-10-03", concepto: "Pedido PED-1037 · Malbec", pedido: "PED-1037", medio: "Transferencia", monto: 114000, estado: "acreditado" },
            { id: "PAG-086", fecha: "2026-09-28", concepto: "Seña reserva Malbec", pedido: "", medio: "Mercado Pago", monto: 57000, estado: "acreditado" }
        ]
    };
}
