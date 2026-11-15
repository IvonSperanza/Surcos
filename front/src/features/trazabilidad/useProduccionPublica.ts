import { useEffect, useMemo, useState } from "react";
import { conBack } from "../../api/client";
import { datosEjemplo } from "../../api/fixtures/parcelasEjemplo";
import { obtenerProduccionPublica, type ProduccionPublica } from "../../api/producciones";
import { produccionesDe, useProducciones } from "../producciones/useProducciones";

// Con back, la página pública la pide por código. Sin él, la busca entre las
// producciones de este navegador y, si no está, entre las de ejemplo, que
// tienen ids fijos: así el QR de una etiqueta de ejemplo abre en cualquier
// teléfono. undefined mientras carga; null si no existe.
function useDelNavegador(codigo: string): ProduccionPublica | null | undefined {
    const locales = useProducciones();
    const ejemplos = useMemo(() => {
        const { parcelas, eventos } = datosEjemplo();
        return produccionesDe(parcelas, eventos);
    }, []);
    if (locales === null) return undefined;
    return locales.find((p) => p.codigo === codigo) ?? ejemplos.find((p) => p.codigo === codigo) ?? null;
}

function useDelBack(codigo: string): ProduccionPublica | null | undefined {
    const [produccion, setProduccion] = useState<ProduccionPublica | null | undefined>(undefined);
    useEffect(() => {
        let vigente = true;
        void obtenerProduccionPublica(codigo).then((p) => vigente && setProduccion(p));
        return () => {
            vigente = false;
        };
    }, [codigo]);
    return produccion;
}

export const useProduccionPublica = conBack ? useDelBack : useDelNavegador;
