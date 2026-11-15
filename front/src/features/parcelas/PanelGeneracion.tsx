import { useEffect, useState } from "react";
import { Check, CircleDashed, LoaderCircle, Minus } from "lucide-react";
import { Button, Card } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import type { EstadoConsulta } from "../parcela/useConsultaParcela";
import type { DatosDeParcela } from "./almacenDatos";
import styles from "./parcelas.module.css";

type Fila = {
    clave: "ndvi" | "clima" | "suelo" | "insights";
    nombre: string;
    fuente: string;
    enCurso: string;
    listo: (datos: DatosDeParcela) => string;
};

const FILAS: Fila[] = [
    {
        clave: "ndvi",
        nombre: "Satélite",
        fuente: "Sentinel-2",
        enCurso: "La primera vez tarda 1 a 2 min.",
        listo: (d) => (d.ndvi.tipo === "listo" ? `${d.ndvi.datos.serie.length} pasadas despejadas, ${d.ndvi.datos.analisis.ciclos.length} ciclos detectados` : "")
    },
    {
        clave: "clima",
        nombre: "Clima",
        fuente: "NASA POWER",
        enCurso: "Consultando…",
        listo: (d) => (d.clima.tipo === "listo" && d.clima.datos.resumen.ultimo_dato ? `Datos hasta el ${formatearFecha(d.clima.datos.resumen.ultimo_dato)}` : "Listo")
    },
    {
        clave: "suelo",
        nombre: "Suelo",
        fuente: "SoilGrids",
        enCurso: "Consultando…",
        listo: (d) => (d.suelo.tipo === "listo" ? `Suelo ${d.suelo.datos.textura_superficial}` : "")
    },
    {
        clave: "insights",
        nombre: "Recomendaciones",
        fuente: "",
        enCurso: "Esperando satélite y clima",
        listo: (d) => (d.insights.tipo === "listo" ? `${d.insights.datos.insights.length} recomendaciones` : "")
    }
];

// Segundos desde que arrancó la consulta: deja claro que sigue trabajando.
function useSegundosDesde(desde: number | undefined, activo: boolean): number {
    const [ahora, setAhora] = useState(() => Date.now());
    useEffect(() => {
        if (!activo) return;
        const intervalo = window.setInterval(() => setAhora(Date.now()), 1000);
        return () => window.clearInterval(intervalo);
    }, [activo]);
    return desde ? Math.max(0, Math.round((ahora - desde) / 1000)) : 0;
}

function IconoEstado({ estado }: { estado: EstadoConsulta<unknown> }) {
    if (estado.tipo === "listo") return <Check size={18} strokeWidth={2} className={styles.iconoListo} aria-hidden />;
    if (estado.tipo === "error") return <Minus size={18} strokeWidth={2} className={styles.iconoError} aria-hidden />;
    if (estado.tipo === "cargando") return <LoaderCircle size={18} strokeWidth={2} className={`${styles.iconoCargando} ${styles.girando}`} aria-hidden />;
    return <CircleDashed size={18} strokeWidth={1.5} className={styles.iconoEspera} aria-hidden />;
}

function FilaGeneracion({ fila, datos }: { fila: Fila; datos: DatosDeParcela }) {
    const estado = datos[fila.clave];
    const segundos = useSegundosDesde(datos.desde[fila.clave], estado.tipo === "cargando");
    const detalle = {
        inactivo: fila.enCurso,
        cargando: fila.enCurso,
        listo: fila.listo(datos),
        error: estado.tipo === "error" ? `No se pudo generar. ${estado.mensaje}` : ""
    }[estado.tipo];

    return (
        <li className={styles.filaGeneracion}>
            <IconoEstado estado={estado} />
            <div>
                <p className="body">
                    <strong>{fila.nombre}</strong>
                    {fila.fuente && <span className={`etiqueta ${styles.textoSecundario}`}> · {fila.fuente}</span>}
                </p>
                <p className={`small ${styles.textoSecundario}`}>{detalle}</p>
            </div>
            {estado.tipo === "cargando" && <span className={`dato ${styles.segundos}`}>{segundos} s</span>}
        </li>
    );
}

export function PanelGeneracion({ datos, onReintentar }: { datos: DatosDeParcela; onReintentar: () => void }) {
    const hayErrores = FILAS.some((f) => datos[f.clave].tipo === "error");
    return (
        <Card className={styles.panelGeneracion}>
            <ul className={styles.listaGeneracion} aria-live="polite">
                {FILAS.map((f) => (
                    <FilaGeneracion key={f.clave} fila={f} datos={datos} />
                ))}
            </ul>
            {hayErrores && (
                <Button onClick={onReintentar} className={styles.reintentar}>
                    Volver a intentar
                </Button>
            )}
        </Card>
    );
}
