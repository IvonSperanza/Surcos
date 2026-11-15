import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../env";

// Archivos subidos (fotos de eventos), como en disden. En el one-box la
// carpeta va montada en un volumen para que sobreviva a los deploys.
export const storageRoot = path.resolve(process.cwd(), env.STORAGE_DIR);

export async function saveBuffer(folder: string, extension: string, buffer: Buffer): Promise<string> {
    const filename = `${crypto.randomUUID()}${extension}`;
    await mkdir(path.join(storageRoot, folder), { recursive: true });
    await writeFile(path.join(storageRoot, folder, filename), buffer);
    return filename;
}

export function publicFileUrl(folder: string, filename: string): string {
    return `${env.HOST.replace(/\/$/, "")}/files/${folder}/${filename}`;
}
