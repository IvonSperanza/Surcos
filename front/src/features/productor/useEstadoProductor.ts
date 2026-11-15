import { useEffect, useState } from "react";
import { estadoInicialProductor, type EstadoProductor } from "../../api/fixtures/productor";
import { guardarEstado, leerEstadoGuardado } from "./almacenamiento";

export function useEstadoProductor() {
    const [estado, setEstado] = useState<EstadoProductor>(() => leerEstadoGuardado() ?? estadoInicialProductor());
    // Cambia en cada reinicio: sirve de `key` para que los formularios con
    // estado propio (filtros, formularios) y las listas de parcelas vuelvan al inicio.
    const [reinicios, setReinicios] = useState(0);

    useEffect(() => guardarEstado(estado), [estado]);

    const reiniciar = () => {
        setEstado(estadoInicialProductor());
        setReinicios((n) => n + 1);
    };

    return { estado, setEstado, reiniciar, reinicios };
}
