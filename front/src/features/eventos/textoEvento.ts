import type { CultivoDeclarado, Evento } from "../../api/eventos";
import { TIPOS_EVENTO } from "./tiposEvento";

const oracion = (texto: string) => texto.charAt(0) + texto.slice(1).toLocaleLowerCase("es-AR");

export function nombreEspecie(cultivo: CultivoDeclarado): string {
    return oracion(cultivo.especie);
}

export function nombreCultivo(cultivo: CultivoDeclarado): string {
    return `${nombreEspecie(cultivo)} ${cultivo.cultivar}`;
}

export function tituloEvento(evento: Evento): string {
    const nombre = TIPOS_EVENTO[evento.tipo].nombre;
    if (!evento.cultivo) return nombre;
    return `${nombre} · ${nombreCultivo(evento.cultivo)}`;
}

export function detallesEvento(evento: Evento): string {
    const { campos } = TIPOS_EVENTO[evento.tipo];
    return campos
        .filter((c) => evento.detalles[c.clave])
        .map((c) => (c.tipo === "numero" ? `${c.etiqueta}: ${evento.detalles[c.clave]} ${c.unidad}` : evento.detalles[c.clave]))
        .join(" · ");
}
