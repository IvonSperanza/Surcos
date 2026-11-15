import { buscarCultivares, getEspecies, type UsoCatalogo } from "../../api/catalogo";
import type { CultivoDeclarado } from "../../api/eventos";

export type BorradorCultivo = { especie: string; cultivar: string };

export const aMayusculas = (texto: string) => texto.toLocaleUpperCase("es-AR");

// Arma el cultivo a guardar con lo que se ve en pantalla. Se calcula aparte
// para que el formulario no dependa del estado interno del campo.
export async function resolverCultivo(uso: UsoCatalogo, borrador: BorradorCultivo): Promise<CultivoDeclarado | null> {
    const especie = (await getEspecies(uso)).especies.find((e) => e.especie === aMayusculas(borrador.especie.trim()));
    const nombre = borrador.cultivar.trim();
    if (!especie || !nombre) return null;
    const inscripto = (await buscarCultivares(especie.especie, nombre)).find((c) => c.nombre === aMayusculas(nombre));
    return {
        especie: especie.especie,
        nombreCientifico: especie.nombre_cientifico,
        familia: especie.familia,
        nombreFamilia: especie.nombre_familia,
        cultivar: inscripto?.nombre ?? nombre,
        numeroInase: inscripto?.numero ?? null
    };
}
