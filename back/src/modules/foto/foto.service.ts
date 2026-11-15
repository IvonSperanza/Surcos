import { saveBuffer, publicFileUrl } from "../../lib/storage";
import { ValidationError } from "../../lib/http/errors";

const EXTENSIONES: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

export function createFotoService() {
    const guardar = async (archivo: { mimetype: string; buffer: Buffer } | undefined) => {
        if (!archivo) throw new ValidationError("Falta la foto (campo \"foto\")");
        const extension = EXTENSIONES[archivo.mimetype];
        if (!extension) throw new ValidationError("La foto tiene que ser JPG, PNG o WebP");
        const filename = await saveBuffer("fotos", extension, archivo.buffer);
        return { url: publicFileUrl("fotos", filename) };
    };
    return { guardar };
}

export type FotoService = ReturnType<typeof createFotoService>;
