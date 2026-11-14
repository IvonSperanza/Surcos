import { useEffect, useState } from "react";
import type { PoligonoGeoJson } from "../../api/ndvi";
import { getErrorMessage } from "../../lib/errors";

type Resultado<T> = { tipo: "listo"; datos: T } | { tipo: "error"; mensaje: string };

export type EstadoConsulta<T> = { tipo: "inactivo" } | { tipo: "cargando" } | Resultado<T>;

// `consultar` tiene que ser estable (una función de src/api/*, no una lambda
// armada en el render): es dependencia del efecto.
export function useConsultaParcela<T>(geometria: PoligonoGeoJson | null, consultar: (g: PoligonoGeoJson) => Promise<T>): EstadoConsulta<T> {
    // El resultado recuerda para qué geometría se pidió: así "cargando" se
    // deduce en el render (no hay resultado de la geometría actual todavía)
    // y una respuesta vieja nunca se muestra para una parcela redibujada.
    const [ultimo, setUltimo] = useState<{ geometria: PoligonoGeoJson; resultado: Resultado<T> } | null>(null);

    useEffect(() => {
        if (!geometria) return;

        let vigente = true;
        const guardar = (resultado: Resultado<T>) => vigente && setUltimo({ geometria, resultado });
        consultar(geometria)
            .then((datos) => guardar({ tipo: "listo", datos }))
            .catch((err: unknown) => guardar({ tipo: "error", mensaje: getErrorMessage(err) }));

        return () => {
            vigente = false;
        };
    }, [geometria, consultar]);

    if (!geometria) return { tipo: "inactivo" };
    if (ultimo?.geometria !== geometria) return { tipo: "cargando" };
    return ultimo.resultado;
}
