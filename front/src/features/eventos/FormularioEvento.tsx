import { useMemo, useState, type FormEvent } from "react";
import { crearEvento, type Evento, type TipoEvento } from "../../api/eventos";
import { getErrorMessage } from "../../lib/errors";
import { formatearFecha } from "../../lib/fecha";
import { produccionAbierta, type Produccion } from "../producciones/producciones";
import { nombreCultivo } from "./textoEvento";
import { Button } from "../../design-system";
import { CampoCultivo } from "./CampoCultivo";
import { CampoFoto } from "./CampoFoto";
import { resolverCultivo, type BorradorCultivo } from "./cultivo";
import { ORDEN_TIPOS, TIPOS_EVENTO, type Campo } from "./tiposEvento";
import styles from "./eventos.module.css";

const hoy = () => new Date().toISOString().slice(0, 10);

function CampoDetalle({ campo, valor, onCambiar }: { campo: Campo; valor: string; onCambiar: (valor: string) => void }) {
    const etiqueta = `${campo.etiqueta}${campo.obligatorio ? "" : " (opcional)"}`;
    if (campo.tipo === "opciones") {
        return (
            <label className={styles.campo}>
                <span className="etiqueta">{etiqueta}</span>
                <select className="body" value={valor} onChange={(e) => onCambiar(e.target.value)}>
                    <option value="">Elegí una opción</option>
                    {campo.opciones.map((o) => (
                        <option key={o}>{o}</option>
                    ))}
                </select>
            </label>
        );
    }
    return (
        <label className={styles.campo}>
            <span className="etiqueta">
                {etiqueta}
                {campo.tipo === "numero" && ` · ${campo.unidad}`}
            </span>
            <input
                className="body"
                type={campo.tipo === "numero" ? "number" : "text"}
                min={campo.tipo === "numero" ? 0 : undefined}
                value={valor}
                placeholder={campo.tipo === "texto" ? campo.ayuda : undefined}
                onChange={(e) => onCambiar(e.target.value)}
            />
        </label>
    );
}

type Props = {
    parcelaId: string;
    // La historia de la parcela: dice si hay un cultivo en pie (producción abierta).
    eventos: Evento[];
    onGuardado: (evento: Evento) => void;
    onCancelar: () => void;
};

// Una parcela tiene un cultivo a la vez: no se planta otro sin cosechar el que
// está, ni se cosecha si no hay nada plantado.
function bloqueo(tipo: TipoEvento, abierta: Produccion | null): string | null {
    if (tipo === "siembra" && abierta) return `${nombreCultivo(abierta.cultivo)} sigue en pie. Registrá su cosecha primero.`;
    if (TIPOS_EVENTO[tipo].conCultivoEnPie && !abierta) return "No hay cultivo en pie. Registrá una siembra primero.";
    return null;
}

