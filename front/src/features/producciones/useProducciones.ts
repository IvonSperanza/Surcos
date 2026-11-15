import { useEffect, useState } from "react";
import { conBack } from "../../api/client";
import { listarTodosLosEventos, type Evento } from "../../api/eventos";
import { listarProducciones } from "../../api/producciones";
import { listarParcelas, type Parcela } from "../../api/parcelas";
import { derivarProducciones, type Produccion } from "./producciones";

export type ProduccionDeParcela = Produccion & { parcela: Parcela };

export function conParcela(producciones: Produccion[], parcela: Parcela): ProduccionDeParcela[] {
    return producciones.map((p) => ({ ...p, parcela }));
}

// De la siembra más reciente a la más vieja.
export function produccionesDe(parcelas: Parcela[], eventos: Evento[]): ProduccionDeParcela[] {
    return parcelas
        .flatMap((parcela) => conParcela(derivarProducciones(eventos.filter((e) => e.parcelaId === parcela.id)), parcela))
        .sort((a, b) => b.siembra.fecha.localeCompare(a.siembra.fecha));
}

// Con back, las arma el servidor; sin él, se deducen de los eventos guardados acá.
async function cargarProducciones(): Promise<ProduccionDeParcela[]> {
    if (conBack) return listarProducciones();
    const [parcelas, eventos] = await Promise.all([listarParcelas(), listarTodosLosEventos()]);
    return produccionesDe(parcelas, eventos);
}

// Las producciones de todas las parcelas, de la siembra más reciente a la más
// vieja. null mientras carga.
export function useProducciones(): ProduccionDeParcela[] | null {
    const [producciones, setProducciones] = useState<ProduccionDeParcela[] | null>(null);
    useEffect(() => {
        let vigente = true;
        void cargarProducciones().then((todas) => vigente && setProducciones(todas));
        return () => {
            vigente = false;
        };
    }, []);
    return producciones;
}
