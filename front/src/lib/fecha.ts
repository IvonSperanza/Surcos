const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Las fechas de las pasadas vienen como "YYYY-MM-DD" (día UTC): se formatean
// en UTC para que no se corran un día por la zona horaria del navegador. Y se
// arman a mano ("10 oct 2026"): Intl da "10 de oct de 2026" o "10 oct. 2026"
// según el navegador.
const diaYMes = (fecha: Date) => `${fecha.getUTCDate()} ${MESES[fecha.getUTCMonth()]}`;

export function formatearFecha(valor: string | number): string {
    const fecha = new Date(valor);
    return `${diaYMes(fecha)} ${fecha.getUTCFullYear()}`;
}

export function formatearMes(valor: number): string {
    const fecha = new Date(valor);
    return `${MESES[fecha.getUTCMonth()]} ${String(fecha.getUTCFullYear()).slice(2)}`;
}

// "entre el 16 y el 23 dic 2025" / "entre el 26 dic 2025 y el 5 ene 2026".
export function formatearVentana(desde: string, hasta: string): string {
    if (desde === hasta) return `alrededor del ${formatearFecha(desde)}`;

    const inicio = new Date(desde);
    const fin = new Date(hasta);
    const mismoAnio = inicio.getUTCFullYear() === fin.getUTCFullYear();
    const mismoMes = mismoAnio && inicio.getUTCMonth() === fin.getUTCMonth();

    if (mismoMes) return `entre el ${inicio.getUTCDate()} y el ${formatearFecha(hasta)}`;
    const primera = mismoAnio ? diaYMes(inicio) : formatearFecha(desde);
    return `entre el ${primera} y el ${formatearFecha(hasta)}`;
}

export function formatearDuracion(dias: number): string {
    if (dias < 14) return `unos ${dias} días`;
    if (dias < 60) return `unas ${Math.round(dias / 7)} semanas`;
    return `unos ${Math.round(dias / 30)} meses`;
}