export function FormularioEvento({ parcelaId, eventos, onGuardado, onCancelar }: Props) {
    const abierta = useMemo(() => produccionAbierta(eventos), [eventos]);
    // Con un cultivo en pie, lo habitual es registrar su manejo, no otra siembra.
    const [tipo, setTipo] = useState<TipoEvento>(() => (abierta ? "riego" : "siembra"));
    const [fecha, setFecha] = useState(hoy);
    const [detalles, setDetalles] = useState<Record<string, string>>({});
    const [cultivo, setCultivo] = useState<BorradorCultivo>({ especie: "", cultivar: "" });
    const [notas, setNotas] = useState("");
    const [foto, setFoto] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);
    const definicion = TIPOS_EVENTO[tipo];
    const motivoBloqueo = bloqueo(tipo, abierta);

    const cambiarTipo = (nuevo: TipoEvento) => {
        setTipo(nuevo);
        setDetalles({});
        setCultivo({ especie: "", cultivar: "" });
        if (!TIPOS_EVENTO[nuevo].foto) setFoto(null);
        setError("");
    };

    const guardar = async (e: FormEvent) => {
        e.preventDefault();
        const faltantes = definicion.campos.filter((c) => c.obligatorio && !detalles[c.clave]?.trim()).map((c) => c.etiqueta.toLowerCase());
        if (motivoBloqueo) return;
        if (!fecha) faltantes.unshift("fecha");
        if (definicion.foto === "obligatoria" && !foto) faltantes.push("la foto");
        if (faltantes.length > 0) {
            setError(`Falta completar: ${faltantes.join(", ")}.`);
            return;
        }
        if (tipo === "cosecha" && abierta && fecha < abierta.siembra.fecha) {
            setError(`La cosecha no puede ser antes de la siembra (${formatearFecha(abierta.siembra.fecha)}).`);
            return;
        }
        setGuardando(true);
        const cultivoResuelto = definicion.cultivo ? await resolverCultivo(definicion.cultivo, cultivo) : null;
        if (definicion.cultivo && !cultivoResuelto) {
            setGuardando(false);
            setError("Elegí la especie de la lista del INASE y escribí el cultivar.");
            return;
        }
        // La cosecha lleva el cultivo que se plantó: es lo que se vende.
        const cultivoEvento = tipo === "cosecha" && abierta ? abierta.cultivo : cultivoResuelto;
        try {
            const evento = await crearEvento({ parcelaId, tipo, fecha, cultivo: cultivoEvento, detalles, notas: notas.trim(), foto: definicion.foto && foto ? { url: foto, credito: null } : null });
            onGuardado(evento);
        } catch (err) {
            setGuardando(false);
            setError(getErrorMessage(err));
        }
    };

    return (
        <form className={styles.formulario} onSubmit={guardar} noValidate>
            <div className={styles.grillaCampos}>
                <label className={styles.campo}>
                    <span className="etiqueta">Tipo</span>
                    <select className="body" value={tipo} onChange={(e) => cambiarTipo(e.target.value as TipoEvento)}>
                        {ORDEN_TIPOS.map((t) => (
                            <option key={t} value={t}>
                                {TIPOS_EVENTO[t].nombre}
                            </option>
                        ))}
                    </select>
                </label>
                <label className={styles.campo}>
                    <span className="etiqueta">Fecha</span>
                    {/* Se registra lo que ya se hizo: la fecha no puede ser futura. */}
                    <input className="body" type="date" value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} />
                </label>
            </div>

            {motivoBloqueo ? (
                <p className={`body ${styles.aviso}`} role="status">
                    {motivoBloqueo}
                </p>
            ) : (
                tipo === "cosecha" &&
                abierta && (
                    <p className="body">
                        <strong>{nombreCultivo(abierta.cultivo)}</strong> · sembrado el {formatearFecha(abierta.siembra.fecha)}
                    </p>
                )
            )}

            {!motivoBloqueo && definicion.cultivo && <CampoCultivo uso={definicion.cultivo} borrador={cultivo} onCambiar={setCultivo} />}

            {!motivoBloqueo && definicion.campos.length > 0 && (
                <div className={styles.grillaCampos}>
                    {definicion.campos.map((c) => (
                        <CampoDetalle key={c.clave} campo={c} valor={detalles[c.clave] ?? ""} onCambiar={(v) => setDetalles((d) => ({ ...d, [c.clave]: v }))} />
                    ))}
                </div>
            )}

            {!motivoBloqueo && definicion.foto && (
                <CampoFoto etiqueta={definicion.foto === "obligatoria" ? "Foto" : "Foto de la cosecha (opcional)"} url={foto} onCambiar={setFoto} />
            )}

            <label className={styles.campo}>
                <span className="etiqueta">Notas (opcional)</span>
                <textarea className="body" rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
            </label>

            {error && (
                <p className={`small ${styles.error}`} role="alert">
                    {error}
                </p>
            )}

            <div className={styles.acciones}>
                <Button type="submit" variante="primario" disabled={guardando || motivoBloqueo !== null}>
                    {guardando ? "Guardando…" : "Guardar"}
                </Button>
                <Button type="button" onClick={onCancelar}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
