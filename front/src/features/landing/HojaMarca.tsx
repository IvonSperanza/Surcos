// Hoja de la marca provisoria: todavía no hay logo (design-system/README.md),
// así que acompaña a "Surco" escrito en Young Serif.
export function HojaMarca({ color = "oliva", tamano = 22 }: { color?: "oliva" | "trigo"; tamano?: number }) {
    return (
        <svg viewBox="0 0 24 24" width={tamano} height={tamano} aria-hidden="true">
            <path d="M21 3c0 11-8 19-19 19H1C1 11 9 3 21 3z" style={{ fill: `var(--${color})` }} />
            <path d="M2 22C6 15 12 9 19 5" style={{ stroke: "var(--surface-raised)", strokeWidth: 2, fill: "none", strokeLinecap: "round" }} />
        </svg>
    );
}
