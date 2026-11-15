import { useState } from "react";
import { Plus } from "lucide-react";
import { eliminarEvento, type Evento } from "../../api/eventos";
import { Button, Card } from "../../design-system";
import { FormularioEvento } from "./FormularioEvento";
import { LineaTiempo } from "./LineaTiempo";
import { tituloEvento } from "./textoEvento";
import styles from "./eventos.module.css";

// Siembra y cosecha arman las producciones: borrarlas cambia lo que se vende.
const CONSECUENCIA: Partial<Record<Evento["tipo"], string>> = {
    siembra: " También desaparece la producción que abre esta siembra.",
    cosecha: " La producción vuelve a quedar en curso."
};

type Props = { parcelaId: string; eventos: Evento[] | null; onCambio: () => void };

// La historia de la parcela es lo que compra el consumidor: cada evento que el
// productor declara y que el satélite contrasta.
export function HistoriaParcela({ parcelaId, eventos, onCambio }: Props) {
    const [registrando, setRegistrando] = useState(false);

    const eliminar = async (evento: Evento) => {
        if (!window.confirm(`¿Eliminar "${tituloEvento(evento)}" del historial?${CONSECUENCIA[evento.tipo] ?? ""}`)) return;
        await eliminarEvento(evento.id);
        onCambio();
    };

    return (
        <Card className={styles.historia}>
            <div className={styles.cabecera}>
                <h2 className="subtitulo">Historial</h2>
                {!registrando && (
                    <Button variante="primario" onClick={() => setRegistrando(true)}>
                        <Plus size={18} strokeWidth={1.5} aria-hidden />
                        Registrar evento
                    </Button>
                )}
            </div>

            {registrando && (
                <FormularioEvento
                    parcelaId={parcelaId}
                    eventos={eventos ?? []}
                    onCancelar={() => setRegistrando(false)}
                    onGuardado={() => {
                        setRegistrando(false);
                        onCambio();
                    }}
                />
            )}

            {eventos?.length === 0 && !registrando && (
                <p className="body">Sin eventos registrados.</p>
            )}

            {eventos && eventos.length > 0 && (
                <LineaTiempo eventos={eventos} onEliminar={eliminar} />
            )}
        </Card>
    );
}
