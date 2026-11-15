import { useCallback, useEffect, useState } from "react";
import { listarEventos, type Evento } from "../../api/eventos";

// null mientras carga. `recargar` se llama después de crear o eliminar.
export function useEventos(parcelaId: string): { eventos: Evento[] | null; recargar: () => void } {
    const [resultado, setResultado] = useState<{ parcelaId: string; eventos: Evento[] } | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let vigente = true;
        void listarEventos(parcelaId).then((eventos) => vigente && setResultado({ parcelaId, eventos }));
        return () => {
            vigente = false;
        };
    }, [parcelaId, version]);

    const recargar = useCallback(() => setVersion((v) => v + 1), []);
    return { eventos: resultado?.parcelaId === parcelaId ? resultado.eventos : null, recargar };
}
