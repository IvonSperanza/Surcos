const fechaCorta = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const diaMes = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });
const mesCorto = new Intl.DateTimeFormat("es-AR", { month: "short", year: "2-digit", timeZone: "UTC" });

// Las fechas de las pasadas vienen como "YYYY-MM-DD" (día UTC): se formatean
// en UTC para que no se corran un día por la zona horaria del navegador.
const sinPunto = (texto: string) => texto.replace(".", "");

export function formatearFecha(valor: string | number): string {
    return sinPunto(fechaCorta.format(new Date(valor)));
}

export function formatearMes(valor: number): string {
    return sinPunto(mesCorto.format(new Date(valor)));
}

// "entre el 16 y el 23 dic 2025" / "entre el 26 dic 2025 y el 5 ene 2026".
export function formatearVentana(desde: string, hasta: string): string {
    if (desde === hasta) return `alrededor del ${formatearFecha(desde)}`;

    const inicio = new Date(desde);
    const fin = new Date(hasta);
    const mismoAnio = inicio.getUTCFullYear() === fin.getUTCFullYear();
    const mismoMes = mismoAnio && inicio.getUTCMonth() === fin.getUTCMonth();

    if (mismoMes) return `entre el ${inicio.getUTCDate()} y el ${formatearFecha(hasta)}`;
    const primera = mismoAnio ? sinPunto(diaMes.format(inicio)) : formatearFecha(desde);
    return `entre el ${primera} y el ${formatearFecha(hasta)}`;
}

export function formatearDuracion(dias: number): string {
    if (dias < 14) return `unos ${dias} días`;
    if (dias < 60) return `unas ${Math.round(dias / 7)} semanas`;
    return `unos ${Math.round(dias / 30)} meses`;
}
