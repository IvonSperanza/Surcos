import type { EstadoProductor } from "../../api/fixtures/productor";

const CLAVE = "surco-productor-v1";

// El panel original guardaba bajo la misma clave otra forma (version 1, en
// inglés): sólo se acepta la version 2 para no levantar datos incompatibles.
function esEstadoProductor(valor: unknown): valor is EstadoProductor {
    if (typeof valor !== "object" || valor === null) return false;
    const estado = valor as Partial<EstadoProductor>;
    return estado.version === 2 && Array.isArray(estado.productos) && Array.isArray(estado.pedidos) && Array.isArray(estado.pagos);
}

// localStorage puede no estar (ventana privada, sitio bloqueado) o tener basura:
// la demo sigue andando sin persistencia.
export function leerEstadoGuardado(): EstadoProductor | null {
    try {
        const guardado: unknown = JSON.parse(window.localStorage.getItem(CLAVE) ?? "null");
        return esEstadoProductor(guardado) ? guardado : null;
    } catch {
        return null;
    }
}

export function guardarEstado(estado: EstadoProductor): void {
    try {
        window.localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
        // Sin persistencia: el estado vive en memoria hasta recargar.
    }
}
