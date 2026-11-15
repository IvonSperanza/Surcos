import { useLayoutEffect, useState } from "react";

export type Tema = "dia" | "noche";

const CLAVE_PREFERENCIA = "surco-tema";

// design-system/README.md, "Temas": Día y Noche comparten tokens y se cambian
// con data-theme. Va en <html> (y no en un div) porque los gráficos leen los
// colores con colorToken() desde la raíz del documento. Al salir de la
// pantalla se vuelve a Día, el tema por defecto.
export function useTema(tema: Tema) {
    useLayoutEffect(() => {
        aplicarTema(tema);
        return () => aplicarTema("dia");
    }, [tema]);
}

function aplicarTema(tema: Tema) {
    document.documentElement.dataset.theme = tema;
}

function leerPreferencia(): Tema {
    try {
        return localStorage.getItem(CLAVE_PREFERENCIA) === "noche" ? "noche" : "dia";
    } catch {
        return "dia";
    }
}

function guardarPreferencia(tema: Tema) {
    try {
        localStorage.setItem(CLAVE_PREFERENCIA, tema);
    } catch {
        // Sin almacenamiento (modo privado, bloqueado): la elección dura la sesión.
    }
}

// Tema elegido por quien mira (panel del productor, vista de datos): arranca
// en Día y recuerda la elección en este navegador.
export function usePreferenciaTema() {
    const [tema, setTema] = useState<Tema>(leerPreferencia);
    useTema(tema);

    const cambiar = (nuevo: Tema) => {
        // Antes del render: los gráficos leen los colores mientras se dibujan,
        // y con el atributo viejo quedarían con la paleta del otro tema.
        aplicarTema(nuevo);
        guardarPreferencia(nuevo);
        setTema(nuevo);
    };

    return { tema, cambiar };
}
