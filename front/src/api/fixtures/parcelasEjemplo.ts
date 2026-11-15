import { crearEvento, eliminarTodosLosEventos, type CultivoDeclarado, type EventoNuevo, type FotoEvento } from "../eventos";
import type { PoligonoGeoJson } from "../ndvi";
import { crearParcela, eliminarTodasLasParcelas, listarParcelas } from "../parcelas";
import CREDITOS from "./fotosEjemplo.json";

// Parcelas reales de una quinta del cinturón hortícola de Rosario (al sudeste de
// Soldini), con una historia de ejemplo armada para coincidir con lo que el
// satélite detectó en cada una: los ciclos de cultivo de los canteros, la
// helada del 3 jul 2026 que registró NASA POWER. Cultivares y números, del
// catálogo del INASE. Los eventos son de demostración; los datos satelitales,
// reales. Las fotos son de huertas reales (Wikimedia Commons, con su crédito)
// y ocupan el lugar de las que sacaría el productor.

const rectangulo = (oeste: number, norte: number, este: number, sur: number): PoligonoGeoJson => ({
    type: "Polygon",
    coordinates: [[[oeste, norte], [este, norte], [este, sur], [oeste, sur], [oeste, norte]]]
});

const LECHUGA = { especie: "LECHUGA", nombreCientifico: "Lactuca sativa L.", familia: "asteraceas", nombreFamilia: "Asteráceas" };
const ACELGA = { especie: "ACELGA", nombreCientifico: "Beta vulgaris L. var. vulgaris L.", familia: "amarantaceas", nombreFamilia: "Amarantáceas" };
const TOMATE = { especie: "TOMATE", nombreCientifico: "Lycopersicon lycopersicum (L.) Karst. ex", familia: "solanaceas", nombreFamilia: "Solanáceas" };
const VICIA = { especie: "VICIA VILLOSA ROTH", nombreCientifico: "Vicia villosa Roth", familia: "fabaceas", nombreFamilia: "Fabáceas (leguminosas)" };

const cultivo = (base: Omit<CultivoDeclarado, "cultivar" | "numeroInase">, cultivar: string, numeroInase: string | null): CultivoDeclarado => ({
    ...base,
    cultivar,
    numeroInase
});

const foto = (nombre: keyof typeof CREDITOS): FotoEvento => {
    const { autor, licencia, pagina } = CREDITOS[nombre];
    return { url: `/fotos-ejemplo/${nombre}.jpg`, credito: { autor, licencia, pagina } };
};

type EventoEjemplo = Omit<EventoNuevo, "parcelaId" | "notas" | "cultivo" | "detalles" | "foto"> & Partial<Pick<EventoNuevo, "notas" | "cultivo" | "detalles" | "foto">>;

