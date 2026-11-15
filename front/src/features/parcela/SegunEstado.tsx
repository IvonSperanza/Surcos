import type { ReactNode } from "react";
import { Card } from "../../design-system";
import type { EstadoConsulta } from "./useConsultaParcela";

type Props<T> = {
    estado: EstadoConsulta<T>;
    titulo: string;
    mensajeCargando: string;
    // Si otra parte de la pantalla ya muestra la carga y los errores.
    soloListo?: boolean;
    children: (datos: T) => ReactNode;
};

// Mismo trato de carga y error para todas las tarjetas de la parcela.
export function SegunEstado<T>({ estado, titulo, mensajeCargando, soloListo = false, children }: Props<T>) {
    if (estado.tipo === "listo") return children(estado.datos);
    if (estado.tipo === "inactivo" || soloListo) return null;

    return (
        <Card>
            <h2 className="subtitulo">{titulo}</h2>
            <p className="body">{estado.tipo === "cargando" ? mensajeCargando : `No pudimos traer estos datos. ${estado.mensaje}`}</p>
        </Card>
    );
}
