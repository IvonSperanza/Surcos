import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { LOTES, META_COBERTURA, TIPOS_COMPRADOR, type Rubro, type TipoComprador } from "../../api/fixtures/productor";
import { Button, Card } from "../../design-system";
import { validarProducto, type ProductoNuevo } from "./estadoProductor";
import formulario from "./formulario.module.css";
import vistas from "./vistas.module.css";

const RUBROS: { valor: Rubro; nombre: string }[] = [
    { valor: "hortalizas", nombre: "Hortalizas" },
    { valor: "frutas", nombre: "Frutas" },
    { valor: "vinos", nombre: "Vinos" },
    { valor: "granos", nombre: "Granos" }
];

type Borrador = Omit<ProductoNuevo, "precio"> & { precio: string };

const BORRADOR_VACIO: Borrador = {
    rubro: "hortalizas",
    cultivo: "",
    lote: LOTES[0].id,
    plantacion: "",
    cosecha: "",
    reparto: "",
    quimicos: "",
    destino: "Consumidor final",
    precio: "",
    unidad: ""
};

function aProducto(borrador: Borrador): ProductoNuevo {
    return {
        ...borrador,
        cultivo: borrador.cultivo.trim(),
        quimicos: borrador.quimicos.trim(),
        unidad: borrador.unidad.trim(),
        precio: Number(borrador.precio) || 0
    };
}

function Campo({ nombre, children }: { nombre: string; children: ReactNode }) {
    return (
        <label className={formulario.campo}>
            <span className={`small ${formulario.nombreCampo}`}>{nombre}</span>
            {children}
        </label>
    );
}

type Props = { onCargar: (datos: ProductoNuevo) => void; onCancelar: () => void };

export function FormularioProducto({ onCargar, onCancelar }: Props) {
    const [borrador, setBorrador] = useState<Borrador>(BORRADOR_VACIO);
    const [error, setError] = useState<string | null>(null);
    const primerCampo = useRef<HTMLInputElement>(null);

    useEffect(() => primerCampo.current?.focus(), []);

    const cambiar = (campo: keyof Borrador) => (e: { target: { value: string } }) => setBorrador((b) => ({ ...b, [campo]: e.target.value }));

    const enviar = (e: FormEvent) => {
        e.preventDefault();
        const producto = aProducto(borrador);
        const problema = validarProducto(producto);
        setError(problema);
        if (!problema) onCargar(producto);
    };

    return (
        <Card className={vistas.panel} aria-labelledby="titulo-nuevo-producto">
            <h2 id="titulo-nuevo-producto" className="subtitulo">
                Nuevo producto
            </h2>
            <form className={formulario.formulario} onSubmit={enviar} noValidate>
                <div className={formulario.grillaCampos}>
                    <Campo nombre="Tipo de producto *">
                        <select value={borrador.rubro} onChange={(e) => setBorrador((b) => ({ ...b, rubro: e.target.value as Rubro }))}>
                            {RUBROS.map((r) => (
                                <option key={r.valor} value={r.valor}>
                                    {r.nombre}
                                </option>
                            ))}
                        </select>
                    </Campo>
                    <Campo nombre="Lote *">
                        <select value={borrador.lote} onChange={cambiar("lote")}>
                            {LOTES.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.id} · {l.nombre} ({l.cobertura}% de cobertura)
                                </option>
                            ))}
                        </select>
                    </Campo>
                </div>
                <Campo nombre="Cultivo o nombre del producto *">
                    <input ref={primerCampo} type="text" placeholder="Tomate perita" maxLength={60} required value={borrador.cultivo} onChange={cambiar("cultivo")} />
                </Campo>
                <div className={formulario.grillaCampos}>
                    <Campo nombre="Fecha de plantación *">
                        <input className="dato" type="date" required value={borrador.plantacion} onChange={cambiar("plantacion")} />
                    </Campo>
                    <Campo nombre="Fecha de cosecha *">
                        <input className="dato" type="date" required value={borrador.cosecha} onChange={cambiar("cosecha")} />
                    </Campo>
                </div>
                <Campo nombre="Químicos aplicados *">
                    <input type="text" placeholder="Ninguno, cobre, azufre…" maxLength={80} required value={borrador.quimicos} onChange={cambiar("quimicos")} />
                </Campo>
                <div className={formulario.grillaCampos}>
                    <Campo nombre="Fecha de reparto *">
                        <input className="dato" type="date" required value={borrador.reparto} onChange={cambiar("reparto")} />
                    </Campo>
                    <Campo nombre="Destino del reparto *">
                        <select value={borrador.destino} onChange={(e) => setBorrador((b) => ({ ...b, destino: e.target.value as TipoComprador }))}>
                            {TIPOS_COMPRADOR.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                    </Campo>
                </div>
                <div className={formulario.grillaCampos}>
                    <Campo nombre="Precio de venta">
                        <input className="dato" type="number" min="0" step="50" placeholder="4800" value={borrador.precio} onChange={cambiar("precio")} />
                    </Campo>
                    <Campo nombre="Unidad">
                        <input type="text" placeholder="bolsón, cajón, botella" maxLength={20} value={borrador.unidad} onChange={cambiar("unidad")} />
                    </Campo>
                </div>

                <div role="alert">{error && <p className={`small ${formulario.error}`}>{error}</p>}</div>

                <div className={formulario.acciones}>
                    <Button type="button" onClick={onCancelar}>
                        Cancelar y volver a productos cargados
                    </Button>
                    <Button type="submit" variante="primario">
                        Cargar producto y generar QR
                    </Button>
                </div>
                <p className={`small ${formulario.nota}`}>
                    Todos los campos con * son obligatorios. Con cobertura menor al {META_COBERTURA}% el QR se emite en estado pendiente.
                </p>
            </form>
        </Card>
    );
}
