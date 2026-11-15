import { useState } from "react";
import { Button, Card, EnlaceBoton } from "../../design-system";
import { nombreEspecie } from "../eventos/textoEvento";
import { CabeceraVista } from "../productor/CabeceraVista";
import { rutasPanel } from "../productor/rutas";
import vistas from "../productor/vistas.module.css";
import { TablaProducciones } from "./TablaProducciones";
import { useProducciones, type ProduccionDeParcela } from "./useProducciones";
import styles from "./producciones.module.css";

type Estado = "todas" | "en_curso" | "cosechadas";

const ESTADOS: { valor: Estado; nombre: string }[] = [
    { valor: "todas", nombre: "Todas" },
    { valor: "en_curso", nombre: "En curso" },
    { valor: "cosechadas", nombre: "Cosechadas" }
];

const TODAS = "";

const segunEstado = (estado: Estado) => (p: ProduccionDeParcela) => estado === "todas" || (estado === "cosechadas") === (p.cosecha !== null);

const distintos = (valores: string[]) => [...new Set(valores)].sort((a, b) => a.localeCompare(b, "es"));

function Filtros({ producciones }: { producciones: ProduccionDeParcela[] }) {
    const [estado, setEstado] = useState<Estado>("todas");
    const [parcela, setParcela] = useState(TODAS);
    const [especie, setEspecie] = useState(TODAS);

    const parcelas = distintos(producciones.map((p) => p.parcela.nombre));
    const especies = distintos(producciones.map((p) => nombreEspecie(p.cultivo)));
    const delSelector = producciones.filter(
        (p) => (parcela === TODAS || p.parcela.nombre === parcela) && (especie === TODAS || nombreEspecie(p.cultivo) === especie)
    );
    const visibles = delSelector.filter(segunEstado(estado));
    const limpiar = () => {
        setEstado("todas");
        setParcela(TODAS);
        setEspecie(TODAS);
    };

    return (
        <>
            <div className={styles.filtros}>
                <div className={vistas.filtros} role="group" aria-label="Filtrar por estado">
                    {ESTADOS.map(({ valor, nombre }) => (
                        <button key={valor} type="button" className={`small ${vistas.filtro}`} aria-pressed={estado === valor} onClick={() => setEstado(valor)}>
                            {nombre} <span className="dato">{delSelector.filter(segunEstado(valor)).length}</span>
                        </button>
                    ))}
                </div>
                <label className={`small ${styles.selector}`}>
                    Parcela
                    <select value={parcela} onChange={(e) => setParcela(e.target.value)}>
                        <option value={TODAS}>Todas</option>
                        {parcelas.map((nombre) => (
                            <option key={nombre}>{nombre}</option>
                        ))}
                    </select>
                </label>
                <label className={`small ${styles.selector}`}>
                    Cultivo
                    <select value={especie} onChange={(e) => setEspecie(e.target.value)}>
                        <option value={TODAS}>Todos</option>
                        {especies.map((nombre) => (
                            <option key={nombre}>{nombre}</option>
                        ))}
                    </select>
                </label>
            </div>

            {visibles.length > 0 ? (
                <TablaProducciones producciones={visibles} />
            ) : (
                <div className={`${vistas.vacio} ${styles.sinResultados}`}>
                    <p className="body">Sin resultados.</p>
                    <Button onClick={limpiar}>Quitar filtros</Button>
                </div>
            )}
        </>
    );
}

// Cada cultivo de cada parcela, de su siembra a su cosecha: lo que se vende.
export function VistaProducciones() {
    const producciones = useProducciones();

    return (
        <section className={vistas.vista}>
            <CabeceraVista titulo="Producciones" />
            {producciones === null ? (
                <p className="body">Cargando…</p>
            ) : producciones.length === 0 ? (
                <Card>
                    <h2 className="subtitulo">Sin producciones</h2>
                    <p className="body">Se crean al registrar una siembra en el historial de una parcela.</p>
                    <EnlaceBoton to={rutasPanel.parcelas}>Ir a mis parcelas</EnlaceBoton>
                </Card>
            ) : (
                <Filtros producciones={producciones} />
            )}
        </section>
    );
}
