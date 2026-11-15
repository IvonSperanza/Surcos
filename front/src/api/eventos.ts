// Eventos de manejo de una parcela: lo que el productor declara que hizo. Es
// la historia del lote que compra el consumidor, y lo que el satélite
// contrasta. Como las parcelas, por ahora viven en el navegador con la misma
// forma que tendría la API del back.

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
    return todos()
        .filter((e) => e.parcelaId === parcelaId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.registrado.localeCompare(a.registrado));
}

export async function crearEvento(nuevo: EventoNuevo): Promise<Evento> {
    const evento: Evento = { ...nuevo, id: crypto.randomUUID(), registrado: new Date().toISOString() };
    const anteriores = todos();
    // Una foto que no entra no se pierde en silencio al recargar: se avisa.
    if (!guardarTodos([...anteriores, evento]) && evento.foto) {
        guardarTodos(anteriores);
        throw new Error("No queda lugar en este navegador para guardar la foto. Probá sin foto o eliminá eventos viejos con foto.");
    }
    return evento;
}

export async function eliminarEvento(id: string): Promise<void> {
    guardarTodos(todos().filter((e) => e.id !== id));
}

export async function eliminarEventosDeParcela(parcelaId: string): Promise<void> {
    guardarTodos(todos().filter((e) => e.parcelaId !== parcelaId));
}

export async function listarTodosLosEventos(): Promise<Evento[]> {
    return [...todos()];
}

export async function eliminarTodosLosEventos(): Promise<void> {
    guardarTodos([]);
}
