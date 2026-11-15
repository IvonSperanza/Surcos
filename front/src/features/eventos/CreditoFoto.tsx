import type { FotoEvento } from "../../api/eventos";

// Toda foto dice de dónde sale: si no la sacó el productor, autor y licencia.
export function CreditoFoto({ foto }: { foto: FotoEvento }) {
    if (!foto.credito) return <>Foto del productor</>;
    const { autor, licencia, pagina } = foto.credito;
    return (
        <>
            Foto de ejemplo · {autor} ·{" "}
            <a href={pagina} target="_blank" rel="noreferrer">
                {licencia}, Wikimedia Commons
            </a>
        </>
    );
}
