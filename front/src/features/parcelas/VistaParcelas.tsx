import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { conBack } from "../../api/client";
import { cargarParcelasEjemplo, hayParcelasEjemplo } from "../../api/fixtures/parcelasEjemplo";
import type { Parcela } from "../../api/parcelas";
import { Button, Card, EnlaceBoton } from "../../design-system";
import { formatearDuracion } from "../../lib/fecha";
import { areaHa } from "../../lib/geometria";
import { formatearNumero } from "../../lib/numero";
import { CabeceraVista } from "../productor/CabeceraVista";
import vistas from "../productor/vistas.module.css";
import { asegurarDatos, estadoGeneral, useDatosParcela } from "./almacenDatos";
import { ChipEstadoDatos } from "./ChipEstadoDatos";
import { MapaParcelas } from "./MapaParcelas";
import { useParcelas } from "./useParcelas";
import styles from "./parcelas.module.css";
import { rutasPanel } from "../productor/rutas";

function ResumenParcela({ parcela }: { parcela: Parcela }) {
    const datos = useDatosParcela(parcela.id);
    if (datos.ndvi.tipo !== "listo") return null;
    const { analisis, serie } = datos.ndvi.datos;
    const cultivos = analisis.ciclos.filter((c) => c.tipo === "cultivo").length;
    return (
        <p className={`small ${styles.textoSecundario}`}>
            <span className="dato">{cultivos}</span> {cultivos === 1 ? "cultivo" : "cultivos"} en el último año · sin cultivo{" "}
            {analisis.dias_sin_cultivo > 0 ? formatearDuracion(analisis.dias_sin_cultivo) : "nunca"} · <span className="dato">{serie.length}</span>{" "}
            pasadas
        </p>
    );
}

function TarjetaParcela({ parcela }: { parcela: Parcela }) {
    const estado = estadoGeneral(useDatosParcela(parcela.id));
    return (
        <li>
            <Link to={rutasPanel.parcela(parcela.id)} className={styles.tarjetaParcela}>
                <div className={styles.filaTarjeta}>
                    <h2 className="subtitulo">{parcela.nombre}</h2>
                    <ChipEstadoDatos estado={estado} />
                </div>
                <p className={`small ${styles.textoSecundario}`}>
                    <span className="dato">{formatearNumero(areaHa(parcela.geometria), 2)} ha</span>
                </p>
                <ResumenParcela parcela={parcela} />
            </Link>
        </li>
    );
}

function BotonEjemplos({ onCargar }: { onCargar: () => void }) {
    const [cargando, setCargando] = useState(false);
    return (
        <Button
            disabled={cargando}
            onClick={async () => {
                setCargando(true);
                await cargarParcelasEjemplo();
                onCargar();
            }}
        >
            {cargando ? "Cargando ejemplos" : "Cargar parcelas de ejemplo"}
        </Button>
    );
}

function SinParcelas({ onEjemplos }: { onEjemplos: () => void }) {
    return (
        <Card className={styles.vacio}>
            <h2 className="subtitulo">Sin parcelas</h2>
            <div className={styles.acciones}>
                <EnlaceBoton to={rutasPanel.nuevaParcela} variante="primario">
                    <Plus size={18} strokeWidth={1.5} aria-hidden />
                    Dibujar una parcela
                </EnlaceBoton>
                <BotonEjemplos onCargar={onEjemplos} />
            </div>
        </Card>
    );
}

export function VistaParcelas() {
    const { parcelas, recargar } = useParcelas();
    const [conEjemplos, setConEjemplos] = useState(true);

    useEffect(() => {
        let vigente = true;
        void hayParcelasEjemplo().then((hay) => vigente && setConEjemplos(hay));
        return () => {
            vigente = false;
        };
    }, [parcelas]);
    const navegar = useNavigate();

    // Apenas se ve la lista, cada parcela empieza a traer sus datos (si no los
    // trajo ya en esta sesión): al abrir una ficha, ya están o falta poco.
    useEffect(() => {
        parcelas?.forEach(asegurarDatos);
    }, [parcelas]);

    return (
        <section className={vistas.vista} aria-label="Mis parcelas">
            <CabeceraVista
                titulo="Mis parcelas"
                acciones={
                    parcelas && parcelas.length > 0 ? (
                        <EnlaceBoton to={rutasPanel.nuevaParcela} variante="primario">
                            <Plus size={18} strokeWidth={1.5} aria-hidden />
                            Nueva parcela
                        </EnlaceBoton>
                    ) : undefined
                }
            />

            {parcelas === null && <p className="body">Cargando…</p>}
            {parcelas?.length === 0 && <SinParcelas onEjemplos={recargar} />}
            {parcelas && parcelas.length > 0 && (
                <div className={styles.grillaParcelas}>
                    <MapaParcelas parcelas={parcelas} onAbrir={(id) => navegar(rutasPanel.parcela(id))} />
                    <ul className={styles.listaParcelas} aria-label="Parcelas">
                        {parcelas.map((p) => (
                            <TarjetaParcela key={p.id} parcela={p} />
                        ))}
                    </ul>
                </div>
            )}
            {!conBack && parcelas && parcelas.length > 0 && !conEjemplos && (
                <div>
                    <BotonEjemplos onCargar={recargar} />
                </div>
            )}
        </section>
    );
}
