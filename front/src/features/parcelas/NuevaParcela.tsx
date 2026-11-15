import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearParcela } from "../../api/parcelas";
import { Button, EnlaceBoton } from "../../design-system";
import { areaHa } from "../../lib/geometria";
import { formatearNumero } from "../../lib/numero";
import { MapaParcela } from "../parcela/MapaParcela";
import { useDibujoParcela } from "../parcela/useDibujoParcela";
import { CabeceraVista } from "../productor/CabeceraVista";
import vistas from "../productor/vistas.module.css";
import { asegurarDatos } from "./almacenDatos";
import { useParcelas } from "./useParcelas";
import styles from "./parcelas.module.css";
import { rutasPanel } from "../productor/rutas";

// Mismo límite que el servicio de datos (datos/surco_datos/api.py).
const AREA_MAXIMA_HA = 500;

function Instrucciones({ cantidadVertices, cerrada }: { cantidadVertices: number; cerrada: boolean }) {
    if (cerrada) return "Poné un nombre y guardá.";
    if (cantidadVertices === 0) return "Marcá las esquinas sobre el mapa.";
    return "Tocá el primer punto para cerrar.";
}

export function NuevaParcela() {
    const { parcelas: otras } = useParcelas();
    const dibujo = useDibujoParcela();
    const navegar = useNavigate();
    const [nombre, setNombre] = useState("");
    const [guardando, setGuardando] = useState(false);

    const hectareas = dibujo.geometria ? areaHa(dibujo.geometria) : null;
    const demasiadoGrande = hectareas !== null && hectareas > AREA_MAXIMA_HA;
    const puedeGuardar = dibujo.geometria !== null && nombre.trim() !== "" && !demasiadoGrande && !guardando;

    const guardar = async () => {
        if (!dibujo.geometria || !puedeGuardar) return;
        setGuardando(true);
        const parcela = await crearParcela({ nombre: nombre.trim(), geometria: dibujo.geometria });
        // Los datos empiezan a generarse ya: la ficha los muestra a medida que llegan.
        asegurarDatos(parcela);
        navegar(rutasPanel.parcela(parcela.id));
    };

    return (
        <section className={vistas.vista} aria-label="Nueva parcela">
            <CabeceraVista
                titulo="Nueva parcela"
                bajada={Instrucciones({ cantidadVertices: dibujo.vertices.length, cerrada: dibujo.cerrada })}
                acciones={<EnlaceBoton to={rutasPanel.parcelas}>Cancelar</EnlaceBoton>}
            />

            <label className={styles.campo}>
                <span className="etiqueta">Nombre</span>
                <input
                    className="body"
                    type="text"
                    value={nombre}
                    maxLength={60}
                    placeholder="Ej.: Canteros del fondo"
                    onChange={(e) => setNombre(e.target.value)}
                />
            </label>

            {/* El mapa espera a las parcelas existentes: arranca encuadrándolas. */}
            {otras !== null && (
                <MapaParcela
                    vertices={dibujo.vertices}
                    cerrada={dibujo.cerrada}
                    onAgregarVertice={dibujo.agregarVertice}
                    onCerrar={dibujo.cerrar}
                    otras={otras.map((p) => p.geometria)}
                />
            )}

            {hectareas !== null && (
                <p className="body">
                    Superficie: <span className="dato">{formatearNumero(hectareas, 2)} ha</span>
                    {demasiadoGrande && ` · máximo ${AREA_MAXIMA_HA} ha`}
                </p>
            )}

            <div className={styles.acciones}>
                <Button variante="primario" onClick={guardar} disabled={!puedeGuardar}>
                    Guardar
                </Button>
                <Button onClick={dibujo.cerrar} disabled={!dibujo.puedeCerrar}>
                    Cerrar polígono
                </Button>
                <Button onClick={dibujo.deshacer} disabled={dibujo.cerrada || dibujo.vertices.length === 0}>
                    Deshacer punto
                </Button>
                <Button onClick={dibujo.reiniciar} disabled={dibujo.vertices.length === 0}>
                    Borrar dibujo
                </Button>
            </div>
        </section>
    );
}
