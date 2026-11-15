import { Camera, CloudHail, Droplets, FlaskConical, Layers, Leaf, Scissors, Shovel, SprayCan, Sprout, Wheat, type LucideIcon } from "lucide-react";
import type { TipoEvento } from "../../api/eventos";
import type { UsoCatalogo } from "../../api/catalogo";

export type Campo =
    | { clave: string; etiqueta: string; tipo: "opciones"; opciones: string[]; obligatorio?: boolean }
    | { clave: string; etiqueta: string; tipo: "texto"; ayuda?: string; obligatorio?: boolean }
    | { clave: string; etiqueta: string; tipo: "numero"; unidad: string; obligatorio?: boolean };

export type DefinicionEvento = {
    nombre: string;
    Icono: LucideIcon;
    // Si lleva especie y cultivar del catálogo del INASE, y de qué grupo.
    cultivo?: UsoCatalogo;
    campos: Campo[];
    // Lo que el satélite puede decir de este evento (docs/proyecto/plan.md, "Fase C").
    contraste: string;
    // Cuándo lleva foto: la de la cosecha es optativa; la foto del cultivo es el evento.
    foto?: "opcional" | "obligatoria";
    // Sólo tiene sentido con un cultivo en pie (producción abierta).
    conCultivoEnPie?: boolean;
};

// El orden es el del ciclo en la parcela: preparar, plantar, cuidar, cosechar.
export const TIPOS_EVENTO: Record<TipoEvento, DefinicionEvento> = {
    labranza: {
        nombre: "Labranza",
        Icono: Shovel,
        campos: [{ clave: "labor", etiqueta: "Labor", tipo: "opciones", opciones: ["Arada", "Rastra", "Rotovator", "Subsolado", "Otra"], obligatorio: true }],
        contraste: "El satélite ve si se fue el rastrojo y quedó el suelo expuesto."
    },
    siembra: {
        nombre: "Siembra o trasplante",
        Icono: Sprout,
        cultivo: "cultivo",
        campos: [
            { clave: "metodo", etiqueta: "Cómo", tipo: "opciones", opciones: ["Siembra directa", "Trasplante"], obligatorio: true },
            { clave: "semilla", etiqueta: "Semilla", tipo: "opciones", opciones: ["Fiscalizada", "Identificada", "Propia"], obligatorio: true }
        ],
        contraste: "El satélite confirma que el verde sube en las semanas siguientes."
    },
    cobertura: {
        nombre: "Siembra de cobertura o abono verde",
        Icono: Leaf,
        cultivo: "cobertura",
        campos: [],
        contraste: "El satélite confirma el verde en un período que si no quedaría sin cultivo."
    },
    riego: {
        nombre: "Riego",
        Icono: Droplets,
        campos: [
            { clave: "metodo", etiqueta: "Método", tipo: "opciones", opciones: ["Goteo", "Aspersión", "Surco o gravedad"], obligatorio: true },
            { clave: "lamina", etiqueta: "Lámina", tipo: "numero", unidad: "mm" }
        ],
        contraste: "Con cultivo en pie, el satélite puede ver subir el agua en la planta."
    },
    fertilizacion: {
        nombre: "Fertilización",
        Icono: FlaskConical,
        campos: [
            { clave: "origen", etiqueta: "Tipo", tipo: "opciones", opciones: ["Orgánica (compost, guano)", "Química"], obligatorio: true },
            { clave: "producto", etiqueta: "Producto", tipo: "texto", obligatorio: true },
            { clave: "dosis", etiqueta: "Dosis", tipo: "texto", ayuda: "Ej.: 2 t/ha" }
        ],
        contraste: "Puede verse como más vigor semanas después; es un indicio, no una confirmación."
    },
    fitosanitario: {
        nombre: "Aplicación fitosanitaria",
        Icono: SprayCan,
        campos: [
            { clave: "clase", etiqueta: "Tipo", tipo: "opciones", opciones: ["Herbicida", "Insecticida", "Fungicida", "Biológico", "Otro"], obligatorio: true },
            { clave: "producto", etiqueta: "Producto", tipo: "texto", obligatorio: true },
            { clave: "dosis", etiqueta: "Dosis", tipo: "texto" },
            { clave: "carencia", etiqueta: "Período de carencia", tipo: "numero", unidad: "días" }
        ],
        contraste: "No se ve desde el satélite: queda como dato declarado para el consumidor."
    },
    desmalezado: {
        nombre: "Desmalezado o mulching",
        Icono: Scissors,
        campos: [{ clave: "metodo", etiqueta: "Cómo", tipo: "opciones", opciones: ["Desmalezado manual", "Desmalezado mecánico", "Mulching plástico", "Mulching orgánico"], obligatorio: true }],
        contraste: "Casi no se ve desde el satélite; el mulching plástico puede confundir la lectura."
    },
    incorporacion: {
        nombre: "Incorporación o rolado de cobertura",
        Icono: Layers,
        campos: [{ clave: "metodo", etiqueta: "Cómo", tipo: "opciones", opciones: ["Rolado", "Incorporación con disco", "Corte y mulch"], obligatorio: true }],
        contraste: "El satélite ve bajar el verde y aparecer rastrojo o suelo trabajado."
    },
    cosecha: {
        nombre: "Cosecha",
        Icono: Wheat,
        // Qué se cosecha no se pregunta: es lo que se plantó (la producción abierta).
        campos: [{ clave: "cantidad", etiqueta: "Cantidad cosechada", tipo: "numero", unidad: "kg", obligatorio: true }],
        contraste: "El satélite confirma la caída del verde.",
        foto: "opcional",
        conCultivoEnPie: true
    },
    dano_climatico: {
        nombre: "Daño por clima",
        Icono: CloudHail,
        campos: [
            { clave: "causa", etiqueta: "Causa", tipo: "opciones", opciones: ["Helada", "Granizo", "Viento", "Inundación"], obligatorio: true },
            { clave: "magnitud", etiqueta: "Daño", tipo: "opciones", opciones: ["Leve", "Moderado", "Total"], obligatorio: true }
        ],
        contraste: "Las heladas se cruzan con la temperatura mínima de NASA POWER."
    },
    foto: {
        nombre: "Foto del cultivo",
        Icono: Camera,
        campos: [],
        contraste: "No es un dato del satélite: muestra a quien compra cómo viene creciendo el cultivo.",
        foto: "obligatoria",
        conCultivoEnPie: true
    }
};

export const ORDEN_TIPOS = Object.keys(TIPOS_EVENTO) as TipoEvento[];
