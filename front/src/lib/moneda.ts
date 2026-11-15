import { formatearNumero } from "./numero";

export function formatearPesos(monto: number): string {
    return `$ ${formatearNumero(Math.round(monto))}`;
}
