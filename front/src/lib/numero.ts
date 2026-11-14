const formatos = new Map<number, Intl.NumberFormat>();

// Formato es-AR (coma decimal, punto de miles), con un formateador por
// cantidad de decimales para no recrearlo en cada render.
export function formatearNumero(valor: number, decimales = 0): string {
    let formato = formatos.get(decimales);
    if (!formato) {
        formato = new Intl.NumberFormat("es-AR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
        formatos.set(decimales, formato);
    }
    return formato.format(valor);
}
