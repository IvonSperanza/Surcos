import { Response, Request, NextFunction } from "express";
import { ZodError } from "zod";
import { ServiceError, BadRequest } from "bradb";

// `NotFound`/`Duplicated`/`Forbidden`/`Unauthorized` no se re-exportan
// desde acá: quien los necesite los importa directo de `bradb`.

// Alias de `BadRequest` (bradb): mismo status, nombre más claro en los call
// sites de validación de reglas de negocio.
export class ValidationError extends BadRequest {}

export class ApiError extends Error {
    status: number;
    name: string;
    // Datos extra del rechazo que el contrato necesita devolver además del
    // mensaje: `handleErrors` los aplana dentro del error del sobre.
    details?: Record<string, unknown>;

    constructor(status: number, message: string, name: string, details?: Record<string, unknown>) {
        super(message);
        this.status = status;
        this.name = name;
        this.details = details;
    }
}

// 200, no es un error real: "no había nada que cambiar".
export class NothingChanged extends ApiError {
    constructor(message: string) {
        super(200, message, "NothingChanged");
    }
}

export class NotImplemented extends ApiError {
    constructor(message: string) {
        super(501, message, "NotImplemented");
    }
}

// La operación choca con una regla de negocio del estado actual.
export class Conflict extends ApiError {
    constructor(message: string) {
        super(409, message, "Conflict");
    }
}

// Un proveedor externo (ej. NASA POWER) no respondió o devolvió un error.
// No se expone el detalle crudo al cliente.
export class ExternalServiceError extends Error {
    constructor(
        public readonly provider: string,
        message: string,
        public readonly status?: number,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "ExternalServiceError";
    }
}

// `next` es obligatorio en la firma aunque no se use: Express reconoce un
// manejador de errores por su aridad de 4 argumentos.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleErrors(err: Error, req: Request, res: Response, next: NextFunction): Response {
    if (err instanceof ZodError) {
        const errors = err.issues.map(e => ({
            ...e,
            message: e.code == "invalid_type"
                ? `El campo ${String(e.path[0])} es obligatorio`
                : e.message
        }));

        return res.status(400).json({
            success: false,
            errors: errors
        });
    }

    if (err instanceof NothingChanged) return res.status(err.status).json({
        success: true,
        message: err.message
    });

    if (err instanceof ApiError) return res.status(err.status).json({
        success: false,
        errors: [{
            code: err.name,
            message: err.message,
            ...err.details
        }]
    });

    if (err instanceof ServiceError) return res.status(err.statusCode).json({
        success: false,
        errors: [{
            code: err.name,
            message: err.message
        }]
    });

    if (err instanceof ExternalServiceError) {
        console.error(`EXTERNAL ERROR [${err.provider}]:`, err.message, err.details);
        return res.status(502).json({
            success: false,
            errors: [{
                code: "BadGateway",
                message: err.message
            }]
        });
    }

    console.error("INTERNAL ERROR: ", err.message, err.stack);
    return res.status(500).json({
        success: false,
        errors: [{
            code: err.name,
            message: "Internal server error"
        }]
    });
}
