import { CircleDashed, Clock, PenLine, SatelliteDish, ScanLine, type LucideIcon } from "lucide-react";
import type { Veredicto } from "../../api/contraste";
import type { ColorToken } from "../../lib/tokens";

type Presentacion = {
    palabra: string;
    // Para la leyenda: "12 confirmados por el satélite", "1 dato del productor".
    conteo: (n: number) => string;
    Icono: LucideIcon;
    // Para la marca sobre el gráfico (Recharts no lee var(--…)).
    color: ColorToken;
};

const contar = (uno: string, varios: string) => (n: number) => `${n} ${n === 1 ? uno : varios}`;

// Cada veredicto lleva palabra, ícono y color (design-system/README.md,
// "Estados de verificación"). "No se ve" es neutro: no acusa al productor.
export const VEREDICTOS: Record<Veredicto, Presentacion> = {
    confirma: { palabra: "Lo confirma el satélite", conteo: contar("confirmado por el satélite", "confirmados por el satélite"), Icono: SatelliteDish, color: "cielo" },
    indicio: { palabra: "Hay un indicio", conteo: contar("con un indicio", "con un indicio"), Icono: ScanLine, color: "cielo" },
    no_se_ve: { palabra: "No se ve en los datos", conteo: contar("no se ve en los datos", "no se ven en los datos"), Icono: CircleDashed, color: "ink-muted" },
    sin_pasadas: { palabra: "Sin imágenes cerca", conteo: contar("sin imágenes cerca", "sin imágenes cerca"), Icono: Clock, color: "sol" },
    declarado: { palabra: "Dato del productor", conteo: contar("dato del productor", "datos del productor"), Icono: PenLine, color: "line" }
};

export const ORDEN_VEREDICTOS: Veredicto[] = ["confirma", "indicio", "no_se_ve", "sin_pasadas", "declarado"];

// Marcas huecas: lo que el satélite no confirma del todo o no puede ver.
export const MARCA_HUECA = new Set<Veredicto>(["indicio", "declarado"]);

export const CONFIANZA = { alta: "Confianza alta", media: "Confianza media", baja: "Confianza baja" } as const;
