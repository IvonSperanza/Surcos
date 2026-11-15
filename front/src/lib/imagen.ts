const LADO_MAXIMO = 1200;
const CALIDAD = 0.8;

// Las fotos del celular pesan varios MB: se achican antes de guardarlas para
// que entren varias en el navegador (y después, para no subir de más al back).
export async function achicarFoto(archivo: File): Promise<string> {
    const imagen = await createImageBitmap(archivo);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(imagen.width * escala);
    lienzo.height = Math.round(imagen.height * escala);
    lienzo.getContext("2d")?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    imagen.close();
    return lienzo.toDataURL("image/jpeg", CALIDAD);
}
