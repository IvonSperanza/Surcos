import type { ReactNode } from "react";

// Todo dato que se muestra lleva su fuente y su fecha (design-system/README.md, "Voz").
export function Fuente({ children }: { children: ReactNode }) {
    return (
        <p className="small" style={{ color: "var(--ink-muted)", margin: 0 }}>
            {children}
        </p>
    );
}
