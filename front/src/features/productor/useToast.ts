import { useEffect, useRef, useState } from "react";

const DURACION_MS = 3400;

export function useToast() {
    const [mensaje, setMensaje] = useState("");
    const temporizador = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(temporizador.current), []);

    const avisar = (texto: string) => {
        setMensaje(texto);
        window.clearTimeout(temporizador.current);
        temporizador.current = window.setTimeout(() => setMensaje(""), DURACION_MS);
    };

    return { mensaje, avisar };
}
