import styles from "./ChipCategoria.module.css";

export type Categoria = "hortalizas" | "frutas" | "vinos" | "granos";

const NOMBRES: Record<Categoria, string> = {
    hortalizas: "Hortalizas",
    frutas: "Frutas",
    vinos: "Vinos",
    granos: "Granos"
};

// design-system/README.md, "Categorías de producto": fondo suave por
// categoría, texto ink, estilo etiqueta, radio sm. Granos no está en el
// manual: usa trigo, el color del cereal en la paleta.
export function ChipCategoria({ categoria }: { categoria: Categoria }) {
    return <span className={`etiqueta ${styles.chip} ${styles[categoria]}`}>{NOMBRES[categoria]}</span>;
}
