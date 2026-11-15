import { useCallback, useEffect, useState } from "react";
import { listarParcelas, obtenerParcela, type Parcela } from "../../api/parcelas";

// null mientras carga: hoy la lectura es local e instantánea, pero cuando las
// parcelas vengan del back va a tardar y la vista ya lo contempla.
export function useParcelas(): { parcelas: Parcela[] | null; recargar: () => void } {
    const [parcelas, setParcelas] = useState<Parcela[] | null>(null);
    const [version, setVersion] = useState(0);
    useEffect(() => {
        let vigente = true;
        void listarParcelas().then((lista) => vigente && setParcelas(lista));
        return () => {
            vigente = false;
        };
    }, [version]);
    const recargar = useCallback(() => setVersion((v) => v + 1), []);
    return { parcelas, recargar };
}

// undefined mientras carga; null si no existe.
export function useParcela(id: string): Parcela | null | undefined {
    const [resultado, setResultado] = useState<{ id: string; parcela: Parcela | null } | null>(null);
    useEffect(() => {
        let vigente = true;
        void obtenerParcela(id).then((parcela) => vigente && setResultado({ id, parcela }));
        return () => {
            vigente = false;
        };
    }, [id]);
    return resultado?.id === id ? resultado.parcela : undefined;
}
