import { useEffect, useState } from "react";
import { buscarCultivares, getEspecies, type Cultivar, type Especie, type UsoCatalogo } from "../../api/catalogo";

export function useEspecies(uso: UsoCatalogo): { especies: Especie[]; error: boolean } {
    const [estado, setEstado] = useState<{ uso: UsoCatalogo; especies: Especie[]; error: boolean } | null>(null);
    useEffect(() => {
        let vigente = true;
        getEspecies(uso)
            .then((r) => vigente && setEstado({ uso, especies: r.especies, error: false }))
            .catch(() => vigente && setEstado({ uso, especies: [], error: true }));
        return () => {
            vigente = false;
        };
    }, [uso]);
    return estado?.uso === uso ? estado : { especies: [], error: false };
}

const ESPERA_AL_TIPEAR_MS = 250;

// Sugerencias del catálogo mientras se escribe. La espera evita una consulta
// por tecla; una respuesta vieja nunca pisa a una más nueva.
export function useCultivares(especie: string, texto: string): Cultivar[] {
    const [resultado, setResultado] = useState<{ clave: string; cultivares: Cultivar[] }>({ clave: "", cultivares: [] });
    const clave = `${especie}|${texto}`;

    useEffect(() => {
        if (!especie) return;
        let vigente = true;
        const temporizador = window.setTimeout(() => {
            buscarCultivares(especie, texto)
                .then((cultivares) => vigente && setResultado({ clave, cultivares }))
                .catch(() => vigente && setResultado({ clave, cultivares: [] }));
        }, ESPERA_AL_TIPEAR_MS);
        return () => {
            vigente = false;
            window.clearTimeout(temporizador);
        };
    }, [especie, texto, clave]);

    return especie && resultado.clave === clave ? resultado.cultivares : [];
}
