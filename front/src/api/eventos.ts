// Eventos de manejo de una parcela: lo que el productor declara que hizo. Es
// la historia del lote que compra el consumidor, y lo que el satélite
// contrasta. Como las parcelas, viven en el back o, sin él, en el navegador.
import { api, conBack, type Envelope } from "./client";

export type TipoEvento =
    | "siembra"
    | "cosecha"
    | "labranza"
    | "cobertura"
    | "incorporacion"
    | "riego"
    | "fertilizacion"
    | "fitosanitario"
    | "desmalezado"
    | "dano_climatico"
    | "foto";

// Qué se plantó: especie oficial del INASE y cultivar. Si el cultivar no está
// en el catálogo, numeroInase es null y se muestra como declarado.
export type CultivoDeclarado = {
    especie: string;
    nombreCientifico: string;
    familia: string | null;
    nombreFamilia: string | null;
    cultivar: string;
    numeroInase: string | null;
};

// Una foto del evento. La sube el productor (url: data URL ya achicada); las
// de los datos de ejemplo son de Wikimedia Commons y llevan su crédito.
export type FotoEvento = {
    url: string;
    credito: { autor: string; licencia: string; pagina: string } | null;
};

export type Evento = {
    id: string;
    parcelaId: string;
    tipo: TipoEvento;
    fecha: string; // "YYYY-MM-DD", el día en que se hizo
    cultivo: CultivoDeclarado | null; // siembra y cobertura
    detalles: Record<string, string>; // campos propios de cada tipo
    notas: string;
    foto?: FotoEvento | null; // opcional: los eventos guardados antes no la tienen
    produccionId?: string | null; // la asigna el back: la siembra abre una producción
    registrado: string; // ISO, cuándo se cargó
};

export type EventoNuevo = Omit<Evento, "id" | "registrado">;

const CLAVE = "surco-eventos-v1";

function leer(): Evento[] {
    try {
        const guardado: unknown = JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
        return Array.isArray(guardado) ? (guardado as Evento[]) : [];
    } catch {
        return [];
    }
}

// false si el navegador no tiene lugar (las fotos ocupan) o no deja guardar.
function escribir(eventos: Evento[]): boolean {
    try {
        window.localStorage.setItem(CLAVE, JSON.stringify(eventos));
        return true;
    } catch {
        return false;
    }
}

let enMemoria: Evento[] | null = null;

function todos(): Evento[] {
    enMemoria ??= leer();
    return enMemoria;
}

// Sin almacenamiento, los eventos duran hasta recargar.
function guardarTodos(eventos: Evento[]): boolean {
    enMemoria = eventos;
    return escribir(eventos);
}

// Del más reciente al más viejo: así se lee la historia en la ficha.
export async function listarEventos(parcelaId: string): Promise<Evento[]> {
    const eventos = conBack ? (await api.get<Envelope<Evento[]>>(`/eventos?parcelaId=${parcelaId}`)).data : todos();
    return eventos
        .filter((e) => e.parcelaId === parcelaId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.registrado.localeCompare(a.registrado));
}

// La foto viaja aparte, como archivo: el evento guarda sólo su URL. Las de
// ejemplo ya son una URL; las que saca el productor llegan como data URL.
async function subirFoto(foto: FotoEvento): Promise<FotoEvento> {
    if (!foto.url.startsWith("data:")) return foto;
    const formulario = new FormData();
    formulario.append("foto", await (await fetch(foto.url)).blob(), "foto.jpg");
    const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/fotos`, { method: "POST", body: formulario });
    if (!respuesta.ok) throw new Error("No se pudo subir la foto. Probá de nuevo o guardá el evento sin foto.");
    const { data } = (await respuesta.json()) as Envelope<{ url: string }>;
    return { ...foto, url: data.url };
}

export async function crearEvento(nuevo: EventoNuevo): Promise<Evento> {
    if (conBack) {
        const foto = nuevo.foto ? await subirFoto(nuevo.foto) : null;
        return (await api.post<Envelope<Evento>>("/eventos", { ...nuevo, foto })).data;
    }
    const evento: Evento = { ...nuevo, id: crypto.randomUUID(), registrado: new Date().toISOString() };
    const anteriores = todos();
    // Una foto que no entra no se pierde en silencio al recargar: se avisa.
    if (!guardarTodos([...anteriores, evento]) && evento.foto) {
        guardarTodos(anteriores);
        throw new Error("No queda lugar en este navegador para guardar la foto. Probá sin foto o eliminá eventos viejos con foto.");
    }
    return evento;
}

// Para los que ya traen id, como los de ejemplo.
export async function agregarEventos(eventos: Evento[]): Promise<void> {
    guardarTodos([...todos(), ...eventos]);
}

export async function eliminarEvento(id: string): Promise<void> {
    if (conBack) {
        await api.del(`/eventos/${id}`);
        return;
    }
    guardarTodos(todos().filter((e) => e.id !== id));
}

// Con back no hace falta: se borran con la parcela.
export async function eliminarEventosDeParcela(parcelaId: string): Promise<void> {
    if (conBack) return;
    guardarTodos(todos().filter((e) => e.parcelaId !== parcelaId));
}

export async function listarTodosLosEventos(): Promise<Evento[]> {
    return [...todos()];
}

export async function eliminarTodosLosEventos(): Promise<void> {
    guardarTodos([]);
}
