import { ApiError } from "../api/client";

// Único lugar que sabe traducir un error de la API a un mensaje mostrable:
// evita repetir "if (err instanceof ApiError) ..." en cada pantalla.
export function getErrorMessage(err: unknown): string {
    if (err instanceof ApiError) return err.errors.map((e) => e.message).join(" — ");
    // fetch falla con un TypeError en inglés cuando no llega al servidor.
    if (err instanceof TypeError) return "No se pudo conectar con el servidor. Revisá la conexión y volvé a intentar.";
    if (err instanceof Error) return err.message;
    return "Error desconocido";
}