const HISTORIA_CANTEROS: EventoEjemplo[] = [
    { tipo: "labranza", fecha: "2025-11-20", detalles: { labor: "Rotovator" } },
    { tipo: "siembra", fecha: "2025-12-05", cultivo: cultivo(LECHUGA, "CRIOLLA VERDE", "4402"), detalles: { metodo: "Trasplante", semilla: "Fiscalizada" } },
    { tipo: "riego", fecha: "2025-12-15", detalles: { metodo: "Goteo", lamina: "12" } },
    { tipo: "cosecha", fecha: "2025-12-30", cultivo: cultivo(LECHUGA, "CRIOLLA VERDE", "4402"), detalles: { cantidad: "8500" }, foto: foto("lechuga-criolla-verde") },
    { tipo: "labranza", fecha: "2026-03-20", detalles: { labor: "Rastra" } },
    { tipo: "siembra", fecha: "2026-03-28", cultivo: cultivo(ACELGA, "VERDE ANUAL SEL SAN PEDRO INTA", "974"), detalles: { metodo: "Siembra directa", semilla: "Fiscalizada" } },
    { tipo: "fertilizacion", fecha: "2026-04-15", detalles: { origen: "Orgánica (compost, guano)", producto: "Compost de la quinta", dosis: "3 t/ha" } },
    { tipo: "fitosanitario", fecha: "2026-04-25", detalles: { clase: "Biológico", producto: "Bacillus thuringiensis", carencia: "0" } },
    { tipo: "cosecha", fecha: "2026-05-12", cultivo: cultivo(ACELGA, "VERDE ANUAL SEL SAN PEDRO INTA", "974"), detalles: { cantidad: "6200" }, foto: foto("acelga-verde-anual") },
    { tipo: "siembra", fecha: "2026-06-05", cultivo: cultivo(LECHUGA, "GALLEGA", "4403"), detalles: { metodo: "Trasplante", semilla: "Fiscalizada" } },
    { tipo: "dano_climatico", fecha: "2026-07-03", detalles: { causa: "Helada", magnitud: "Leve" }, notas: "Se quemaron las puntas de las hojas exteriores." },
    { tipo: "cosecha", fecha: "2026-07-08", cultivo: cultivo(LECHUGA, "GALLEGA", "4403"), detalles: { cantidad: "7800" }, foto: foto("lechuga-gallega-cosecha") },
    { tipo: "cobertura", fecha: "2026-08-01", cultivo: cultivo(VICIA, "ASCASUBI INTA", "16520") },
    { tipo: "incorporacion", fecha: "2026-09-25", detalles: { metodo: "Rolado" } },
    { tipo: "siembra", fecha: "2026-10-10", cultivo: cultivo(TOMATE, "PLATENSE J.J.GOMEZ", "958"), detalles: { metodo: "Trasplante", semilla: "Fiscalizada" } },
    { tipo: "riego", fecha: "2026-10-24", detalles: { metodo: "Goteo", lamina: "8" } },
    { tipo: "foto", fecha: "2026-11-08", notas: "Ya tutoradas con hilo.", foto: foto("tomate-platense-invernadero") }
];

const HISTORIA_OESTE: EventoEjemplo[] = [
    { tipo: "labranza", fecha: "2026-08-25", detalles: { labor: "Rotovator" } },
    { tipo: "siembra", fecha: "2026-09-10", cultivo: cultivo(LECHUGA, "GALLEGA", "4403"), detalles: { metodo: "Trasplante", semilla: "Identificada" } },
    { tipo: "riego", fecha: "2026-09-18", detalles: { metodo: "Goteo", lamina: "10" } },
    { tipo: "desmalezado", fecha: "2026-10-15", detalles: { metodo: "Desmalezado manual" } },
    { tipo: "foto", fecha: "2026-10-22", foto: foto("lechuga-gallega-en-pie") }
];

const EJEMPLOS = [
    { nombre: "Canteros junto al casco", geometria: rectangulo(-60.7329, -33.027, -60.7322, -33.0276), historia: HISTORIA_CANTEROS },
    { nombre: "Parcela verde del oeste", geometria: rectangulo(-60.7345, -33.0257, -60.7337, -33.026), historia: HISTORIA_OESTE },
    { nombre: "Lote extensivo vecino", geometria: rectangulo(-60.72432, -33.03173, -60.72368, -33.03227), historia: [] }
];

export async function hayParcelasEjemplo(): Promise<boolean> {
    const nombres = new Set((await listarParcelas()).map((p) => p.nombre));
    return EJEMPLOS.every((e) => nombres.has(e.nombre));
}

// Carga sólo las que falten: se puede apretar dos veces sin duplicar.
export async function cargarParcelasEjemplo(): Promise<void> {
    const existentes = new Set((await listarParcelas()).map((p) => p.nombre));
    for (const ejemplo of EJEMPLOS.filter((e) => !existentes.has(e.nombre))) {
        const parcela = await crearParcela({ nombre: ejemplo.nombre, geometria: ejemplo.geometria });
        for (const evento of ejemplo.historia) {
            await crearEvento({ notas: "", cultivo: null, detalles: {}, foto: null, ...evento, parcelaId: parcela.id });
        }
    }
}

// Deja el panel como al empezar la demo: sólo las parcelas de ejemplo, con su
// historia. Devuelve los ids borrados para olvidar sus datos satelitales.
export async function reiniciarParcelas(): Promise<string[]> {
    const borradas = (await listarParcelas()).map((p) => p.id);
    await eliminarTodasLasParcelas();
    await eliminarTodosLosEventos();
    await cargarParcelasEjemplo();
    return borradas;
}
