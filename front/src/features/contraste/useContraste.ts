import { useEffect, useState } from "react";
import type { ContrasteParcela } from "../../api/contraste";
import type { Evento } from "../../api/eventos";
import type { PoligonoGeoJson } from "../../api/ndvi";
import { getErrorMessage } from "../../lib/errors";

export type EstadoContraste = { estado: "cargando" } | { estado: "listo"; contraste: ContrasteParcela } | { estado: "error"; mensaje: string };

type Contrastar = (geometria: PoligonoGeoJson, eventos: Evento[]) => Promise<ContrasteParcela>;

// La primera consulta de una parcela baja las imágenes y tarda uno o dos
// minutos; después sale de la caché de datos/.
export function useContraste(contrastar: Contrastar, geometria: PoligonoGeoJson, eventos: Evento[]): EstadoContraste {
    const clave = JSON.stringify([geometria, eventos.map((e) => [e.id, e.tipo, e.fecha])]);
    const [resultado, setResultado] = useState<{ clave: string; valor: EstadoContraste } | null>(null);

    useEffect(() => {
        if (eventos.length === 0) return;
        let vigente = true;
        contrastar(geometria, eventos).then(
            (contraste) => vigente && setResultado({ clave, valor: { estado: "listo", contraste } }),
            (error: unknown) => vigente && setResultado({ clave, valor: { estado: "error", mensaje: getErrorMessage(error) } })
        );
        return () => {
            vigente = false;
        };
        // La clave resume geometría y eventos: los arrays cambian de identidad en cada render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clave, contrastar]);

    return resultado?.clave === clave ? resultado.valor : { estado: "cargando" };
}
