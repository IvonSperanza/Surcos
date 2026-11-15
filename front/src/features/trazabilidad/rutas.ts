export const rutaPublica = (codigo: string) => `/p/${codigo}`;

// El QR lo abre el teléfono de quien compra, así que necesita una dirección
// que se vea desde afuera: la configurada o, si falta, la de este navegador.
export function urlPublica(codigo: string): string {
    const base = import.meta.env.VITE_URL_PUBLICA ?? window.location.origin;
    return `${base.replace(/\/$/, "")}${rutaPublica(codigo)}`;
}

export function apuntaALocal(url: string): boolean {
    return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname);
}
