// Recharts y Leaflet reciben colores como atributos SVG/JS, donde `var(--x)`
// no se resuelve: se lee el valor del token ya calculado desde tokens.css.
export type ColorToken =
    | "ink"
    | "ink-muted"
    | "line"
    | "surface"
    | "surface-raised"
    | "cobre"
    | "hoja"
    | "hoja-soft"
    | "cielo"
    | "cielo-soft"
    | "sol"
    | "suelo-desnudo";

export function colorToken(nombre: ColorToken): string {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${nombre}`).trim();
}
