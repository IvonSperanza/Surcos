// Cliente HTTP único. Hay dos servicios y los dos responden con el mismo sobre
// (`{ success, data }` / `{ success: false, errors: [{ code, message }] }`,
// ver back/src/lib/http/responses.ts), así que comparten esta implementación:
// - `api`:   back/ (lógica de negocio: productores, lotes, pasaportes, productos)
// - `datos`: datos/ (Python: NASA y suelos, en tiempo real)

export type ApiErrorItem = {
    code: string;
    message: string;
};

export type Envelope<T> = {
    success: true;
    message?: string;
    data: T;
};

export class ApiError extends Error {
    status: number;
    errors: ApiErrorItem[];

    constructor(status: number, errors: ApiErrorItem[]) {
        super(errors.map((e) => e.message).join("\n") || "Error desconocido");
        this.status = status;
        this.errors = errors;
    }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | undefined;

export function toQueryString(params: Record<string, QueryValue>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "";

    const search = new URLSearchParams();
    for (const [key, value] of entries) search.set(key, String(value));
    return `?${search.toString()}`;
}

function parseJson(text: string): unknown {
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}

function parseErrors(data: unknown): ApiErrorItem[] {
    const fallback = [{ code: "Error", message: "Error desconocido" }];
    if (typeof data !== "object" || data === null) return fallback;

    const { errors, error } = data as { errors?: unknown; error?: unknown };
    if (Array.isArray(errors) && errors.length > 0) return errors as ApiErrorItem[];
    if (typeof error === "string" && error.trim() !== "") return [{ code: "Error", message: error }];
    return fallback;
}

export function createHttpClient(baseUrl: string) {
    const request = async <T>(path: string, method: Method, body?: unknown): Promise<T> => {
        const res = await fetch(`${baseUrl}${path}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
        const data = parseJson(await res.text());

        if (!res.ok) throw new ApiError(res.status, parseErrors(data));
        return data as T;
    };

    return {
        get: <T>(path: string) => request<T>(path, "GET"),
        post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
        put: <T>(path: string, body?: unknown) => request<T>(path, "PUT", body),
        patch: <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
        del: <T>(path: string, body?: unknown) => request<T>(path, "DELETE", body)
    };
}

export type HttpClient = ReturnType<typeof createHttpClient>;

export const api = createHttpClient(import.meta.env.VITE_API_URL);
export const datos = createHttpClient(import.meta.env.VITE_DATOS_URL);
