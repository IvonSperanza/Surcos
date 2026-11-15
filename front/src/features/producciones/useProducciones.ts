import { useEffect, useState } from "react";
import { listarTodosLosEventos } from "../../api/eventos";
import { listarParcelas, type Parcela } from "../../api/parcelas";
import { derivarProducciones, type Produccion } from "./producciones";

export type ProduccionDeParcela = Produccion & { parcela: Parcela };

export function conParcela(producciones: Produccion[], parcela: Parcela): ProduccionDeParcela[] {
    return producciones.map((p) => ({ ...p, parcela }));
}

// Las producciones de todas las parcelas, de la siembra más reciente a la más
// vieja. null mientras carga.
export function useProducciones(): ProduccionDeParcela[] | null {
    const [producciones, setProducciones] = useState<ProduccionDeParcela[] | null>(null);
    useEffect(() => {
        let vigente = true;
        void Promise.all([listarParcelas(), listarTodosLosEventos()]).then(([parcelas, eventos]) => {
            const todas = parcelas
                .flatMap((parcela) => conParcela(derivarProducciones(eventos.filter((e) => e.parcelaId === parcela.id)), parcela))
                .sort((a, b) => b.siembra.fecha.localeCompare(a.siembra.fecha));
            if (vigente) setProducciones(todas);
        });
        return () => {
            vigente = false;
        };
    }, []);
    return producciones;
}
