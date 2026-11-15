import type { EventoInsert } from "../evento";
import type { PoligonoGeoJson } from "../parcela";
import type { ProductorInsert } from "../productor";
import CREDITOS from "./fotosEjemplo.json";

// Parcelas reales de una quinta del cinturón hortícola de Rosario (al sudeste
// de Soldini), con una historia de ejemplo armada para coincidir con lo que el
// satélite detectó en cada una: los ciclos de los canteros y la helada del
// 3 jul 2026 que registró NASA POWER. Cultivares y números, del catálogo del
// INASE. Los eventos son de demostración; los datos satelitales, reales. Las
// fotos son de huertas reales (Wikimedia Commons, con su crédito); las sirve
// el front en /fotos-ejemplo.

export const PRODUCTOR_EJEMPLO: ProductorInsert = {
    nombre: "Quinta de ejemplo",
    localidad: "Soldini, Santa Fe",
    descripcion: "",
    fotoUrl: null
};

const rectangulo = (oeste: number, norte: number, este: number, sur: number): PoligonoGeoJson => ({
    type: "Polygon",
    coordinates: [[[oeste, norte], [este, norte], [este, sur], [oeste, sur], [oeste, norte]]]
});

const LECHUGA = { especie: "LECHUGA", nombreCientifico: "Lactuca sativa L.", familia: "asteraceas", nombreFamilia: "Asteráceas" };
const ACELGA = { especie: "ACELGA", nombreCientifico: "Beta vulgaris L. var. vulgaris L.", familia: "amarantaceas", nombreFamilia: "Amarantáceas" };
const TOMATE = { especie: "TOMATE", nombreCientifico: "Lycopersicon lycopersicum (L.) Karst. ex", familia: "solanaceas", nombreFamilia: "Solanáceas" };
const VICIA = { especie: "VICIA VILLOSA ROTH", nombreCientifico: "Vicia villosa Roth", familia: "fabaceas", nombreFamilia: "Fabáceas (leguminosas)" };

const cultivo = (base: typeof LECHUGA, cultivar: string, numeroInase: string | null) => ({ ...base, cultivar, numeroInase });

const foto = (nombre: keyof typeof CREDITOS) => {
    const { autor, licencia, pagina } = CREDITOS[nombre];
    return { url: `/fotos-ejemplo/${nombre}.jpg`, credito: { autor, licencia, pagina } };
};

type EventoEjemplo = Pick<EventoInsert, "tipo" | "fecha"> & Partial<Omit<EventoInsert, "parcelaId">>;

const HISTORIA_CANTEROS: EventoEjemplo[] = [
    { tipo: "labranza", fecha: "2025-11-20", detalles: { labor: "Rotovator" } },
    { tipo: "siembra", fecha: "2025-12-05", cultivo: cultivo(LECHUGA, "CRIOLLA VERDE", "4402"), detalles: { metodo: "Trasplante", semilla: "Fiscalizada" } },
    { tipo: "riego", fecha: "2025-12-15", detalles: { metodo: "Goteo", lamina: "12" } },
    { tipo: "cosecha", fecha: "2025-12-30", detalles: { cantidad: "8500" }, foto: foto("lechuga-criolla-verde") },
    { tipo: "labranza", fecha: "2026-03-20", detalles: { labor: "Rastra" } },
    { tipo: "siembra", fecha: "2026-03-28", cultivo: cultivo(ACELGA, "VERDE ANUAL SEL SAN PEDRO INTA", "974"), detalles: { metodo: "Siembra directa", semilla: "Fiscalizada" } },
    { tipo: "fertilizacion", fecha: "2026-04-15", detalles: { origen: "Orgánica (compost, guano)", producto: "Compost de la quinta", dosis: "3 t/ha" } },
    { tipo: "fitosanitario", fecha: "2026-04-25", detalles: { clase: "Biológico", producto: "Bacillus thuringiensis", carencia: "0" } },
    { tipo: "cosecha", fecha: "2026-05-12", detalles: { cantidad: "6200" }, foto: foto("acelga-verde-anual") },
    { tipo: "siembra", fecha: "2026-06-05", cultivo: cultivo(LECHUGA, "GALLEGA", "4403"), detalles: { metodo: "Trasplante", semilla: "Fiscalizada" } },
    { tipo: "dano_climatico", fecha: "2026-07-03", detalles: { causa: "Helada", magnitud: "Leve" }, notas: "Se quemaron las puntas de las hojas exteriores." },
    { tipo: "cosecha", fecha: "2026-07-08", detalles: { cantidad: "7800" }, foto: foto("lechuga-gallega-cosecha") },
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

// En orden de creación: la última es la primera en la lista de parcelas.
export const PARCELAS_EJEMPLO = [
    { nombre: "Canteros junto al casco", geometria: rectangulo(-60.7329, -33.027, -60.7322, -33.0276), historia: HISTORIA_CANTEROS },
    { nombre: "Parcela verde del oeste", geometria: rectangulo(-60.7345, -33.0257, -60.7337, -33.026), historia: HISTORIA_OESTE },
    { nombre: "Lote extensivo vecino", geometria: rectangulo(-60.72432, -33.03173, -60.72368, -33.03227), historia: [] }
];
