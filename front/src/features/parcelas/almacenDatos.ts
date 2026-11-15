import { useSyncExternalStore } from "react";
import { getClima } from "../../api/clima";
import { getInsights } from "../../api/insights";
import { getHistoricoNdvi, type PoligonoGeoJson } from "../../api/ndvi";
import type { Parcela } from "../../api/parcelas";
import { getSuelo } from "../../api/suelo";
import { getErrorMessage } from "../../lib/errors";
import type { EstadosDatosParcela } from "../parcela/DatosParcela";

// Los datos de cada parcela se piden una sola vez por sesión, en segundo plano,
// apenas se crea la parcela o se abre la lista: así al entrar a la ficha ya
// están (o falta poco). El servicio de datos además cachea por día, así que
// pedirlos de nuevo al recargar es barato.

type Fuente = keyof EstadosDatosParcela;

export type DatosDeParcela = EstadosDatosParcela & {
    // Cuándo arrancó cada consulta en curso: para mostrar cuánto lleva.
    desde: Partial<Record<Fuente, number>>;
};

const INICIAL: DatosDeParcela = {
    ndvi: { tipo: "inactivo" },
    clima: { tipo: "inactivo" },
    suelo: { tipo: "inactivo" },
    insights: { tipo: "inactivo" },
    desde: {}
};

const estados = new Map<string, DatosDeParcela>();
const oyentes = new Set<() => void>();

function actualizar(id: string, cambio: Partial<DatosDeParcela>) {
    const actual = estados.get(id) ?? INICIAL;
    estados.set(id, { ...actual, ...cambio, desde: { ...actual.desde, ...cambio.desde } });
    oyentes.forEach((avisar) => avisar());
}

function consultar<T>(id: string, fuente: Fuente, pedir: (g: PoligonoGeoJson) => Promise<T>, geometria: PoligonoGeoJson): Promise<boolean> {
    actualizar(id, { [fuente]: { tipo: "cargando" }, desde: { [fuente]: Date.now() } });
    return pedir(geometria)
        .then((datos) => {
            actualizar(id, { [fuente]: { tipo: "listo", datos } });
            return true;
        })
        .catch((err: unknown) => {
            actualizar(id, { [fuente]: { tipo: "error", mensaje: getErrorMessage(err) } });
            return false;
        });
}

export function asegurarDatos(parcela: Parcela): void {
    if (estados.has(parcela.id)) return;
    estados.set(parcela.id, INICIAL);
    const { id, geometria } = parcela;

    void consultar(id, "suelo", getSuelo, geometria);
    // Los insights reutilizan lo que calcularon /ndvi y /clima: van después,
    // así el servicio los toma de su caché en vez de recalcular.
    void Promise.all([consultar(id, "ndvi", getHistoricoNdvi, geometria), consultar(id, "clima", getClima, geometria)]).then(([ndvi, clima]) => {
        if (ndvi && clima) {
            void consultar(id, "insights", getInsights, geometria);
            return;
        }
        actualizar(id, { insights: { tipo: "error", mensaje: "Hacen falta las imágenes satelitales y el clima para generarlas." } });
    });
}

export function reintentarDatos(parcela: Parcela): void {
    estados.delete(parcela.id);
    asegurarDatos(parcela);
}

export function olvidarDatos(id: string): void {
    estados.delete(id);
    oyentes.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
    oyentes.add(avisar);
    return () => oyentes.delete(avisar);
}

export function useDatosParcela(id: string): DatosDeParcela {
    return useSyncExternalStore(suscribir, () => estados.get(id) ?? INICIAL);
}

export type EstadoGeneral = "generando" | "listo" | "con_errores";

// Sin el NDVI no hay nada que mostrar de la parcela; si falló otra fuente,
// la ficha igual sirve pero lo avisa.
export function estadoGeneral(datos: EstadosDatosParcela): EstadoGeneral {
    const fuentes = [datos.ndvi, datos.clima, datos.suelo, datos.insights];
    if (fuentes.some((f) => f.tipo === "cargando" || f.tipo === "inactivo")) return "generando";
    return fuentes.some((f) => f.tipo === "error") ? "con_errores" : "listo";
}
