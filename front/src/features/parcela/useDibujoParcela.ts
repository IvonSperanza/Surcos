import { useMemo, useState } from "react";
import type { Coordenada, PoligonoGeoJson } from "../../api/ndvi";

const VERTICES_MINIMOS = 3;

export function useDibujoParcela() {
    const [vertices, setVertices] = useState<Coordenada[]>([]);
    const [cerrada, setCerrada] = useState(false);

    const agregarVertice = (vertice: Coordenada) => {
        if (!cerrada) setVertices((actuales) => [...actuales, vertice]);
    };

    const deshacer = () => setVertices((actuales) => actuales.slice(0, -1));

    const cerrar = () => {
        if (vertices.length >= VERTICES_MINIMOS) setCerrada(true);
    };

    const reiniciar = () => {
        setVertices([]);
        setCerrada(false);
    };

    // GeoJSON exige el anillo cerrado: el primer vértice se repite al final.
    // Memorizada porque es la dependencia de la consulta al satélite: un
    // objeto nuevo en cada render la dispararía en loop.
    const geometria = useMemo<PoligonoGeoJson | null>(
        () => (cerrada ? { type: "Polygon", coordinates: [[...vertices, vertices[0]]] } : null),
        [cerrada, vertices]
    );

    return {
        vertices,
        cerrada,
        puedeCerrar: !cerrada && vertices.length >= VERTICES_MINIMOS,
        geometria,
        agregarVertice,
        deshacer,
        cerrar,
        reiniciar
    };
}
