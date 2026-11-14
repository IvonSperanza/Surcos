import { useEffect, useState } from "react";
import { getHistoricoNdvi, type HistoricoNdvi, type PoligonoGeoJson } from "../../api/ndvi";
import { getErrorMessage } from "../../lib/errors";

type Resultado = { tipo: "listo"; historico: HistoricoNdvi } | { tipo: "error"; mensaje: string };

type Estado = { tipo: "inactivo" } | { tipo: "cargando" } | Resultado;

export function useHistoricoNdvi(geometria: PoligonoGeoJson | null): Estado {
    // El resultado recuerda para qué geometría se pidió: así "cargando" se
    // deduce en el render (no hay resultado de la geometría actual todavía)
    // y una respuesta vieja nunca se muestra para una parcela redibujada.
    const [ultimo, setUltimo] = useState<{ geometria: PoligonoGeoJson; resultado: Resultado } | null>(null);

    useEffect(() => {
        if (!geometria) return;

        let vigente = true;
        const guardar = (resultado: Resultado) => vigente && setUltimo({ geometria, resultado });
        getHistoricoNdvi(geometria)
            .then((historico) => guardar({ tipo: "listo", historico }))
            .catch((err: unknown) => guardar({ tipo: "error", mensaje: getErrorMessage(err) }));

        return () => {
            vigente = false;
        };
    }, [geometria]);

    if (!geometria) return { tipo: "inactivo" };
    if (ultimo?.geometria !== geometria) return { tipo: "cargando" };
    return ultimo.resultado;
}
